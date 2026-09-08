# pyrefly: ignore [missing-import]
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

import os
import sqlite3
import hashlib
from datetime import datetime
from gtts import gTTS

from database import get_db, init_db
from ai_classifier import classify_waste


# ==========================================
# APP CONFIGURATION
# ==========================================

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=False)

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
    return response

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), ".uploads")

ALLOWED_EXTENSIONS = {
    "png",
    "jpg",
    "jpeg",
    "webp"
}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# Initialize database
init_db()


# ==========================================
# HELPER FUNCTIONS
# ==========================================

def allowed_file(filename):

    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower()
        in ALLOWED_EXTENSIONS
    )


def row_to_dict(row):

    if row is None:
        return None

    return dict(row)


# ==========================================
# HOME
# ==========================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "success": True,
        "message": "MedWaste AI Backend is running",
        "version": "1.0"
    })


# ==========================================
# HEALTH CHECK
# ==========================================

@app.route("/api/health", methods=["GET"])
def health():

    return jsonify({
        "status": "online",
        "database": "connected",
        "ai": "available"
    })


# ==========================================
# MULTILINGUAL TEXT-TO-SPEECH (TTS)
# ==========================================

TTS_CACHE_DIR = os.path.join(os.path.dirname(__file__), ".tts_cache")
os.makedirs(TTS_CACHE_DIR, exist_ok=True)

GTTS_LANG_MAP = {
    "hi": "hi",
    "mr": "mr",
    "ta": "ta",
    "te": "te",
    "bn": "bn",
    "gu": "gu",
    "kn": "kn",
    "ml": "ml",
    "pa": "pa",
    "ur": "ur",
    "en": "en",
    "or": "hi",
}

@app.route("/api/tts", methods=["GET", "POST"])
def text_to_speech():
    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        text = data.get("text", "").strip()
        lang = data.get("lang", "en").strip()
    else:
        text = request.args.get("text", "").strip()
        lang = request.args.get("lang", "en").strip()

    if not text:
        return jsonify({"error": "Missing 'text' parameter"}), 400

    target_lang = GTTS_LANG_MAP.get(lang.lower(), "en")
    text_hash = hashlib.md5(f"{target_lang}:{text}".encode("utf-8")).hexdigest()
    filename = f"tts_{target_lang}_{text_hash}.mp3"
    filepath = os.path.join(TTS_CACHE_DIR, filename)

    if not os.path.exists(filepath):
        try:
            tts = gTTS(text=text, lang=target_lang, slow=False)
            tts.save(filepath)
        except Exception as e:
            try:
                tts = gTTS(text=text, lang="en", slow=False)
                tts.save(filepath)
            except Exception as e2:
                return jsonify({"error": str(e2)}), 500

    response = send_from_directory(TTS_CACHE_DIR, filename, mimetype="audio/mpeg")
    response.headers["Cache-Control"] = "public, max-age=86400"
    return response


# ==========================================
# DASHBOARD
# ==========================================

@app.route("/api/dashboard", methods=["GET"])
def dashboard():
    hospital_id = request.args.get("hospital_id", type=int)

    conn = get_db()
    cursor = conn.cursor()

    if hospital_id is not None:
        # User-specific facility metrics
        cursor.execute("""
            SELECT COALESCE(SUM(wr.weight), 0)
            FROM waste_records wr
            JOIN bins b ON wr.bin_id = b.id
            WHERE b.hospital_id = ?
        """, (hospital_id,))
        total_waste = cursor.fetchone()[0]

        cursor.execute("""
            SELECT COUNT(*)
            FROM bins
            WHERE hospital_id = ?
        """, (hospital_id,))
        total_bins = cursor.fetchone()[0]

        cursor.execute("""
            SELECT COUNT(*)
            FROM collections c
            JOIN bins b ON c.bin_id = b.id
            WHERE b.hospital_id = ? AND c.status != 'Pending'
        """, (hospital_id,))
        collections = cursor.fetchone()[0]

        cursor.execute("""
            SELECT COUNT(*)
            FROM bins
            WHERE hospital_id = ? AND current_level >= 80
        """, (hospital_id,))
        alerts = cursor.fetchone()[0]
    else:
        # Global metrics across all facilities
        cursor.execute("""
            SELECT COALESCE(SUM(weight), 0)
            FROM waste_records
        """)
        total_waste = cursor.fetchone()[0]

        cursor.execute("""
            SELECT COUNT(*)
            FROM bins
        """)
        total_bins = cursor.fetchone()[0]

        cursor.execute("""
            SELECT COUNT(*)
            FROM collections
            WHERE status != 'Pending'
        """)
        collections = cursor.fetchone()[0]

        cursor.execute("""
            SELECT COUNT(*)
            FROM bins
            WHERE current_level >= 80
        """)
        alerts = cursor.fetchone()[0]

    conn.close()

    return jsonify({
        "success": True,
        "data": {
            "total_waste": round(total_waste, 2),
            "active_bins": total_bins,
            "collections": collections,
            "alerts": alerts
        }
    })


# ==========================================
# GET ALL BINS
# ==========================================

@app.route("/api/bins", methods=["GET"])
def get_bins():
    hospital_id = request.args.get("hospital_id", type=int)

    conn = get_db()
    cursor = conn.cursor()

    if hospital_id is not None:
        cursor.execute("""
            SELECT
                bins.*,
                hospitals.name AS hospital_name
            FROM bins
            LEFT JOIN hospitals
            ON bins.hospital_id = hospitals.id
            WHERE bins.hospital_id = ?
            ORDER BY bins.current_level DESC
        """, (hospital_id,))
    else:
        cursor.execute("""
            SELECT
                bins.*,
                hospitals.name AS hospital_name
            FROM bins
            LEFT JOIN hospitals
            ON bins.hospital_id = hospitals.id
            ORDER BY bins.current_level DESC
        """)

    rows = cursor.fetchall()
    conn.close()

    bins = [
        row_to_dict(row)
        for row in rows
    ]

    return jsonify({
        "success": True,
        "count": len(bins),
        "bins": bins
    })


# ==========================================
# CREATE NEW SMART BIN
# ==========================================

@app.route("/api/bins", methods=["POST"])
def create_bin():
    data = request.get_json() or {}
    bin_code = data.get("bin_code", "").strip()
    waste_type = data.get("waste_type", "Yellow").strip()
    capacity = float(data.get("capacity", 100) or 100)
    current_level = float(data.get("current_level", 0) or 0)
    weight = float(data.get("weight", 0) or 0)
    hospital_id = int(data.get("hospital_id", 1) or 1)

    if not bin_code:
        return jsonify({
            "success": False,
            "message": "Bin code is required (e.g. BIN-Y002)"
        }), 400

    if current_level >= 90:
        status = "Urgent"
    elif current_level >= 80:
        status = "Collection Required"
    elif current_level >= 60:
        status = "Warning"
    else:
        status = "Normal"

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO bins
            (bin_code, hospital_id, waste_type, capacity, current_level, weight, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (bin_code, hospital_id, waste_type, capacity, current_level, weight, status))
        bin_id = cursor.lastrowid
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({
            "success": False,
            "message": f"Bin code '{bin_code}' already exists"
        }), 409

    conn.close()
    return jsonify({
        "success": True,
        "message": "Smart bin registered successfully",
        "bin_id": bin_id
    }), 201


# ==========================================
# UPDATE BIN
# ==========================================

@app.route("/api/bins/<int:bin_id>", methods=["PUT"])
def update_bin(bin_id):

    data = request.get_json() or {}

    current_level = float(data.get("current_level", 0) or 0)
    weight = float(data.get("weight", 0) or 0)

    conn = get_db()
    cursor = conn.cursor()

    # Determine status
    if current_level >= 90:
        status = "Urgent"

    elif current_level >= 80:
        status = "Collection Required"

    elif current_level >= 60:
        status = "Warning"

    else:
        status = "Normal"

    cursor.execute("""
        UPDATE bins
        SET current_level = ?,
            weight = ?,
            status = ?,
            last_updated = CURRENT_TIMESTAMP
        WHERE id = ?
    """, (
        current_level,
        weight,
        status,
        bin_id
    ))

    conn.commit()

    if cursor.rowcount == 0:

        conn.close()

        return jsonify({
            "success": False,
            "message": "Bin not found"
        }), 404

    conn.close()

    return jsonify({
        "success": True,
        "message": "Bin updated successfully",
        "status": status,
        "current_level": current_level,
        "weight": weight
    })


# ==========================================
# SYNC MULTI-BIN STATION TELEMETRY
# ==========================================

@app.route("/api/bins/sync-station", methods=["POST"])
def sync_station_bins():
    data = request.get_json() or {}
    hospital_id = data.get("hospital_id")
    bins_breakdown = data.get("bins_breakdown", [])

    conn = get_db()
    cursor = conn.cursor()

    updated_bins = []
    collections_created = []

    for item in bins_breakdown:
        waste_type = item.get("waste_type")
        level = float(item.get("fulfillment_pct", 75))
        weight = float(item.get("weight", round(level * 0.45, 1)))

        status = "Normal"
        if level >= 90:
            status = "Urgent"
        elif level >= 80:
            status = "Collection Required"
        elif level >= 60:
            status = "Warning"

        # Match bin for this hospital and waste type
        b_id = None
        b_code = None

        if hospital_id is not None:
            cursor.execute("""
                SELECT id, bin_code FROM bins 
                WHERE hospital_id = ? AND LOWER(waste_type) = LOWER(?)
            """, (hospital_id, waste_type))
            bin_row = cursor.fetchone()
            if not bin_row:
                code_prefix = waste_type[:3].upper()
                cursor.execute("SELECT COUNT(*) FROM bins")
                total_b = cursor.fetchone()[0]
                bin_code = f"BIN-{code_prefix}-{total_b + 1:03d}"
                cursor.execute("""
                    INSERT INTO bins (bin_code, hospital_id, waste_type, capacity, current_level, weight, status)
                    VALUES (?, ?, ?, 50.0, ?, ?, ?)
                """, (bin_code, hospital_id, waste_type, level, weight, status))
                b_id = cursor.lastrowid
                b_code = bin_code
            else:
                b_id = bin_row["id"]
                b_code = bin_row["bin_code"]
                cursor.execute("""
                    UPDATE bins
                    SET current_level = ?, weight = ?, status = ?, last_updated = CURRENT_TIMESTAMP
                    WHERE id = ?
                """, (level, weight, status, b_id))
        else:
            cursor.execute("SELECT id, bin_code FROM bins WHERE LOWER(waste_type) = LOWER(?)", (waste_type,))
            bin_row = cursor.fetchone()
            if bin_row:
                b_id = bin_row["id"]
                b_code = bin_row["bin_code"]
                cursor.execute("""
                    UPDATE bins
                    SET current_level = ?, weight = ?, status = ?, last_updated = CURRENT_TIMESTAMP
                    WHERE id = ?
                """, (level, weight, status, b_id))

        if b_id:
            cursor.execute("""
                INSERT INTO waste_records (bin_id, waste_type, weight, confidence, image_path)
                VALUES (?, ?, ?, 0.98, 'station_audit_scan.jpg')
            """, (b_id, waste_type, weight))

            # Auto-queue pickup if >= 80%
            if level >= 80:
                cursor.execute("SELECT id FROM collections WHERE bin_id = ? AND status = 'Pending'", (b_id,))
                existing_col = cursor.fetchone()
                if not existing_col:
                    cursor.execute("INSERT INTO collections (bin_id, status) VALUES (?, 'Pending')", (b_id,))
                    collections_created.append(b_code)

            updated_bins.append({"bin_id": b_id, "bin_code": b_code, "waste_type": waste_type, "level": level, "status": status})

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": f"Successfully synchronized {len(updated_bins)} smart bins with optical telemetry!",
        "updated_bins": updated_bins,
        "collections_created": collections_created
    })


# ==========================================
# AI WASTE CLASSIFICATION
# ==========================================

import base64
import time

