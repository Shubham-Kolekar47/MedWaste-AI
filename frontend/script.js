/* =========================================================
   MEDWASTE AI - CONNECTED FRONTEND ENGINE
   Full REST API Integration with Flask Backend (:5000)
========================================================= */

const API_PORT = "5000";
const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? `${window.location.protocol}//${window.location.hostname}:${API_PORT}/api`
    : "http://127.0.0.1:5000/api";

// Global Application State
let currentUser = JSON.parse(localStorage.getItem("medwaste_user") || "null");
let allBins = [];
let allCollections = [];
let currentPickupFilter = "all";
let currentPickupSearch = "";
let lastClassifiedResult = null;
let isBackendOnline = false;


/* =========================
   INITIALIZATION
========================= */

document.addEventListener("DOMContentLoaded", () => {
    checkAuthStatus();
    checkHealth();

    // Auto-refresh heartbeat every 8 seconds
    setInterval(() => {
        checkHealth();
    }, 8000);

    // If on Dashboard page:
    if (document.getElementById("totalWasteDisplay")) {
        fetchLiveDashboardData();
        setInterval(() => {
            if (isBackendOnline) {
                fetchLiveDashboardData(true);
            }
        }, 15000);
    }

    // If on Pickup page:
    if (document.getElementById("pickupTableBody") || document.getElementById("pickupPageContainer")) {
        loadPickupPageData();
        initPickupMap();
        setInterval(() => {
            if (isBackendOnline) {
                loadPickupPageData(true);
            }
        }, 10000);
    }

    // If on Scanner page:
    if (document.getElementById("uploadDropzone")) {
        setupDropzone();
        loadScannerBins();
    }

    // If on Profile page:
    if (document.getElementById("profileForm")) {
        loadUserProfile();
    }
});


/* =========================
   API CLIENT HELPER
========================= */

async function apiCall(endpoint, method = "GET", body = null, isFormData = false) {
    const url = `${API_BASE}${endpoint}`;
    const options = {
        method: method
    };

    if (!isFormData) {
        options.headers = {
            "Content-Type": "application/json"
        };
    }

    if (body) {
        if (isFormData) {
            // FormData automatically sets multipart/form-data with boundary
            options.body = body;
        } else {
            options.body = JSON.stringify(body);
        }
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json().catch(() => ({}));
        return { ok: response.ok, status: response.status, data };
    } catch (err) {
        return { ok: false, status: 0, error: err.message };
    }
}


/* =========================
   BACKEND HEALTH CHECK
========================= */

async function checkHealth() {
    const res = await apiCall("/health");
    const badge = document.getElementById("backendStatusBadge");
    const dot = document.getElementById("statusDot");
    const text = document.getElementById("backendStatusText");

    if (res.ok && res.data.status === "online") {
        isBackendOnline = true;
        if (dot) {
            dot.className = "status-pulse-dot";
        }
        if (text) {
            text.innerText = "Backend Online (Flask :5000)";
        }
        if (badge) {
            badge.style.borderColor = "#a7f3d0";
        }
    } else {
        isBackendOnline = false;
        if (dot) {
            dot.className = "status-pulse-dot offline";
        }
        if (text) {
            text.innerText = "Backend Offline (Port 5000)";
        }
        if (badge) {
            badge.style.borderColor = "#fca5a5";
        }
    }
}


/* =========================
   LIVE DASHBOARD SYNC
========================= */

async function fetchLiveDashboardData(silent = false) {
    let endpoint = "/dashboard";
    if (currentUser && currentUser.hospital_id) {
        endpoint += `?hospital_id=${currentUser.hospital_id}`;
    }

    const res = await apiCall(endpoint);

    if (res.ok && res.data.success) {
        const d = res.data.data;
        const wasteEl = document.getElementById("totalWasteDisplay");
        const binsEl = document.getElementById("activeBinsDisplay");
        const collectionsEl = document.getElementById("collectionsDisplay");
        const alertsEl = document.getElementById("alertsDisplay");
        const facilityTitleEl = document.getElementById("facilityTitleDisplay");

        if (wasteEl) wasteEl.innerText = `${d.total_waste.toLocaleString()} kg`;
        if (binsEl) binsEl.innerText = d.active_bins;
        if (collectionsEl) collectionsEl.innerText = d.collections;
        if (alertsEl) alertsEl.innerText = d.alerts < 10 ? `0${d.alerts}` : d.alerts;
        if (facilityTitleEl && currentUser && currentUser.hospital_name) {
            facilityTitleEl.innerText = currentUser.hospital_name;
        }

        if (!silent) {
            showToast("Live telemetry synced from database", "info");
        }
    }

    // Also reload bins and fleet
    await loadBinsData();
    await loadFleetData();
}

function syncBackendData() {
    fetchLiveDashboardData(false);
}


/* =========================
   SMART BINS TELEMETRY
========================= */

async function loadBinsData() {
    const container = document.getElementById("binStatusContainer");
    if (!container) return;

    let endpoint = "/bins";
    if (currentUser && currentUser.hospital_id) {
        endpoint += `?hospital_id=${currentUser.hospital_id}`;
    }

    const res = await apiCall(endpoint);

    if (res.ok && res.data.success) {
        allBins = res.data.bins || [];
        renderBins(allBins);
    } else {
        if (allBins.length === 0) {
            container.innerHTML = `
                <div class="bins-loading-placeholder">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    Unable to fetch bin telemetry. Ensure Flask backend is running on port 5000.
                </div>
            `;
        }
    }
}

