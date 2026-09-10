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
# DELETE BIN
# ==========================================

@app.route("/api/bins/<int:bin_id>", methods=["DELETE"])
def delete_bin(bin_id):
    """
    Delete a smart bin and clean up linked collections and waste records.
    """
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id, bin_code FROM bins WHERE id = ?", (bin_id,))
    bin_row = cursor.fetchone()

    if not bin_row:
        conn.close()
        return jsonify({
            "success": False,
            "message": "Smart bin not found"
        }), 404

    bin_code = bin_row["bin_code"]

    try:
        # Delete or clean up linked references
        cursor.execute("DELETE FROM collections WHERE bin_id = ?", (bin_id,))
        cursor.execute("DELETE FROM waste_records WHERE bin_id = ?", (bin_id,))
        cursor.execute("DELETE FROM bins WHERE id = ?", (bin_id,))

        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "message": f"Smart bin {bin_code} deleted successfully",
            "deleted_bin_id": bin_id,
            "bin_code": bin_code
        })

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({
            "success": False,
            "message": f"Error deleting bin: {str(e)}"
        }), 500


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
    api_key = request.headers.get("X-Gemini-Key") or os.environ.get("GEMINI_API_KEY")
    if request.is_json:
        data = request.get_json() or {}
        hint = data.get("hint", "")
        api_key = data.get("api_key") or api_key
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
        api_key = request.form.get("api_key") or api_key

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

    # Execute AI classification model with multimodal or deep heuristic vision
    result = classify_waste(file_path, hint=hint, api_key=api_key)
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
    api_key = request.headers.get("X-Gemini-Key") or os.environ.get("GEMINI_API_KEY")

    if request.is_json:
        data = request.get_json() or {}
        hint = data.get("hint", "")
        hospital_id = data.get("hospital_id", 1)
        api_key = data.get("api_key") or api_key
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
        api_key = request.form.get("api_key") or api_key
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
        result = classify_waste(file_path, hint=hint, api_key=api_key)
        if "stage_1_upload" in result:
            result["stage_1_upload"]["image_url"] = f"/uploads/{filename}"

    db_waste_type = (data.get("waste_type") if request.is_json else None) or result.get("db_waste_type") or "Red"
    if "/" in db_waste_type:
        db_waste_type = db_waste_type.split("/")[0].strip()
    if db_waste_type.lower() == "multi":
        db_waste_type = "Red"
    db_waste_type = db_waste_type.capitalize()

    req_weight = data.get("weight") if request.is_json else None
    if req_weight is not None:
        try:
            est_weight = float(req_weight)
        except (ValueError, TypeError):
            est_weight = float(result.get("stage_4_segregation", {}).get("deposit_weight_kg", 0.035))
    else:
        est_weight = float(result.get("stage_4_segregation", {}).get("deposit_weight_kg", 0.035))
    est_weight = round(est_weight, 3)

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
        # Auto-create the bin specifically for this hospital with the exact waste_type
        cursor.execute("SELECT COUNT(*) FROM bins")
        total_b = cursor.fetchone()[0]
        bin_code = f"BIN-{db_waste_type[:3].upper()}-{total_b + 1:03d}"
        cursor.execute("""
            INSERT INTO bins (bin_code, hospital_id, waste_type, capacity, current_level, weight, status)
            VALUES (?, ?, ?, 50.0, 15.0, 1.5, 'Normal')
        """, (bin_code, hospital_id or 1, db_waste_type))
        bin_id = cursor.lastrowid
        cur_level = 15.0
        cur_weight = 1.5
        capacity = 50.0
    else:
        bin_id = bin_row["id"]
        bin_code = bin_row["bin_code"]
        cur_level = float(bin_row["current_level"])
        cur_weight = float(bin_row["weight"])
        capacity = float(bin_row["capacity"])

    cursor.execute("""
        INSERT INTO waste_records (bin_id, waste_type, weight, confidence, image_path)
        VALUES (?, ?, ?, ?, ?)
    """, (bin_id, db_waste_type, est_weight, confidence, f"/uploads/{filename}"))
    waste_record_id = cursor.lastrowid

    # Update bin telemetry in database
    new_weight = round(cur_weight + est_weight, 3)
    fill_impact = round((est_weight / capacity) * 100, 2)
    new_level = min(round(cur_level + fill_impact, 1), 100.0)

    threshold_cap = 75.0 if db_waste_type.lower() == "white" else 80.0
    is_urgent = (new_level >= threshold_cap)

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

    # CRITICAL 10KG SEGREGATION RULE:
    # If weight < 10 kg -> Added to Facility Smart Bin Telemetry (do not dispatch fleet unless bin overflow threshold >= 80% is reached)
    # If weight >= 10 kg -> Directly add into Dispatched Collection Requests on pickup page!
    is_bulk_load = (est_weight >= 10.0)
    should_dispatch_collection = is_bulk_load or is_urgent

    collection_id = None
    collection_created = False

    if is_bulk_load:
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("""
            INSERT INTO collections (bin_id, vehicle_id, collector_name, status, weight, requested_at)
            VALUES (?, 1, 'CBWTF Rapid Response Fleet', 'Pending', ?, ?)
        """, (bin_id, est_weight, now_str))
        collection_id = cursor.lastrowid
        collection_created = True
    elif is_urgent:
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

    action_msg = (
        f"Bulk batch ({est_weight} kg >= 10 kg): Collection request dispatched to Pickup Logistics!"
        if is_bulk_load else
        f"Deposit ({est_weight} kg < 10 kg): Successfully updated {bin_code} ({db_waste_type}) in Facility Smart Bin Telemetry!"
    )

    return jsonify({
        "success": True,
        "message": action_msg,
        "weight_kg": est_weight,
        "is_under_10kg": (est_weight < 10.0),
        "target_bin_code": bin_code,
        "target_bin_id": bin_id,
        "waste_type": db_waste_type,
        "action_taken": "direct_collection_dispatch" if is_bulk_load else "facility_telemetry_updated",
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
            "status": "Committed to Facility Smart Bin Telemetry" if (est_weight < 10.0) else "Dispatched to Collection Fleet"
        },
        "collection_alert": {
            "alert_triggered": should_dispatch_collection,
            "is_bulk_load": is_bulk_load,
            "bin_code": bin_code,
            "new_level_pct": new_level,
            "new_weight_kg": new_weight,
            "threshold_pct": threshold_cap,
            "collection_created": collection_created,
            "collection_id": collection_id,
            "status": "Automated CBWTF Fleet Dispatch Dispatched" if should_dispatch_collection else "Normal (Capacity Safe)"
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

    # Normalize requested waste_type if provided
    req_waste_type = (waste_type or "").strip()
    if "/" in req_waste_type:
        req_waste_type = req_waste_type.split("/")[0].strip()
    if req_waste_type.lower() == "multi":
        req_waste_type = "Red"

    # Step 1: If bin_id is specified, check if it belongs to requested hospital_id AND matches req_waste_type
    if bin_id:
        cursor.execute("SELECT * FROM bins WHERE id = ?", (bin_id,))
        b_row = cursor.fetchone()
        if b_row:
            hosp_matches = (hospital_id is None or b_row["hospital_id"] == hospital_id)
            type_matches = True
            if req_waste_type:
                type_matches = (b_row["waste_type"].strip().lower() == req_waste_type.lower())
            
            if hosp_matches and type_matches:
                target_bin = dict(b_row)

    # Step 2: If target_bin not resolved, search by hospital_id and req_waste_type
    if not target_bin:
        if hospital_id is not None:
            if req_waste_type:
                cursor.execute("""
                    SELECT * FROM bins 
                    WHERE hospital_id = ? AND LOWER(waste_type) = LOWER(?)
                    ORDER BY id ASC
                    LIMIT 1
                """, (hospital_id, req_waste_type))
                b_row = cursor.fetchone()
                if b_row:
                    target_bin = dict(b_row)

            # Auto-create bin if missing for this hospital and waste_type is specified
            if not target_bin and req_waste_type:
                wtype = req_waste_type.capitalize()
                prefix = f"BIN-{wtype[:3].upper()}"
                cursor.execute("SELECT COUNT(*) FROM bins")
                total_b = cursor.fetchone()[0]
                bin_code = f"{prefix}-{total_b + 1:03d}"
                cursor.execute("""
                    INSERT INTO bins (bin_code, hospital_id, waste_type, capacity, current_level, weight, status)
                    VALUES (?, ?, ?, 50.0, 15.0, 1.5, 'Normal')
                """, (bin_code, hospital_id, wtype))
                new_id = cursor.lastrowid
                target_bin = {
                    "id": new_id,
                    "bin_code": bin_code,
                    "hospital_id": hospital_id,
                    "waste_type": wtype,
                    "current_level": 15.0,
                    "weight": 1.5
                }

            # Only fallback to any bin if waste_type was completely unspecified
            if not target_bin and not req_waste_type:
                cursor.execute("""
                    SELECT * FROM bins 
                    WHERE hospital_id = ?
                    ORDER BY id ASC
                    LIMIT 1
                """, (hospital_id,))
                b_row = cursor.fetchone()
                if b_row:
                    target_bin = dict(b_row)

        else:
            if req_waste_type:
                cursor.execute("SELECT * FROM bins WHERE LOWER(waste_type) = LOWER(?) LIMIT 1", (req_waste_type,))
                b_row = cursor.fetchone()
                if b_row:
                    target_bin = dict(b_row)
            if not target_bin:
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
        weight = 0.035
    weight = round(weight, 3)

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


# New AI Chatbot Engine for backend/app.py

def call_gemini_llm(query, api_key):
    """Invokes Google Gemini model for natural clinical intelligence with model fallbacks."""
    if not HAS_GENAI or not api_key:
        return None

    models_to_try = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
    client = genai.Client(api_key=api_key)
    system_instruction = (
        "You are MedWaste AI, an intelligent, empathetic, and expert clinical AI companion and hospital biomedical waste specialist.\n"
        "You think through questions carefully, analyze what the user is asking, and communicate naturally, warmly, and clearly like an experienced human colleague on a hospital healthcare team:\n"
        "1. For casual greetings, small talk, social questions, or shift empathy: Respond warmly, naturally, and conversationally like a caring friend (greet them back, ask how their shift is, show empathy if they are tired or stressed). Do NOT dump unnecessary clinical lectures when someone is just saying hello!\n"
        "2. When asked about bins (Red, Blue, Yellow, White, Black, Green, Purple), multi-bin comparisons ('what goes in blue or red bin', 'difference between yellow and red'), or specific hospital items: Think and analyze the question, then break down the explanation clearly with practical examples, rationale (why it goes there, how it's treated), and safety tips.\n"
        "3. Explain the reasoning clearly rather than sounding like an inflexible robot reciting a legal statute.\n"
        "4. If a question mixes a greeting with a question (e.g., 'hey bro what goes into the blue bin?'): Warmly greet them back first, then clearly answer their question.\n"
        "Format replies cleanly using markdown with bolding and bullet points when appropriate.\n"
        "At the very end of your response, strictly output these three metadata tags on separate lines:\n"
        "CATEGORY: <Yellow | Red | White | Blue | Cytotoxic | General | Emergency | Regulatory | Educational>\n"
        "ACTION: <A single concise sentence with the key takeaway action or friendly thought>\n"
        "FOLLOWUPS: <Followup 1> | <Followup 2> | <Followup 3>"
    )

    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=query,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.3,
                )
            )
            text = response.text or ""
            if not text.strip():
                continue

            category_tag = "General"
            action = "Follow hospital infection control SOPs and waste segregation guidelines."
            followups = [
                "Which bin do used plastic syringes go into?",
                "What is the emergency protocol for a needle-stick injury?",
                "What goes into the Blue container?"
            ]

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
                "engine": f"Gemini ({model_name})"
            }
        except Exception as e:
            print(f"[!] Gemini LLM invocation failed for {model_name}: {e}")
            continue

    return None


