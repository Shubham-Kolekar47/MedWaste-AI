# pyrefly: ignore [missing-import]
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

import os
import sqlite3

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

    return jsonify({
        "success": True,
        "classification": result,
        "image_url": f"/uploads/{filename}",
        "filename": filename
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

    data = request.get_json()

    bin_id = data.get("bin_id")

    if not bin_id:

        return jsonify({
            "success": False,
            "message": "bin_id is required"
        }), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO collections
        (bin_id, status)
        VALUES (?, 'Pending')
    """, (bin_id,))

    collection_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Collection request created",
        "collection_id": collection_id
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
                collections.*,
                bins.bin_code,
                bins.waste_type,
                bins.current_level
            FROM collections
            LEFT JOIN bins
            ON collections.bin_id = bins.id
            WHERE bins.hospital_id = ?
            ORDER BY collections.requested_at DESC
        """, (hospital_id,))
    else:
        cursor.execute("""
            SELECT
                collections.*,
                bins.bin_code,
                bins.waste_type,
                bins.current_level
            FROM collections
            LEFT JOIN bins
            ON collections.bin_id = bins.id
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


# ==========================================
# RUN SERVER
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