function renderBins(bins) {
    const container = document.getElementById("binStatusContainer");
    if (!container) return;

    if (!bins || bins.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding: 48px 24px; background: white; border-radius: 16px; border: 2px dashed #cbd5e1; box-shadow: 0 4px 18px rgba(0,0,0,0.02);">
                <i class="fa-solid fa-box-open" style="font-size: 44px; color: #94a3b8; margin-bottom: 14px; display:inline-block;"></i>
                <h4 style="font-size: 18px; color: #1e293b; margin-bottom: 8px;">No Smart Bins Registered Yet</h4>
                <p style="color: #64748b; font-size: 14px; max-width: 480px; margin: 0 auto 20px; line-height: 1.5;">
                    Your healthcare facility starts with zero telemetry by default. Click below to register your first smart bin or enter custom waste levels to begin live tracking.
                </p>
                <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                    <button class="primary-btn" style="background:#087f60;" onclick="initStandardHospitalBins()">
                        <i class="fa-solid fa-wand-magic-sparkles"></i> Initialize Standard 4 Bins (0 kg)
                    </button>
                    <button class="primary-btn" onclick="openCustomDataModal('newbin')">
                        <i class="fa-solid fa-plus"></i> Add Custom Bin
                    </button>
                    <button class="outline-btn" onclick="openCustomDataModal('log')">
                        <i class="fa-solid fa-pen-to-square"></i> Put Your Data
                    </button>
                </div>
            </div>
        `;
        return;
    }

    const typeConfig = {
        Yellow: {
            name: "Infectious Waste",
            icon: "fa-biohazard",
            color: "#eab308",
            class: "bin-yellow"
        },
        Red: {
            name: "Contaminated Plastics",
            icon: "fa-syringe",
            color: "#ef4444",
            class: "bin-red"
        },
        Blue: {
            name: "Glass & Metals",
            icon: "fa-vial",
            color: "#3b82f6",
            class: "bin-blue"
        },
        White: {
            name: "Sharps & Blades",
            icon: "fa-shield-halved",
            color: "#64748b",
            class: "bin-white"
        }
    };

    container.innerHTML = bins.map(bin => {
        const conf = typeConfig[bin.waste_type] || {
            name: `${bin.waste_type} Waste`,
            icon: "fa-trash",
            color: "#087f60",
            class: "bin-yellow"
        };

        const level = Math.min(Math.round(bin.current_level), 100);
        const weight = (bin.weight || 0).toFixed(1);

        // Status badge styling
        let statusClass = "status-normal";
        if (level >= 90) statusClass = "status-urgent";
        else if (level >= 80) statusClass = "status-collection-required";
        else if (level >= 60) statusClass = "status-warning";

        return `
            <div class="bin-card ${conf.class}" id="binCard-${bin.id}">
                <div class="bin-card-header">
                    <div class="bin-type-title">
                        <i class="fa-solid ${conf.icon}" style="color:${conf.color}"></i>
                        <span>${conf.name}</span>
                    </div>
                    <span class="bin-code-pill">${bin.bin_code}</span>
                </div>

                <div class="bin-meter">
                    <div class="bin-meter-info">
                        <span>Fill Level</span>
                        <strong>${level}%</strong>
                    </div>
                    <div class="bin-progress-bg">
                        <div class="bin-progress-fill" style="width: ${level}%; background: ${conf.color};"></div>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="bin-status-pill ${statusClass}">${bin.status || "Normal"}</span>
                    <span style="font-size: 12px; color: #475569; font-weight: 600;">
                        <i class="fa-solid fa-weight-hanging"></i> ${weight} kg
                    </span>
                </div>

                <div class="bin-controls">
                    <button class="bin-btn-pickup" onclick="triggerCollectionRequest(${bin.id}, '${bin.bin_code}')">
                        <i class="fa-solid fa-truck"></i> Request Pickup
                    </button>
                    <button class="bin-btn-adjust" title="Put custom level or weight" onclick="openAdjustBinForId(${bin.id})">
                        <i class="fa-solid fa-sliders"></i> Adjust
                    </button>
                    <button class="bin-btn-add" title="Simulate +1.5kg waste deposit" onclick="depositWasteToBin(${bin.id}, '${bin.waste_type}', 1.5)">
                        +1.5 kg
                    </button>
                </div>
            </div>
        `;
    }).join("");
}


/* =========================
   SIMULATE / ADD WASTE TO BIN
========================= */

async function depositWasteToBin(binId, wasteType, weight = 1.5) {
    const payload = {
        bin_id: binId,
        waste_type: wasteType,
        weight: weight,
        confidence: 0.97,
        image_path: "iot_sensor_inflow.jpg"
    };

    const res = await apiCall("/waste", "POST", payload);

    if (res.ok && res.data.success) {
        showToast(`Deposited ${weight} kg into ${wasteType} Bin!`, "success");
        if (document.getElementById("pickupPageContainer")) {
            loadPickupPageData(true);
        } else {
            fetchLiveDashboardData(true);
        }
    } else {
        showToast(res.data.message || "Failed to record waste deposit", "error");
    }
}

async function simulateWasteDeposit() {
    if (!allBins || allBins.length === 0) {
        showToast("No active bins found. Loading...", "info");
        await loadBinsData();
    }

    if (allBins.length === 0) {
        showToast("Database connection needed to simulate waste", "error");
        return;
    }

    // Pick a random bin
    const randomBin = allBins[Math.floor(Math.random() * allBins.length)];
    await depositWasteToBin(randomBin.id, randomBin.waste_type, 2.0);
}


/* =========================
   COLLECTION & FLEET TRACKER
========================= */

async function loadFleetData() {
    // 1. Fetch vehicles
    const vRes = await apiCall("/vehicles");
    if (vRes.ok && vRes.data.success && vRes.data.vehicles.length > 0) {
        const v = vRes.data.vehicles[0];
        const numEl = document.getElementById("vehicleNumberDisplay");
        const driverEl = document.getElementById("vehicleDriverDisplay");
        const loadEl = document.getElementById("vehicleLoadDisplay");
        const tagEl = document.getElementById("vehicleStatusTag");

        if (numEl) numEl.innerText = v.vehicle_number;
        if (driverEl) driverEl.innerText = `Driver: ${v.driver_name || "Demo Collector"}`;
        if (loadEl) loadEl.innerText = `${v.current_load} / ${v.capacity} kg`;
        if (tagEl) tagEl.innerText = v.status;
    }

    // 2. Fetch collection requests
    let cEndpoint = "/collections";
    if (currentUser && currentUser.hospital_id) {
        cEndpoint += `?hospital_id=${currentUser.hospital_id}`;
    }
    const cRes = await apiCall(cEndpoint);
    const listEl = document.getElementById("collectionRequestsList");
    if (!listEl) return;

    if (cRes.ok && cRes.data.success && cRes.data.collections.length > 0) {
        const recent = cRes.data.collections.slice(0, 4);
        listEl.innerHTML = recent.map(req => {
            const time = req.requested_at ? formatPickupTime(req.requested_at) : "Just now";
            const statusClass = req.status === "Collected" ? "status-normal" : "status-warning";
            return `
                <div class="request-item">
                    <div>
                        <strong>${req.bin_code || `Bin #${req.bin_id}`}</strong>
                        <span style="color:#64748b; margin-left:6px;">(${req.waste_type || "Waste"})</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:11px; color:#94a3b8;">${time}</span>
                        <span class="bin-status-pill ${statusClass}">${req.status}</span>
                    </div>
                </div>
            `;
        }).join("");
    } else {
        listEl.innerHTML = `<p class="empty-requests">No pending pickups for this facility. Click "Request Pickup" on any bin above!</p>`;
    }
}

async function triggerCollectionRequest(binId, binCode) {
    const res = await apiCall("/collections", "POST", { bin_id: binId });

    if (res.ok && res.data.success) {
        showToast(`Pickup request dispatched for ${binCode}!`, "success");
        if (document.getElementById("pickupPageContainer")) {
            await loadPickupPageData(true);
        } else {
            await loadFleetData();
            fetchLiveDashboardData(true);
        }
    } else {
        showToast(res.data.message || "Failed to dispatch collection request", "error");
    }
}


/* =========================================================
   DEDICATED PICKUP & FLEET MANAGEMENT ENGINE (pickup.html)
========================================================= */

async function loadPickupPageData(isSilent = false) {
    if (!isSilent) {
        const tbody = document.getElementById("pickupTableBody");
        if (tbody && allCollections.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="table-loading-row">
                        <i class="fa-solid fa-circle-notch fa-spin"></i> Loading pickup logistics records...
                    </td>
                </tr>
            `;
        }
    }

    // 1. Fetch Fleet Vehicles
    const vRes = await apiCall("/vehicles");
    if (vRes.ok && vRes.data.success && vRes.data.vehicles.length > 0) {
        const v = vRes.data.vehicles[0];
        const numEl = document.getElementById("vehicleFleetNumber");
        const driverEl = document.getElementById("vehicleFleetDriver");
        const loadEl = document.getElementById("vehicleFleetLoad");
        const loadBarEl = document.getElementById("vehicleFleetLoadBar");

        if (numEl) numEl.innerText = v.vehicle_number;
        if (driverEl) driverEl.innerText = `Assigned Driver: ${v.driver_name || "Ramesh Kumar"}`;
        if (loadEl) loadEl.innerText = `${v.current_load} / ${v.capacity} kg`;
        if (loadBarEl) {
            const pct = Math.min(100, Math.round((v.current_load / v.capacity) * 100));
            loadBarEl.style.width = `${pct}%`;
        }

        if (typeof updateVehicleMarkerFromData === "function") {
            updateVehicleMarkerFromData(v);
        }
    }

    // 2. Fetch Collections
    let cEndpoint = "/collections";
    if (currentUser && currentUser.hospital_id) {
        cEndpoint += `?hospital_id=${currentUser.hospital_id}`;
    }
    const cRes = await apiCall(cEndpoint);

    if (cRes.ok && cRes.data.success) {
        allCollections = cRes.data.collections || [];
        updatePickupKpis(allCollections);
        renderPickupTable();
    } else {
        const tbody = document.getElementById("pickupTableBody");
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="table-empty-row" style="color: #ef4444;">
                        <i class="fa-solid fa-triangle-exclamation"></i> Unable to load pickup records from server.
                    </td>
                </tr>
            `;
        }
    }

    // 3. Populate bins and render All Bins section
    const bRes = await apiCall(currentUser && currentUser.hospital_id ? `/bins?hospital_id=${currentUser.hospital_id}` : "/bins");
    if (bRes.ok && bRes.data.success) {
        allBins = bRes.data.bins || [];
        renderBins(allBins);
    }
}

function updatePickupKpis(collections) {
    const total = collections.length;
    const pending = collections.filter(c => c.status === "Pending").length;
    const enRoute = collections.filter(c => c.status === "En Route" || c.status === "In Transit").length;
    const completed = collections.filter(c => c.status === "Collected" || c.status === "Completed").length;

    const totalEl = document.getElementById("kpiTotalPickups");
    const pendingEl = document.getElementById("kpiPendingPickups");
    const enRouteEl = document.getElementById("kpiEnRoutePickups");
    const compEl = document.getElementById("kpiCompletedPickups");

    const badgeAll = document.getElementById("badgeCountAll");
    const badgePending = document.getElementById("badgeCountPending");
    const badgeEnRoute = document.getElementById("badgeCountEnRoute");
    const badgeComp = document.getElementById("badgeCountCompleted");

    if (totalEl) totalEl.innerText = total;
    if (pendingEl) pendingEl.innerText = pending;
    if (enRouteEl) enRouteEl.innerText = enRoute;
    if (compEl) compEl.innerText = completed;

    if (badgeAll) badgeAll.innerText = total;
    if (badgePending) badgePending.innerText = pending;
    if (badgeEnRoute) badgeEnRoute.innerText = enRoute;
    if (badgeComp) badgeComp.innerText = completed;
}

function filterPickups(status) {
    currentPickupFilter = status;
    const tabs = document.querySelectorAll(".filter-tab-btn");
    tabs.forEach(t => t.classList.remove("active"));

    if (status === "all") {
        document.getElementById("tabAllPickups")?.classList.add("active");
    } else if (status === "Pending") {
        document.getElementById("tabPendingPickups")?.classList.add("active");
    } else if (status === "En Route") {
        document.getElementById("tabEnRoutePickups")?.classList.add("active");
    } else if (status === "Collected") {
        document.getElementById("tabCompletedPickups")?.classList.add("active");
    }

    renderPickupTable();
}

function handlePickupSearch(event) {
    currentPickupSearch = (event.target.value || "").trim().toLowerCase();
    renderPickupTable();
}

function formatPickupTime(rawDate) {
    if (!rawDate) return "Just now";
    try {
        let normalized = String(rawDate).trim();
        const m = normalized.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
        let d;
        if (m) {
            d = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10), parseInt(m[4], 10), parseInt(m[5], 10), parseInt(m[6] || 0, 10));
        } else {
            d = new Date(normalized);
        }
        if (isNaN(d.getTime())) return rawDate;

        return d.toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return rawDate;
    }
}

function renderPickupTable() {
    const tbody = document.getElementById("pickupTableBody");
    if (!tbody) return;

    let filtered = allCollections;

    // Filter by status tab
    if (currentPickupFilter !== "all") {
        if (currentPickupFilter === "En Route") {
            filtered = filtered.filter(c => c.status === "En Route" || c.status === "In Transit");
        } else if (currentPickupFilter === "Collected") {
            filtered = filtered.filter(c => c.status === "Collected" || c.status === "Completed");
        } else {
            filtered = filtered.filter(c => c.status === currentPickupFilter);
        }
    }

    // Filter by search query
    if (currentPickupSearch) {
        filtered = filtered.filter(c => {
            const code = (c.bin_code || "").toLowerCase();
            const wtype = (c.waste_type || "").toLowerCase();
            const status = (c.status || "").toLowerCase();
            const idStr = String(c.id);
            const ward = "central clinical block";
            return code.includes(currentPickupSearch) ||
                   wtype.includes(currentPickupSearch) ||
                   status.includes(currentPickupSearch) ||
                   idStr.includes(currentPickupSearch) ||
                   ward.includes(currentPickupSearch);
        });
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="table-empty-row">
                    <i class="fa-solid fa-clipboard-check" style="font-size:24px; color:#cbd5e1; display:block; margin-bottom:8px;"></i>
                    No collection requests found matching current filter.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(req => {
        const stream = (req.waste_type || "Yellow").toLowerCase();
        const binCode = req.bin_code || `BIN-${req.bin_id || '001'}`;
        const timeStr = formatPickupTime(req.requested_at);
        const weightDisplay = req.weight ? (parseFloat(req.weight).toFixed(1) + ' kg') : (req.current_level ? req.current_level + '%' : '1.8 kg');
        
        let statusClass = "status-pill-pending";
        let statusLabel = req.status;
        if (req.status === "En Route" || req.status === "In Transit") {
            statusClass = "status-pill-enroute";
        } else if (req.status === "Collected" || req.status === "Completed") {
            statusClass = "status-pill-collected";
        } else if (req.status === "Cancelled" || req.status === "Terminated") {
            statusClass = "status-pill-cancelled";
        }

        const isCompleted = (req.status === "Collected" || req.status === "Completed");
        const isPending = req.status === "Pending";

        return `
            <tr id="pickupRow-${req.id}">
                <td>
                    <strong style="color: #0f172a;">#REQ-${req.id}</strong>
                </td>
                <td>
                    <span class="bin-stream-tag tag-stream-${stream}">
                        <i class="fa-solid fa-trash-can"></i> ${binCode}
                    </span>
                </td>
                <td>
                    <strong>${req.waste_type || "Biohazard"} Stream</strong>
                    <div style="font-size: 11px; color: #64748b;">Clinical Segregated Waste</div>
                </td>
                <td>
                    <span style="font-weight: 600;">${weightDisplay}</span>
                </td>
                <td>
                    <span class="ward-pill"><i class="fa-solid fa-hospital-user"></i> Central Clinical Block</span>
                </td>
                <td>
                    <span style="color: #64748b; font-size: 12px;">${timeStr}</span>
                </td>
                <td>
                    <span class="req-status-pill ${statusClass}">${statusLabel}</span>
                </td>
                <td>
                    <div class="action-btns-cell">
                        <button class="pickup-act-btn btn-track-map" title="Locate & Track Ward on Map" onclick="locateWardOnMap('${req.waste_type || 'Yellow'}', '${binCode}')">
                            <i class="fa-solid fa-location-dot"></i>
                        </button>

                        ${isPending ? `
                            <button class="pickup-act-btn dispatch-action-btn" title="Dispatch Driver" onclick="dispatchPickupRequest(${req.id})">
                                <i class="fa-solid fa-truck-fast"></i> Dispatch
                            </button>
                        ` : ''}

                        ${!isCompleted ? `
                            <button class="pickup-act-btn complete-btn" title="Mark as Collected" onclick="completePickupRequest(${req.id}, '${binCode}')">
                                <i class="fa-solid fa-check"></i> Complete
                            </button>
                        ` : ''}

                        <button class="pickup-act-btn terminate-btn" title="Terminate / Cancel Pickup" onclick="terminatePickupRequest(${req.id}, '${binCode}')">
                            <i class="fa-solid fa-ban"></i> Terminate
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

async function terminatePickupRequest(collectionId, binCode) {
    if (!confirm(`Are you sure you want to terminate/cancel pickup request #REQ-${collectionId} for ${binCode}?`)) {
        return;
    }

    showToast(`Terminating pickup #REQ-${collectionId}...`, "info");
    const res = await apiCall(`/collections/${collectionId}`, "DELETE");

    if (res.ok && res.data.success) {
        showToast(`Pickup request #REQ-${collectionId} for ${binCode} terminated successfully.`, "success");
        allCollections = allCollections.filter(c => c.id !== collectionId);
        updatePickupKpis(allCollections);
        renderPickupTable();
    } else {
        showToast(res.data.message || "Failed to terminate pickup request", "error");
    }
}

async function completePickupRequest(collectionId, binCode) {
    showToast(`Marking pickup #REQ-${collectionId} as Collected...`, "info");
    const res = await apiCall(`/collections/${collectionId}`, "PUT", { status: "Collected" });

    if (res.ok && res.data.success) {
        showToast(`Pickup #REQ-${collectionId} marked as Collected and completed!`, "success");
        const idx = allCollections.findIndex(c => c.id === collectionId);
        if (idx !== -1) {
            allCollections[idx].status = "Collected";
        }
        updatePickupKpis(allCollections);
        renderPickupTable();
    } else {
        showToast(res.data.message || "Failed to update pickup status", "error");
    }
}

async function dispatchPickupRequest(collectionId) {
    showToast(`Dispatching vehicle for #REQ-${collectionId}...`, "info");
    const res = await apiCall(`/collections/${collectionId}`, "PUT", { status: "En Route" });

    if (res.ok && res.data.success) {
        showToast(`Vehicle en route for pickup #REQ-${collectionId}!`, "success");
        const idx = allCollections.findIndex(c => c.id === collectionId);
        if (idx !== -1) {
            allCollections[idx].status = "En Route";
        }
        updatePickupKpis(allCollections);
        renderPickupTable();
    } else {
        showToast(res.data.message || "Failed to dispatch vehicle", "error");
    }
}

function openNewPickupModal() {
    const modal = document.getElementById("newPickupModal");
    const select = document.getElementById("pickupTargetBinSelect");
    if (!modal) return;

    if (select) {
        select.innerHTML = `<option value="">-- Choose Container --</option>`;
        if (allBins.length > 0) {
            allBins.forEach(b => {
                const opt = document.createElement("option");
                opt.value = b.id;
                opt.innerText = `${b.bin_code} (${b.waste_type} Stream - ${b.current_level}% Full, ${b.weight} kg)`;
                select.appendChild(opt);
            });
        } else {
            // Fallback options
            select.innerHTML += `
                <option value="1">BIN-YEL-001 (Yellow Biohazard - 78% Full)</option>
                <option value="2">BIN-RED-001 (Red Contaminated Plastics - 88% Full)</option>
                <option value="3">BIN-BLU-001 (Blue Glassware - 84% Full)</option>
                <option value="4">BIN-WHT-001 (White Sharps - 72% Full)</option>
            `;
        }
    }

    modal.style.display = "flex";
}

function closeNewPickupModal() {
    const modal = document.getElementById("newPickupModal");
    if (modal) modal.style.display = "none";
}

async function handleSchedulePickupSubmit(event) {
    event.preventDefault();
    const select = document.getElementById("pickupTargetBinSelect");
    const binId = select ? select.value : null;

    if (!binId) {
        showToast("Please select a target smart container", "warning");
        return;
    }

    const submitBtn = document.getElementById("submitScheduleBtn");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Dispatching...`;
    }

    const res = await apiCall("/collections", "POST", { bin_id: parseInt(binId, 10) });

    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Dispatch Pickup Request`;
    }

    if (res.ok && res.data.success) {
        showToast("Collection request dispatched successfully!", "success");
        closeNewPickupModal();
        await loadPickupPageData(true);
    } else {
        showToast(res.data.message || "Failed to dispatch pickup", "error");
    }
}