def advanced_semantic_biomed_ai(query):
    """
    Comprehensive Cognitive AI Reasoning Engine for Healthcare & Biomedical Waste.
    Thinks through question intent, analyzes multi-bin comparisons, explains clinical rationales,
    and converses naturally like a human hospital clinical specialist.
    """
    raw_q = (query or "").strip()
    q = raw_q.lower()

    if not q:
        return {
            "reply": "Hello! I am your **MedWaste AI Clinical Specialist**. You can ask me anything about hospital waste segregation (Red, Blue, Yellow, White, Black/Green bins), clinical item handling, emergency SOPs, or healthcare safety protocols.",
            "category_tag": "General",
            "recommended_action": "Ask any question about waste bins, hospital items, or emergency procedures.",
            "suggested_followups": [
                "What goes into the Blue or Red bin?",
                "Which bin do used plastic syringes go into?",
                "What is the emergency first-aid for a needle-stick injury?"
            ],
            "engine": "MedWaste AI Cognitive Engine"
        }

    # -------------------------------------------------------------
    # 1. GREETINGS & CASUAL SOCIAL CONVERSATION (HUMAN-LIKE)
    # -------------------------------------------------------------
    pure_greeting = (
        bool(re.search(r"^(hi+|hello+|hey+|namaste|yo|heya|howdy|greetings)\b", q))
        and len(q.split()) <= 4
        and not any(w in q for w in ["bin", "waste", "needle", "syringe", "plastic", "glass", "blood", "red", "blue", "yellow", "white", "black", "green"])
    )

    if pure_greeting:
        return {
            "reply": "Hey there! 👋 It's wonderful to connect with you! How are you doing today? How is your day or hospital shift going so far?\n\nWhether you need help sorting waste bins (like Red vs Blue), checking an emergency protocol, or just chatting, I'm right here with you! What can I help you with?",
            "category_tag": "General",
            "recommended_action": "Feel free to ask any question or chat anytime.",
            "suggested_followups": [
                "What goes into the Blue or Red bin?",
                "How are you doing today?",
                "Where do used plastic syringes go?"
            ],
            "engine": "MedWaste AI Conversational Engine"
        }

    # "How are you" / "How is your day"
    if any(k in q for k in ["how are you", "how r u", "how is your day", "how's your day", "hows your day", "how are things", "how's it going", "how is it going", "what's up", "whats up", "wassup", "how do you do"]) and not any(w in q for w in ["bin", "waste", "needle", "glass", "red", "blue", "yellow"]):
        prefix = "Good morning! ☀️ " if ("morning" in q or "gm" in q) else ("Good afternoon! 🌤️ " if "afternoon" in q else ("Good evening! 🌆 " if "evening" in q else ""))
        return {
            "reply": f"{prefix}I'm doing really well, thank you so much for asking! 😊 My day has been going great. How about you? How is your day going? Are you working a busy shift at the clinic or hospital today, or taking things easy?",
            "category_tag": "General",
            "recommended_action": "Stay positive, drink water, and have a wonderful day!",
            "suggested_followups": [
                "I'm having a busy hospital shift today",
                "What goes into the Blue or Red bin?",
                "What is the emergency protocol for a needle-stick injury?"
            ],
            "engine": "MedWaste AI Conversational Engine"
        }

    # Empathy for hard shift / fatigue
    if any(w in q for w in ["tired", "exhausted", "busy day", "stressful", "hectic", "rough day", "hard shift", "long day", "tough day", "overwhelmed"]):
        return {
            "reply": "Oh, hang in there! 💙 Working in healthcare and clinical environments can be mentally and physically demanding. Please remember to take a short breather, drink some water, and give yourself credit for the vital work you do keeping patients and staff safe every single day! 💪\n\nIs there anything I can help you with right now to take some load off your shoulders?",
            "category_tag": "General",
            "recommended_action": "Take a 5-minute breather and stay hydrated!",
            "suggested_followups": [
                "What goes into the Blue or Red bin?",
                "Tell me a joke to cheer me up",
                "Where do used plastic syringes go?"
            ],
            "engine": "MedWaste AI Conversational Engine"
        }

    # Identity / Capabilities
    if any(k in q for k in ["who are you", "what are you", "what can you do", "are you human", "are you a bot", "are you ai", "what is your name", "your name"]):
        return {
            "reply": "I'm **MedWaste AI**—your intelligent clinical AI companion and biomedical waste specialist! 🤖✨\n\nI'm designed to think through hospital scenarios and guide you naturally just like an experienced clinical colleague. You can ask me:\n- Detailed bin segregation (**Red, Blue, Yellow, White, Black/Green, Cytotoxic**)\n- Multi-bin comparisons (like *'What goes into the Blue or Red bin?'*)\n- How to dispose of specific items (syringes, glass vials, IV sets, expired medicines, pizza boxes)\n- Emergency protocols (needle sticks, blood spills, chemical leaks)\n- Scientific explanations (*'Why can't needles go into the red bin?'*)\n\nHow can I help you right now?",
            "category_tag": "General",
            "recommended_action": "Ask any question about waste bins, hospital items, or emergency procedures.",
            "suggested_followups": [
                "What goes into the Blue or Red bin?",
                "What is the first-aid for a needle-stick injury?",
                "Where do expired medicines go?"
            ],
            "engine": "MedWaste AI Conversational Engine"
        }

    # Jokes / Humor
    if any(k in q for k in ["joke", "funny", "make me laugh", "humor"]):
        return {
            "reply": "Here's a light healthcare one for you! 😄\n\n*Why did the recycling bin break up with the trash can?*\n**Because it felt like their relationship was just going to waste!** 🗑️💚\n\nHope that brought a smile to your shift! What else is on your mind?",
            "category_tag": "General",
            "recommended_action": "Keep smiling and stay energized!",
            "suggested_followups": [
                "Tell me another joke",
                "What goes into the Blue or Red bin?",
                "Where do used plastic syringes go?"
            ],
            "engine": "MedWaste AI Conversational Engine"
        }

    # Gratitude
    if any(k in q for k in ["thank you", "thanks", "thx", "appreciate it", "awesome", "great job", "you are great", "you're great"]):
        return {
            "reply": "You're so very welcome! 🥰 I'm really glad I could help make things clearer for you. Keep up the fantastic work keeping healthcare clean and safe. Let me know whenever you need anything else!",
            "category_tag": "General",
            "recommended_action": "Always here and happy to support you!",
            "suggested_followups": [
                "What goes into the Blue or Red bin?",
                "What is the emergency protocol for a needle stick?",
                "How is your day going?"
            ],
            "engine": "MedWaste AI Conversational Engine"
        }

    # Farewell
    if any(k in q for k in ["bye", "goodbye", "good bye", "see you", "take care", "talk later"]):
        return {
            "reply": "Goodbye for now! 👋 Take care of yourself, stay safe around the ward, and have a wonderful day ahead. Come back whenever you need anything!",
            "category_tag": "General",
            "recommended_action": "Stay safe and take care!",
            "suggested_followups": ["Good morning!", "How are you doing?"],
            "engine": "MedWaste AI Conversational Engine"
        }

    # -------------------------------------------------------------
    # 2. EMERGENCY PROTOCOLS & ACCIDENT PROCEDURES
    # -------------------------------------------------------------
    # Needle-stick injury SOP
    if any(k in q for k in ["needle stick", "needlestick", "prick", "sharp injury", "punctured by needle", "pricked", "cut by blade"]):
        return {
            "reply": "🚨 **EMERGENCY FIRST-AID: Needle-Stick / Sharps Injury Protocol**\n\n"
                     "If you have suffered an accidental needle-stick puncture, act immediately:\n\n"
                     "1. **Wash Immediately:** Hold the wound under cool running tap water with soap for at least **5 minutes**.\n"
                     "2. **DO NOT Squeeze or Suck:** Never squeeze, pinch, or suck the wound. Squeezing creates trauma and can draw virus particles deeper into vascular tissue.\n"
                     "3. **Disinfect & Cover:** Pat dry with clean gauze and cover with a sterile waterproof adhesive bandage.\n"
                     "4. **Report Promptly:** Inform your nursing in-charge or Infection Control Officer immediately.\n"
                     "5. **Initiate PEP (Post-Exposure Prophylaxis):** Evaluation for HIV and Hepatitis B PEP must be started **within 2 hours** of exposure for maximum clinical efficacy.",
            "category_tag": "Emergency",
            "recommended_action": "Wash under running tap water for 5 minutes; report immediately for PEP within 2 hours.",
            "suggested_followups": [
                "What PPE is required for handling sharps?",
                "Where should hypodermic needles be disposed?",
                "What goes into the Blue or Red bin?"
            ],
            "engine": "MedWaste AI Cognitive Engine"
        }

    # Blood or bodily fluid spill
    if any(k in q for k in ["spill", "leak", "blood spill", "vomit", "hypochlorite"]):
        return {
            "reply": "⚠️ **CLINICAL BLOOD & FLUID SPILL MANAGEMENT SOP**\n\n"
                     "1. **Cordon Off:** Mark the spill perimeter with warning cones to prevent foot traffic.\n"
                     "2. **Don PPE:** Put on heavy utility gloves, eye protection/face shield, and a fluid-resistant apron.\n"
                     "3. **Contain with Paper Towels:** Cover the liquid spill with absorbent paper towels to absorb the liquid and prevent spreading.\n"
                     "4. **Disinfect with Hypochlorite:** Pour freshly prepared **1% Sodium Hypochlorite solution** (10,000 ppm available chlorine) generously over the towels.\n"
                     "5. **Wait 20 Minutes:** Allow a mandatory **20-minute contact time** for full viral inactivation (HIV, HBV, HCV).\n"
                     "6. **Disposal:** Using tongs, scoop soaked towels into a **Yellow Biohazard Bag**.\n"
                     "7. **Mop & Sanitize:** Mop the area thoroughly with hospital-grade disinfectant.",
            "category_tag": "Emergency",
            "recommended_action": "Cover spill with towels + 1% Sodium Hypochlorite for 20 minutes; discard in Yellow bag.",
            "suggested_followups": [
                "What items go into the Yellow bag?",
                "What PPE is mandatory for waste handlers?",
                "What is the first aid for a needle stick?"
            ],
            "engine": "MedWaste AI Cognitive Engine"
        }

    # Needle accidentally dropped in Red or Yellow bin (Near-miss)
    if any(w in q for w in ["needle", "sharp"]) and any(w in q for w in ["wrong bin", "accidentally", "mistake", "dropped in", "dropped into", "mixed into"]):
        return {
            "reply": "⚠️ **NEAR-MISS PROTOCOL: Needle Placed in Wrong Bin (Red or Yellow)**\n\n"
                     "- **Why it is Dangerous:** Red waste goes to autoclaves and mechanical granulators. A metal needle can shatter shredder blades and severely injure recycling plant personnel.\n"
                     "- **Corrective Action:**\n"
                     "  1. Don heavy puncture-resistant utility gloves and eye protection.\n"
                     "  2. **NEVER reach into the bin with bare or gloved hands!**\n"
                     "  3. Use long forceps or tongs to carefully extract the needle.\n"
                     "  4. Drop it immediately into the **White Puncture-Proof Sharps Container**.\n"
                     "  5. Document the incident as an internal safety near-miss in the ward logbook.",
            "category_tag": "Emergency",
            "recommended_action": "Extract needle using forceps/tongs only; place in White container; log near-miss.",
            "suggested_followups": [
                "Where do used plastic syringes go?",
                "What is the first-aid for a needle stick?",
                "What goes into the Blue or Red bin?"
            ],
            "engine": "MedWaste AI Cognitive Engine"
        }

    # -------------------------------------------------------------
    # 3. "WHY" & SCIENTIFIC REASONING QUESTIONS
    # -------------------------------------------------------------
    # Why can't needles go in red bin?
    if ("needle" in q or "sharp" in q) and ("red" in q) and any(w in q for w in ["why", "cannot", "can't", "not allowed", "prohibit", "never"]):
        return {
            "reply": "⚠️ **WHY NEEDLES CAN NEVER GO INTO THE RED BIN**\n\n"
                     "1. **Severe Worker Puncture Hazard:** Red bin waste travels to recycling facilities where plastic items are sorted and fed into machines. A loose needle inside a Red bag poses an extreme risk of needle-stick injury and Hepatitis B/HIV infection to recycling workers.\n"
                     "2. **Destruction of Shredding Machinery:** The Red stream goes directly to industrial granulators and rotating blade shredders. Hardened steel hypodermic needles jam, dull, and destroy mechanical shredder blades.\n"
                     "3. **Regulatory Violation:** Under biomedical waste rules, all sharps must be placed strictly in puncture-proof White translucent containers.\n\n"
                     "💡 **Proper Method:** Always cut the needle off at the hub using a needle destroyer before placing the plastic syringe barrel in the Red bin!",
            "category_tag": "Educational",
            "recommended_action": "Never put needles in Red bin; drop into White puncture-proof container.",
            "suggested_followups": [
                "What goes into the Blue or Red bin?",
                "What is the emergency first-aid for a needle-stick injury?",
                "What goes into the White sharps container?"
            ],
            "engine": "MedWaste AI Cognitive Engine"
        }

    # Why can't chlorinated plastics / PVC go in yellow bin?
    if any(w in q for w in ["chlorinated", "pvc", "plastic"]) and "yellow" in q and any(w in q for w in ["why", "cannot", "can't", "not allowed", "burn", "incinerat"]):
        return {
            "reply": "🔥 **WHY CHLORINATED PLASTICS (PVC) ARE BANNED FROM YELLOW BAGS**\n\n"
                     "1. **Dioxins & Furans Emission:** When chlorinated plastics (such as PVC IV tubing or blood bags) are incinerated, the chlorine reacts with organic compounds to produce **polychlorinated dibenzo-p-dioxins (PCDDs) and dibenzofurans (PCDFs)**. These are among the most toxic, carcinogenic environmental pollutants known.\n"
                     "2. **Acid Gas Formation:** Burning chlorine generates hydrochloric acid (HCl) gas, which corrodes incinerator refractory brickwork and flue systems.\n"
                     "3. **Proper Segregation:** All recyclable plastics belong in the **Red Bin** for steam sterilization (autoclaving), which uses zero combustion and produces zero dioxins.",
            "category_tag": "Educational",
            "recommended_action": "Place all plastics into Red bin for autoclaving; never incinerate chlorinated plastics.",
            "suggested_followups": [
                "What items belong in the Yellow bag?",
                "What goes into the Red bin?",
                "How does an autoclave work?"
            ],
            "engine": "MedWaste AI Cognitive Engine"
        }

    # Why is recapping needles prohibited?
    if "recap" in q:
        return {
            "reply": "🚫 **WHY RECAPPING NEEDLES BY HAND IS STRICTLY PROHIBITED**\n\n"
                     "- **The Danger:** Clinical studies show that **over 80% of accidental needle-stick injuries** occur while healthcare workers attempt to slide the tiny plastic cap back onto a used needle with two hands.\n"
                     "- **Safety Protocol:**\n"
                     "  1. Destroy or snip the needle hub immediately using a needle burner or hub cutter at the point of care.\n"
                     "  2. Drop the needle directly into the **White Puncture-Proof Sharps Box**.\n"
                     "  3. If recapping is absolutely unavoidable (e.g. arterial blood gas collection), use the **Single-Handed 'Scoop' Technique** only (place cap on table, scoop with needle using one hand, then click in place).",
            "category_tag": "White",
            "recommended_action": "Never recap needles by hand; drop directly into White sharps box.",
            "suggested_followups": [
                "What is the first-aid for a needle-stick injury?",
                "Where do plastic syringes go?",
                "What goes into the Blue or Red bin?"
            ],
            "engine": "MedWaste AI Cognitive Engine"
        }

    # Why segregate biomedical waste?
    if any(k in q for k in ["why segregate", "importance of segregation", "why separate", "why is biomedical waste", "why segregation"]):
        return {
            "reply": "🏥 **WHY PROPER BIOMEDICAL WASTE SEGREGATION IS VITAL**\n\n"
                     "1. **Only 15% is Hazardous:** In any hospital, approximately **85%** of waste is clean municipal trash (packaging, food, paper) and only **15%** is biohazardous. Without strict source segregation, the 85% clean waste becomes contaminated, escalating disposal costs by up to 10-fold.\n"
                     "2. **Preventing Epidemics & Cross-Infection:** Segregation prevents dangerous bloodborne pathogens (HIV, Hepatitis B, Hepatitis C) from infecting sanitation workers, ragpickers, and the general community.\n"
                     "3. **Eliminating Toxic Air Pollution:** Keeping plastics out of incinerators prevents toxic carcinogenic Dioxins and Furans from entering our atmosphere.\n"
                     "4. **Worker Safety:** Keeping sharps contained in puncture-proof White boxes prevents life-threatening needle-stick punctures.\n"
                     "5. **Resource Recovery:** Enables safe recycling of thousands of tons of high-grade clinical polymers and glass every year.",
            "category_tag": "Educational",
            "recommended_action": "Segregate strictly at source to prevent infection spread and environmental contamination.",
            "suggested_followups": [
                "What goes into the Blue or Red bin?",
                "What are the 4 main color streams?",
                "What is the first-aid for a needle-stick injury?"
            ],
            "engine": "MedWaste AI Cognitive Engine"
        }

    # -------------------------------------------------------------
    # 4. MULTI-BIN COMPARISONS & REASONING
    # -------------------------------------------------------------
    bin_colors = []
    if "blue" in q: bin_colors.append("blue")
    if "red" in q: bin_colors.append("red")
    if "yellow" in q: bin_colors.append("yellow")
    if "white" in q: bin_colors.append("white")
    if "black" in q: bin_colors.append("black")
    if "green" in q: bin_colors.append("green")
    if "purple" in q or "cytotoxic" in q or "chemo" in q or "oncology" in q: bin_colors.append("purple")

    # A. Blue OR Red (The user's direct question!)
    if ("blue" in bin_colors and "red" in bin_colors) or (("blue" in q or "red" in q) and ("or red" in q or "or blue" in q or "and red" in q or "and blue" in q or "blue vs red" in q or "red vs blue" in q)):
        return {
            "reply": "Great question! Both the **Blue container** and the **Red bin** handle recyclable hospital materials, but they are strictly separated because they contain completely different materials requiring different recycling technologies:\n\n"
                     "🔵 **BLUE CONTAINER: Glassware & Metallic Implants**\n"
                     "- **What goes here:**\n"
                     "  - Medicine glass vials (broken or intact)\n"
                     "  - Antibiotic glass ampoules\n"
                     "  - Microscope glass slides and cover slips\n"
                     "  - Contaminated orthopedic metal implants (pins, bone screws, plates, intramedullary rods)\n"
                     "- **Why it goes to Blue:** Glass and metals CANNOT go into plastic shredders (they would destroy the shredder blades). Instead, they undergo chemical disinfection (1-2% Sodium Hypochlorite) or autoclaving, and are sent to licensed glass crushing recyclers and metal smelters.\n"
                     "- **Safety Rule:** Always handle broken glass or ampoules with forceps or tongs—never with bare hands!\n\n"
                     "🔴 **RED BIN: Contaminated Recyclable Plastics**\n"
                     "- **What goes here:**\n"
                     "  - Disposable plastic syringe barrels (**WITHOUT needles**)\n"
                     "  - Intravenous (IV) infusion bottles and tubing sets\n"
                     "  - Urinary catheters and drainage urine bags\n"
                     "  - Dialysis kits and plastic tubing\n"
                     "  - Vacutainer blood collection tubes (plastic bodies)\n"
                     "- **Why it goes to Red:** These are high-grade recyclable polymers. They are sterilized via pressurized steam autoclaving (121°C @ 15 psi) or microwaving, then mechanically shredded into clean plastic granules to manufacture non-clinical plastic products.\n"
                     "- **Crucial Rule:** The metal needle must ALWAYS be cut off at the hub using a needle destroyer before dropping the plastic syringe into the Red bin!\n\n"
                     "💡 **Quick Summary to Remember:**\n"
                     "- **Blue** = **Breakables & Metal Implants** (Glass vials, ampoules, orthopedic screws)\n"
                     "- **Red** = **Recyclable Plastics** (Syringes, IV sets, catheters, urine bags)",
            "category_tag": "Segregation",
            "recommended_action": "Place glass vials/implants in Blue; place plastic syringes (no needle) and IV sets in Red.",
            "suggested_followups": [
                "Where do the metal needles go?",
                "What items belong in the Yellow biohazard bag?",
                "What is the emergency first-aid for a needle-stick injury?"
            ],
            "engine": "MedWaste AI Cognitive Engine"
        }

    # B. Yellow vs Red
    if ("yellow" in bin_colors and "red" in bin_colors) or ("yellow vs red" in q or "red vs yellow" in q or "yellow or red" in q):
        return {
            "reply": "Here is the key distinction between the **Yellow bag** and the **Red bin**:\n\n"
                     "🟡 **YELLOW BAG: Infectious & Anatomical (Destruction via Incineration)**\n"
                     "- **Items:** Human anatomical tissues, organs, placentas, blood-soaked gauze, dressings, soiled cotton swabs, pus swabs, pathology cultures, and expired medicines.\n"
                     "- **Fate:** High-temperature double-chamber incineration (800°C primary / 1050°C secondary) or plasma pyrolysis to convert biological hazards to inert ash.\n"
                     "- **Rule:** Never put recyclable plastics or metals here.\n\n"
                     "🔴 **RED BIN: Contaminated Plastics (Sterilization & Recycling)**\n"
                     "- **Items:** Recyclable plastic equipment: plastic syringe barrels (without needle), IV tubing sets, saline bottles, catheters, urine bags.\n"
                     "- **Fate:** Autoclaved with steam under pressure (121°C), then shredded and recycled into industrial plastic polymers.\n"
                     "- **Rule:** Never put tissues, blood bags, or metal sharps in the Red bin!",
            "category_tag": "Segregation",
            "recommended_action": "Yellow is for infectious/anatomical incineration; Red is for recyclable plastics.",
            "suggested_followups": [
                "What goes into the Blue container?",
                "Where do needle tips go?",
                "Why can't chlorinated plastics be incinerated?"
            ],
            "engine": "MedWaste AI Cognitive Engine"
        }

    # C. Blue vs White
    if ("blue" in bin_colors and "white" in bin_colors) or ("blue vs white" in q or "white vs blue" in q or "blue or white" in q):
        return {
            "reply": "Here is how to separate **Blue** vs **White** containers:\n\n"
                     "🔵 **BLUE CONTAINER (Glassware & Metal Implants):**\n"
                     "- Broken or unbroken glass vials, ampoules, slides, and orthopedic implants (pins, screws, plates).\n"
                     "- Treated by chemical disinfection or autoclaving, then crushed and recycled.\n\n"
                     "⚪ **WHITE TRANSLUCENT BOX (Puncture-Proof Sharps):**\n"
                     "- Contaminated metal sharps: Hypodermic needles, surgical scalpels, suture needles, lancets, and broken sharp ampoule tips.\n"
                     "- Translucent, rigid, puncture-proof box. Never recap needles! Sealed at 3/4 capacity and encapsulated in concrete or sent to sharp pits.",
            "category_tag": "Segregation",
            "recommended_action": "Glass vials & implants go in Blue; needles & scalpels go in White puncture-proof box.",
            "suggested_followups": [
                "What goes into the Red bin?",
                "What is the first-aid for a needle-stick injury?",
                "Can empty glass vials be recycled?"
            ],
            "engine": "MedWaste AI Cognitive Engine"
        }

    # D. General overview of ALL bins
    if any(k in q for k in ["all bins", "every bin", "color code", "which bins", "all colors", "4 colors", "four colors", "list bins", "types of bins"]):
        return {
            "reply": "Here is the complete color-coding guide for hospital biomedical waste segregation:\n\n"
                     "🟡 **YELLOW BAG (Infectious & Anatomical Waste):**\n"
                     "- Human tissues, organs, placentas, blood-soaked gauze, dressings, pus swabs, expired medicines, lab cultures.\n"
                     "- **Treatment:** High-temperature incineration (800°C–1050°C).\n\n"
                     "🔴 **RED BIN (Contaminated Recyclable Plastics):**\n"
                     "- Disposable syringe bodies (no needle), IV tubing sets, catheters, urine bags, dialysis kits, plastic bottles.\n"
                     "- **Treatment:** Autoclaving (121°C @ 15 psi) + mechanical shredding + plastic recycling.\n\n"
                     "⚪ **WHITE CONTAINER (Metal Sharps):**\n"
                     "- Hypodermic needles, scalpel blades, suture needles, lancets. Rigid puncture-proof box.\n"
                     "- **Treatment:** Autoclaving/dry heat + encapsulation in concrete or deep sharp pits.\n\n"
                     "🔵 **BLUE BOX (Glassware & Metal Implants):**\n"
                     "- Medicine glass vials, antibiotic ampoules, microscope slides, orthopedic screws/plates/pins.\n"
                     "- **Treatment:** Disinfection soak or autoclaving + glass recycling / metal smelting.\n\n"
                     "🟢⚫ **GREEN & BLACK BINS (General Municipal Waste - 85% of total):**\n"
                     "- Green: Wet/food leftovers, fruit peels, canteen scraps (composting).\n"
                     "- Black: Clean dry paper, packaging boxes, clean plastic wrappers (municipal recycling).",
            "category_tag": "Segregation",
            "recommended_action": "Segregate strictly at source into Yellow, Red, White, Blue, and Municipal bins.",
            "suggested_followups": [
                "What goes into the Blue or Red bin?",
                "Where do used plastic syringes go?",
                "What is the first-aid for a needle-stick injury?"
            ],
            "engine": "MedWaste AI Cognitive Engine"
        }

    # -------------------------------------------------------------
    # 5. ITEM-SPECIFIC REASONING ENGINE (100+ ITEMS)
    # -------------------------------------------------------------
    # Syringes (Plastic body vs needle)
    if any(k in q for k in ["syringe", "syringes"]):
        return {
            "reply": "💉 **DISPOSAL OF USED SYRINGES: Step-by-Step Clinical Procedure**\n\n"
                     "A used disposable syringe contains two distinct hazard components that MUST be separated at the point of use:\n\n"
                     "1. **The Metal Needle:**\n"
                     "   - Snip the needle at the hub using a point-of-use needle cutter or electric burner.\n"
                     "   - Deposit the metal needle immediately into the **White Translucent Puncture-Proof Sharps Container**.\n"
                     "   - **Never recap needles by hand!**\n\n"
                     "2. **The Plastic Barrel & Plunger:**\n"
                     "   - Drain any residual medication or fluid.\n"
                     "   - Drop the needle-free plastic barrel into the **Red Bin**.\n"
                     "   - It will be autoclaved at 121°C and shredded into plastic granules for safe polymer recycling.\n\n"
                     "*(Note: If the syringe has a permanently fixed needle, such as an insulin syringe, do NOT attempt to break it; drop the entire unit into the White container).*",
            "category_tag": "Red",
            "recommended_action": "Snip needle into White sharps box; place plastic barrel into Red bin.",
            "suggested_followups": [
                "What goes into the Blue container?",
                "What is the emergency first-aid for a needle-stick injury?",
                "What belongs in the Yellow biohazard bag?"
            ],
            "engine": "MedWaste AI Cognitive Engine"
        }

    # Needles / Scalpels / Blades / Sharps
    if any(k in q for k in ["needle", "needles", "scalpel", "blade", "lancet", "suture needle", "ampoule tip"]):
        return {
            "reply": "🔪 **SHARPS DISPOSAL: Needles, Scalpels, and Blades**\n\n"
                     "- **Designated Container:** **White Translucent Puncture-Proof Sharps Box**.\n"
                     "- **Items Included:** Hypodermic needles, suture needles, surgical scalpel blades, disposable razors, lancets, and broken glass ampoule tips.\n"
                     "- **Safety Protocol:**\n"
                     "  1. Drop directly into the container immediately after use at bedside.\n"
                     "  2. **NEVER recap needles with two hands.** If recapping is clinically necessary (e.g. arterial blood gas), use the single-handed 'scoop' technique.\n"
                     "  3. Stop using and seal the container permanently when it reaches **3/4 capacity (75%)**.\n"
                     "- **Final Treatment:** Autoclaving followed by concrete encapsulation or deep burial in a sharp pit.",
            "category_tag": "White",
            "recommended_action": "Drop directly into White puncture-proof container without recapping.",
            "suggested_followups": [
                "What is the first-aid for an accidental needle-stick injury?",
                "Where do plastic syringes go?",
                "What goes into the Blue container?"
            ],
            "engine": "MedWaste AI Cognitive Engine"
        }

    # Glass vials / Ampoules / Slides
    if any(k in q for k in ["glass", "vial", "vials", "ampoule", "ampoules", "slide", "slides", "petri dish", "flask"]):
        return {
            "reply": "🧪 **GLASSWARE DISPOSAL: Vials, Ampoules, and Slides**\n\n"
                     "- **Designated Container:** **Blue Box or Blue-Marked Puncture-Resistant Bin**.\n"
                     "- **Items Included:** Intact or broken medicine glass vials, antibiotic ampoules, laboratory glass slides, cover slips, and culture flasks.\n"
                     "- **Safe Handling:**\n"
                     "  - Never pick up broken glass fragments with bare hands or standard gloves; always use forceps, tongs, or a dustpan brush.\n"
                     "  - Ensure the Blue container has a puncture-resistant bottom to prevent glass shards from piercing through.\n"
                     "- **Recycling Path:** Glass items are disinfected in a sodium hypochlorite bath or autoclave, crushed into cullet, and remelted into industrial glass products.",
            "category_tag": "Blue",
            "recommended_action": "Use forceps to place glass vials and ampoules into Blue box.",
            "suggested_followups": [
                "What goes into the Red bin?",
                "What goes into the Yellow bag?",
                "Where do metal implants go?"
            ],
            "engine": "MedWaste AI Cognitive Engine"
        }

    # IV sets / Catheters / Urine bags / Tubing
    if any(k in q for k in ["iv set", "iv tube", "iv bottle", "catheter", "urine bag", "dialysis", "tubing", "vacutainer"]):
        return {
            "reply": "🩸 **PLASTIC TUBING & DRAINAGE: IV Sets, Catheters, and Urine Bags**\n\n"
                     "- **Designated Container:** **Red Bin**.\n"
                     "- **Categorized Items:** IV drip sets, infusion lines, plastic saline/dextrose bottles, Foley catheters, drainage bags, urine bags, dialysis kits, and plastic specimen vacutainers.\n"
                     "- **Pre-Disposal Step:**\n"
                     "  - Residual fluids (saline, urine, drained fluids) must be emptied into the sluice/sanitary drainage.\n"
                     "  - Any attached metal needle or connector spike must be removed and placed into the White sharps container.\n"
                     "- **Treatment:** Pressurized steam autoclaving (121°C @ 15 psi) followed by mechanical granulating and polymer recycling.",
            "category_tag": "Red",
            "recommended_action": "Drain fluids, remove any metal tips, and place plastic tubing/bags into Red bin.",
            "suggested_followups": [
                "What goes into the Blue container?",
                "Where do blood-soaked bandages go?",
                "What is the 48-hour waste storage rule?"
            ],
            "engine": "MedWaste AI Cognitive Engine"
        }

    # Blood-soaked cotton / Gauze / Bandages / Plaster casts / Tissues
    if any(k in q for k in ["cotton", "gauze", "bandage", "bandages", "dressing", "dressings", "blood soaked", "placenta", "tissue", "anatomical", "biopsy", "organ", "flesh", "plaster cast", "pus swab"]):
        return {
            "reply": "🟡 **INFECTIOUS & ANATOMICAL SOILS: Cotton, Gauze, Bandages, and Tissues**\n\n"
                     "- **Designated Container:** **Yellow Non-Chlorinated Biohazard Bag**.\n"
                     "- **Categorized Items:**\n"
                     "  - Blood-soaked gauze, surgical dressings, and cotton swabs\n"
                     "  - Pus swabs and contaminated wound packings\n"
                     "  - Plaster of Paris casts contaminated with body fluids\n"
                     "  - Human anatomical specimens: tissues, placentas, biopsy samples, amputated parts\n"
                     "- **Why Yellow:** These items carry high biological pathogen loads (hepatitis, HIV, bacterial infections). They must be completely eliminated through double-chamber high-temperature incineration (800°C–1050°C) to prevent disease transmission.\n"
                     "- **Storage:** Must be incinerated within **48 hours** under CPCB regulations.",
            "category_tag": "Yellow",
            "recommended_action": "Place infectious swabs and anatomical waste into Yellow bag; route for incineration.",
            "suggested_followups": [
                "What goes into the Red bin?",
                "What is the emergency SOP for a blood spill?",
                "Where do used plastic syringes go?"
            ],
            "engine": "MedWaste AI Cognitive Engine"
        }

    # Gloves & Masks (Clinical vs General)
    if any(k in q for k in ["glove", "gloves", "mask", "masks", "ppe"]):
        return {
            "reply": "🧤 **PPE DISPOSAL: Gloves and Masks Segregation Matrix**\n\n"
                     "How you dispose of gloves and masks depends strictly on their clinical contamination status:\n\n"
                     "1. **Contaminated / Blood-Stained Gloves & Masks:**\n"
                     "   - Any PPE used in isolation wards, ICU, COVID/infectious wards, or visibly stained with blood/fluids.\n"
                     "   - ➡️ **Yellow Biohazard Bag** (for high-temperature incineration).\n\n"
                     "2. **Routine Clean Examination Gloves (Latex/Nitrile):**\n"
                     "   - Used for non-infectious routine checks, free of blood or body fluid contamination.\n"
                     "   - ➡️ **Red Bin** (for autoclaving and polymer recycling).\n\n"
                     "3. **Clean Paper Masks / Administrative Use:**\n"
                     "   - Masks worn by receptionists, visitors, or non-clinical staff with zero infectious exposure.\n"
                     "   - ➡️ **Black Municipal Bin** (general waste).",
            "category_tag": "Segregation",
            "recommended_action": "Blood-stained = Yellow bag; Clean clinical gloves = Red bin; Clean admin masks = Black bin.",
            "suggested_followups": [
                "What items go into the Yellow bag?",
                "What goes into the Red bin?",
                "What PPE is mandatory for waste handlers?"
            ],
            "engine": "MedWaste AI Cognitive Engine"
        }

    # Expired Medicines / Discarded Drugs / Blister packs
    if any(k in q for k in ["medicine", "medicines", "drug", "drugs", "expired", "tablet", "tablets", "capsule", "capsules", "syrup", "paracetamol", "antibiotic", "blister pack"]):
        return {
            "reply": "💊 **EXPIRED & DISCARDED PHARMACEUTICALS**\n\n"
                     "- **Solid & Liquid Medicines:** Expired tablets, capsules, antibiotic syrups, and injectable solutions.\n"
                     "  - ➡️ **Yellow Biohazard Bag** (sent for high-temperature incineration at authorized CBWTFs).\n"
                     "  - **Crucial Rule:** Never flush antibiotics or expired drugs down the toilet or sink! This causes pharmaceutical contamination of municipal water and accelerates antimicrobial resistance.\n\n"
                     "- **Empty Clean Blister Packs & Outer Cardboard Boxes:**\n"
                     "  - If empty and clean (no drug residue), paper cartons go into the **Black Municipal Bin** for recycling.\n"
                     "  - Contaminated foil blister packs with drug residue go into the **Yellow Bag**.",
            "category_tag": "Yellow",
            "recommended_action": "Deposit expired drugs into Yellow bag for high-temperature incineration; never flush.",
            "suggested_followups": [
                "Where do chemotherapy drugs go?",
                "What goes into the Blue container?",
                "What belongs in the Red bin?"
            ],
            "engine": "MedWaste AI Cognitive Engine"
        }

    # Food waste / Pizza box / Lunch / Bottles / Packaging (Everyday hospital waste)
    if any(k in q for k in ["food", "pizza", "lunch", "apple", "banana", "snack", "wrapper", "paper", "cardboard", "packaging", "water bottle", "cup", "tea"]):
        return {
            "reply": "🥗📦 **GENERAL MUNICIPAL HOSPITAL WASTE (Food & Packaging)**\n\n"
                     "Food scraps, lunch boxes, and packaging are non-hazardous municipal waste (part of the 85% general stream):\n\n"
                     "1. **Food Leftovers & Organic Items:**\n"
                     "   - Leftover patient meals, fruit peels, tea bags, food scraps.\n"
                     "   - ➡️ **Green Bin** (Biodegradable / wet waste for composting).\n\n"
                     "2. **Clean Paper, Pizza Boxes & Packaging:**\n"
                     "   - Clean cardboard packaging, dry pizza boxes, snack wrappers, empty mineral water bottles, office paper.\n"
                     "   - ➡️ **Black Bin** (Non-biodegradable / dry municipal waste for recycling).\n\n"
                     "⚠️ **Hospital Tip:** If any food container was contaminated by blood or used in a strict infectious isolation ward, it must be treated as hazardous; otherwise, keep it strictly out of the expensive Yellow/Red biohazard streams!",
            "category_tag": "General",
            "recommended_action": "Food scraps go in Green bin; clean dry packaging and pizza boxes go in Black bin.",
            "suggested_followups": [
                "What goes into the Blue or Red bin?",
                "What are the 4 main color streams?",
                "Where do used plastic syringes go?"
            ],
            "engine": "MedWaste AI Cognitive Engine"
        }

    # Thermometers & Mercury
    if any(k in q for k in ["mercury", "thermometer", "sphygmomanometer", "blood pressure apparatus"]):
        return {
            "reply": "☣️ **CRITICAL PROTOCOL: Mercury & Clinical Thermometers**\n\n"
                     "- **ABSOLUTE WARNING:** **NEVER incinerate or autoclave mercury.** When heated, mercury converts into a lethal, odorless, neurotoxic vapor.\n"
                     "- **NEVER throw mercury into Yellow, Red, or general bins, and never wash down drains.**\n\n"
                     "### Spill Management Protocol:\n"
                     "1. Evacuate pregnant women and non-essential staff; ventilate the area immediately.\n"
                     "2. Don nitrile gloves (never touch mercury or use a vacuum cleaner, which vaporizes it).\n"
                     "3. Use two stiff pieces of cardboard or an eye-dropper to gather the beads together.\n"
                     "4. Transfer droplets into a sealable plastic bottle containing a layer of water or oil to suppress vapors.\n"
                     "5. Label container clearly: **'Hazardous Chemical Waste: Elemental Mercury'** and transfer to authorized hazardous waste facility.",
            "category_tag": "Emergency",
            "recommended_action": "Collect beads with cardboard into airtight water container; never incinerate or vacuum.",
            "suggested_followups": [
                "What goes into the Blue container?",
                "What is the first-aid for a needle stick?",
                "What happens if mercury is incinerated?"
            ],
            "engine": "MedWaste AI Cognitive Engine"
        }

    # -------------------------------------------------------------
    # 6. SINGLE BIN IN-DEPTH GUIDES
    # -------------------------------------------------------------
    # Blue Container
    if "blue" in bin_colors or any(k in q for k in ["blue bin", "blue container", "blue box", "blue bag"]):
        return {
            "reply": "🔵 **BLUE CONTAINER: Glassware & Metallic Implants**\n\n"
                     "The Blue container is specially designated for breakable glass items and orthopedic implants:\n\n"
                     "### What Goes In:\n"
                     "- **Medicine Glass Vials:** Both intact and broken vaccine or medicine vials.\n"
                     "- **Glass Ampoules:** Antibiotic ampoules, injection ampoules.\n"
                     "- **Laboratory Glassware:** Microscope slides, cover slips, glass petri dishes, pipettes, and culture flasks.\n"
                     "- **Contaminated Metal Implants:** Orthopedic pins, bone screws, compression plates, and intramedullary rods removed during surgeries.\n\n"
                     "### Why it is Segregated Here:\n"
                     "Glass and metal cannot be mixed with plastics (they would ruin shredder blades) or general trash. Blue box waste is pre-treated by soaking in 1-2% Sodium Hypochlorite or autoclaving, then crushed and safely recycled into commercial glass or smelted for metal recovery.\n\n"
                     "### Practical Handling Tips:\n"
                     "- Always use tongs or forceps to collect broken glass shards—never pick them up with your hands!\n"
                     "- Ensure the blue box is puncture-resistant and leak-proof with a reinforced bottom.",
            "category_tag": "Blue",
            "recommended_action": "Use forceps to place glass vials, ampoules, slides, and metal implants into Blue container.",
            "suggested_followups": [
                "What goes into the Red bin?",
                "Where do metal hypodermic needles go?",
                "What belongs in the Yellow biohazard bag?"
            ],
            "engine": "MedWaste AI Cognitive Engine"
        }

    # Red Bin
    if "red" in bin_colors or any(k in q for k in ["red bin", "red container", "red bag", "red bucket"]):
        return {
            "reply": "🔴 **RED BIN: Contaminated Recyclable Plastics**\n\n"
                     "The Red bin is exclusively for contaminated plastic clinical equipment that can be sterilized and recycled:\n\n"
                     "### What Goes In:\n"
                     "- **Plastic Syringes:** Disposable plastic syringe barrels and plungers (**metal needle MUST be removed**).\n"
                     "- **IV Equipment:** Intravenous infusion tubes, IV drip sets, saline plastic bottles.\n"
                     "- **Catheters & Drainage:** Urinary catheters, Foley catheters, drainage bags, urine collection bags.\n"
                     "- **Dialysis Supplies:** Dialysis kits, plastic tubing, filter casings.\n"
                     "- **Specimen Containers:** Plastic vacutainer blood tubes, plastic urine sample cups.\n"
                     "- **Gloves:** Clean clinical examination gloves (nitrile or latex).\n\n"
                     "### The 2 Golden Rules for Red Bins:\n"
                     "1. **Never drop a needle in the Red bin!** Always snip the needle hub with a point-of-use needle cutter into the White sharps container.\n"
                     "2. **Drain fluids first:** Empty residual urine, blood, or IV fluids into the sanitary sluice before bagging.\n\n"
                     "### How It Is Treated:\n"
                     "Waste is sterilized inside autoclaves (pressurized steam at 121°C @ 15 psi) or microwaves to eliminate 100% of pathogens, then mechanically shredded into clean plastic pellets for secondary industrial recycling.",
            "category_tag": "Red",
            "recommended_action": "Snip needle hub at point-of-use; drain fluids; place plastic body into Red bin.",
            "suggested_followups": [
                "What goes into the Blue container?",
                "Why can't needles go into the Red bin?",
                "Where do blood-soaked bandages go?"
            ],
            "engine": "MedWaste AI Cognitive Engine"
        }

    # White Container
    if "white" in bin_colors or any(k in q for k in ["white bin", "white container", "white box", "sharps container", "sharps box"]):
        return {
            "reply": "⚪ **WHITE TRANSLUCENT CONTAINER: Contaminated Metal Sharps**\n\n"
                     "The White container is a rigid, puncture-proof, leak-proof, and tamper-evident container for dangerous metal sharps:\n\n"
                     "### What Goes In:\n"
                     "- **Needles:** Hypodermic injection needles, spinal needles, biopsy needles, fixed-needle syringes (like insulin syringes).\n"
                     "- **Surgical Blades:** Scalpel blades, disposable razors, skin grafting blades.\n"
                     "- **Suture Needles:** Curved surgical needles with or without suture attached.\n"
                     "- **Lancets & Tips:** Blood lancets, contaminated broken ampoule tips.\n\n"
                     "### Critical Safety Rules:\n"
                     "- **NEVER recap needles by hand!** Recapping causes over 80% of accidental needle-stick injuries.\n"
                     "- Do not bend, snap, or break needles manually.\n"
                     "- Fill only up to **3/4 capacity** (never overfill or force sharps in).\n"
                     "- Permanently lock the tamper-evident lid before dispatch.\n\n"
                     "### Final Treatment:\n"
                     "Autoclaving or dry-heat sterilization, followed by encapsulation inside concrete blocks or disposal in deep sealed sharp pits.",
            "category_tag": "White",
            "recommended_action": "Drop directly into White puncture-proof container without recapping.",
            "suggested_followups": [
                "What is the first-aid for an accidental needle-stick injury?",
                "Where do plastic syringes without needles go?",
                "What goes into the Blue container?"
            ],
            "engine": "MedWaste AI Cognitive Engine"
        }

    # Yellow Bag
    if "yellow" in bin_colors or any(k in q for k in ["yellow bin", "yellow bag", "yellow container"]):
        return {
            "reply": "🟡 **YELLOW BAG: Infectious & Anatomical Biohazard Waste**\n\n"
                     "The Yellow bag is for highly infectious, anatomical, and chemical waste that requires complete thermal destruction:\n\n"
                     "### What Goes In:\n"
                     "- **Human Anatomical Waste:** Tissues, organs, amputated limbs, biopsy specimens, placentas, extracted teeth.\n"
                     "- **Animal Waste:** Experimental animal carcasses, organs, body parts from research.\n"
                     "- **Soiled Clinical Items:** Blood-soaked gauze, dressings, cotton swabs, pus swabs, plaster casts, blood bags.\n"
                     "- **Expired & Discarded Medicines:** Antibiotics, expired tablets, syrups, contaminated injectables.\n"
                     "- **Laboratory Cultures:** Microbiology cultures, biotechnology specimens, vaccine stocks.\n"
                     "- **Soiled PPE:** Masks, caps, and gowns heavily contaminated with body fluids.\n\n"
                     "### How It Is Treated:\n"
                     "Must be placed in certified non-chlorinated yellow plastic bags and transported for **double-chamber high-temperature incineration** (primary chamber at 800°C ± 50°C, secondary chamber at 1050°C ± 50°C) or plasma pyrolysis.\n\n"
                     "### Crucial Storage Rule:\n"
                     "Untreated Yellow waste must **never be held past 48 hours** without informing the pollution control authorities.",
            "category_tag": "Yellow",
            "recommended_action": "Double-knot yellow bag when 3/4 full; route for high-temperature incineration within 48 hours.",
            "suggested_followups": [
                "What goes into the Red bin?",
                "What items go into the Blue box?",
                "What is the emergency protocol for a blood spill?"
            ],
            "engine": "MedWaste AI Cognitive Engine"
        }

    # Black & Green Municipal
    if any(c in bin_colors for c in ["black", "green"]) or any(k in q for k in ["black bin", "green bin", "municipal", "general waste", "office trash"]):
        return {
            "reply": "🟢⚫ **BLACK & GREEN BINS: General Municipal Waste (Non-Biohazardous)**\n\n"
                     "General waste accounts for approximately **85%** of all waste generated in hospitals. It is completely non-hazardous:\n\n"
                     "### 🟢 Green Bin (Wet / Biodegradable):**\n"
                     "- Food leftovers from wards and hospital canteens\n"
                     "- Fruit and vegetable peels\n"
                     "- Tea bags and coffee grounds\n"
                     "- Garden leaves and flowers\n"
                     "- *Routed for composting and vermiculture.*\n\n"
                     "### ⚫ Black Bin (Dry / Recyclable Municipal):**\n"
                     "- Clean medicine packaging cartons and paper boxes\n"
                     "- Paper wrappers and office stationery\n"
                     "- Empty clean plastic water bottles\n"
                     "- Newspaper and magazine reading materials\n"
                     "- *Routed for municipal recycling.*\n\n"
                     "⚠️ **Zero Contamination Rule:** Never throw blood-stained gauze, soiled gloves, needles, or clinical fluids into municipal bins!",
            "category_tag": "General",
            "recommended_action": "Segregate food scraps into Green bin and clean paper/packaging into Black bin.",
            "suggested_followups": [
                "What goes into the Blue or Red bin?",
                "Where do used plastic syringes go?",
                "What happens if medical waste is mixed with municipal trash?"
            ],
            "engine": "MedWaste AI Cognitive Engine"
        }

    # Purple Cytotoxic
    if "purple" in bin_colors or any(k in q for k in ["purple", "cytotoxic", "chemo", "oncology"]):
        return {
            "reply": "🟣 **PURPLE / CYTOTOXIC CONTAINER: Chemotherapy & Oncology Waste**\n\n"
                     "Cytotoxic drugs are mutagenic, teratogenic, and carcinogenic, requiring the highest level of biosafety:\n\n"
                     "### What Goes In:\n"
                     "- Expired or leftover chemotherapy drug vials and ampoules\n"
                     "- IV sets and infusion tubing used to administer cancer drugs\n"
                     "- Gloves, gowns, and masks worn during cytotoxic preparation and infusion\n"
                     "- Patient bodily waste (urine, vomitus) within 48 hours of chemotherapy administration\n\n"
                     "### Safe Handling SOP:\n"
                     "- Handlers must wear double chemotherapy-tested nitrile gloves, eye goggles, and a fluid-impermeable gown.\n"
                     "- Prepare all doses under Class II Type B2 Biosafety Cabinets.\n"
                     "- Seal tightly in designated Purple bags or Yellow bags labeled with the prominent Cytotoxic symbol.\n"
                     "- Requires high-temperature destruction in dedicated incinerators at **exceeding 1200°C**.",
            "category_tag": "Cytotoxic",
            "recommended_action": "Double-glove, use Purple cytotoxic bags, and incinerate at >1200°C.",
            "suggested_followups": [
                "What is the spill procedure for chemotherapy drugs?",
                "What goes into the Blue or Red bin?",
                "What PPE is mandatory in oncology wards?"
            ],
            "engine": "MedWaste AI Cognitive Engine"
        }

    # -------------------------------------------------------------
    # 7. DYNAMIC HUMAN-LIKE REASONING FALLBACK FOR ANY NOVEL QUESTION
    # -------------------------------------------------------------
    words = [w for w in re.findall(r"\b[a-zA-Z]{3,}\b", q) if w not in [
        "the", "this", "that", "what", "which", "how", "where", "can", "should",
        "about", "for", "into", "with", "does", "are", "and", "tell", "explain",
        "please", "give", "know", "want"
    ]]
    subject_term = " ".join(words[:4]) if words else raw_q

    return {
        "reply": f"Let's think through how to handle **'{subject_term}'** by analyzing its material and clinical risk:\n\n"
                 "To determine the exact correct disposal, clinical staff evaluate three simple criteria:\n\n"
                 "1. **Is it sharp or capable of puncturing?**\n"
                 "   - *Metal needles, scalpels, surgical blades, lancets* ➡️ **White Puncture-Proof Container**.\n"
                 "   - *Broken glass vials, ampoules, microscope slides* ➡️ **Blue Container**.\n\n"
                 "2. **Is it heavily contaminated with blood, pus, or infectious body tissue?**\n"
                 "   - *Blood-soaked gauze, dressings, anatomical tissues, expired medicines* ➡️ **Yellow Biohazard Bag** (for high-temperature incineration).\n\n"
                 "3. **Is it a recyclable plastic medical item (without needles)?**\n"
                 "   - *Disposable plastic syringe barrels, IV tubes, urine bags, catheters* ➡️ **Red Bin** (for autoclaving & polymer recycling).\n\n"
                 "4. **Is it clean, dry general hospital trash?**\n"
                 "   - *Clean packaging cartons, office paper, food packaging* ➡️ **Black or Green Municipal Bins**.\n\n"
                 f"Could you tell me a little more about **'{subject_term}'**—specifically, what material it is made of, and whether it came into contact with blood or infectious fluids?",
        "category_tag": "General",
        "recommended_action": f"Assess material type and contamination level of '{subject_term}' before disposal.",
        "suggested_followups": [
            "What goes into the Blue or Red bin?",
            "What items belong in the Yellow biohazard bag?",
            "Where do used plastic syringes go?"
        ],
        "engine": "MedWaste AI Cognitive Engine"
    }


def generate_biomed_chat_reply(query, user_api_key=None):
    """Main routing function: uses Gemini LLM if key available, else uses advanced cognitive engine."""
    api_key = user_api_key or os.environ.get("GEMINI_API_KEY")
    if api_key and HAS_GENAI:
        llm_res = call_gemini_llm(query, api_key)
        if llm_res:
            return llm_res

    # Use advanced cognitive reasoning engine
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