@app.route("/api/classify", methods=["POST"])
def classify():
    hint = ""
    filename = f"scan_{int(time.time())}.jpg"
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)

    # 1. Handle JSON base64 data (from Live Camera or Canvas snapshot)
    if request.is_json:
        data = request.get_json() or {}
        hint = data.get("hint", "")
        img_b64 = data.get("image_base64") or data.get("image") or ""

        if not img_b64:
            return jsonify({
                "success": False,
                "message": "No image data provided in request"
            }), 400

        # Strip header like data:image/jpeg;base64,
        if "," in img_b64:
            img_b64 = img_b64.split(",", 1)[1]

        try:
            raw_bytes = base64.b64decode(img_b64)
            with open(file_path, "wb") as f:
                f.write(raw_bytes)
        except Exception as e:
            return jsonify({
                "success": False,
                "message": f"Failed to decode base64 image: {str(e)}"
            }), 400

    # 2. Handle Multipart Form File Upload
    elif "image" in request.files:
        file = request.files["image"]
        hint = request.form.get("hint", "")

        if file.filename == "":
            return jsonify({
                "success": False,
                "message": "No file selected"
            }), 400

        clean_name = secure_filename(file.filename)
        if not clean_name or "." not in clean_name:
            clean_name = f"upload_{int(time.time())}.jpg"

        filename = clean_name
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(file_path)

    else:
        return jsonify({
            "success": False,
            "message": "Please upload an image file or provide base64 image data"
        }), 400

    # Execute AI classification model
    result = classify_waste(file_path, hint=hint)
    if "stage_1_upload" in result:
        result["stage_1_upload"]["image_url"] = f"/uploads/{filename}"

    return jsonify({
        "success": True,
        "classification": result,
        "image_url": f"/uploads/{filename}",
        "filename": filename
    })


# ==========================================
# AI SCANNER PIPELINE: SEGREGATE + RECORD + ALERT
# Implements the 6-Stage Architecture Flow
# ==========================================

@app.route("/api/scanner/pipeline-segregate", methods=["POST"])
def scanner_pipeline_segregate():
    hint = ""
    filename = f"scan_pipe_{int(time.time())}.jpg"
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)

    classification_override = None
    hospital_id = 1

    if request.is_json:
        data = request.get_json() or {}
        hint = data.get("hint", "")
        hospital_id = data.get("hospital_id", 1)
        img_b64 = data.get("image_base64") or data.get("image") or ""
        classification_override = data.get("classification")

        if img_b64:
            if "," in img_b64:
                img_b64 = img_b64.split(",", 1)[1]
            try:
                raw_bytes = base64.b64decode(img_b64)
                with open(file_path, "wb") as f:
                    f.write(raw_bytes)
            except Exception as e:
                return jsonify({"success": False, "message": f"Base64 error: {str(e)}"}), 400
    elif "image" in request.files:
        file = request.files["image"]
        hint = request.form.get("hint", "")
        hospital_id = int(request.form.get("hospital_id", 1) or 1)
        clean_name = secure_filename(file.filename) or f"pipe_{int(time.time())}.jpg"
        filename = clean_name
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(file_path)

    if classification_override:
        result = classification_override
    else:
        if not os.path.exists(file_path):
            with open(file_path, "wb") as f:
                f.write(b"")
        result = classify_waste(file_path, hint=hint)
        if "stage_1_upload" in result:
            result["stage_1_upload"]["image_url"] = f"/uploads/{filename}"

    db_waste_type = result.get("db_waste_type", "Yellow")
    if db_waste_type == "Multi":
        db_waste_type = "Yellow"

    est_weight = float(result.get("stage_4_segregation", {}).get("deposit_weight_kg", 1.5))
    confidence = float(result.get("confidence", 0.95))

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, bin_code, current_level, weight, capacity, status 
        FROM bins 
        WHERE hospital_id = ? AND LOWER(waste_type) = LOWER(?)
        LIMIT 1
    """, (hospital_id, db_waste_type))
    bin_row = cursor.fetchone()

    if not bin_row:
        cursor.execute("""
            SELECT id, bin_code, current_level, weight, capacity, status 
            FROM bins 
            WHERE LOWER(waste_type) = LOWER(?)
            LIMIT 1
        """, (db_waste_type,))
        bin_row = cursor.fetchone()

    bin_id = bin_row["id"] if bin_row else 1
    bin_code = bin_row["bin_code"] if bin_row else f"BIN-{db_waste_type[:3].upper()}-001"
    cur_level = float(bin_row["current_level"]) if bin_row else 50.0
    cur_weight = float(bin_row["weight"]) if bin_row else 10.0
    capacity = float(bin_row["capacity"]) if bin_row else 50.0

    cursor.execute("""
        INSERT INTO waste_records (bin_id, waste_type, weight, confidence, image_path)
        VALUES (?, ?, ?, ?, ?)
    """, (bin_id, db_waste_type, est_weight, confidence, f"/uploads/{filename}"))
    waste_record_id = cursor.lastrowid

    new_weight = round(cur_weight + est_weight, 1)
    new_level = min(round(cur_level + ((est_weight / capacity) * 100), 1), 100.0)

    threshold_cap = 75.0 if db_waste_type.lower() == "white" else 80.0
    is_urgent = new_level >= threshold_cap

    if new_level >= 90.0:
        bin_status = "Urgent"
    elif new_level >= threshold_cap:
        bin_status = "Collection Required"
    elif new_level >= 60.0:
        bin_status = "Warning"
    else:
        bin_status = "Normal"

    cursor.execute("""
        UPDATE bins 
        SET weight = ?, current_level = ?, status = ?, last_updated = CURRENT_TIMESTAMP
        WHERE id = ?
    """, (new_weight, new_level, bin_status, bin_id))

    collection_id = None
    collection_created = False

    if is_urgent:
        cursor.execute("SELECT id FROM collections WHERE bin_id = ? AND status = 'Pending'", (bin_id,))
        existing_col = cursor.fetchone()
        if existing_col:
            collection_id = existing_col["id"]
        else:
            now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cursor.execute("""
                INSERT INTO collections (bin_id, vehicle_id, collector_name, status, weight, requested_at)
                VALUES (?, 1, 'CBWTF Rapid Response Fleet', 'Pending', ?, ?)
            """, (bin_id, est_weight, now_str))
            collection_id = cursor.lastrowid
            collection_created = True

    conn.commit()
    conn.close()

    manifest_id = result.get("stage_5_digital_record", {}).get("manifest_id", f"MW-MNF-{waste_record_id:04d}")
    barcode_num = result.get("stage_5_digital_record", {}).get("barcode_number", f"CPCB-BMW-{waste_record_id:06d}")

    return jsonify({
        "success": True,
        "message": "AI Waste Segregation, Digital Record, and Collection Alert Processed",
        "architecture": "MedWaste-AI-6Stage-Model",
        "classification": result,
        "digital_record": {
            "record_id": waste_record_id,
            "manifest_id": manifest_id,
            "barcode_number": barcode_num,
            "bin_id": bin_id,
            "bin_code": bin_code,
            "waste_type": db_waste_type,
            "weight_kg": est_weight,
            "confidence": confidence,
            "status": "Committed to Digital Biohazard Ledger"
        },
        "collection_alert": {
            "alert_triggered": is_urgent,
            "collection_id": collection_id,
            "collection_created": collection_created,
            "bin_code": bin_code,
            "threshold_pct": threshold_cap,
            "new_level_pct": new_level,
            "status": "Automated CBWTF Fleet Dispatch Dispatched" if is_urgent else "Normal (Capacity Safe)"
        }
    })



# ==========================================
# INITIALIZE STANDARD 4 CLINICAL BINS
# ==========================================

@app.route("/api/bins/init-standard", methods=["POST"])
def init_standard_bins():
    data = request.get_json() or {}
    hospital_id = data.get("hospital_id", 1)

    conn = get_db()
    cursor = conn.cursor()

    created_bins = []
    std_bins = [
        ("Yellow", "BIN-YEL"),
        ("Red", "BIN-RED"),
        ("Blue", "BIN-BLU"),
        ("White", "BIN-WHT")
    ]

    for wtype, prefix in std_bins:
        cursor.execute("SELECT id FROM bins WHERE hospital_id = ? AND LOWER(waste_type) = LOWER(?)", (hospital_id, wtype))
        if not cursor.fetchone():
            cursor.execute("SELECT COUNT(*) FROM bins")
            total = cursor.fetchone()[0]
            code = f"{prefix}-{total + 1:03d}"
            cursor.execute("""
                INSERT INTO bins (bin_code, hospital_id, waste_type, capacity, current_level, weight, status)
                VALUES (?, ?, ?, 50.0, 0.0, 0.0, 'Normal')
            """, (code, hospital_id, wtype))
            created_bins.append(code)

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": f"Initialized {len(created_bins)} standard clinical bins",
        "created_bins": created_bins
    })


# ==========================================
# SAVE WASTE RECORD
# ==========================================

@app.route("/api/waste", methods=["POST"])
def add_waste():

    data = request.get_json() or {}

    bin_id = data.get("bin_id")
    waste_type = data.get("waste_type")
    weight = float(data.get("weight", 0) or 0)
    confidence = float(data.get("confidence", 0) or 0)
    image_path = data.get("image_path")
    hospital_id = data.get("hospital_id")

    if not waste_type:
        return jsonify({
            "success": False,
            "message": "Waste type is required"
        }), 400

    conn = get_db()
    cursor = conn.cursor()

    # Auto-resolve bin_id if empty or "auto"
    if not bin_id or bin_id == "auto" or str(bin_id) == "auto":
        if hospital_id:
            cursor.execute("SELECT id FROM bins WHERE hospital_id = ? AND LOWER(waste_type) = LOWER(?)", (hospital_id, waste_type))
            row = cursor.fetchone()
            if row:
                bin_id = row[0]
            else:
                code_prefix = waste_type[:3].upper()
                cursor.execute("SELECT COUNT(*) FROM bins")
                total_b = cursor.fetchone()[0]
                bin_code = f"BIN-{code_prefix}-{total_b + 1:03d}"
                cursor.execute("""
                    INSERT INTO bins (bin_code, hospital_id, waste_type, capacity, current_level, weight, status)
                    VALUES (?, ?, ?, 50.0, 0.0, 0.0, 'Normal')
                """, (bin_code, hospital_id, waste_type))
                bin_id = cursor.lastrowid
        else:
            cursor.execute("SELECT id FROM bins WHERE LOWER(waste_type) = LOWER(?)", (waste_type,))
            row = cursor.fetchone()
            if row:
                bin_id = row[0]

    cursor.execute("""
        INSERT INTO waste_records
        (bin_id, waste_type, weight,
         confidence, image_path)
        VALUES (?, ?, ?, ?, ?)
    """, (
        bin_id,
        waste_type,
        weight,
        confidence,
        image_path
    ))

    waste_id = cursor.lastrowid

    # Update bin
    if bin_id:

        cursor.execute("""
            SELECT current_level, weight
            FROM bins
            WHERE id = ?
        """, (bin_id,))

        bin_data = cursor.fetchone()

        if bin_data:

            new_weight = (
                bin_data["weight"] + weight
            )

            new_level = min(
                bin_data["current_level"]
                + (weight / 50 * 100),
                100
            )

            if new_level >= 90:
                status = "Urgent"

            elif new_level >= 80:
                status = "Collection Required"

            elif new_level >= 60:
                status = "Warning"

            else:
                status = "Normal"

            cursor.execute("""
                UPDATE bins
                SET weight = ?,
                    current_level = ?,
                    status = ?,
                    last_updated = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (
                new_weight,
                new_level,
                status,
                bin_id
            ))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Waste record added",
        "waste_id": waste_id
    }), 201


# ==========================================
# GET WASTE RECORDS
# ==========================================