/* =========================
   AI WASTE CLASSIFIER & SCANNER
========================= */

let cameraStream = null;
let simulatedCamInterval = null;

async function loadScannerBins() {
    try {
        let endpoint = "/bins";
        if (currentUser && currentUser.hospital_id) {
            endpoint += `?hospital_id=${currentUser.hospital_id}`;
        }
        const res = await apiCall(endpoint);
        if (res.ok && res.data && res.data.success) {
            allBins = res.data.bins || [];
        }
    } catch (e) {
        console.warn("Could not preload scanner bins:", e);
    }
}

function setupDropzone() {
    const dropzone = document.getElementById("uploadDropzone");
    const input = document.getElementById("wasteImageInput");
    if (!dropzone) return;

    if (input) {
        input.addEventListener("click", (e) => {
            e.stopPropagation();
        });
    }

    // Restore any active scan from sessionStorage (resists Live Server or accidental reloads)
    restoreLastScanIfAvailable();

    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add("dragover");
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove("dragover");
        }, false);
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const dt = e.dataTransfer;
        const files = dt ? dt.files : null;
        if (files && files.length > 0) {
            handleImageFile(files[0]);
        }
    });
}

function restoreLastScanIfAvailable() {
    try {
        const raw = sessionStorage.getItem("medwaste_active_scan");
        if (!raw) return;
        const data = JSON.parse(raw);
        if (!data || !data.classification) return;

        // Retain scan for up to 4 hours
        if (data.time && (Date.now() - data.time < 4 * 3600 * 1000)) {
            const previewEl = document.getElementById("dropzonePreview");
            const contentEl = document.getElementById("dropzoneContent");
            const img = document.getElementById("imagePreviewImg");

            if (data.previewSrc && img) {
                img.src = data.previewSrc;
                if (previewEl) previewEl.style.display = "flex";
                if (contentEl) contentEl.style.display = "none";
            }
            renderClassificationResult(data.classification, data.imageUrl, false);
        } else {
            sessionStorage.removeItem("medwaste_active_scan");
        }
    } catch (e) {
        console.warn("Could not restore previous scan:", e);
    }
}

function handleDropzoneClick(event) {
    if (!event) return;
    if (event.target.closest(".preview-remove-btn") || event.target.closest(".dropzone-preview")) {
        return;
    }
    const input = document.getElementById("wasteImageInput");
    if (input) {
        input.value = "";
        input.click();
    }
}

function handleImageFileSelect(event) {
    if (!event || !event.target || !event.target.files) return;
    const files = event.target.files;
    if (files && files.length > 0) {
        handleImageFile(files[0]);
    }
}

function updatePipelineTracker(stageNumber) {
    for (let i = 1; i <= 5; i++) {
        const node = document.getElementById(`stageNode${i}`);
        const conn = document.getElementById(`connector${i}`);
        if (!node) continue;

        if (i < stageNumber) {
            node.className = "flow-stage-node completed";
            if (conn) conn.className = "flow-connector active";
        } else if (i === stageNumber) {
            node.className = "flow-stage-node active";
            if (conn) conn.className = "flow-connector";
        } else {
            node.className = "flow-stage-node";
            if (conn) conn.className = "flow-connector";
        }
    }
}

async function handleImageFile(file, hint = "") {
    if (!file) return;

    // Stage 1: Upload / Capture Active
    updatePipelineTracker(1);

    // Show image preview
    const previewEl = document.getElementById("dropzonePreview");
    const contentEl = document.getElementById("dropzoneContent");
    const img = document.getElementById("imagePreviewImg");
    const laser = document.getElementById("scannerLaser");
    const badge = document.getElementById("scanningBadge");

    const reader = new FileReader();
    reader.onload = (e) => {
        if (img) img.src = e.target.result;
        if (previewEl) previewEl.style.display = "flex";
        if (contentEl) contentEl.style.display = "none";
    };
    reader.readAsDataURL(file);

    // Stage 2: AI Waste Detection running
    updatePipelineTracker(2);
    if (laser) laser.style.display = "block";
    if (badge) badge.style.display = "inline-flex";

    // Call backend API /api/classify
    showToast("AI Model running waste detection & analysis...", "info");

    const formData = new FormData();
    formData.append("image", file);
    if (hint) {
        formData.append("hint", hint);
    }

    try {
        const res = await apiCall("/classify", "POST", formData, true);

        // Turn off scanning animations
        if (laser) laser.style.display = "none";
        if (badge) badge.style.display = "none";

        if (res.ok && res.data && res.data.success) {
            renderClassificationResult(res.data.classification, res.data.image_url);
        } else {
            console.error("Classification error:", res);
            showToast((res.data && res.data.message) || "Classification failed. Ensure Flask backend is running on :5000.", "error");
            updatePipelineTracker(1);
        }
    } catch (err) {
        console.error("Classification exception:", err);
        if (laser) laser.style.display = "none";
        if (badge) badge.style.display = "none";
        showToast("Error connecting to AI classification engine: " + err.message, "error");
        updatePipelineTracker(1);
    }
}

// Quick Sample Waste Selector
async function selectSampleWaste(category, filename, displayName) {
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 360;
    const ctx = canvas.getContext("2d");

    const configs = {
        Yellow: {
            bg: "#fef9c3",
            header: "#ca8a04",
            accent: "#854d0e",
            label: "INFECTIOUS BIOHAZARD",
            symbol: "☣",
            details: "Soiled Gauze, Cotton Bandage, Blood Dressing"
        },
        Red: {
            bg: "#fee2e2",
            header: "#dc2626",
            accent: "#b91c1c",
            label: "CONTAMINATED PLASTICS",
            symbol: "♳",
            details: "Disposable Syringe, Catheter, IV Tubing"
        },
        "White/Blue": {
            bg: "#e0f2fe",
            header: "#0284c7",
            accent: "#0369a1",
            label: "SHARPS & GLASSWARE / METALS",
            symbol: "⚔⚗",
            details: "Surgical Needle, Scalpel Blade, Glass Medicine Vial"
        },
        Blue: {
            bg: "#dbeafe",
            header: "#2563eb",
            accent: "#1d4ed8",
            label: "GLASSWARE & METALS",
            symbol: "⚗",
            details: "Medicine Ampoule, Glass Vial, Test Tubes"
        },
        White: {
            bg: "#f1f5f9",
            header: "#475569",
            accent: "#334155",
            label: "SHARPS & SURGICAL BLADES",
            symbol: "⚔",
            details: "Scalpel Blade, Surgical Needle, Lancet"
        }
    };

    const cfg = configs[category] || configs.Yellow;

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, 500, 360);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(1, cfg.bg);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 500, 360);

    // Clinical border
    ctx.strokeStyle = cfg.header;
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, 484, 344);

    // Top banner
    ctx.fillStyle = cfg.header;
    ctx.fillRect(12, 12, 476, 48);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`CLINICAL INSPECTION SPECIMEN: ${cfg.label}`, 250, 42);

    // Center symbol
    ctx.font = "bold 80px Inter, sans-serif";
    ctx.fillStyle = cfg.accent;
    ctx.fillText(cfg.symbol, 250, 160);

    // Display Name
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 20px Inter, sans-serif";
    ctx.fillText(displayName, 250, 215);

    // Description
    ctx.fillStyle = "#475569";
    ctx.font = "14px Inter, sans-serif";
    ctx.fillText(cfg.details, 250, 248);

    // Telemetry stamp
    ctx.fillStyle = "#64748b";
    ctx.font = "11px monospace";
    ctx.fillText(`MEDWASTE_CV_FEED // PROTOCOL_ISO_14001 // ${category.toUpperCase()}_CHANNEL`, 250, 310);

    canvas.toBlob(async (blob) => {
        const file = new File([blob], filename, { type: "image/jpeg" });
        await handleImageFile(file, displayName);
    }, "image/jpeg");
}

// Quick Sample 4-Stream Station Selector
async function selectSampleStation() {
    showToast("Loading 4-Stream Bio-Medical Waste Station...", "info");

    try {
        const res = await fetch("sample_station.jpg");
        if (res.ok) {
            const blob = await res.blob();
            const file = new File([blob], "hospital_waste_station.jpg", { type: "image/jpeg" });
            await handleImageFile(file, "4-Stream Bio-Medical Waste Station (Yellow, Red, White, Blue)");
            return;
        }
    } catch (e) {
        console.warn("Could not fetch sample_station.jpg directly, falling back to canvas:", e);
    }

    // Fallback: draw 4 vertical columns representing Yellow, Red, White, Blue streams
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");

    const streams = [
        { color: "#ca8a04", bg: "#fef08a", label: "YELLOW STREAM (78%)" },
        { color: "#dc2626", bg: "#fecaca", label: "RED STREAM (88%)" },
        { color: "#475569", bg: "#f1f5f9", label: "WHITE STREAM (72%)" },
        { color: "#2563eb", bg: "#bfdbfe", label: "BLUE STREAM (84%)" }
    ];

    streams.forEach((s, idx) => {
        const x = idx * 150;
        ctx.fillStyle = s.bg;
        ctx.fillRect(x, 0, 150, 400);
        ctx.fillStyle = s.color;
        ctx.fillRect(x + 15, 60, 120, 280);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(s.label, x + 75, 200);
    });

    canvas.toBlob(async (blob) => {
        const file = new File([blob], "hospital_waste_station.jpg", { type: "image/jpeg" });
        await handleImageFile(file, "4-Stream Bio-Medical Waste Station (Yellow, Red, White, Blue)");
    }, "image/jpeg");
}

