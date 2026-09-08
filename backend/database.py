import os
import sqlite3

DATABASE = os.path.join(os.path.dirname(__file__), "medwaste.db")


def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():

    conn = get_db()
    cursor = conn.cursor()

    # Hospitals
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS hospitals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            location TEXT,
            contact TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Users
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'hospital',
            hospital_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(hospital_id) REFERENCES hospitals(id)
        )
    """)

    # Smart bins
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bin_code TEXT UNIQUE NOT NULL,
            hospital_id INTEGER,
            waste_type TEXT NOT NULL,
            capacity REAL DEFAULT 100,
            current_level REAL DEFAULT 0,
            weight REAL DEFAULT 0,
            status TEXT DEFAULT 'Normal',
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(hospital_id) REFERENCES hospitals(id)
        )
    """)

    # Waste records
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS waste_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bin_id INTEGER,
            waste_type TEXT NOT NULL,
            weight REAL DEFAULT 0,
            confidence REAL DEFAULT 0,
            image_path TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(bin_id) REFERENCES bins(id)
        )
    """)

    # Vehicles
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS vehicles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vehicle_number TEXT UNIQUE NOT NULL,
            driver_name TEXT,
            latitude REAL,
            longitude REAL,
            capacity REAL DEFAULT 100,
            current_load REAL DEFAULT 0,
            status TEXT DEFAULT 'Available',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Collection requests
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS collections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bin_id INTEGER,
            vehicle_id INTEGER,
            collector_name TEXT,
            status TEXT DEFAULT 'Pending',
            weight REAL DEFAULT 0,
            requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            collected_at TIMESTAMP,
            delivered_at TIMESTAMP,
            FOREIGN KEY(bin_id) REFERENCES bins(id),
            FOREIGN KEY(vehicle_id) REFERENCES vehicles(id)
        )
    """)

    # Auto-migrate if collections table exists without weight column
    cols = [col[1] for col in cursor.execute("PRAGMA table_info(collections)").fetchall()]
    if "weight" not in cols:
        cursor.execute("ALTER TABLE collections ADD COLUMN weight REAL DEFAULT 0")

    # Inquiries / Demo Requests
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS inquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            phone TEXT,
            hospital_name TEXT,
            message TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()

    # Add demo hospital
    cursor.execute("SELECT COUNT(*) FROM hospitals")
    hospital_count = cursor.fetchone()[0]

    if hospital_count == 0:

        cursor.execute("""
            INSERT INTO hospitals
            (name, location, contact)
            VALUES (?, ?, ?)
        """, (
            "Demo General Hospital",
            "Pune, Maharashtra",
            "+91 9876543210"
        ))

    conn.commit()

    # Add demo user
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO users
            (name, email, password, role, hospital_id)
            VALUES (?, ?, ?, ?, ?)
        """, (
            "Dr. Rajesh Sharma",
            "admin@medwaste.ai",
            "admin123",
            "admin",
            1
        ))

    conn.commit()

    # Add demo bins
    cursor.execute("SELECT COUNT(*) FROM bins")
    bin_count = cursor.fetchone()[0]

    if bin_count == 0:

        bins = [
            ("BIN-Y001", 1, "Yellow", 76, 18.5),
            ("BIN-R001", 1, "Red", 54, 13.2),
            ("BIN-B001", 1, "Blue", 38, 9.7),
            ("BIN-W001", 1, "White", 82, 21.4)
        ]

        cursor.executemany("""
            INSERT INTO bins
            (bin_code, hospital_id, waste_type,
             current_level, weight)
            VALUES (?, ?, ?, ?, ?)
        """, bins)

    conn.commit()

    # Demo vehicle
    cursor.execute("SELECT COUNT(*) FROM vehicles")

    if cursor.fetchone()[0] == 0:

        cursor.execute("""
            INSERT INTO vehicles
            (vehicle_number, driver_name, latitude,
             longitude, capacity, current_load)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            "MH12-MW-001",
            "Demo Collector",
            18.5204,
            73.8567,
            500,
            120
        ))

    conn.commit()
    conn.close()