@app.route("/api/waste", methods=["GET"])
def get_waste():

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            waste_records.*,
            bins.bin_code
        FROM waste_records
        LEFT JOIN bins
        ON waste_records.bin_id = bins.id
        ORDER BY waste_records.created_at DESC
    """)

    rows = cursor.fetchall()

    conn.close()

    records = [
        row_to_dict(row)
        for row in rows
    ]

    return jsonify({
        "success": True,
        "records": records
    })


# ==========================================
# COLLECTION REQUEST
# ==========================================

@app.route("/api/collections", methods=["POST"])
def create_collection():

    data = request.get_json() or {}

    raw_bin_id = data.get("bin_id")
    hospital_id = data.get("hospital_id")
    waste_type = data.get("waste_type")
    collector_name = data.get("collector_name", "CBWTF Rapid Response Fleet")
    vehicle_id = data.get("vehicle_id")
    status = data.get("status", "Pending")

    weight = float(data.get("weight") or data.get("weight_kg") or data.get("deposit_weight_kg") or 0.0)
    requested_at = data.get("requested_at") or data.get("timestamp") or datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if "T" in requested_at:
        try:
            if requested_at.endswith("Z"):
                dt_utc = datetime.fromisoformat(requested_at.replace("Z", "+00:00"))
                requested_at = dt_utc.astimezone().strftime("%Y-%m-%d %H:%M:%S")
            else:
                requested_at = requested_at.replace("T", " ").split(".")[0]
        except Exception:
            requested_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Clean bin_id
    bin_id = None
    if raw_bin_id not in (None, "", "auto", "Auto"):
        try:
            bin_id = int(raw_bin_id)
        except (ValueError, TypeError):
            bin_id = None

    if hospital_id is not None:
        try:
            hospital_id = int(hospital_id)
        except (ValueError, TypeError):
            hospital_id = None

    conn = get_db()
    cursor = conn.cursor()

    target_bin = None

    # Step 1: If bin_id is specified, check if it belongs to requested hospital_id
    if bin_id:
        cursor.execute("SELECT * FROM bins WHERE id = ?", (bin_id,))
        b_row = cursor.fetchone()
        if b_row:
            # If hospital_id is specified and matches the bin, keep it
            if hospital_id is None or b_row["hospital_id"] == hospital_id:
                target_bin = dict(b_row)

    # Step 2: If target_bin still not found, search by hospital_id and waste_type
    if not target_bin:
        if hospital_id is not None:
            if waste_type:
                cursor.execute("""
                    SELECT * FROM bins 
                    WHERE hospital_id = ? AND LOWER(waste_type) = LOWER(?)
                    LIMIT 1
                """, (hospital_id, waste_type))
                b_row = cursor.fetchone()
                if b_row:
                    target_bin = dict(b_row)

            if not target_bin:
                # Any existing bin for this hospital
                cursor.execute("""
                    SELECT * FROM bins 
                    WHERE hospital_id = ?
                    ORDER BY id ASC
                    LIMIT 1
                """, (hospital_id,))
                b_row = cursor.fetchone()
                if b_row:
                    target_bin = dict(b_row)

            if not target_bin:
                # Auto-initialize standard bin for this hospital
                wtype = waste_type or "Yellow"
                cursor.execute("SELECT COUNT(*) FROM bins")
                total_b = cursor.fetchone()[0]
                bin_code = f"BIN-{wtype[:3].upper()}-{total_b + 1:03d}"
                cursor.execute("""
                    INSERT INTO bins (bin_code, hospital_id, waste_type, capacity, current_level, weight, status)
                    VALUES (?, ?, ?, 50.0, 10.0, 5.0, 'Normal')
                """, (bin_code, hospital_id, wtype))
                new_id = cursor.lastrowid
                target_bin = {
                    "id": new_id,
                    "bin_code": bin_code,
                    "hospital_id": hospital_id,
                    "waste_type": wtype,
                    "current_level": 10.0,
                    "weight": 5.0
                }
        else:
            # Fallback to first available bin
            cursor.execute("SELECT * FROM bins LIMIT 1")
            b_row = cursor.fetchone()
            if b_row:
                target_bin = dict(b_row)

    if not target_bin:
        conn.close()
        return jsonify({
            "success": False,
            "message": "No valid smart container found to attach collection request"
        }), 400

    resolved_bin_id = target_bin["id"]
    bin_code = target_bin.get("bin_code", f"BIN-{resolved_bin_id:03d}")

    if weight <= 0:
        weight = float(target_bin.get("weight", 0.0) or 1.8)
    weight = round(weight, 1)

    # Assign default vehicle if not provided
    if not vehicle_id:
        cursor.execute("SELECT id FROM vehicles LIMIT 1")
        v_row = cursor.fetchone()
        if v_row:
            vehicle_id = v_row[0]

    cursor.execute("""
        INSERT INTO collections
        (bin_id, vehicle_id, collector_name, status, weight, requested_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (resolved_bin_id, vehicle_id, collector_name, status, weight, requested_at))

    collection_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Collection request created successfully",
        "collection_id": collection_id,
        "bin_id": resolved_bin_id,
        "bin_code": bin_code,
        "waste_type": target_bin.get("waste_type", "Yellow"),
        "weight": weight,
        "requested_at": requested_at,
        "status": status
    }), 201


# ==========================================
# GET COLLECTION REQUESTS
# ==========================================

@app.route("/api/collections", methods=["GET"])
def get_collections():
    hospital_id = request.args.get("hospital_id", type=int)

    conn = get_db()
    cursor = conn.cursor()

    if hospital_id is not None:
        cursor.execute("""
            SELECT
                collections.id,
                collections.bin_id,
                collections.vehicle_id,
                collections.collector_name,
                collections.status,
                collections.requested_at,
                collections.collected_at,
                collections.delivered_at,
                CASE 
                    WHEN collections.weight IS NOT NULL AND collections.weight > 0 THEN collections.weight 
                    ELSE bins.weight 
                END AS weight,
                bins.bin_code,
                bins.waste_type,
                bins.current_level,
                bins.hospital_id,
                hospitals.name AS hospital_name,
                vehicles.vehicle_number,
                vehicles.driver_name
            FROM collections
            LEFT JOIN bins
            ON collections.bin_id = bins.id
            LEFT JOIN hospitals
            ON bins.hospital_id = hospitals.id
            LEFT JOIN vehicles
            ON collections.vehicle_id = vehicles.id
            WHERE bins.hospital_id = ?
            ORDER BY collections.requested_at DESC
        """, (hospital_id,))
    else:
        cursor.execute("""
            SELECT
                collections.id,
                collections.bin_id,
                collections.vehicle_id,
                collections.collector_name,
                collections.status,
                collections.requested_at,
                collections.collected_at,
                collections.delivered_at,
                CASE 
                    WHEN collections.weight IS NOT NULL AND collections.weight > 0 THEN collections.weight 
                    ELSE bins.weight 
                END AS weight,
                bins.bin_code,
                bins.waste_type,
                bins.current_level,
                bins.hospital_id,
                hospitals.name AS hospital_name,
                vehicles.vehicle_number,
                vehicles.driver_name
            FROM collections
            LEFT JOIN bins
            ON collections.bin_id = bins.id
            LEFT JOIN hospitals
            ON bins.hospital_id = hospitals.id
            LEFT JOIN vehicles
            ON collections.vehicle_id = vehicles.id
            ORDER BY collections.requested_at DESC
        """)

    rows = cursor.fetchall()
    conn.close()

    collections = [
        row_to_dict(row)
        for row in rows
    ]

    return jsonify({
        "success": True,
        "collections": collections
    })


# ==========================================
# UPDATE COLLECTION STATUS
# ==========================================

@app.route(
    "/api/collections/<int:collection_id>",
    methods=["PUT"]
)
def update_collection(collection_id):

    data = request.get_json()

    status = data.get("status")
    vehicle_id = data.get("vehicle_id")
    collector_name = data.get("collector_name")

    valid_statuses = [
        "Pending",
        "Assigned",
        "Collected",
        "Delivered",
        "Cancelled"
    ]

    if status not in valid_statuses:

        return jsonify({
            "success": False,
            "message": "Invalid status"
        }), 400

    conn = get_db()
    cursor = conn.cursor()

    if status == "Collected":

        cursor.execute("""
            UPDATE collections
            SET status = ?,
                vehicle_id = ?,
                collector_name = ?,
                collected_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (
            status,
            vehicle_id,
            collector_name,
            collection_id
        ))

    elif status == "Delivered":

        cursor.execute("""
            UPDATE collections
            SET status = ?,
                delivered_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (
            status,
            collection_id
        ))

    else:

        cursor.execute("""
            UPDATE collections
            SET status = ?,
                vehicle_id = ?,
                collector_name = ?
            WHERE id = ?
        """, (
            status,
            vehicle_id,
            collector_name,
            collection_id
        ))

    conn.commit()

    if cursor.rowcount == 0:

        conn.close()

        return jsonify({
            "success": False,
            "message": "Collection not found"
        }), 404

    conn.close()

    return jsonify({
        "success": True,
        "message": "Collection updated"
    })


# ==========================================
# DELETE COLLECTION REQUEST
# ==========================================

@app.route(
    "/api/collections/<int:collection_id>",
    methods=["DELETE"]
)
def delete_collection(collection_id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM collections WHERE id = ?", (collection_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()

    if not deleted:
        return jsonify({
            "success": False,
            "message": "Pickup request not found"
        }), 404

    return jsonify({
        "success": True,
        "message": "Pickup request deleted successfully"
    })


# ==========================================
# VEHICLES
# ==========================================

@app.route("/api/vehicles", methods=["GET"])
def get_vehicles():

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM vehicles
        ORDER BY status
    """)

    rows = cursor.fetchall()

    conn.close()

    vehicles = [
        row_to_dict(row)
        for row in rows
    ]

    return jsonify({
        "success": True,
        "vehicles": vehicles
    })


# ==========================================
# UPDATE VEHICLE LOCATION
# ==========================================

@app.route(
    "/api/vehicles/<int:vehicle_id>/location",
    methods=["PUT"]
)
def update_vehicle_location(vehicle_id):

    data = request.get_json()

    latitude = data.get("latitude")
    longitude = data.get("longitude")

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE vehicles
        SET latitude = ?,
            longitude = ?
        WHERE id = ?
    """, (
        latitude,
        longitude,
        vehicle_id
    ))

    conn.commit()

    if cursor.rowcount == 0:

        conn.close()

        return jsonify({
            "success": False,
            "message": "Vehicle not found"
        }), 404

    conn.close()

    return jsonify({
        "success": True,
        "message": "Vehicle location updated"
    })


# ==========================================
# HOSPITALS
# ==========================================

@app.route("/api/hospitals", methods=["GET"])
def get_hospitals():

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM hospitals
        ORDER BY name
    """)

    rows = cursor.fetchall()

    conn.close()

    hospitals = [
        row_to_dict(row)
        for row in rows
    ]

    return jsonify({
        "success": True,
        "hospitals": hospitals
    })


# ==========================================
# CREATE HOSPITAL
# ==========================================

@app.route("/api/hospitals", methods=["POST"])
def create_hospital():

    data = request.get_json()

    name = data.get("name")
    location = data.get("location")
    contact = data.get("contact")

    if not name:

        return jsonify({
            "success": False,
            "message": "Hospital name is required"
        }), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO hospitals
        (name, location, contact)
        VALUES (?, ?, ?)
    """, (
        name,
        location,
        contact
    ))

    hospital_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "hospital_id": hospital_id
    }), 201


# ==========================================
# STATISTICS
# ==========================================

@app.route("/api/statistics", methods=["GET"])
def statistics():

    conn = get_db()
    cursor = conn.cursor()

    # Waste by category
    cursor.execute("""
        SELECT
            waste_type,
            SUM(weight) AS total_weight
        FROM waste_records
        GROUP BY waste_type
    """)

    category_rows = cursor.fetchall()

    waste_by_category = {
        row["waste_type"]: round(
            row["total_weight"] or 0,
            2
        )
        for row in category_rows
    }

    # Total records
    cursor.execute("""
        SELECT COUNT(*)
        FROM waste_records
    """)

    total_records = cursor.fetchone()[0]

    # Total hospitals
    cursor.execute("""
        SELECT COUNT(*)
        FROM hospitals
    """)

    hospitals = cursor.fetchone()[0]

    # Total vehicles
    cursor.execute("""
        SELECT COUNT(*)
        FROM vehicles
    """)

    vehicles = cursor.fetchone()[0]

    conn.close()

    return jsonify({
        "success": True,
        "statistics": {
            "total_waste_records": total_records,
            "hospitals": hospitals,
            "vehicles": vehicles,
            "waste_by_category": waste_by_category
        }
    })


# ==========================================
# UPLOADED FILE SERVING
# ==========================================