/* =========================
   LIVE WEBCAM SCANNER
========================= */

function switchScannerMode(mode) {
    const uploadBtn = document.getElementById("modeUploadBtn");
    const cameraBtn = document.getElementById("modeCameraBtn");
    const uploadContainer = document.getElementById("uploadModeContainer");
    const cameraContainer = document.getElementById("cameraModeContainer");

    if (mode === "camera") {
        if (uploadBtn) uploadBtn.classList.remove("active");
        if (cameraBtn) cameraBtn.classList.add("active");
        if (uploadContainer) uploadContainer.style.display = "none";
        if (cameraContainer) cameraContainer.style.display = "block";

        if (!cameraStream) {
            toggleCamera();
        }
    } else {
        if (cameraBtn) cameraBtn.classList.remove("active");
        if (uploadBtn) uploadBtn.classList.add("active");
        if (cameraContainer) cameraContainer.style.display = "none";
        if (uploadContainer) uploadContainer.style.display = "block";

        stopCamera();
    }
}

async function toggleCamera() {
    if (cameraStream) {
        stopCamera();
        return;
    }

    const video = document.getElementById("scannerVideo");
    const hudStatus = document.getElementById("cameraHudStatus");

    if (hudStatus) {
        hudStatus.innerText = "INITIALIZING SENSOR...";
    }

    try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment",
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                },
                audio: false
            });
            cameraStream = stream;
            if (video) {
                video.srcObject = stream;
                video.play().catch(() => {});
            }
            onCameraStarted("LIVE OPTICAL FEED (ONLINE)");
        } else {
            throw new Error("Camera API not supported");
        }
    } catch (err) {
        console.warn("Hardware camera unavailable, starting simulated clinical optical feed:", err.message);
        showToast("Physical camera unavailable. Starting Simulated Clinical Sensor Feed.", "info");
        startSimulatedCameraFeed();
    }
}

function onCameraStarted(statusText) {
    const toggleBtn = document.getElementById("toggleCamBtn");
    const captureBtn = document.getElementById("captureCamBtn");
    const hudStatus = document.getElementById("cameraHudStatus");
    const laser = document.getElementById("cameraLaser");

    if (toggleBtn) {
        toggleBtn.innerHTML = `<i class="fa-solid fa-video-slash"></i> Stop Camera Feed`;
        toggleBtn.style.background = "#e11d48";
    }
    if (captureBtn) captureBtn.style.display = "inline-flex";
    if (hudStatus) {
        hudStatus.innerText = statusText;
        hudStatus.className = "hud-status-badge live";
    }
    if (laser) laser.style.display = "block";
}

function stopCamera() {
    if (simulatedCamInterval) {
        clearInterval(simulatedCamInterval);
        simulatedCamInterval = null;
    }

    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }

    const video = document.getElementById("scannerVideo");
    if (video) video.srcObject = null;

    const toggleBtn = document.getElementById("toggleCamBtn");
    const captureBtn = document.getElementById("captureCamBtn");
    const hudStatus = document.getElementById("cameraHudStatus");
    const laser = document.getElementById("cameraLaser");

    if (toggleBtn) {
        toggleBtn.innerHTML = `<i class="fa-solid fa-video"></i> Start Camera Feed`;
        toggleBtn.style.background = "";
    }
    if (captureBtn) captureBtn.style.display = "none";
    if (hudStatus) {
        hudStatus.innerText = "Camera Off";
        hudStatus.className = "hud-status-badge";
    }
    if (laser) laser.style.display = "none";
}

function startSimulatedCameraFeed() {
    const video = document.getElementById("scannerVideo");
    const canvas = document.getElementById("scannerCanvas");
    if (!canvas) return;

    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");

    let angle = 0;
    simulatedCamInterval = setInterval(() => {
        angle += 0.05;

        // Dark medical tech viewport background
        ctx.fillStyle = "#090d16";
        ctx.fillRect(0, 0, 640, 480);

        // Technical Grid
        ctx.strokeStyle = "rgba(16, 185, 129, 0.12)";
        ctx.lineWidth = 1;
        for (let x = 40; x < 640; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 480);
            ctx.stroke();
        }
        for (let y = 40; y < 480; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(640, y);
            ctx.stroke();
        }

        // Circular reticle
        const cx = 320;
        const cy = 240;
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 95, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, 45 + Math.sin(angle * 2) * 4, 0, Math.PI * 2);
        ctx.stroke();

        // Simulated Waste item on examination plate
        ctx.fillStyle = "#fee2e2";
        ctx.beginPath();
        ctx.roundRect(cx - 55, cy - 35, 110, 70, 8);
        ctx.fill();
        ctx.strokeStyle = "#ef4444";
        ctx.stroke();

        ctx.fillStyle = "#b91c1c";
        ctx.font = "bold 13px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("CLINICAL PLASTIC", cx, cy + 5);

        // HUD Telemetry
        ctx.fillStyle = "#34d399";
        ctx.font = "12px monospace";
        ctx.textAlign = "left";
        ctx.fillText("AI SENSOR [CHANNEL-01]", 20, 30);
        ctx.fillText(`CONF: ${(95.2 + Math.sin(angle) * 2).toFixed(1)}%`, 20, 460);

        ctx.textAlign = "right";
        ctx.fillText(new Date().toLocaleTimeString(), 620, 30);
        ctx.fillText("TARGET: LOCKED", 620, 460);
    }, 60);

    if (canvas.captureStream && video) {
        try {
            cameraStream = canvas.captureStream(20);
            video.srcObject = cameraStream;
            video.play().catch(() => {});
        } catch (e) {
            console.warn("captureStream error:", e);
        }
    }

    onCameraStarted("SIMULATED CLINICAL SENSOR");
}

async function captureAndScan() {
    const video = document.getElementById("scannerVideo");
    const canvas = document.getElementById("scannerCanvas");
    const hudStatus = document.getElementById("cameraHudStatus");
    if (!canvas) return;

    const w = (video && video.videoWidth) ? video.videoWidth : 640;
    const h = (video && video.videoHeight) ? video.videoHeight : 480;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (video && video.srcObject && video.videoWidth) {
        ctx.drawImage(video, 0, 0, w, h);
    }

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

    if (hudStatus) {
        hudStatus.innerText = "ANALYZING NEURAL FRAME...";
    }

    showToast("AI analyzing camera frame...", "info");

    const res = await apiCall("/classify", "POST", {
        image_base64: dataUrl,
        hint: "live clinical camera capture plastic syringe"
    });

    if (hudStatus) {
        hudStatus.innerText = "LIVE OPTICAL FEED (ONLINE)";
    }

    if (res.ok && res.data.success) {
        const img = document.getElementById("imagePreviewImg");
        if (img) img.src = dataUrl;
        renderClassificationResult(res.data.classification, res.data.image_url);
    } else {
        showToast(res.data.message || "Camera classification failed.", "error");
    }
}

function renderClassificationResult(classification, imageUrl, shouldSave = true) {
    lastClassifiedResult = classification;

    if (shouldSave) {
        try {
            const previewImg = document.getElementById("imagePreviewImg");
            sessionStorage.setItem("medwaste_active_scan", JSON.stringify({
                classification: classification,
                imageUrl: imageUrl,
                previewSrc: previewImg ? previewImg.src : null,
                time: Date.now()
            }));
        } catch (e) {}
    }

    const placeholder = document.getElementById("classifierPlaceholder");
    const resultBox = document.getElementById("classifierResult");

    if (placeholder) placeholder.style.display = "none";
    if (resultBox) {
        resultBox.style.display = "block";
        resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    // Advance tracker through all stages
    updatePipelineTracker(5);

    // ==========================================
    // STAGE 2: AI MODEL WASTE DETECTION
    // ==========================================
    const confBadge = document.getElementById("aiConfidenceBadge");
    const modelName = document.getElementById("aiModelName");
    const latency = document.getElementById("aiLatency");
    const featuresList = document.getElementById("aiVisualFeatures");

    const st2 = classification.stage_2_ai_detection || {};
    const confScore = Math.round((classification.confidence || 0.96) * 100);

    if (confBadge) confBadge.innerText = `${confScore}% Match`;
    if (modelName) modelName.innerText = st2.model_name || "MedWaste Optical Net v3.2 (Biomedical Vision Backbone)";
    if (latency) latency.innerText = `Inference Latency: ${st2.inference_latency_ms || 42}ms • MobileNet Vision Backbone`;

    if (featuresList) {
        const feats = st2.visual_features || [
            "Porous medical textile matrix",
            "Biohazard pathogen trace markers",
            "Non-chlorinated containment indicator"
        ];
        featuresList.innerHTML = feats.map(f => `<span class="feature-pill"><i class="fa-solid fa-circle-check"></i> ${f}</span>`).join("");
    }

    // ==========================================
    // STAGE 3: IDENTIFY WASTE TYPE (3-WAY CATEGORY CARDS)
    // ==========================================
    const catYellow = document.getElementById("catCardYellow");
    const catRed = document.getElementById("catCardRed");
    const catWhiteBlue = document.getElementById("catCardWhiteBlue");
    const subNotice = document.getElementById("subStreamNotice");
    const subText = document.getElementById("subStreamText");

    if (catYellow) catYellow.classList.remove("detected");
    if (catRed) catRed.classList.remove("detected");
    if (catWhiteBlue) catWhiteBlue.classList.remove("detected");

    const catTitle = (classification.stage_3_waste_type && classification.stage_3_waste_type.primary_category) 
        || classification.waste_type 
        || "Yellow";

    const isYellow = catTitle.toLowerCase().includes("yellow");
    const isRed = catTitle.toLowerCase().includes("red");
    const isWhiteBlue = catTitle.toLowerCase().includes("white") || catTitle.toLowerCase().includes("blue");

    if (isYellow && catYellow) {
        catYellow.classList.add("detected");
        if (subNotice) subNotice.style.display = "none";
    } else if (isRed && catRed) {
        catRed.classList.add("detected");
        if (subNotice) subNotice.style.display = "none";
    } else if (catWhiteBlue) {
        catWhiteBlue.classList.add("detected");
        if (subNotice && subText) {
            subNotice.style.display = "flex";
            const sub = (classification.stage_3_waste_type && classification.stage_3_waste_type.sub_stream) || "Sharps & Glassware Stream";
            subText.innerText = `Sub-stream routing: ${sub}`;
        }
    }

    if (classification.is_multi_bin) {
        if (catYellow) catYellow.classList.add("detected");
        if (catRed) catRed.classList.add("detected");
        if (catWhiteBlue) catWhiteBlue.classList.add("detected");
        if (subNotice && subText) {
            subNotice.style.display = "flex";
            subText.innerText = "Central Multi-Stream Station Audit: Yellow, Red, and White/Blue streams synchronized.";
        }
    }

    // ==========================================
    // STAGE 4: SOFTWARE "SEGREGATES"
    // ==========================================
    const segTarget = document.getElementById("segTargetBin");
    const segTreat = document.getElementById("segTreatment");
    const segWeight = document.getElementById("segWeight");
    const segRule = document.getElementById("segRule");
    const meterFill = document.getElementById("segMeterFill");
    const meterText = document.getElementById("segMeterText");

    const st4 = classification.stage_4_segregation || {};
    const weightVal = st4.deposit_weight_kg || (classification.fulfillment ? classification.fulfillment.deposit_weight_kg : 1.8);
    const impactVal = st4.impact_pct || (classification.fulfillment ? classification.fulfillment.deposit_impact_pct : 3.6);
    const curFill = st4.current_bin_fill_pct || (classification.fulfillment ? classification.fulfillment.current_level_pct : 78);
    const projFill = st4.projected_fill_pct || (classification.fulfillment ? classification.fulfillment.projected_level_pct : 81.6);
    const thresholdCap = (classification.stage_6_collection_alert && classification.stage_6_collection_alert.threshold_pct) || 80.0;

    if (segTarget) segTarget.innerText = st4.target_bin || classification.target_bin || "Designated Smart Receptacle";
    if (segTreat) segTreat.innerText = st4.treatment_method || classification.treatment_method || "High-Temperature Thermal Treatment";
    if (segWeight) segWeight.innerText = `${weightVal} kg (+${impactVal}% Bin Fill Impact)`;
    if (segRule) segRule.innerText = st4.regulatory_standard || "Bio-Medical Waste Management Rules 2016 - Schedule II";

    if (meterFill) meterFill.style.width = `${Math.min(projFill, 100)}%`;
    if (meterText) meterText.innerText = `${curFill}% ➔ ${projFill}% (Collection Threshold: ${thresholdCap}%)`;

    // ==========================================
    // STAGE 5: DIGITAL RECORD
    // ==========================================
    const st5 = classification.stage_5_digital_record || {};
    const barcodeEl = document.getElementById("recordBarcode");
    const manifestEl = document.getElementById("recordManifestId");
    const categoryEl = document.getElementById("recordCategory");
    const weightEl = document.getElementById("recordWeight");
    const timeEl = document.getElementById("recordTimestamp");
    const chipEl = document.getElementById("recordStatusChip");
    const commitBtn = document.getElementById("commitRecordBtn");

    const manifestId = st5.manifest_id || `MW-MNF-${Math.floor(1000 + Math.random() * 9000)}`;
    const barcodeNum = st5.barcode_number || `CPCB-BMW-${Math.floor(100000 + Math.random() * 900000)}`;

    if (barcodeEl) barcodeEl.innerText = barcodeNum;
    if (manifestEl) manifestEl.innerText = manifestId;
    if (categoryEl) categoryEl.innerText = (classification.stage_3_waste_type && classification.stage_3_waste_type.category_title) || classification.category_name;
    if (weightEl) weightEl.innerText = `${weightVal} kg`;
    if (timeEl) timeEl.innerText = st5.timestamp || new Date().toLocaleString();

    if (chipEl) {
        chipEl.className = "status-chip success-chip";
        chipEl.innerHTML = `<i class="fa-solid fa-shield-check"></i> Ready to Commit`;
    }
    if (commitBtn) {
        commitBtn.disabled = false;
        commitBtn.innerHTML = `<i class="fa-solid fa-database"></i> Commit to Digital Ledger`;
        commitBtn.style.background = "";
    }

    // ==========================================
    // STAGE 6: COLLECTION ALERT
    // ==========================================
    const st6 = classification.stage_6_collection_alert || {};
    const alertCapacity = document.getElementById("alertCapacityPct");
    const alertLevel = document.getElementById("alertLevelText");
    const alertThreshold = document.getElementById("alertThresholdNote");
    const alertDispatch = document.getElementById("alertDispatchStatus");
    const alertChip = document.getElementById("alertStatusChip");
    const fleetBtn = document.getElementById("dispatchFleetBtn");

    const isAlert = st6.alert_triggered || (projFill >= thresholdCap);

    if (alertCapacity) alertCapacity.innerText = `${projFill}%`;
    if (alertLevel) alertLevel.innerText = isAlert ? "Collection Threshold Exceeded" : "Capacity Safe";
    if (alertThreshold) alertThreshold.innerText = `Threshold: ${thresholdCap}% • CPCB 48h Evacuation Standard`;
    if (alertDispatch) {
        alertDispatch.innerText = isAlert 
            ? "CBWTF Fleet Dispatch Recommended immediately" 
            : "Capacity safe. Automated collection scheduled normally.";
    }

    if (alertChip) {
        if (isAlert) {
            alertChip.className = "status-chip alert-chip";
            alertChip.innerText = "Alert Triggered";
        } else {
            alertChip.className = "status-chip success-chip";
            alertChip.innerText = "Capacity Normal";
        }
    }

    if (fleetBtn) {
        fleetBtn.disabled = false;
        fleetBtn.innerHTML = isAlert 
            ? `<i class="fa-solid fa-truck-ramp-box"></i> Dispatch Collection Fleet` 
            : `<i class="fa-solid fa-truck-fast"></i> Request Early Collection`;
        fleetBtn.style.background = isAlert ? "" : "#2563eb";
    }

    const viewLink = document.getElementById("viewPickupLogisticsLink");
    if (viewLink) viewLink.style.display = "none";

    showToast(`AI Segregation Complete: Identified ${(classification.stage_3_waste_type && classification.stage_3_waste_type.category_title) || classification.category_name}!`, "success");
}

async function commitDigitalRecordAndAlert() {
    if (!lastClassifiedResult) {
        showToast("Please scan or select a waste item first", "error");
        return;
    }

    const btn = document.getElementById("commitRecordBtn");
    const chip = document.getElementById("recordStatusChip");
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Committing to Ledger...`;
    }

    try {
        const res = await apiCall("/scanner/pipeline-segregate", "POST", {
            classification: lastClassifiedResult,
            hospital_id: currentUser ? currentUser.hospital_id : 1
        });

        if (res.ok && res.data && res.data.success) {
            const dr = res.data.digital_record || {};
            const ca = res.data.collection_alert || {};

            if (btn) {
                btn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Committed to Digital Ledger`;
                btn.style.background = "#059669";
                btn.disabled = true;
            }
            if (chip) {
                chip.className = "status-chip success-chip";
                chip.innerHTML = `<i class="fa-solid fa-check-double"></i> Committed (ID #${dr.record_id || 1})`;
            }

            showToast(`Digital Record #${dr.manifest_id || ''} saved to SQLite & Smart Bin ${dr.bin_code || ''} updated!`, "success");

            if (ca.alert_triggered) {
                const alertChip = document.getElementById("alertStatusChip");
                if (alertChip) {
                    alertChip.innerText = "Fleet Ticket Created";
                    alertChip.className = "status-chip alert-chip";
                }
                showToast(`Collection alert generated: Ticket #${ca.collection_id || ''} queued for fleet!`, "info");
            }
        } else {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `<i class="fa-solid fa-database"></i> Commit to Digital Ledger`;
            }
            showToast((res.data && res.data.message) || "Failed to commit digital record", "error");
        }
    } catch (e) {
        console.error("Commit record exception:", e);
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-database"></i> Commit to Digital Ledger`;
        }
        showToast("Error committing record: " + e.message, "error");
    }
}

async function dispatchCollectionFleet() {
    const btn = document.getElementById("dispatchFleetBtn");

    if (!lastClassifiedResult) {
        try {
            const raw = sessionStorage.getItem("medwaste_active_scan");
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.classification) {
                    lastClassifiedResult = parsed.classification;
                }
            }
        } catch (e) {}
    }

    if (!lastClassifiedResult) {
        showToast("Please scan or select a waste item first before requesting pickup", "warning");
        return;
    }

    const btnText = btn ? btn.innerText.toLowerCase() : "";
    const isEarly = btnText.includes("early") || btnText.includes("pickup");

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${isEarly ? "Scheduling Early Pickup..." : "Dispatching Vehicle..."}`;
    }

    try {
        const hospId = (currentUser && currentUser.hospital_id) ? currentUser.hospital_id : 1;

        // Ensure bins are loaded for the current facility
        if (!allBins || allBins.length === 0) {
            const bRes = await apiCall(hospId ? `/bins?hospital_id=${hospId}` : "/bins");
            if (bRes.ok && bRes.data && bRes.data.success) {
                allBins = bRes.data.bins || [];
            }
        }

        const rawWasteType = lastClassifiedResult.db_waste_type || lastClassifiedResult.waste_type || "Yellow";
        const dbWasteType = rawWasteType === "Multi" ? "Yellow" : rawWasteType;

        // Find the matching container for this facility
        let targetBin = allBins.find(b => 
            (!hospId || b.hospital_id == hospId) &&
            b.waste_type.toLowerCase() === dbWasteType.toLowerCase()
        ) || allBins.find(b => !hospId || b.hospital_id == hospId) || allBins[0];

        // Extract accurate weight from AI scanner result or UI
        let scannerWeight = 0;
        const weightEl = document.getElementById("recordWeight");
        if (weightEl && weightEl.innerText) {
            const parsed = parseFloat(weightEl.innerText.replace(/[^\d.]/g, ""));
            if (!isNaN(parsed) && parsed > 0) scannerWeight = parsed;
        }
        if (scannerWeight <= 0 && lastClassifiedResult) {
            const st4 = lastClassifiedResult.stage_4_segregation || {};
            const st5 = lastClassifiedResult.stage_5_digital_record || {};
            const w = st5.weight_kg || st4.deposit_weight_kg || (lastClassifiedResult.fulfillment && lastClassifiedResult.fulfillment.deposit_weight_kg) || lastClassifiedResult.weight;
            if (w) {
                const parsed = parseFloat(w);
                if (!isNaN(parsed) && parsed > 0) scannerWeight = parsed;
            }
        }
        if (scannerWeight <= 0) scannerWeight = 1.3;

        // Extract scanner / current local timestamp (YYYY-MM-DD HH:MM:SS)
        const d = new Date();
        const pad = n => String(n).padStart(2, '0');
        const nowLocalStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

        let scannerTime = nowLocalStr;
        if (lastClassifiedResult && lastClassifiedResult.stage_5_digital_record && lastClassifiedResult.stage_5_digital_record.timestamp) {
            const t = lastClassifiedResult.stage_5_digital_record.timestamp;
            if (typeof t === "string" && (t.includes("-") || t.includes("/"))) {
                scannerTime = t;
            }
        }

        const payload = {
            bin_id: targetBin ? targetBin.id : "auto",
            hospital_id: hospId,
            waste_type: dbWasteType,
            weight: scannerWeight,
            requested_at: scannerTime,
            collector_name: "CBWTF Rapid Response Fleet",
            status: "Pending" // Registered as Pending so it displays in "Dispatched Collection Requests" on pickup.html
        };

        const res = await apiCall("/collections", "POST", payload);

        if (res.ok && res.data && res.data.success) {
            const binCode = (targetBin && targetBin.bin_code) || res.data.bin_code || "Smart Container";
            const reqId = res.data.collection_id;

            if (btn) {
                btn.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${isEarly ? "Early Pickup Requested!" : "Fleet Dispatched!"}`;
                btn.style.background = "#059669";
                btn.disabled = true;
            }

            const alertChip = document.getElementById("alertStatusChip");
            if (alertChip) {
                alertChip.innerText = isEarly ? "Early Pickup Queued" : "Vehicle En Route";
                alertChip.className = "status-chip success-chip";
            }

            const viewLink = document.getElementById("viewPickupLogisticsLink");
            if (viewLink) {
                viewLink.style.display = "flex";
            }

            showToast(`Collection Request #REQ-${reqId} created for ${binCode}! Dispatched to Pickup Logistics. <a href="pickup.html" style="color:#ffffff;text-decoration:underline;font-weight:700;margin-left:6px;">View on Pickup Page &rarr;</a>`, "success");
        } else {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = isEarly 
                    ? `<i class="fa-solid fa-truck-fast"></i> Request Early Collection` 
                    : `<i class="fa-solid fa-truck-ramp-box"></i> Dispatch Collection Fleet`;
            }
            showToast((res.data && res.data.message) || "Collection request failed", "error");
        }
    } catch (e) {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = isEarly
                ? `<i class="fa-solid fa-truck-fast"></i> Request Early Collection`
                : `<i class="fa-solid fa-truck-ramp-box"></i> Dispatch Collection Fleet`;
        }
        showToast("Error dispatching vehicle: " + e.message, "error");
    }
}