@app.route("/uploads/<path:filename>", methods=["GET"])
def uploaded_file(filename):
    if os.path.exists(os.path.join(app.config["UPLOAD_FOLDER"], filename)):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)
    legacy_folder = os.path.join(os.path.dirname(__file__), "uploads")
    if os.path.exists(os.path.join(legacy_folder, filename)):
        return send_from_directory(legacy_folder, filename)
    return jsonify({"error": "File not found"}), 404


# ==========================================
# AUTHENTICATION
# ==========================================

@app.route("/api/auth/login", methods=["POST"])
@app.route("/api/login", methods=["POST"])
def login_user():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required"
        }), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT users.*, hospitals.name AS hospital_name
        FROM users
        LEFT JOIN hospitals ON users.hospital_id = hospitals.id
        WHERE LOWER(users.email) = ? AND users.password = ?
    """, (email, password))
    user_row = cursor.fetchone()
    conn.close()

    if not user_row:
        return jsonify({
            "success": False,
            "message": "Invalid email or password"
        }), 401

    user = dict(user_row)
    del user["password"]

    return jsonify({
        "success": True,
        "message": "Login successful",
        "user": user,
        "token": f"demo-token-{user['id']}-medwaste"
    })


@app.route("/api/auth/register", methods=["POST"])
@app.route("/api/register", methods=["POST"])
def register_user():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role", "hospital").strip()
    hospital_name = data.get("hospital_name", "").strip() or f"{name}'s Medical Facility"

    if not name or not email or not password:
        return jsonify({
            "success": False,
            "message": "Full name, email, and password are required"
        }), 400

    conn = get_db()
    cursor = conn.cursor()

    # Always create a brand-new facility for a newly registered user so their initial data starts at 0!
    cursor.execute("INSERT INTO hospitals (name, location) VALUES (?, 'India')", (hospital_name,))
    hospital_id = cursor.lastrowid

    try:
        cursor.execute("""
            INSERT INTO users (name, email, password, role, hospital_id)
            VALUES (?, ?, ?, ?, ?)
        """, (name, email, password, role, hospital_id))
        user_id = cursor.lastrowid

        # Initialize the 4 standard empty clinical bins (Yellow, Red, Blue, White) at 0% level / 0 kg
        std_bins = [
            ("Yellow", "BIN-YEL"),
            ("Red", "BIN-RED"),
            ("Blue", "BIN-BLU"),
            ("White", "BIN-WHT")
        ]
        for wtype, prefix in std_bins:
            cursor.execute("SELECT COUNT(*) FROM bins")
            total_b = cursor.fetchone()[0]
            code = f"{prefix}-{total_b + 1:03d}"
            cursor.execute("""
                INSERT INTO bins (bin_code, hospital_id, waste_type, capacity, current_level, weight, status)
                VALUES (?, ?, ?, 50.0, 0.0, 0.0, 'Normal')
            """, (code, hospital_id, wtype))

        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({
            "success": False,
            "message": "This email address is already registered"
        }), 409

    cursor.execute("""
        SELECT users.*, hospitals.name AS hospital_name
        FROM users
        LEFT JOIN hospitals ON users.hospital_id = hospitals.id
        WHERE users.id = ?
    """, (user_id,))
    new_user = dict(cursor.fetchone())
    del new_user["password"]
    conn.close()

    return jsonify({
        "success": True,
        "message": "Account created successfully",
        "user": new_user,
        "token": f"demo-token-{user_id}-medwaste"
    }), 201


@app.route("/api/auth/me", methods=["GET"])
def auth_me():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT users.id, users.name, users.email, users.role, users.hospital_id, hospitals.name AS hospital_name
        FROM users
        LEFT JOIN hospitals ON users.hospital_id = hospitals.id
        LIMIT 1
    """)
    user_row = cursor.fetchone()
    conn.close()

    if user_row:
        return jsonify({
            "success": True,
            "user": dict(user_row)
        })
    return jsonify({
        "success": False,
        "message": "Not authenticated"
    }), 401


@app.route("/api/auth/profile", methods=["GET", "PUT"])
def auth_profile():
    conn = get_db()
    cursor = conn.cursor()

    if request.method == "GET":
        user_id = request.args.get("user_id", type=int)
        if not user_id:
            cursor.execute("SELECT id FROM users LIMIT 1")
            row = cursor.fetchone()
            user_id = row["id"] if row else 1

        cursor.execute("""
            SELECT users.*, hospitals.name AS hospital_name
            FROM users
            LEFT JOIN hospitals ON users.hospital_id = hospitals.id
            WHERE users.id = ?
        """, (user_id,))
        user_row = cursor.fetchone()
        if not user_row:
            conn.close()
            return jsonify({"success": False, "message": "User not found"}), 404

        user_data = dict(user_row)
        del user_data["password"]

        h_id = user_data.get("hospital_id")
        cursor.execute("""
            SELECT COALESCE(SUM(wr.weight), 0)
            FROM waste_records wr
            JOIN bins b ON wr.bin_id = b.id
            WHERE b.hospital_id = ?
        """, (h_id,))
        facility_waste = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM bins WHERE hospital_id = ?", (h_id,))
        facility_bins = cursor.fetchone()[0]

        conn.close()
        return jsonify({
            "success": True,
            "user": user_data,
            "facility_stats": {
                "total_waste": round(facility_waste, 2),
                "bins_count": facility_bins
            }
        })

    elif request.method == "PUT":
        data = request.get_json() or {}
        user_id = data.get("user_id")
        if not user_id:
            conn.close()
            return jsonify({"success": False, "message": "user_id is required"}), 400

        name = data.get("name", "").strip()
        email = data.get("email", "").strip().lower()
        hospital_name = data.get("hospital_name", "").strip()
        password = data.get("password", "").strip()

        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user_row = cursor.fetchone()
        if not user_row:
            conn.close()
            return jsonify({"success": False, "message": "User not found"}), 404

        hospital_id = user_row["hospital_id"]

        if hospital_name and hospital_id:
            cursor.execute("UPDATE hospitals SET name = ? WHERE id = ?", (hospital_name, hospital_id))

        if password:
            cursor.execute("""
                UPDATE users
                SET name = COALESCE(NULLIF(?, ''), name),
                    email = COALESCE(NULLIF(?, ''), email),
                    password = ?
                WHERE id = ?
            """, (name, email, password, user_id))
        else:
            cursor.execute("""
                UPDATE users
                SET name = COALESCE(NULLIF(?, ''), name),
                    email = COALESCE(NULLIF(?, ''), email)
                WHERE id = ?
            """, (name, email, user_id))

        conn.commit()

        cursor.execute("""
            SELECT users.*, hospitals.name AS hospital_name
            FROM users
            LEFT JOIN hospitals ON users.hospital_id = hospitals.id
            WHERE users.id = ?
        """, (user_id,))
        updated_user = dict(cursor.fetchone())
        del updated_user["password"]
        conn.close()

        return jsonify({
            "success": True,
            "message": "Profile updated successfully",
            "user": updated_user
        })


# ==========================================
# CONTACT & DEMO REQUEST
# ==========================================