function resetClassifier(event) {
    if (event) {
        if (typeof event.preventDefault === "function") event.preventDefault();
        if (typeof event.stopPropagation === "function") event.stopPropagation();
    }

    try {
        sessionStorage.removeItem("medwaste_active_scan");
    } catch (e) {}

    lastClassifiedResult = null;
    const input = document.getElementById("wasteImageInput");
    if (input) input.value = "";

    const previewEl = document.getElementById("dropzonePreview");
    const contentEl = document.getElementById("dropzoneContent");
    const placeholder = document.getElementById("classifierPlaceholder");
    const resultBox = document.getElementById("classifierResult");
    const laser = document.getElementById("scannerLaser");
    const badge = document.getElementById("scanningBadge");
    const gridEl = document.querySelector(".classifier-grid");

    if (gridEl) gridEl.classList.remove("multi-stream-active");
    if (previewEl) previewEl.style.display = "none";
    if (contentEl) contentEl.style.display = "block";
    if (placeholder) placeholder.style.display = "flex";
    if (resultBox) resultBox.style.display = "none";
    if (laser) laser.style.display = "none";
    if (badge) badge.style.display = "none";

    const viewLink = document.getElementById("viewPickupLogisticsLink");
    if (viewLink) viewLink.style.display = "none";

    // Reset tracker to Stage 1
    updatePipelineTracker(1);

    // Reset 3 category cards
    const catYellow = document.getElementById("catCardYellow");
    const catRed = document.getElementById("catCardRed");
    const catWhiteBlue = document.getElementById("catCardWhiteBlue");
    if (catYellow) catYellow.classList.remove("detected");
    if (catRed) catRed.classList.remove("detected");
    if (catWhiteBlue) catWhiteBlue.classList.remove("detected");
}


/* =========================
   AUTHENTICATION & SESSION
========================= */

function checkAuthStatus() {
    const container = document.getElementById("authNavContainer");
    if (!container) return;

    if (currentUser && currentUser.name) {
        container.innerHTML = `
            <div class="user-nav-chip-wrapper" style="display:inline-flex; align-items:center; gap:6px;">
                <a href="profile.html" class="user-nav-chip" style="text-decoration:none; cursor:pointer;" title="View & Edit Profile (${currentUser.email})">
                    <i class="fa-solid fa-user-doctor"></i>
                    <span>${currentUser.name.split(" ")[0]}</span>
                </a>
                <button class="logout-icon-btn" onclick="logout()" title="Logout (${currentUser.email})">
                    <i class="fa-solid fa-arrow-right-from-bracket"></i>
                </button>
            </div>
        `;
    } else {
        container.innerHTML = `
            <a href="login.html" class="login-btn">
                <i class="fa-solid fa-user-lock"></i> Login / Register
            </a>
        `;
    }
}

async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const alertBox = document.getElementById("loginAlertBox");
    const submitBtn = document.getElementById("loginSubmitBtn");

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...`;
    }

    const res = await apiCall("/auth/login", "POST", { email, password });

    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `Login`;
    }

    if (res.ok && res.data.success) {
        currentUser = res.data.user;
        localStorage.setItem("medwaste_user", JSON.stringify(currentUser));
        localStorage.setItem("medwaste_token", res.data.token || "token");

        if (alertBox) {
            alertBox.className = "login-alert success";
            alertBox.innerText = `Welcome, ${currentUser.name}!`;
            alertBox.style.display = "block";
        }

        showToast(`Logged in as ${currentUser.name}`, "success");
        checkAuthStatus();

        setTimeout(() => {
            closeLogin();
            if (alertBox) alertBox.style.display = "none";
            window.location.href = "dashboard.html";
        }, 800);
    } else {
        if (alertBox) {
            alertBox.className = "login-alert error";
            alertBox.innerText = res.data.message || "Invalid email or password";
            alertBox.style.display = "block";
        }
        showToast(res.data.message || "Login failed", "error");
    }
}

function fillDemoCredentials() {
    const emailInput = document.getElementById("loginEmail");
    const passInput = document.getElementById("loginPassword");
    if (emailInput) emailInput.value = "admin@medwaste.ai";
    if (passInput) passInput.value = "admin123";
    showToast("Demo credentials filled!", "info");
}

function logout() {
    currentUser = null;
    localStorage.removeItem("medwaste_user");
    localStorage.removeItem("medwaste_token");
    checkAuthStatus();
    showToast("Logged out of MedWaste AI session", "info");
    setTimeout(() => {
        window.location.href = "index.html";
    }, 400);
}


/* =========================
   USER PROFILE MANAGEMENT
========================= */

async function loadUserProfile() {
    const form = document.getElementById("profileForm");
    if (!form) return;

    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    const nameInput = document.getElementById("profileNameInput");
    const emailInput = document.getElementById("profileEmailInput");
    const hospitalInput = document.getElementById("profileHospitalInput");
    const rolePill = document.getElementById("profileRolePill");
    const headerName = document.getElementById("profileHeaderName");
    const headerEmail = document.getElementById("profileHeaderEmail");
    const headerHospital = document.getElementById("profileHeaderHospital");

    if (nameInput) nameInput.value = currentUser.name || "";
    if (emailInput) emailInput.value = currentUser.email || "";
    if (hospitalInput) hospitalInput.value = currentUser.hospital_name || "";
    if (rolePill) rolePill.innerText = currentUser.role === "admin" ? "System Administrator" : "Hospital Facility Manager";
    if (headerName) headerName.innerText = currentUser.name || "Healthcare User";
    if (headerEmail) headerEmail.innerText = currentUser.email || "";
    if (headerHospital) headerHospital.innerText = currentUser.hospital_name || "General Facility";

    // Fetch latest profile & facility stats from server
    const res = await apiCall(`/auth/profile?user_id=${currentUser.id}`);
    if (res.ok && res.data.success) {
        const u = res.data.user;
        const stats = res.data.facility_stats || {};

        if (nameInput) nameInput.value = u.name;
        if (emailInput) emailInput.value = u.email;
        if (hospitalInput) hospitalInput.value = u.hospital_name || "";
        if (headerName) headerName.innerText = u.name;
        if (headerEmail) headerEmail.innerText = u.email;
        if (headerHospital) headerHospital.innerText = u.hospital_name || "General Facility";

        const statWaste = document.getElementById("profileStatWaste");
        const statBins = document.getElementById("profileStatBins");
        if (statWaste) statWaste.innerText = `${stats.total_waste || 0} kg`;
        if (statBins) statBins.innerText = stats.bins_count || 0;

        currentUser = { ...currentUser, ...u };
        localStorage.setItem("medwaste_user", JSON.stringify(currentUser));
        checkAuthStatus();
    }
}

async function handleProfileUpdate(event) {
    event.preventDefault();
    if (!currentUser) return;

    const name = document.getElementById("profileNameInput").value.trim();
    const email = document.getElementById("profileEmailInput").value.trim();
    const hospital_name = document.getElementById("profileHospitalInput").value.trim();
    const password = document.getElementById("profilePasswordInput") ? document.getElementById("profilePasswordInput").value : "";
    const saveBtn = document.getElementById("saveProfileBtn");

    if (!name || !email) {
        showToast("Name and email are required", "error");
        return;
    }

    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;
    }

    const payload = {
        user_id: currentUser.id,
        name,
        email,
        hospital_name
    };
    if (password) {
        payload.password = password;
    }

    const res = await apiCall("/auth/profile", "PUT", payload);

    if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `<i class="fa-solid fa-check"></i> Save Changes`;
    }

    if (res.ok && res.data.success) {
        currentUser = { ...currentUser, ...res.data.user };
        localStorage.setItem("medwaste_user", JSON.stringify(currentUser));
        checkAuthStatus();
        showToast("Profile and facility details updated successfully!", "success");

        const passInput = document.getElementById("profilePasswordInput");
        if (passInput) passInput.value = "";

        loadUserProfile();
    } else {
        showToast(res.data.message || "Failed to update profile", "error");
    }
}


/* =========================
   CONTACT & DEMO REQUEST
========================= */

async function handleContactSubmit(event) {
    event.preventDefault();

    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const phone = document.getElementById("contactPhone").value.trim();
    const hospital = document.getElementById("contactHospital").value.trim();
    const message = document.getElementById("contactMessage").value.trim();
    const btn = document.getElementById("contactSubmitBtn");

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Submitting...`;
    }

    const payload = {
        name,
        email,
        phone,
        hospital_name: hospital,
        message
    };

    const res = await apiCall("/contact", "POST", payload);

    if (btn) {
        btn.disabled = false;
        btn.innerHTML = `Submit Demo Request <i class="fa-solid fa-paper-plane"></i>`;
    }

    if (res.ok && res.data.success) {
        showToast("Demo request received! Our deployment team will reach out shortly.", "success");
        document.getElementById("contactForm").reset();
    } else {
        showToast(res.data.message || "Failed to submit demo request", "error");
    }
}


/* =========================
   MODAL & NAVIGATION UTILS
========================= */

function toggleMenu() {
    const nav = document.getElementById("navMenu");
    if (nav) nav.classList.toggle("open");
}

function scrollToSection(id) {
    const section = document.getElementById(id);
    if (section) {
        section.scrollIntoView({ behavior: "smooth" });
    }
    const nav = document.getElementById("navMenu");
    if (nav && nav.classList.contains("open")) {
        nav.classList.remove("open");
    }
}

function openLogin() {
    window.location.href = "login.html";
}

function closeLogin() {
    // legacy helper
}

window.addEventListener("click", function (event) {
    const modal = document.getElementById("loginModal");
    if (event.target === modal) {
        closeLogin();
    }
    const customModal = document.getElementById("customDataModal");
    if (event.target === customModal) {
        closeCustomDataModal();
    }
});


/* =========================================================
   CUSTOM DATA & TELEMETRY INPUT MODAL HANDLERS
========================================================= */

function openCustomDataModal(tab = 'log') {
    const modal = document.getElementById("customDataModal");
    if (!modal) return;

    // Populate bin select options
    populateBinSelectOptions();

    // Switch to requested tab
    switchCustomTab(tab);

    modal.classList.add("show");
}

function closeCustomDataModal() {
    const modal = document.getElementById("customDataModal");
    if (modal) modal.classList.remove("show");
}

function openAdjustBinForId(binId) {
    openCustomDataModal('adjust');
    const select = document.getElementById("adjustBinSelect");
    if (select) {
        select.value = binId;
        onAdjustBinSelectChange();
    }
}

function switchCustomTab(tabName) {
    const btnLog = document.getElementById("tabBtnLog");
    const btnAdjust = document.getElementById("tabBtnAdjust");
    const btnNewBin = document.getElementById("tabBtnNewBin");

    const formLog = document.getElementById("customWasteLogForm");
    const formAdjust = document.getElementById("adjustBinForm");
    const formNew = document.getElementById("newBinForm");

    const titleEl = document.getElementById("customModalTitle");

    if (btnLog) btnLog.classList.toggle("active", tabName === 'log');
    if (btnAdjust) btnAdjust.classList.toggle("active", tabName === 'adjust');
    if (btnNewBin) btnNewBin.classList.toggle("active", tabName === 'newbin');

    if (formLog) formLog.style.display = (tabName === 'log') ? "block" : "none";
    if (formAdjust) formAdjust.style.display = (tabName === 'adjust') ? "block" : "none";
    if (formNew) formNew.style.display = (tabName === 'newbin') ? "block" : "none";

    if (titleEl) {
        if (tabName === 'log') titleEl.innerText = "Log Custom Waste Entry";
        else if (tabName === 'adjust') titleEl.innerText = "Calibrate Smart Bin Sensors";
        else if (tabName === 'newbin') titleEl.innerText = "Register New Smart Bin";
    }

    if (tabName === 'adjust') {
        onAdjustBinSelectChange();
    }
}

function switchCustomDataTab(tabName) {
    switchCustomTab(tabName);
}

function populateBinSelectOptions() {
    const targetSelect = document.getElementById("customTargetBin") || document.getElementById("customWasteBinSelect");
    const adjustSelect = document.getElementById("adjustBinSelect");
    const categorySelect = document.getElementById("customWasteType");

    if (targetSelect) {
        let html = '<option value="auto">✨ Auto-Assign Smart Bin (Based on Category)</option>';
        if (allBins && allBins.length > 0) {
            html += allBins.map(b => `
                <option value="${b.id}" data-type="${b.waste_type}">
                    ${b.bin_code} - ${b.waste_type} Bin (Level: ${Math.round(b.current_level)}%, ${b.weight}kg)
                </option>
            `).join("");
        }
        targetSelect.innerHTML = html;

        // Auto-match based on category
        if (categorySelect) {
            onCustomWasteTypeChange();
        } else {
            targetSelect.value = "auto";
        }
    }

    if (adjustSelect) {
        if (allBins && allBins.length > 0) {
            adjustSelect.innerHTML = allBins.map(b => `
                <option value="${b.id}" data-type="${b.waste_type}">
                    ${b.bin_code} (${b.waste_type}) - Fill: ${Math.round(b.current_level)}% | ${b.weight} kg
                </option>
            `).join("");
            onAdjustBinSelectChange();
        } else {
            adjustSelect.innerHTML = '<option value="">-- No Smart Bins Registered Yet --</option>';
        }
    }
}

function onCustomWasteTypeChange() {
    const categorySelect = document.getElementById("customWasteType");
    const targetSelect = document.getElementById("customTargetBin") || document.getElementById("customWasteBinSelect");
    if (!categorySelect || !targetSelect) return;

    const selectedCategory = categorySelect.value;
    const matchingBin = allBins.find(b => b.waste_type.toLowerCase() === selectedCategory.toLowerCase());
    if (matchingBin) {
        targetSelect.value = matchingBin.id;
    } else {
        targetSelect.value = "auto";
    }
}

function onAdjustBinSelectChange() {
    const select = document.getElementById("adjustBinSelect");
    if (!select || !select.value) return;

    const binId = parseInt(select.value);
    const bin = allBins.find(b => b.id === binId);
    if (!bin) return;

    const levelInput = document.getElementById("adjustBinLevel");
    const levelDisplay = document.getElementById("adjustLevelDisplay");
    const weightInput = document.getElementById("adjustBinWeight");

    if (levelInput) levelInput.value = Math.round(bin.current_level || 0);
    if (levelDisplay) levelDisplay.innerText = `${Math.round(bin.current_level || 0)}%`;
    if (weightInput) weightInput.value = (bin.weight || 0).toFixed(1);

    updateAdjustStatusPreview();
}

function updateAdjustStatusPreview() {
    const levelInput = document.getElementById("adjustBinLevel");
    const statusPill = document.getElementById("adjustPreviewStatus");
    if (!levelInput || !statusPill) return;

    const level = parseFloat(levelInput.value) || 0;
    let status = "Normal";
    let statusClass = "status-normal";

    if (level >= 90) {
        status = "Urgent";
        statusClass = "status-urgent";
    } else if (level >= 80) {
        status = "Collection Required";
        statusClass = "status-warning";
    } else if (level >= 60) {
        status = "Warning";
        statusClass = "status-warning";
    }

    statusPill.innerText = status;
    statusPill.className = `bin-status-pill ${statusClass}`;
}

// Handler for Submitting Custom Waste Record (Tab 1)
async function handleCustomWasteSubmit(event) {
    event.preventDefault();
    const targetSelect = document.getElementById("customTargetBin") || document.getElementById("customWasteBinSelect");
    const wasteTypeSelect = document.getElementById("customWasteType");
    const weightInput = document.getElementById("customWasteWeight");
    const confidenceInput = document.getElementById("customConfidence");
    const notesInput = document.getElementById("customNotes");
    const btn = document.getElementById("customLogSubmitBtn");

    const wasteType = wasteTypeSelect ? wasteTypeSelect.value : "Red";
    const weight = parseFloat(weightInput ? weightInput.value : 2.5) || 1.0;
    const confidence = parseFloat(confidenceInput ? confidenceInput.value : 96) / 100.0;
    const notes = notesInput ? notesInput.value.trim() : "Routine Clinical Disposal";

    let binId = targetSelect ? targetSelect.value : "auto";
    if (!binId || binId === "" || binId === "auto") {
        const match = allBins.find(b => b.waste_type.toLowerCase() === wasteType.toLowerCase());
        binId = match ? match.id : "auto";
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving Waste Entry...`;
    }

    const payload = {
        bin_id: binId,
        waste_type: wasteType,
        weight: weight,
        confidence: confidence,
        image_path: notes ? `entry_${notes.replace(/\s+/g, '_').toLowerCase()}.jpg` : "manual_input.jpg",
        hospital_id: (currentUser && currentUser.hospital_id) ? currentUser.hospital_id : 1
    };

    const res = await apiCall("/waste", "POST", payload);

    if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Save Waste Entry to Database`;
    }

    if (res.ok && res.data.success) {
        showToast(`Successfully logged ${weight} kg to ${wasteType} Smart Bin!`, "success");
        closeCustomDataModal();
        const form = document.getElementById("customWasteLogForm");
        if (form) form.reset();
        await fetchLiveDashboardData(true);
    } else {
        showToast(res.data.message || "Failed to log waste record", "error");
    }
}

// Handler for Adjusting Bin Telemetry (Tab 2)
async function handleAdjustBinSubmit(event) {
    event.preventDefault();
    const select = document.getElementById("adjustBinSelect");
    const levelInput = document.getElementById("adjustBinLevel");
    const weightInput = document.getElementById("adjustBinWeight");
    const btn = document.getElementById("adjustBinSubmitBtn");

    if (!select || !select.value) {
        showToast("Please select a smart bin or register a bin first", "error");
        return;
    }

    const binId = parseInt(select.value);
    const level = parseFloat(levelInput ? levelInput.value : 50) || 0;
    const weight = parseFloat(weightInput ? weightInput.value : 10) || 0;

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Updating Sensor...`;
    }

    const res = await apiCall(`/bins/${binId}`, "PUT", {
        current_level: level,
        weight: weight
    });

    if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-check-double"></i> Save Telemetry to Smart Bin`;
    }

    if (res.ok && res.data.success) {
        showToast(`Smart Bin telemetry updated: ${level}% Fill | ${weight} kg`, "success");
        closeCustomDataModal();
        await fetchLiveDashboardData(true);
    } else {
        showToast(res.data.message || "Failed to update bin telemetry", "error");
    }
}

// Handler for Registering New Bin (Tab 3)
async function handleNewBinSubmit(event) {
    event.preventDefault();
    const codeInput = document.getElementById("newBinCode");
    const typeSelect = document.getElementById("newBinType");
    const capInput = document.getElementById("newBinCapacity");
    const levelInput = document.getElementById("newBinStartLevel");
    const btn = document.getElementById("newBinSubmitBtn");

    const code = codeInput ? codeInput.value.trim().toUpperCase() : "";
    const type = typeSelect ? typeSelect.value : "Yellow";
    const cap = parseFloat(capInput ? capInput.value : 50) || 50;
    const startLevel = parseFloat(levelInput ? levelInput.value : 0) || 0;
    const startWeight = parseFloat((startLevel / 100 * cap).toFixed(1)) || 0;

    if (!code) {
        showToast("Please enter a unique bin code (e.g. BIN-ICU-01)", "error");
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Registering Smart Bin...`;
    }

    const payload = {
        bin_code: code,
        waste_type: type,
        capacity: cap,
        current_level: startLevel,
        weight: startWeight,
        hospital_id: (currentUser && currentUser.hospital_id) ? currentUser.hospital_id : 1
    };

    const res = await apiCall("/bins", "POST", payload);

    if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-plus-circle"></i> Register New Smart Bin`;
    }

    if (res.ok && res.data.success) {
        showToast(`Smart Bin ${code} registered successfully!`, "success");
        closeCustomDataModal();
        const form = document.getElementById("newBinForm");
        if (form) form.reset();
        await fetchLiveDashboardData(true);
    } else {
        showToast(res.data.message || "Failed to register new bin", "error");
    }
}

// Helper: Initialize Standard 4 Clinical Bins (0 kg)
async function initStandardHospitalBins() {
    const payload = {
        hospital_id: (currentUser && currentUser.hospital_id) ? currentUser.hospital_id : 1
    };
    showToast("Initializing standard 4 clinical bins...", "info");
    const res = await apiCall("/bins/init-standard", "POST", payload);
    if (res.ok && res.data.success) {
        showToast("Initialized standard 4 smart bins at 0 kg!", "success");
        await fetchLiveDashboardData(true);
    } else {
        showToast(res.data.message || "Failed to initialize bins", "error");
    }
}


function showVideo() {
    showToast("MedWaste AI System Demo Video is loaded in the interactive demo sections below!", "info");
    scrollToSection("classifier");
}


/* Active Navigation Spy */
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav a");

window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 140;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute("id");
        }
    });

    navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === "#" + current) {
            link.classList.add("active");
        }
    });
});


/* =========================
   TOAST NOTIFICATIONS
========================= */

function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const icons = {
        success: "fa-circle-check",
        error: "fa-circle-exclamation",
        info: "fa-circle-info"
    };

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fa-solid ${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 3800);
}


/* =========================================================
   LIVE GPS VEHICLE TRACKING & ROUTE MAP (LEAFLET)
   ========================================================= */

let pickupMap = null;
let vehicleMarker = null;
let routePolyline = null;
let traveledPolyline = null;
let wardMarkers = [];
let isSimulating = false;
let simulationInterval = null;
let simProgress = 0.0;
let activeVehicleId = 1;

// Coordinated Corridor in Pune (Transport Hub to Central Hospital Wards & CBWTF Treatment Plant)
const FLEET_ROUTE_COORDS = [
    [18.5204, 73.8567], // Base Station: Central Transport Hub
    [18.5228, 73.8542],
    [18.5255, 73.8525], // Stop 1: ICU Block B (Yellow Infectious Stream)
    [18.5274, 73.8538],
    [18.5298, 73.8559],
    [18.5310, 73.8580], // Stop 2: Trauma & Surgery (Red Plastics Stream)
    [18.5302, 73.8612],
    [18.5285, 73.8645], // Stop 3: Pathology & Diagnostics (Blue Glass Stream)
    [18.5256, 73.8632],
    [18.5220, 73.8610], // Stop 4: Minor OT & Dental (White Sharps Stream)
    [18.5245, 73.8665],
    [18.5290, 73.8700],
    [18.5360, 73.8720]  // Stop 5 / Final Destination: CBWTF Bio-Disposal Plant
];

const HOSPITAL_WARDS = [
    {
        name: "ICU Block B (Infectious)",
        category: "Yellow",
        binCode: "BIN-Y001",
        coords: [18.5255, 73.8525],
        pinClass: "pin-yellow",
        icon: "fa-biohazard",
        loadEst: "18.5 kg",
        fill: "76%"
    },
    {
        name: "Surgical Trauma Unit",
        category: "Red",
        binCode: "BIN-R001",
        coords: [18.5310, 73.8580],
        pinClass: "pin-red",
        icon: "fa-syringe",
        loadEst: "13.2 kg",
        fill: "54%"
    },
    {
        name: "Pathology Diagnostic Lab",
        category: "Blue",
        binCode: "BIN-B001",
        coords: [18.5285, 73.8645],
        pinClass: "pin-blue",
        icon: "fa-vial",
        loadEst: "9.7 kg",
        fill: "38%"
    },
    {
        name: "Minor OT & Dental",
        category: "White",
        binCode: "BIN-W001",
        coords: [18.5220, 73.8610],
        pinClass: "pin-white",
        icon: "fa-shield-halved",
        loadEst: "21.4 kg",
        fill: "82%"
    },
    {
        name: "CBWTF Central Disposal Facility",
        category: "Facility",
        binCode: "CBWTF-PUNE",
        coords: [18.5360, 73.8720],
        pinClass: "pin-cbwtf",
        icon: "fa-recycle",
        loadEst: "High-Temp Incinerator",
        fill: "Online"
    }
];

function initPickupMap() {
    const container = document.getElementById("pickupMapContainer");
    if (!container) return;
    if (typeof L === "undefined") {
        console.warn("Leaflet library not ready. Retrying in 400ms...");
        setTimeout(initPickupMap, 400);
        return;
    }
    if (pickupMap) {
        setTimeout(() => pickupMap.invalidateSize(), 150);
        return;
    }
    if (container._leaflet_id) {
        container._leaflet_id = null;
    }

    try {
        // Initialize map
        pickupMap = L.map("pickupMapContainer", {
            zoomControl: true,
            scrollWheelZoom: true
        }).setView([18.527, 73.860], 14);

        // Standard OpenStreetMap Tiles with multi-subdomain fallback
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            subdomains: ['a', 'b', 'c'],
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(pickupMap);

    // Active Route Polyline (dashed emerald green)
    routePolyline = L.polyline(FLEET_ROUTE_COORDS, {
        color: '#0c8c66',
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 8',
        lineCap: 'round'
    }).addTo(pickupMap);

    // Traveled path (solid gray trail)
    traveledPolyline = L.polyline([], {
        color: '#94a3b8',
        weight: 4,
        opacity: 0.7
    }).addTo(pickupMap);

    // Ward Waypoints
    wardMarkers = [];
    HOSPITAL_WARDS.forEach(ward => {
        const isFacility = ward.category === "Facility";
        const wardIcon = L.divIcon({
            className: 'ward-marker-icon',
            html: `
                <div class="ward-marker-pin ${ward.pinClass}" title="${ward.name}">
                    <i class="fa-solid ${ward.icon}"></i>
                </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });

        const marker = L.marker(ward.coords, { icon: wardIcon }).addTo(pickupMap);
        marker.bindPopup(`
            <div class="map-popup-card">
                <div class="map-popup-header">
                    <span class="map-popup-badge ${ward.pinClass}">${ward.category} Stream</span>
                    <strong style="font-size:12px; color:#475569;">${ward.binCode}</strong>
                </div>
                <div class="map-popup-title">${ward.name}</div>
                <div class="map-popup-desc">
                    ${isFacility ? 'Authorized Common Bio-medical Waste Treatment Plant (Incineration & Autoclave facility).' : 'Hospital ward biomedical waste segregation point.'}
                </div>
                <div class="map-popup-meta-row">
                    <span>Est. Load: <strong>${ward.loadEst}</strong></span>
                    <span>Fill Level: <strong>${ward.fill}</strong></span>
                </div>
                ${!isFacility ? `
                    <button class="map-popup-btn" onclick="dispatchDirectToWard('${ward.binCode}', '${ward.name}')">
                        <i class="fa-solid fa-truck-fast"></i> Dispatch Vehicle Here
                    </button>
                ` : ''}
            </div>
        `);
        ward.marker = marker;
        wardMarkers.push(ward);
    });

    // Custom Animated Vehicle Marker
    const initialPos = FLEET_ROUTE_COORDS[0];
    const vehicleIcon = L.divIcon({
        className: 'vehicle-marker-icon',
        html: `
            <div class="vehicle-marker-bubble" id="vehicleMapMarkerBubble" title="Biomedical Collection Vehicle">
                <div class="vehicle-marker-halo"></div>
                <i class="fa-solid fa-truck-medical"></i>
            </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
    });

    vehicleMarker = L.marker(initialPos, { icon: vehicleIcon, zIndexOffset: 1000 }).addTo(pickupMap);
    vehicleMarker.bindPopup(`
        <div class="map-popup-card">
            <div class="map-popup-header">
                <span class="map-popup-badge" style="background:#dcfce7; color:#166534;">Active Transport</span>
                <strong style="font-size:12px; color:#0c8c66;">MH12-MW-001</strong>
            </div>
            <div class="map-popup-title">Biomedical Electric Hauler</div>
            <div class="map-popup-desc">Driver: <strong>Ramesh Kumar</strong> • GPS Telemetry Active</div>
            <div class="map-popup-meta-row">
                <span>Speed: <strong id="popupSpeed">32 km/h</strong></span>
                <span>Payload: <strong>120 / 500 kg</strong></span>
            </div>
            <button class="map-popup-btn" onclick="toggleVehicleSimulation()">
                <i class="fa-solid fa-play"></i> Toggle Movement Simulation
            </button>
        </div>
    `);

    // Fit map bounds safely
    try {
        if (routePolyline && routePolyline.getBounds && routePolyline.getBounds().isValid()) {
            pickupMap.fitBounds(routePolyline.getBounds(), { padding: [40, 40] });
        } else {
            pickupMap.setView([18.527, 73.860], 14);
        }
    } catch (e) {
        pickupMap.setView([18.527, 73.860], 14);
    }

    // Invalidate size after layout paint
    setTimeout(() => { if (pickupMap) pickupMap.invalidateSize(); }, 150);
    setTimeout(() => { if (pickupMap) pickupMap.invalidateSize(); }, 500);
    setTimeout(() => { if (pickupMap) pickupMap.invalidateSize(); }, 1200);

    window.addEventListener("resize", () => {
        if (pickupMap) pickupMap.invalidateSize();
    });

    // Initial Telemetry Update
    updateTelemetryDisplay(initialPos[0], initialPos[1], 32, "ICU Block B (BIN-Y001)", "1.4 km", "8 mins");
} catch (err) {
    console.error("Error initializing Leaflet pickup map:", err);
}
}

function centerMapOnVehicle() {
    if (!pickupMap || !vehicleMarker) return;
    pickupMap.panTo(vehicleMarker.getLatLng(), { animate: true, duration: 0.8 });
    vehicleMarker.openPopup();
}

function fitMapRoute() {
    if (!pickupMap || !routePolyline) return;
    pickupMap.fitBounds(routePolyline.getBounds(), { padding: [40, 40], animate: true });
}

function locateWardOnMap(category, binCode) {
    const mapCard = document.getElementById("pickupMapCard");
    if (mapCard) {
        mapCard.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (!pickupMap) return;
    const ward = wardMarkers.find(w => 
        (w.category && w.category.toLowerCase() === category.toLowerCase()) || 
        (w.binCode && w.binCode.toLowerCase() === binCode.toLowerCase())
    );

    if (ward && ward.marker) {
        pickupMap.flyTo(ward.coords, 16, { duration: 1.2 });
        setTimeout(() => {
            ward.marker.openPopup();
        }, 1300);
        showToast(`Focusing on ${ward.name}...`, "info");
    } else {
        pickupMap.panTo(vehicleMarker.getLatLng());
        vehicleMarker.openPopup();
    }
}

function dispatchDirectToWard(binCode, wardName) {
    showToast(`Vehicle re-routed to ${wardName} (${binCode})`, "success");
    const nextStopEl = document.getElementById("hudNextStop");
    if (nextStopEl) nextStopEl.innerText = `${wardName} (${binCode})`;
    if (pickupMap) pickupMap.closePopup();
    if (!isSimulating) {
        toggleVehicleSimulation();
    }
}

function updateVehicleMarkerFromData(vehicleData) {
    if (!vehicleMarker || !vehicleData) return;
    if (vehicleData.id) activeVehicleId = vehicleData.id;
    if (vehicleData.latitude && vehicleData.longitude && !isSimulating) {
        vehicleMarker.setLatLng([vehicleData.latitude, vehicleData.longitude]);
        updateTelemetryDisplay(
            vehicleData.latitude,
            vehicleData.longitude,
            30,
            "ICU Block B (BIN-Y001)",
            "1.2 km",
            "7 mins"
        );
    }
    const hudPayload = document.getElementById("hudPayload");
    if (hudPayload) {
        hudPayload.innerText = `${vehicleData.current_load || 120} / ${vehicleData.capacity || 500} kg`;
    }
}

function updateTelemetryDisplay(lat, lng, speed, nextStop, distance, eta) {
    const hudSpeed = document.getElementById("hudSpeed");
    const hudNext = document.getElementById("hudNextStop");
    const hudDistance = document.getElementById("hudDistance");
    const hudEta = document.getElementById("hudEta");
    const hudCoords = document.getElementById("hudCoords");
    const popupSpeed = document.getElementById("popupSpeed");

    if (hudSpeed) hudSpeed.innerText = `${Math.round(speed)} km/h`;
    if (popupSpeed) popupSpeed.innerText = `${Math.round(speed)} km/h`;
    if (hudNext) hudNext.innerText = nextStop;
    if (hudDistance) hudDistance.innerText = distance;
    if (hudEta) hudEta.innerText = eta;
    if (hudCoords) hudCoords.innerText = `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
}

// Route interpolation helpers
function getPositionOnRoute(progress) {
    const totalSegments = FLEET_ROUTE_COORDS.length - 1;
    const floatIdx = progress * totalSegments;
    const segIdx = Math.min(Math.floor(floatIdx), totalSegments - 1);
    const segT = floatIdx - segIdx;

    const p0 = FLEET_ROUTE_COORDS[segIdx];
    const p1 = FLEET_ROUTE_COORDS[segIdx + 1];

    const lat = p0[0] + (p1[0] - p0[0]) * segT;
    const lng = p0[1] + (p1[1] - p0[1]) * segT;

    return { lat, lng, segIdx };
}

function toggleVehicleSimulation() {
    const btn = document.getElementById("toggleSimBtn");

    if (isSimulating) {
        clearInterval(simulationInterval);
        isSimulating = false;
        if (btn) {
            btn.innerHTML = `<i class="fa-solid fa-play"></i> Simulate Movement`;
            btn.classList.remove("is-simulating");
        }
        showToast("GPS vehicle tracking simulation paused", "info");
    } else {
        isSimulating = true;
        if (btn) {
            btn.innerHTML = `<i class="fa-solid fa-pause"></i> Pause Simulation`;
            btn.classList.add("is-simulating");
        }
        showToast("Live vehicle movement simulation started", "success");

        let stepCounter = 0;
        simulationInterval = setInterval(() => {
            simProgress += 0.0035;
            if (simProgress >= 1.0) {
                simProgress = 0.0;
                traveledPolyline.setLatLngs([]);
                showToast("Collection vehicle completed route cycle to CBWTF Facility!", "success");
            }

            const currentPos = getPositionOnRoute(simProgress);
            vehicleMarker.setLatLng([currentPos.lat, currentPos.lng]);

            // Update traveled trail
            const pastCoords = FLEET_ROUTE_COORDS.slice(0, currentPos.segIdx + 1);
            pastCoords.push([currentPos.lat, currentPos.lng]);
            traveledPolyline.setLatLngs(pastCoords);

            // Dynamic realistic speed fluctuation
            const speed = 28 + Math.sin(simProgress * 25) * 8 + (Math.random() * 4 - 2);

            // Calculate which stop is next
            let nextStop = "ICU Block B (BIN-Y001)";
            let distEst = "1.8 km";
            let etaEst = "9 mins";

            if (simProgress > 0.8) {
                nextStop = "CBWTF Central Bio-Disposal Plant";
                distEst = `${((1.0 - simProgress) * 5.2).toFixed(1)} km`;
                etaEst = `${Math.max(1, Math.round((1.0 - simProgress) * 16))} mins`;
            } else if (simProgress > 0.55) {
                nextStop = "Minor OT & Dental (BIN-W001)";
                distEst = `${((0.8 - simProgress) * 4.5).toFixed(1)} km`;
                etaEst = `${Math.max(1, Math.round((0.8 - simProgress) * 14))} mins`;
            } else if (simProgress > 0.35) {
                nextStop = "Pathology Diagnostic Lab (BIN-B001)";
                distEst = `${((0.55 - simProgress) * 3.8).toFixed(1)} km`;
                etaEst = `${Math.max(1, Math.round((0.55 - simProgress) * 11))} mins`;
            } else if (simProgress > 0.15) {
                nextStop = "Surgical Trauma Unit (BIN-R001)";
                distEst = `${((0.35 - simProgress) * 3.2).toFixed(1)} km`;
                etaEst = `${Math.max(1, Math.round((0.35 - simProgress) * 8))} mins`;
            } else {
                nextStop = "ICU Block B (BIN-Y001)";
                distEst = `${((0.15 - simProgress) * 2.5).toFixed(1)} km`;
                etaEst = `${Math.max(1, Math.round((0.15 - simProgress) * 6))} mins`;
            }

            updateTelemetryDisplay(currentPos.lat, currentPos.lng, speed, nextStop, distEst, etaEst);

            // Periodically sync GPS coordinates to backend
            stepCounter++;
            if (stepCounter % 35 === 0 && isBackendOnline) {
                apiCall(`/vehicles/${activeVehicleId}/location`, "PUT", {
                    latitude: currentPos.lat,
                    longitude: currentPos.lng
                });
            }
        }, 120);
    }
}