@app.route("/api/contact", methods=["POST"])
def contact_inquiry():
    data = request.get_json() or {}
    name = data.get("name", "")
    email = data.get("email", "")
    phone = data.get("phone", "")
    hospital_name = data.get("hospital_name", "")
    message = data.get("message", "")

    if not email and not phone:
        return jsonify({
            "success": False,
            "message": "Please provide an email or phone number"
        }), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO inquiries (name, email, phone, hospital_name, message)
        VALUES (?, ?, ?, ?, ?)
    """, (name, email, phone, hospital_name, message))
    inquiry_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Demo request registered! Our coordinator will contact you shortly.",
        "inquiry_id": inquiry_id
    }), 201


# # ==========================================
# AI CHATBOT & KNOWLEDGE ENGINE
# ==========================================

import re
from dotenv import load_dotenv

load_dotenv()

# Optional Gemini 2.5 Flash LLM Integration
try:
    from google import genai
    from google.genai import types
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False


CHATBOT_FAQS = [
    {
        "id": "faq-1",
        "category": "Segregation",
        "category_tag": "Red",
        "question": "Which bin should I dispose of used plastic syringes and IV sets into?",
        "answer": "Disposable plastic syringes (without needles), IV fluid administration sets, catheters, urine bags, and plastic dialysis tubing must be segregated into the **Red Container**. Crucial step: Always cut the needle hub using a point-of-use needle cutter before dropping the plastic syringe body into the Red bin.",
        "recommended_action": "Snip needle hub at point-of-use, then place plastic barrel into RED bin."
    },
    {
        "id": "faq-2",
        "category": "Emergency",
        "category_tag": "Emergency",
        "question": "What is the emergency first-aid procedure for an accidental needle-stick injury?",
        "answer": "1. **Immediately wash** the puncture wound under cool running tap water with soap for 5 minutes.\n2. **DO NOT** squeeze, press, or suck the wound violently, as this causes tissue trauma.\n3. Cover with a sterile waterproof bandage.\n4. **Report immediately** to the Infection Control Officer or supervisor.\n5. Initiate **Post-Exposure Prophylaxis (PEP)** for HIV and Hepatitis B evaluation within 2 hours.",
        "recommended_action": "Wash under running tap water for 5 minutes. Report within 2 hours for PEP."
    },
    {
        "id": "faq-3",
        "category": "Collection",
        "category_tag": "Collection",
        "question": "What is the maximum time biomedical waste can be stored before collection?",
        "answer": "According to the **Bio-Medical Waste Management Rules 2016 (CPCB)**, untreated biomedical waste must **never be stored beyond 48 hours**. If holding beyond 48 hours is unavoidable due to exceptional circumstances, the healthcare facility must inform the State Pollution Control Board and ensure cool refrigerated storage to prevent microbial growth.",
        "recommended_action": "Ensure waste collection and dispatch within 48 hours."
    },
    {
        "id": "faq-4",
        "category": "Segregation",
        "category_tag": "Yellow",
        "question": "What items belong in the Yellow biohazard bag?",
        "answer": "The **Yellow Bag** is for infectious and anatomical waste:\n- Human anatomical tissues, organs, placentas, biopsy specimens\n- Soiled waste: blood-soaked gauze, dressings, cotton swabs, plaster casts\n- Expired or discarded cytotoxic medicines\n- Microbiology and biotechnology laboratory cultures and specimens\n- Soiled masks and paper PPE contaminated with body fluids.",
        "recommended_action": "Double-knot non-chlorinated yellow bag when 3/4 full."
    },
    {
        "id": "faq-5",
        "category": "Segregation",
        "category_tag": "White",
        "question": "Where should hypodermic needles, scalpels, and surgical blades be discarded?",
        "answer": "All contaminated metal sharps—including hypodermic needles, scalpel blades, suture needles, lancets, and contaminated broken ampoule tips—must be dropped immediately into a **White Translucent, Puncture-Proof, Tamper-Evident Container**. Never recap needles by hand!",
        "recommended_action": "Drop directly into White puncture-proof sharps box without recapping."
    },
    {
        "id": "faq-6",
        "category": "Segregation",
        "category_tag": "Blue",
        "question": "Which container is used for broken medicine glass ampoules and metal implants?",
        "answer": "Broken or intact glass medicine vials, ampoules, microscope slides, and contaminated metal orthopedic implants (pins, screws, plates) must go into **Blue-marked puncture-resistant boxes or bins**. Never pick up broken glass with bare hands; always use forceps or tongs.",
        "recommended_action": "Use tongs or forceps to place glass and implants into BLUE boxes."
    },
    {
        "id": "faq-7",
        "category": "Precautions",
        "category_tag": "Precautions",
        "question": "What PPE is required when handling biomedical waste bags and bins?",
        "answer": "Waste handlers and clinical staff must wear:\n- Heavy-duty nitrile or utility puncture-resistant gloves\n- Fluid-impermeable apron or clinical gown\n- N95 respirator mask or 3-ply surgical mask\n- Protective eye goggles or full-face shield\n- Closed-toe impermeable rubber gumboots.\nNever compress or squeeze waste bags with bare hands.",
        "recommended_action": "Don full PPE: heavy gloves, fluid apron, face shield, and gumboots."
    },
    {
        "id": "faq-8",
        "category": "Emergency",
        "category_tag": "Emergency",
        "question": "How should a blood or bodily fluid spill in a hospital ward be managed?",
        "answer": "1. Cordon off the spill zone immediately.\n2. Don full protective PPE (gloves, face shield, apron).\n3. Cover the liquid spill with absorbent paper towels.\n4. Pour freshly prepared **1% Sodium Hypochlorite solution** (10,000 ppm available chlorine) over the towels.\n5. Allow a minimum of **20 minutes contact time** for viral/bacterial inactivation.\n6. Scoop soaked towels using a dustpan/tongs into a **Yellow Bag** and mop with hospital disinfectant.",
        "recommended_action": "Cover with paper towels + 1% Sodium Hypochlorite for 20 minutes."
    },
    {
        "id": "faq-9",
        "category": "Collection",
        "category_tag": "Collection",
        "question": "What are barcoded bio-waste bags and why are they mandatory?",
        "answer": "Under CPCB BMWM Rules, every biohazard bag and sharp container must bear a **unique Barcode and RFID tag** generated for that specific healthcare facility. This enables end-to-end digital tracking from the hospital ward through transport vehicles to the Common Bio-Medical Waste Treatment Facility (CBWTF), recording exact weight and transit timestamps.",
        "recommended_action": "Scan and tag every bag with CPCB-compliant Barcode before handoff."
    },
    {
        "id": "faq-10",
        "category": "Precautions",
        "category_tag": "Cytotoxic",
        "question": "How should cytotoxic oncology and chemotherapy drugs be handled?",
        "answer": "Chemotherapy agents are carcinogenic, mutagenic, and teratogenic. Waste (IV lines, gloves, drug residues, patient bodily waste within 48 hours of chemo) must be sealed in **dedicated Purple-labeled cytotoxic bags**. Handlers must wear double chemo-tested nitrile gloves and face shields. Final disposal requires high-temperature incineration exceeding 1200°C.",
        "recommended_action": "Double-glove, use Purple cytotoxic bags, and incinerate at 1200°C."
    }
]


def call_gemini_llm(query, api_key):
    """Invokes Google Gemini 2.5 Flash model for natural clinical intelligence."""
    if not HAS_GENAI or not api_key:
        return None
    try:
        client = genai.Client(api_key=api_key)
        system_instruction = (
            "You are MedWaste AI, a friendly, warm, empathetic, and intelligent AI companion and clinical biomedical waste guide. "
            "You communicate naturally like a kind, supportive, and knowledgeable human colleague on a hospital healthcare team:\n"
            "1. For casual greetings, small talk, and social questions (such as 'hi', 'hello', 'good morning', 'how are you', 'how is your day going', 'tell me a joke', 'thank you', 'goodbye', 'i am tired'): "
            "Respond warmly, naturally, and conversationally like a caring friend (e.g., greet them back, say 'Good morning! How is your day going?', ask how their shift is, show empathy if they are stressed, or joke lightly). "
            "Do NOT dump unnecessary clinical lectures when someone is just saying hello or asking how you are!\n"
            "2. When asked questions about biomedical waste segregation, collection logistics, clinical precautions, emergencies, or regulations: "
            "Provide authoritative, clear, and structured guidance strictly adhering to India's Bio-Medical Waste Management Rules 2016 (CPCB) and WHO Infection Control protocols.\n"
            "3. If a question mixes a greeting with a waste question (e.g., 'Good morning, where do plastic syringes go?'): "
            "Warmly greet them back first, then clearly answer their question.\n"
            "Format replies cleanly using markdown with bolding and bullet points when appropriate.\n"
            "At the very end of your response, strictly output these three metadata tags on separate lines:\n"
            "CATEGORY: <Yellow | Red | White | Blue | Cytotoxic | General | Emergency | Regulatory | Educational>\n"
            "ACTION: <A single concise sentence with the key takeaway action or friendly thought>\n"
            "FOLLOWUPS: <Followup 1> | <Followup 2> | <Followup 3>"
        )

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=query,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.3,
            )
        )

        text = response.text or ""
        category_tag = "General"
        action = "Follow hospital infection control SOPs and CPCB guidelines."
        followups = [
            "Which bin do used syringes go into?",
            "What is the needle-stick injury emergency SOP?",
            "What is the 48-hour waste storage rule?"
        ]

        # Extract metadata tags
        cat_match = re.search(r"CATEGORY:\s*([^\n\r]+)", text, re.IGNORECASE)
        if cat_match:
            category_tag = cat_match.group(1).strip()
            text = re.sub(r"CATEGORY:\s*[^\n\r]+", "", text, flags=re.IGNORECASE)

        act_match = re.search(r"ACTION:\s*([^\n\r]+)", text, re.IGNORECASE)
        if act_match:
            action = act_match.group(1).strip()
            text = re.sub(r"ACTION:\s*[^\n\r]+", "", text, flags=re.IGNORECASE)

        fol_match = re.search(r"FOLLOWUPS:\s*([^\n\r]+)", text, re.IGNORECASE)
        if fol_match:
            raw_fols = fol_match.group(1).split("|")
            followups = [f.strip() for f in raw_fols if f.strip()]
            text = re.sub(r"FOLLOWUPS:\s*[^\n\r]+", "", text, flags=re.IGNORECASE)

        return {
            "reply": text.strip(),
            "category_tag": category_tag,
            "recommended_action": action,
            "suggested_followups": followups,
            "engine": "Gemini 2.5 Flash"
        }
    except Exception as e:
        print(f"[!] Gemini LLM invocation failed: {e}")
        return None


def advanced_semantic_biomed_ai(query):
    """
    Comprehensive Semantic Reasoning Engine for Biomedical Waste Management.
    Understands user intent, question structure, hospital scenarios, and specific items.
    """
    raw_q = (query or "").strip()
    q = raw_q.lower()

    if not q:
        return {
            "reply": "Hello! I am your **MedWaste AI Clinical & Regulatory Assistant**. You can ask me any question about biomedical waste segregation (Yellow, Red, White, Blue streams), collection schedules, barcoding, CPCB 2016 rules, and clinical safety precautions.",
            "category_tag": "General",
            "recommended_action": "Type any waste item or question to get instant segregation guidance.",
            "suggested_followups": [
                "Which bin do used syringes go into?",
                "What is the needle-stick injury emergency SOP?",
                "What is the 48-hour waste storage rule?"
            ],
            "engine": "MedWaste AI Neural Rule Engine"
        }

    # -------------------------------------------------------------
    # GREETING PREFIX HELPER (FOR MIXED GREETING + CLINICAL QUERIES)
    # -------------------------------------------------------------
    greeting_prefix = ""
    if re.search(r"\b(good\s*morning|morning|gm)\b", q):
        greeting_prefix = "Good morning! ☀️ Hope your day is off to a great start!\n\n"
    elif re.search(r"\b(good\s*afternoon|afternoon)\b", q):
        greeting_prefix = "Good afternoon! 🌤️ Hope your day is going well!\n\n"
    elif re.search(r"\b(good\s*evening|evening)\b", q):
        greeting_prefix = "Good evening! 🌆 Hope you had a fulfilling day!\n\n"
    elif re.search(r"\b(hi+|hello+|hey+|namaste)\b", q):
        greeting_prefix = "Hello! 👋 Great to connect with you!\n\n"

    # Check if query is asking a specific clinical / waste / regulatory question
    exact_clinical_words = {"bin", "bins", "waste", "red", "blue", "ppe", "pus", "sharp", "sharps"}
    query_tokens = set(re.findall(r"\b[a-z0-9_]+\b", q))
    multiword_or_stems = [
        "needle", "syringe", "iv set", "iv tube", "catheter", "scalpel", "blade",
        "lancet", "glass", "ampoule", "vial", "yellow bag", "yellow bin", "white container",
        "cytotoxic", "chemo", "spill", "leak", "hypochlorite", "vomit", "vomited",
        "blood", "prick", "needlestick", "infection", "hazard", "segregat", "cpcb",
        "spcb", "48 hour", "48hr", "storage", "collection", "pickup", "autoclave",
        "incinerat", "glove", "mask", "gowns", "mercury", "disinfect", "cotton",
        "gauze", "dressing", "placenta", "tissue", "anatomical", "pathology",
        "dialysis", "overfill", "recap"
    ]
    is_clinical_query = bool(exact_clinical_words & query_tokens) or any(k in q for k in multiword_or_stems)

    # -------------------------------------------------------------
    # 1. CASUAL CONVERSATION & SOCIAL INTERACTION (HUMAN-LIKE)
    # -------------------------------------------------------------
    if not is_clinical_query:
        # A. How are you / How is your day / What's up
        if any(k in q for k in ["how are you", "how r u", "how is your day", "how's your day", "how is ur day", "hows your day", "how are you doing", "how are things", "how's it going", "how is it going", "what's up", "whats up", "wassup", "sup", "how do you do"]):
            prefix = "Good morning! ☀️ " if ("morning" in q or "gm" in q) else ("Good afternoon! 🌤️ " if "afternoon" in q else ("Good evening! 🌆 " if "evening" in q else ""))
            return {
                "reply": f"{prefix}I'm doing really well, thank you so much for asking! 😊 My day has been going great. How about you? How is your day going? Are you working a busy shift at the hospital today or taking things easy?",
                "category_tag": "General",
                "recommended_action": "Stay positive, drink water, and have a wonderful day!",
                "suggested_followups": [
                    "I'm having a busy shift today",
                    "Which bin do used plastic syringes go into?",
                    "What is the emergency protocol for a needle-stick injury?"
                ],
                "engine": "MedWaste AI Conversational Engine"
            }

        # B. Good Morning
        if any(k in q for k in ["good morning", "morning", "mornin", "gm"]):
            return {
                "reply": "Good morning! ☀️ Hope your day is off to a wonderful start! How is your day going so far? Let me know if you need any help with waste segregation, hospital protocols, or anything around the ward today. Wishing you a smooth, safe, and productive day ahead! 😊",
                "category_tag": "General",
                "recommended_action": "Have a wonderful, safe, and productive morning!",
                "suggested_followups": [
                    "How are you doing today?",
                    "Where do used plastic syringes go?",
                    "What is the 48-hour waste storage rule?"
                ],
                "engine": "MedWaste AI Conversational Engine"
            }

        # C. Good Afternoon
        if any(k in q for k in ["good afternoon", "afternoon"]):
            return {
                "reply": "Good afternoon! 🌤️ Hope you're having a pleasant and productive day. How is your shift or workday going so far? I'm right here if you need a quick hand with clinical waste sorting, storage rules, or anything else today!",
                "category_tag": "General",
                "recommended_action": "Stay energized and have a great afternoon!",
                "suggested_followups": [
                    "How are you doing?",
                    "What belongs in the Yellow biohazard bag?",
                    "What PPE is required for waste handling?"
                ],
                "engine": "MedWaste AI Conversational Engine"
            }

        # D. Good Evening / Good Night
        if any(k in q for k in ["good evening", "evening"]):
            return {
                "reply": "Good evening! 🌆 Hope you had a fulfilling day today. How are things winding down for you? Feel free to ask if you're wrapping up ward duties, checking storage logs, or just checking in!",
                "category_tag": "General",
                "recommended_action": "Wishing you a calm and peaceful evening!",
                "suggested_followups": [
                    "How was your day?",
                    "What is the 48-hour waste storage rule?",
                    "What goes into the White sharps container?"
                ],
                "engine": "MedWaste AI Conversational Engine"
            }

        if any(k in q for k in ["good night", "goodnight"]):
            return {
                "reply": "Good night! 🌙 Wishing you a peaceful and restful night! If you're on the night shift, stay safe, alert, and take good care of yourself. I'm always here if you need any guidance!",
                "category_tag": "General",
                "recommended_action": "Have a restful night and stay safe on night shifts!",
                "suggested_followups": [
                    "What is the emergency protocol for a needle stick?",
                    "Where do plastic IV sets go?",
                    "Tell me a joke"
                ],
                "engine": "MedWaste AI Conversational Engine"
            }

        # E. Casual Greetings ("Hi", "Hello", "Hey", "Namaste", "Yo", etc.)
        if re.search(r"^(hi+|hello+|hey+|heya|namaste|yo|greetings)\b", q):
            return {
                "reply": "Hey there! 👋 It's great to see you! How are you doing today? How's your day going so far?\n\nWhether you have a quick question about waste segregation, need an emergency protocol, or just want to chat, I'm right here with you! What's on your mind today?",
                "category_tag": "General",
                "recommended_action": "Feel free to ask any question or chat anytime.",
                "suggested_followups": [
                    "How are you doing?",
                    "Which bin do used syringes go into?",
                    "What is the emergency protocol for a needle-stick injury?"
                ],
                "engine": "MedWaste AI Conversational Engine"
            }

        # F. Work Shift Feelings & Empathy ("I'm tired", "busy day", "stressful", "hectic", "rough shift")
        if any(w in q for w in ["tired", "exhausted", "busy day", "stressful", "hectic", "rough day", "hard shift", "long day", "tough day", "overwhelmed"]):
            return {
                "reply": "Oh, hang in there! 💙 Healthcare and hospital work can be so demanding and mentally draining. Please remember to take a short breather, drink some water, and give yourself credit for the incredible work you do keeping people safe every single day! 💪\n\nIs there anything I can help you with right now to take some load off your shoulders?",
                "category_tag": "General",
                "recommended_action": "Take a 5-minute breather and remember to stay hydrated!",
                "suggested_followups": [
                    "Where do used plastic syringes go?",
                    "What is the 48-hour waste storage rule?",
                    "Tell me a joke"
                ],
                "engine": "MedWaste AI Conversational Engine"
            }

        # G. User is doing good / fine ("I'm good", "doing well", "all good")
        if any(k in q for k in ["i'm good", "im good", "doing well", "doing good", "all good", "i am good", "fine thanks", "great thanks", "doing fine"]):
            return {
                "reply": "That's wonderful to hear! 😊 So glad to know you're doing well today. Is there anything on your mind I can help you with—whether it's checking a waste bin rule, collection schedule, or safety precaution?",
                "category_tag": "General",
                "recommended_action": "Let me know whenever you have any question or need help!",
                "suggested_followups": [
                    "Which bin do used plastic syringes go into?",
                    "What is the needle-stick injury emergency SOP?",
                    "What is the 48-hour waste storage rule?"
                ],
                "engine": "MedWaste AI Conversational Engine"
            }

        # H. Short confirmations ("ok", "cool", "alright")
        if q in ["ok", "okay", "alright", "got it", "cool", "sure", "yep", "yes", "gotcha"]:
            return {
                "reply": "Sounds great! 👍 I'm right here whenever you need anything. Wishing you a safe and smooth rest of your day!",
                "category_tag": "General",
                "recommended_action": "Ask anytime if you need more information.",
                "suggested_followups": [
                    "Where do used plastic syringes go?",
                    "What belongs in the Yellow biohazard bag?",
                    "What is the emergency protocol for a needle stick?"
                ],
                "engine": "MedWaste AI Conversational Engine"
            }

        # I. Gratitude & Compliments ("Thank you", "Thanks", "You are awesome", "Great job")
        if any(k in q for k in ["thank you", "thanks", "thx", "appreciate it", "awesome", "good job", "great job", "you're great", "you are great", "you're awesome", "you are awesome", "cool", "love you", "nice bot", "good bot"]):
            return {
                "reply": "You're so very welcome! 🥰 It really makes my day to know I could help you out! Thank you for the kind words. How is the rest of your day looking? Let me know whenever you need anything else!",
                "category_tag": "General",
                "recommended_action": "Always here and happy to support you!",
                "suggested_followups": [
                    "How's your day going?",
                    "What are the 4 main color-coded waste streams?",
                    "What is the emergency protocol for a needle stick?"
                ],
                "engine": "MedWaste AI Conversational Engine"
            }

        # J. Farewells ("Bye", "Goodbye", "See you", "Later", "Take care")
        if any(k in q for k in ["bye", "goodbye", "good bye", "see you", "cya", "take care", "talk later", "ttyl", "see ya"]):
            return {
                "reply": "Goodbye for now! 👋 It was wonderful chatting with you. Have a fantastic rest of your day, take care of yourself, and stay safe out there! Come back anytime!",
                "category_tag": "General",
                "recommended_action": "Stay safe and have a wonderful day ahead!",
                "suggested_followups": [
                    "Good morning!",
                    "How are you doing today?",
                    "What is the 48-hour waste storage rule?"
                ],
                "engine": "MedWaste AI Conversational Engine"
            }

        # K. Jokes & Humor
        if any(k in q for k in ["joke", "funny", "make me laugh", "humor"]):
            return {
                "reply": "Here's a light one for you! 😄\n\n*Why did the recycling bin break up with the trash can?*\n**Because it felt like their relationship was just going to waste!** 🗑️💚\n\nHope that brought a little smile to your day! How are things going with you today?",
                "category_tag": "General",
                "recommended_action": "Keep smiling and have a wonderful day!",
                "suggested_followups": [
                    "Tell me another joke",
                    "How are you doing today?",
                    "Where do used plastic syringes go?"
                ],
                "engine": "MedWaste AI Conversational Engine"
            }

        # L. Identity & Purpose
        if any(k in q for k in ["who are you", "what are you", "what can you do", "are you human", "are you a bot", "are you ai", "what is your name", "your name", "help me"]):
            return {
                "reply": "I'm **MedWaste AI**—your friendly digital companion and healthcare waste guide! 🤖✨\n\nWhile I am an AI, I love chatting just like a friendly human colleague on your hospital team. You can talk to me casually, ask me how my day is going, or consult me on serious hospital topics like waste segregation (Yellow, Red, White, Blue bins), emergency needle-stick SOPs, and CPCB regulations.\n\nHow are you doing today? How can I help make your day a little easier?",
                "category_tag": "General",
                "recommended_action": "Chat casually or ask about biomedical waste protocols.",
                "suggested_followups": [
                    "Good morning! How are you?",
                    "Which bin do used syringes go into?",
                    "What is the emergency protocol for a needle stick?"
                ],
                "engine": "MedWaste AI Conversational Engine"
            }

    # -------------------------------------------------------------
    # 2. "WHY" / IMPORTANCE & HAZARDS OF MEDICAL WASTE
    # -------------------------------------------------------------
    if (any(k in q for k in ["why", "importance", "hazard", "risk", "danger", "why segregate", "why is medical waste", "consequence"]) and 
        any(w in q for w in ["segregate", "segregation", "biomedical", "waste", "dangerous", "separate", "important"])):
        return {
            "reply": "### Why Proper Biomedical Waste Segregation is Crucial:\n\n1. **Infection & Disease Transmission:** Untreated medical waste can transmit bloodborne pathogens like **Hepatitis B (HBV)**, **Hepatitis C (HCV)**, and **HIV** to hospital staff, waste handlers, and the public.\n2. **Toxic Emissions:** If chlorinated plastics (like PVC tubing) are accidentally incinerated with Yellow waste, they release **Dioxins and Furans**, which are potent environmental carcinogens.\n3. **Preventing Illegal Reuse:** Unsegregated plastic syringes and needles can be scavenged, illicitly repackaged, and resold without sterilization.\n4. **Worker Safety:** Exposed sharps in general bags cause accidental punctures and severe injuries to sanitation staff.\n5. **Economic Efficiency:** Only **15%** of hospital waste is hazardous. Proper segregation prevents treating 85% of general waste as biohazardous, saving significant incineration costs.",
            "category_tag": "Educational",
            "recommended_action": "Segregate strictly at source to prevent infectious disease spread and toxic emissions.",
            "suggested_followups": [
                "What are the 4 main color-coded streams?",
                "What happens if needles are placed in the Red bin?",
                "What is the legal penalty for improper segregation?"
            ],
            "engine": "MedWaste AI Neural Rule Engine"
        }

    # -------------------------------------------------------------
    # 3. "WHAT IF" / SCENARIOS & MISTAKES
    # -------------------------------------------------------------
    if "what if" in q or "accidentally" in q or "wrong bin" in q or "mistake" in q or "mixed" in q:
        # Scenario: needle in red bin
        if any(w in q for w in ["needle", "sharp"]) and any(w in q for w in ["red", "plastic", "yellow"]):
            return {
                "reply": "⚠️ **CRITICAL HAZARD: Needle Placed in Wrong Bin (Red or Yellow)**\n\n- **Why it is Dangerous:** Red bin waste goes to autoclaving and mechanical granulators/shredders. A loose steel needle will damage shredding machinery and poses an extreme puncture/infection risk to plastic recycling plant workers.\n- **Immediate Corrective Action:**\n  1. Don heavy-duty puncture-resistant utility gloves and a face shield.\n  2. **Do NOT reach in with bare hands.** Use forceps or tongs to carefully extract the needle.\n  3. Immediately deposit the needle into the **White Translucent Puncture-Proof Container**.\n  4. Document the incident as a near-miss safety violation in the ward logbook.",
                "category_tag": "Emergency",
                "recommended_action": "Use tongs to extract needle; place into White sharps box; report near-miss.",
                "suggested_followups": [
                    "What is the proper procedure for needle disposal?",
                    "Where do plastic syringes without needles go?",
                    "What is the needle-stick injury emergency SOP?"
                ],
                "engine": "MedWaste AI Neural Rule Engine"
            }

        # Scenario: infectious waste in general municipal bin
        if any(w in q for w in ["yellow", "blood", "gauze", "cotton", "infectious"]) and any(w in q for w in ["general", "black", "green", "municipal"]):
            return {
                "reply": "🚨 **CRITICAL VIOLATION: Infectious Waste in General Municipal Bin**\n\n- **Consequences:** Mixing infectious blood-soaked items into municipal trash contaminates city garbage trucks and landfills, creating widespread public health risks and violating the Environment (Protection) Act 1986.\n- **Corrective Protocol:**\n  1. Cordon off the bin.\n  2. Don full PPE (nitrile gloves, N95 mask, fluid apron).\n  3. Transfer the contaminated items using tongs into a **Yellow Non-Chlorinated Biohazard Bag**.\n  4. Disinfect the general bin using **1% Sodium Hypochlorite solution**.\n  5. Re-educate ward staff on strict source segregation.",
                "category_tag": "Emergency",
                "recommended_action": "Transfer contaminated waste into Yellow bag with tongs; disinfect general bin with 1% hypochlorite.",
                "suggested_followups": [
                    "What items belong in the Yellow bag?",
                    "What are the penalties under BMWM Rules 2016?",
                    "How to clean up a blood spill?"
                ],
                "engine": "MedWaste AI Neural Rule Engine"
            }

        # Scenario: overfilled bin
        if any(w in q for w in ["overflow", "full", "overfilled", "capacity", "spilling"]):
            return {
                "reply": "⚠️ **OVERFLOWING BIN PROTOCOL**\n\n- **The Rule:** Biohazard bags must **never exceed 3/4 capacity (75%)**.\n- **Action Required:**\n  1. **NEVER push, stomp, or compress** the waste with hands or feet to make room.\n  2. Immediately seal the overfilled bag using a zip-tie or double knot.\n  3. Affix the CPCB Barcode label.\n  4. Place a fresh replacement liner in the bin.\n  5. Request an immediate collection dispatch via MedWaste AI.",
                "category_tag": "Collection",
                "recommended_action": "Never compress waste; seal tightly at 3/4 full and request collection.",
                "suggested_followups": [
                    "What is the 48-hour waste storage rule?",
                    "How do I schedule a pickup?",
                    "What PPE is needed when tying waste bags?"
                ],
                "engine": "MedWaste AI Neural Rule Engine"
            }

        # Scenario: recapping needles
        if "recap" in q:
            return {
                "reply": "🚫 **STRICTLY PROHIBITED: Recapping Needles by Hand**\n\n- **The Risk:** Over **80% of accidental needle-stick injuries** in hospitals occur while trying to put the plastic cap back on a used needle.\n- **Regulatory Mandate (CPCB):** Recapping with two hands is strictly banned.\n- **Correct Handling:**\n  1. Destroy the needle hub immediately after injection using an electric needle burner or mechanical hub cutter at point-of-use.\n  2. If recapping is absolutely mandatory for blood gas sampling, use the **Single-Handed 'Scoop' Technique** only.\n  3. Drop directly into the **White Puncture-Proof Sharps Box**.",
                "category_tag": "White",
                "recommended_action": "Never recap needles by hand. Use electric needle burner or hub cutter immediately.",
                "suggested_followups": [
                    "What is the single-handed scoop technique?",
                    "What is the emergency protocol for a needle-stick injury?",
                    "What belongs in the White sharps container?"
                ],
                "engine": "MedWaste AI Neural Rule Engine"
            }

    # -------------------------------------------------------------
    # 4. EMERGENCY PROTOCOLS (NEEDLE-STICK, BLOOD SPILL, MERCURY)
    # -------------------------------------------------------------
    if any(k in q for k in ["needle stick", "needlestick", "prick", "sharp injury", "punctured by needle", "pricked", "cut by blade"]):
        return {
            "reply": "🚨 **EMERGENCY PROTOCOL: Needle-Stick / Sharps Injury**\n\n1. **Immediate Irrigation:** Wash the puncture wound immediately under cool running tap water with mild soap for at least **5 minutes**.\n2. **DO NOT Squeeze or Suck:** Never squeeze the wound or suck it with your mouth; this creates localized pressure and tissue trauma.\n3. **Disinfect & Cover:** Pat dry with sterile gauze and apply a sterile waterproof bandage.\n4. **Report Instantly:** Notify the Nursing Supervisor and Infection Control Officer immediately.\n5. **Post-Exposure Prophylaxis (PEP):** Must be evaluated and initiated within **2 hours** for HIV and Hepatitis B baseline testing.",
            "category_tag": "Emergency",
            "recommended_action": "Wash under running water for 5 min. Report within 2 hours for PEP.",
            "suggested_followups": [
                "What PPE is required for handling sharps?",
                "Where should hypodermic needles be disposed?",
                "How do I manage a blood spill?"
            ],
            "engine": "MedWaste AI Neural Rule Engine"
        }

    if any(k in q for k in ["spill", "leak", "hypochlorite", "vomit", "vomited", "fluid on floor"]) or (any(b in q for b in ["blood", "urine", "body fluid", "pus"]) and any(w in q for w in ["floor", "clean", "drop", "wipe", "puddle", "flow", "spill", "ward"])):
        return {
            "reply": "⚠️ **CLINICAL BLOOD & FLUID SPILL MANAGEMENT**\n\n1. **Cordon Off:** Mark the spill perimeter to prevent foot traffic.\n2. **Don PPE:** Wear heavy nitrile gloves, eye protection/face shield, and fluid-resistant apron.\n3. **Contain Spill:** Cover the liquid spill with absorbent paper towels to contain spread.\n4. **Disinfect:** Flood paper towels with freshly prepared **1% Sodium Hypochlorite solution** (10,000 ppm available chlorine).\n5. **Contact Time:** Allow exactly **20 minutes** for viral inactivation (HIV, HBV, HCV).\n6. **Disposal:** Scoop soaked towels with forceps/dustpan into a **Yellow Biohazard Bag**.\n7. **Mop:** Clean area with neutral hospital disinfectant.",
            "category_tag": "Emergency",
            "recommended_action": "Apply absorbent towels + 1% Sodium Hypochlorite for 20 minutes.",
            "suggested_followups": [
                "Which bin does soiled gauze go into?",
                "What PPE is mandatory for waste handlers?",
                "What is the 48-hour waste storage rule?"
            ],
            "engine": "MedWaste AI Neural Rule Engine"
        }

    if "mercury" in q or "thermometer" in q or "sphygmomanometer" in q:
        return {
            "reply": "☣️ **SPECIAL PROTOCOL: Mercury Spill Management**\n\n- **CRITICAL WARNING:** **NEVER incinerate or autoclave mercury.** Mercury vaporizes into an odorless, neurotoxic heavy metal gas.\n- **NEVER put mercury in biohazard bags or down the drain.**\n- **Spill Handling Steps:**\n  1. Evacuate pregnant women and non-essential staff; ventilate the room.\n  2. Put on nitrile gloves (never use a vacuum cleaner).\n  3. Use two stiff cardboard pieces or an eyedropper to collect beads together.\n  4. Place mercury droplets into an airtight plastic container containing a layer of water or oil to suppress vapors.\n  5. Seal, label as **'Hazardous Mercury Waste'**, and route to an authorized hazardous waste treatment facility.",
            "category_tag": "Emergency",
            "recommended_action": "Collect beads with cardboard into sealed water container; never incinerate or vacuum.",
            "suggested_followups": [
                "Where do broken glass thermometer parts go?",
                "What are the toxic risks of mercury vapors?",
                "What items go into the Blue container?"
            ],
            "engine": "MedWaste AI Neural Rule Engine"
        }

    # -------------------------------------------------------------
    # 5. SPECIFIC WASTE STREAM ITEMS
    # -------------------------------------------------------------
    # Red Bin: Recyclable Plastics
    if any(k in q for k in ["syringe", "iv set", "iv tube", "iv bottle", "catheter", "urine bag", "dialysis", "plastic tubing", "vacutainer", "specimen container"]):
        return {
            "reply": "🔴 **RED BIN: Contaminated Recyclable Plastics**\n\n- **Categorized Items:** Disposable plastic syringes (WITHOUT needles), IV infusion tubing sets, urinary catheters, drainage urine bags, dialysis kits, and plastic specimen vacutainers.\n- **Point-of-Use Preparation:**\n  1. The metal needle MUST be cut off at the hub using a needle destroyer or cutter before disposal.\n  2. Drain all residual urine, IV fluids, or blood into sanitary sewage before bagging.\n- **Treatment Method:** Autoclaving (121°C @ 15 psi) or microwaving, followed by mechanical shredding and polymer recycling by state-authorized recyclers.",
            "category_tag": "Red",
            "recommended_action": "Cut needle hub at point-of-use; drain fluids; place plastic body into RED bin.",
            "suggested_followups": [
                "Where do needle tips and scalpels go?",
                "What happens to shredded plastic after autoclaving?",
                "What items go into the Yellow bin?"
            ],
            "engine": "MedWaste AI Neural Rule Engine"
        }

    # White Container: Sharps
    if any(k in q for k in ["needle", "sharp", "scalpel", "blade", "lancet", "suture needle", "ampoule tip"]):
        return {
            "reply": "⚪ **WHITE TRANSLUCENT CONTAINER: Contaminated Sharps**\n\n- **Categorized Items:** Hypodermic needles, fixed-needle syringes, surgical scalpel blades, suture needles, lancets, and broken glass ampoule tips.\n- **Container Specifications:** Rigid, puncture-proof, leak-proof, tamper-evident white translucent box.\n- **Essential Handling Rules:**\n  - **NEVER recap needles by hand.**\n  - Do not bend, shear, or break needles manually.\n  - Fill strictly up to **3/4 capacity** (never overfill).\n  - Permanently engage the tamper-proof lid before handoff.\n- **Final Disposal:** Autoclaving or dry-heat sterilization followed by encapsulation in cement or deep sharp-pit burial.",
            "category_tag": "White",
            "recommended_action": "Drop directly into WHITE puncture-proof container without recapping.",
            "suggested_followups": [
                "What is the first aid for needle-stick injuries?",
                "Where do used plastic syringes go?",
                "What goes into the Blue container?"
            ],
            "engine": "MedWaste AI Neural Rule Engine"
        }

    # Blue Box: Glassware & Metallic Implants
    if any(k in q for k in ["glass", "ampoule", "vial", "metallic implant", "orthopedic pin", "screw", "plate", "slide", "flask"]):
        return {
            "reply": "🔵 **BLUE BOX: Glassware & Metallic Implants**\n\n- **Categorized Items:** Broken or intact medicine glass vials, antibiotic ampoules, microscope glass slides, glass flasks, and contaminated metallic orthopedic implants (pins, screws, plates, intramedullary rods).\n- **Handling SOP:**\n  - Never pick up broken glass shards with bare or gloved hands; always use forceps, tongs, or a dustpan brush.\n  - Cardboard or blue boxes must have reinforced puncture-resistant bottoms.\n- **Pre-treatment & Recycling:** Disinfection with 1-2% sodium hypochlorite soak or autoclaving, followed by industrial glass crushing and metal recycling.",
            "category_tag": "Blue",
            "recommended_action": "Use forceps to place glass vials and metal implants into BLUE box.",
            "suggested_followups": [
                "Where do expired medicines go?",
                "What goes into the Yellow bag?",
                "What is the collection frequency for biomedical waste?"
            ],
            "engine": "MedWaste AI Neural Rule Engine"
        }

    # Yellow Bag: Infectious & Anatomical
    if any(k in q for k in ["yellow", "cotton", "gauze", "bandage", "dressing", "placenta", "tissue", "anatomical", "blood soaked", "pathology", "biopsy", "organ", "flesh", "pus", "plaster cast", "soiled mask"]):
        return {
            "reply": "🟡 **YELLOW BAG: Infectious & Anatomical Waste**\n\n- **Categorized Items:** Human anatomical waste (tissues, organs, placentas, biopsy specimens), blood-soaked gauze, soiled cotton dressings, pus swabs, plaster casts, microbiology culture plates, soiled paper masks, and expired cytotoxic medicines.\n- **Liner Specifications:** Certified non-chlorinated yellow plastic bags bearing the prominent international biohazard symbol.\n- **Storage Limit:** Must be incinerated within **48 hours** under CPCB regulations.\n- **Treatment Method:** Double-chamber high-temperature incineration (primary chamber 800°C ± 50°C, secondary chamber 1050°C ± 50°C with 2-second retention time) or plasma pyrolysis.",
            "category_tag": "Yellow",
            "recommended_action": "Tie non-chlorinated yellow bag securely at 3/4 full; route for high-temp incineration.",
            "suggested_followups": [
                "Where do plastic IV bags and syringes go?",
                "What is the maximum time waste can be stored?",
                "What PPE is needed for handling Yellow bags?"
            ],
            "engine": "MedWaste AI Neural Rule Engine"
        }

    # Cytotoxic / Chemotherapy
    if any(k in q for k in ["chemo", "cytotoxic", "oncology", "cancer drug", "antineoplastic"]):
        return {
            "reply": "🟣 **CYTOTOXIC & ONCOLOGY DRUG WASTE (Purple / Yellow with Cytotoxic Emblem)**\n\n- **Hazard Profile:** Mutagenic, teratogenic, and carcinogenic.\n- **Categorized Items:** Expired chemotherapy vials, infused IV tubing, contaminated gloves, gowns, and patient excreta/vomitus within 48 hours of chemotherapy administration.\n- **Segregation:** Dedicated heavy-duty purple or yellow bags labeled with the prominent Cytotoxic hazard symbol.\n- **Precautions:** Double-glove with chemotherapy-tested nitrile gloves, wear impermeable gown and face shield. Prepare under Class II Biosafety Cabinets.\n- **Treatment:** High-temperature incineration at minimum **1200°C**.",
            "category_tag": "Cytotoxic",
            "recommended_action": "Double-glove, use Purple cytotoxic bags, and incinerate at >1200°C.",
            "suggested_followups": [
                "What is the spill procedure for chemotherapy drugs?",
                "Where do non-hazardous hospital items go?",
                "What PPE is mandatory in hospital wards?"
            ],
            "engine": "MedWaste AI Neural Rule Engine"
        }

    # Masks & Gloves specific differentiation
    if "mask" in q or "glove" in q:
        return {
            "reply": "🧤 **PPE DISPOSAL: Masks & Gloves Segregation Rules**\n\n- **Contaminated/Soiled with Blood or Body Fluids:** Must go into the **Yellow Biohazard Bag** for high-temperature incineration.\n- **Clean/Routine Examination Nitrile/Latex Gloves:** Go into the **Red Container** for autoclaving and recycling.\n- **Uncontaminated Surgical & N95 Masks:** Can be discarded in the **Yellow Bag** (if used in infectious wards) or municipal general bin if completely clean administrative use.\n- **Crucial Rule:** Never dispose of blood-stained gloves or masks into general office bins!",
            "category_tag": "Segregation",
            "recommended_action": "Soiled with blood/fluids = YELLOW; Clean clinical plastic gloves = RED.",
            "suggested_followups": [
                "What PPE is required when handling waste bins?",
                "What items belong in the Yellow biohazard bag?",
                "What is the needle-stick injury emergency SOP?"
            ],
            "engine": "MedWaste AI Neural Rule Engine"
        }

    # General / Municipal / Black / Green
    if any(k in q for k in ["general", "municipal", "food", "paper", "cardboard", "wrapper", "black bin", "green bin", "clean plastic", "office", "stationery"]):
        return {
            "reply": "🟢⚫ **BLACK & GREEN BINS: Non-Hazardous Municipal Healthcare Waste**\n\n- **Volume:** Represents roughly **85%** of all hospital waste generated.\n- **Green Bin (Biodegradable/Wet):** Food leftovers, fruit peels, canteen vegetable scraps, tea bags, garden leaves. Routed for composting.\n- **Black Bin (Non-Biodegradable/Dry):** Clean cardboard packaging, medicine outer paper boxes, office papers, clean plastic wrappers, empty water bottles. Routed for municipal recycling.\n- **Zero Contamination Policy:** Never mix blood-stained dressings, swabs, or syringes into general municipal bins.",
            "category_tag": "General",
            "recommended_action": "Segregate clean dry packaging into Black bin and food/organic waste into Green bin.",
            "suggested_followups": [
                "What is the difference between Red and Black bins?",
                "Which bin do used syringes go into?",
                "What are the BMWM 2016 Rules?"
            ],
            "engine": "MedWaste AI Neural Rule Engine"
        }

    # -------------------------------------------------------------
    # 6. LOGISTICS, STORAGE & CPCB 48-HOUR RULE
    # -------------------------------------------------------------
    if any(k in q for k in ["collection", "storage", "48 hour", "48hr", "pickup", "transport", "cbwtf", "barcode", "rfid", "schedule", "truck", "van"]):
        return {
            "reply": "🚛 **BIOMEDICAL WASTE COLLECTION & LOGISTICS PROTOCOLS**\n\n1. **The 48-Hour CPCB Rule:** Untreated biomedical waste must **never be stored beyond 48 hours**. If collection is delayed due to an emergency, the facility must inform the State Pollution Control Board and keep waste in cool refrigerated storage.\n2. **CPCB Barcoding Mandate:** Every biohazard bag and sharps box must bear a unique GPS-traceable Barcode label and RFID tag to record origin ward, weight, and handoff timestamp.\n3. **Internal Transport:** Use covered, dedicated wheeled trolleys marked with biohazard symbols. Never drag or transport bags manually along general patient pathways.\n4. **CBWTF Hand-off:** Registered Central Treatment Facilities send GPS-monitored vehicles to weigh and log each barcoded consignment.",
            "category_tag": "Collection",
            "recommended_action": "Ensure bag barcoding and CBWTF collection within 48 hours.",
            "suggested_followups": [
                "How do I schedule a pickup on MedWaste AI?",
                "What are the penalties for delayed waste collection?",
                "What are the 4 main color categories of waste?"
            ],
            "engine": "MedWaste AI Neural Rule Engine"
        }

    # -------------------------------------------------------------
    # 7. REGULATIONS, PENALTIES & CPCB RULES
    # -------------------------------------------------------------
    if any(k in q for k in ["rule", "law", "penalty", "fine", "jail", "cpcb", "spcb", "act", "legal", "compliance", "inspection", "audit", "standard"]):
        return {
            "reply": "⚖️ **REGULATORY COMPLIANCE: Bio-Medical Waste Management Rules 2016**\n\n- **Governing Law:** Issued under the **Environment (Protection) Act, 1986** by the Ministry of Environment, Forest and Climate Change (MoEFCC).\n- **Mandatory Duties of Healthcare Facilities:**\n  - Obtain official authorization from the State Pollution Control Board (SPCB).\n  - Ensure 100% source segregation into color-coded containers.\n  - Implement Barcode and RFID tagging on every bag.\n  - Submit the Annual Compliance Report by **June 30th** every year.\n  - Immunize all healthcare and waste workers against Hepatitis B and Tetanus.\n- **Legal Penalties (Section 15, EPA 1986):** Non-compliance or unauthorized dumping can result in **imprisonment up to 5 years** and/or fines up to **₹1,00,000**, with facility closure orders.",
            "category_tag": "Regulatory",
            "recommended_action": "Ensure valid SPCB authorization, 100% barcoding, and annual report filing.",
            "suggested_followups": [
                "What is the 48-hour waste storage rule?",
                "What is the mandatory immunization for waste handlers?",
                "What are the 4 main color categories of waste?"
            ],
            "engine": "MedWaste AI Neural Rule Engine"
        }

    # -------------------------------------------------------------
    # 8. TREATMENT TECHNOLOGIES (AUTOCLAVE, INCINERATOR, ETC.)
    # -------------------------------------------------------------
    if any(k in q for k in ["autoclave", "incinerat", "shredder", "microwave", "plasma pyrolysis", "encapsulation", "sharp pit"]):
        return {
            "reply": "⚙️ **TREATMENT & DESTRUCTION TECHNOLOGIES**\n\n- **Incineration (Yellow Waste):** Double-chamber thermal destruction. Primary chamber operates at **800°C ± 50°C** for gasification; secondary chamber operates at **1050°C ± 50°C** with 2-second gas retention to destroy dioxins/furans. Flue gas scrubbers neutralize acidic gases.\n- **Autoclaving (Red Waste):** Pressurized saturated steam sterilization at **121°C @ 15 psi for 30 min** (or 135°C @ 31 psi for 15 min). Validated with *Geobacillus stearothermophilus* spore testing.\n- **Mechanical Shredding:** Destroys sterilized plastics and sharps into unidentifiable granules to prevent reuse.\n- **Encapsulation (White Sharps):** Sharps boxes are filled with 1:2 cement-lime mortar, solidified into impermeable blocks, and sent to secured landfills.",
            "category_tag": "Educational",
            "recommended_action": "Ensure continuous validation of autoclave spore indicators and incinerator CEMS.",
            "suggested_followups": [
                "Why can't chlorinated plastics be incinerated?",
                "What belongs in the Yellow bin vs Red bin?",
                "What is the 48-hour waste storage rule?"
            ],
            "engine": "MedWaste AI Neural Rule Engine"
        }

    # -------------------------------------------------------------
    # 9. PPE & CLINICAL SAFETY CHECKLISTS
    # -------------------------------------------------------------
    if any(k in q for k in ["ppe", "precaution", "safety", "protect", "immuniz", "hepatitis b vaccine"]):
        return {
            "reply": "🛡️ **MANDATORY PPE CHECKLIST & CLINICAL PRECAUTIONS**\n\n1. **Gloves:** Double nitrile gloves for patient procedures; heavy-duty puncture-resistant utility gloves for waste handling.\n2. **Masks:** N95 particulate respirator or 3-ply surgical mask.\n3. **Body:** Fluid-impermeable long-sleeve gown or rubber apron.\n4. **Eyes & Face:** Goggles or full-face splash shield.\n5. **Footwear:** Closed-toe heavy rubber gumboots.\n6. **Mandatory Worker Protection:** Complete **Hepatitis B vaccination (3 doses)** and **Tetanus Toxoid booster** are legally mandatory for all staff handling medical waste.",
            "category_tag": "Precautions",
            "recommended_action": "Always don full PPE and ensure complete Hepatitis B vaccination.",
            "suggested_followups": [
                "What is the emergency protocol for a needle-stick injury?",
                "How to manage an accidental blood spill?",
                "What items belong in the Yellow biohazard bag?"
            ],
            "engine": "MedWaste AI Neural Rule Engine"
        }

    # -------------------------------------------------------------
    # 10. DYNAMIC CONTEXTUAL FALLBACK
    # -------------------------------------------------------------
    # Extract noun or keywords from user query for custom tailored reply
    words = [w for w in re.findall(r"\b[a-zA-Z]{3,}\b", q) if w not in ["the", "this", "that", "what", "which", "how", "where", "can", "should", "about", "for", "into", "with", "does"]]
    subject_term = " ".join(words[:3]) if words else raw_q

    return {
        "reply": f"Regarding your inquiry on **'{subject_term}'**:\n\nTo determine the correct handling under the **Bio-Medical Waste Management Rules 2016**:\n- **If it is an infectious anatomical or soiled item (cotton/gauze):** Place into **Yellow Non-Chlorinated Biohazard Bag**.\n- **If it is recyclable contaminated plastic (IV tube/catheter/syringe without needle):** Place into **Red Container**.\n- **If it is a metal sharp (needle/scalpel/blade):** Drop immediately into **White Puncture-Proof Sharps Box**.\n- **If it is broken glass or metal implant (vials/ampoules/pins):** Deposit into **Blue-marked Container**.\n- **If it is clean municipal waste (paper/food):** Place into **Black or Green General Bins**.\n\nCould you specify whether this item is contaminated with blood, what material it is made of, or what clinical procedure it was used in?",
        "category_tag": "General",
        "recommended_action": f"Verify material and contamination level of '{subject_term}' before disposal.",
        "suggested_followups": [
            "Which bin do used plastic syringes go into?",
            "What is the needle-stick injury emergency SOP?",
            "What is the 48-hour waste storage rule?"
        ],
        "engine": "MedWaste AI Neural Rule Engine"
    }


def generate_biomed_chat_reply(query, user_api_key=None):
    """Main routing function: uses Gemini LLM if key available, else uses advanced semantic engine."""
    api_key = user_api_key or os.environ.get("GEMINI_API_KEY")
    if api_key and HAS_GENAI:
        llm_res = call_gemini_llm(query, api_key)
        if llm_res:
            return llm_res

    # Use advanced semantic reasoning engine
    result = advanced_semantic_biomed_ai(query)
    q_lower = (query or "").lower().strip()
    if result.get("engine") != "MedWaste AI Conversational Engine":
        if re.search(r"\b(good\s*morning|morning|gm)\b", q_lower) and not result["reply"].lower().startswith("good morning"):
            result["reply"] = "Good morning! ☀️ Hope your day is off to a great start!\n\n" + result["reply"]
        elif re.search(r"\b(good\s*afternoon|afternoon)\b", q_lower) and not result["reply"].lower().startswith("good afternoon"):
            result["reply"] = "Good afternoon! 🌤️ Hope your day is going well!\n\n" + result["reply"]
        elif re.search(r"\b(good\s*evening|evening)\b", q_lower) and not result["reply"].lower().startswith("good evening"):
            result["reply"] = "Good evening! 🌆 Hope you had a fulfilling day!\n\n" + result["reply"]
        elif re.search(r"\b(hi+|hello+|hey+|namaste)\b", q_lower) and not any(result["reply"].lower().startswith(x) for x in ["hi", "hello", "hey", "namaste"]):
            result["reply"] = "Hello! 👋 Great to connect with you!\n\n" + result["reply"]

    return result

@app.route("/api/chat", methods=["POST"])
def api_chat():
    data = request.get_json() or {}
    message = data.get("message", "")
    client_key = request.headers.get("X-Gemini-Key") or data.get("api_key")

    result = generate_biomed_chat_reply(message, user_api_key=client_key)
    return jsonify({
        "success": True,
        "query": message,
        "reply": result["reply"],
        "category_tag": result["category_tag"],
        "recommended_action": result["recommended_action"],
        "suggested_followups": result["suggested_followups"],
        "engine": result.get("engine", "MedWaste AI Engine")
    })


@app.route("/api/chat/faqs", methods=["GET"])
def api_chat_faqs():
    category = request.args.get("category")
    if category and category.lower() != "all":
        filtered = [f for f in CHATBOT_FAQS if f["category"].lower() == category.lower()]
        return jsonify({
            "success": True,
            "count": len(filtered),
            "faqs": filtered
        })
    return jsonify({
        "success": True,
        "count": len(CHATBOT_FAQS),
        "faqs": CHATBOT_FAQS
    })


# ==========================================
# RUN SERVER
# ==========================================
# ==========================================

if __name__ == "__main__":

    print("""
    ==========================================
        MEDWASTE AI BACKEND
    ==========================================

        Server:
        http://127.0.0.1:5000

        API:
        http://127.0.0.1:5000/api

    ==========================================
    """)

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )