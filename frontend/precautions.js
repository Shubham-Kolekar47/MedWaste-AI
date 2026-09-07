/**
 * MedWaste AI - Precautions & Safety Protocols Audio Controller
 * Provides Text-to-Speech narration, active step highlighting, sound equalizer animation,
 * category filtering, and live search.
 */

// Safety Content Transcripts for Text-to-Speech Narration
const PRECAUTION_TRANSCRIPTS = {
    master: {
        title: "Master Clinical Safety & Biomedical Waste Overview",
        summary: "Welcome to the MedWaste AI Clinical Safety and Waste Handling Guide. All healthcare workers, cleaning staff, and waste handlers must follow strict Bio-Medical Waste Management Rules. Always wear category-specific Personal Protective Equipment, including double nitrile gloves, N95 respirators, fluid-impermeable aprons, and eye protection. Segregate waste strictly at source using the four color-coded streams: Yellow for anatomical and infectious soiled waste; Red for recyclable contaminated plastics like IV sets and syringes; White translucent for sharp needles and scalpels in puncture-proof containers; and Blue for broken glass and metallic implants. In chemotherapy units, use dedicated purple cytotoxic bags. Never recap needles with bare hands, never compress waste bags, and report any accidental needle-stick injury immediately for post-exposure prophylaxis within two hours. Segregation saves lives.",
        steps: [
            "Always wear category-specific Personal Protective Equipment before touching any medical waste.",
            "Segregate waste strictly at point of generation into Yellow, Red, White, and Blue containers.",
            "Never recap, bend, or break needles by hand. Use point-of-use needle destroyers.",
            "Seal and tag all biohazard bags with barcodes when they reach three-quarters capacity.",
            "In case of needle-stick injury, wash under running water immediately and report within two hours."
        ]
    },
    yellow: {
        title: "Yellow Category: Infectious & Anatomical Waste Precautions",
        summary: "Yellow category waste contains high-risk biohazardous items such as human tissues, organs, body parts, placentas, biopsy specimens, blood-soaked gauze, dressings, cotton swabs, plaster casts, microbiology culture plates, expired cytotoxic medicines, and chemical waste. Always use non-chlorinated yellow bags bearing the international biohazard symbol. Wear double nitrile gloves, an N95 respirator, fluid-impermeable gown, and protective goggles. Never compress or squeeze yellow bags by hand. Securely tie and seal bags using zip-ties when three-quarters full. Never store infectious waste in ward corridors; transfer immediately to a designated cool waste storage room for maximum forty-eight hours prior to high-temperature incineration or autoclaving.",
        steps: [
            "Don full PPE: heavy-duty nitrile gloves, N95 mask, fluid-resistant apron, and eye protection.",
            "Use only certified non-chlorinated yellow plastic bags bearing the biohazard symbol.",
            "Never pack bags beyond three-quarters capacity to ensure an airtight neck seal.",
            "Never compress, knead, or sit on waste bags to create more space.",
            "Transport bags in dedicated enclosed wheeled bins directly to the bio-waste holding room.",
            "Ensure incineration or authorized deep burial occurs within forty-eight hours."
        ]
    },
    red: {
        title: "Red Category: Contaminated Recyclable Plastics Precautions",
        summary: "Red category waste comprises recyclable plastic clinical items contaminated with bodily fluids. This includes disposable plastic syringes without needles, intravenous tubing and sets, catheters, urine bags, dialysis kits, rubber gloves, and vacutainer tubes. All syringes must have their needle hubs destroyed using a needle cutter at point of use before dropping into the red bin to prevent illicit reuse. Empty all residual fluids before disposal. Autoclave, microwave, or soak in freshly prepared one to two percent sodium hypochlorite solution before shredding and sending to registered recyclers. Wear puncture-resistant utility gloves and a face shield. Never place needles, scalpels, or glass items into red bins.",
        steps: [
            "Cut syringe needle hubs or tips using a mechanical cutter before disposing into the red bin.",
            "Completely drain urine bags, IV lines, and suction canisters into sanitary sewers before bagging.",
            "Wear heavy-duty puncture-resistant utility gloves and a splash-proof face shield.",
            "Never drop hypodermic needles, blades, or glass vials into red bags.",
            "Disinfect with one to two percent sodium hypochlorite or autoclave prior to shredding.",
            "Hand over shredded plastic only to authorized state pollution control board recyclers."
        ]
    },
    white: {
        title: "White Category: Sharps, Needles & Blades Precautions",
        summary: "White category waste contains contaminated sharps that pose severe puncture, cut, and blood-borne virus risks. This includes hypodermic needles, scalpel blades, lancets, surgical suture needles, contaminated broken ampoule tips, and fixed-needle syringes. Always use rigid, puncture-proof, tamper-proof, and translucent white containers. Never attempt to recap, bend, break, or manually strip needles from syringes with bare hands. Use point-of-use electric needle burners or manual hub cutters immediately upon injection. Never fill sharp containers beyond three-quarters full. Once full, lock the tamper-proof lid permanently. Containers undergo autoclaving or dry-heat sterilization followed by encapsulation in concrete or sharp-pit disposal.",
        steps: [
            "Immediately discard sharps at point of generation into a white puncture-proof container.",
            "Never recap needles by hand. If mandatory, use the single-handed scoop technique.",
            "Use electric needle burners or hub cutters directly at the bedside or nursing station.",
            "Do not exceed the three-quarters fill line marked on the container.",
            "Permanently lock the tamper-evident lid before handing over for final disposal.",
            "Ensure dry heat sterilization and encapsulation to permanently immobilize metal sharps."
        ]
    },
    blue: {
        title: "Blue Category: Glassware & Metallic Implants Precautions",
        summary: "Blue category waste consists of broken or intact medicine ampoules, glass vials, microscope slides, glass culture flasks, and contaminated metallic orthopedic implants such as pins, plates, and screws. Store in rigid, puncture-resistant cardboard boxes or blue-coded plastic bins with blue biohazard markings. Always handle broken glassware using forceps, tongs, or a dustpan brush; never collect glass fragments with gloved hands. Disinfect glassware with sodium hypochlorite disinfectant or autoclaving before crushing. Return intact pharmaceutical glass bottles to licensed glass recycling facilities after thorough decontamination.",
        steps: [
            "Segregate all glass vials, ampoules, and orthopedic metal implants into blue-labeled boxes.",
            "Never pick up shattered glass vials with bare hands or thin exam gloves; always use tongs.",
            "Pre-treat with one percent sodium hypochlorite disinfectant soak or autoclave sterilization.",
            "Ensure boxes have robust bottom reinforcement to prevent glass puncturing during transit.",
            "Route cleaned and crushed glass safely to approved industrial glass recyclers."
        ]
    },
    purple: {
        title: "Cytotoxic & Chemotherapy Oncology Waste Precautions",
        summary: "Cytotoxic waste includes expired or residual chemotherapy drugs, contaminated intravenous lines, gloves, gowns, tubing, and patient bodily waste within forty-eight hours of chemotherapy administration. Cytotoxic agents are mutagens, teratogens, and carcinogens. Always use heavy-duty purple or yellow bags labeled with the prominent cytotoxic warning symbol. Oncology staff must double-glove using chemotherapy-tested nitrile gloves, an impermeable gown, and a full face shield. Prepare drugs only inside certified biological safety cabinets. In case of spills, immediately deploy the chemotherapy spill kit with neutralizing absorbent pads. Cytotoxic waste must be destroyed by high-temperature incineration at minimum twelve hundred degrees Celsius.",
        steps: [
            "Wear double chemotherapy-rated nitrile gloves, impermeable gown, and face shield.",
            "Place all chemotherapy-contaminated items into designated purple cytotoxic containers.",
            "Prepare all intravenous antineoplastic drugs inside Class II Biological Safety Cabinets.",
            "Keep dedicated cytotoxic spill kits immediately accessible in oncology wards and labs.",
            "Incinerate all cytotoxic waste at extreme temperatures exceeding twelve hundred degrees Celsius."
        ]
    },
    general: {
        title: "General Non-Hazardous Healthcare Waste Precautions",
        summary: "General healthcare waste represents eighty to eighty-five percent of all hospital waste and is non-hazardous. It includes clean packaging, paper cartons, administrative paperwork, food leftovers, disposable paper cups, and plastic wrappers. Segregate in green or black municipal bins. Strictly inspect that no infectious dressings, gloves, or needles contaminate general waste. Clean cardboard and office paper should be compacted and routed for municipal recycling. Proper pre-sorting prevents unnecessary and expensive biohazard incineration for safe municipal trash.",
        steps: [
            "Deposit clean cardboard, food waste, wrappers, and paper towels into green or black bins.",
            "Never dispose of contaminated patient dressings, cotton, or gloves into general bins.",
            "Keep recycling bins cleanly separated at ward reception, administrative desks, and cafeterias.",
            "Conduct routine spot audits on general bins to ensure complete absence of clinical waste.",
            "Partner with municipal circular recycling initiatives for paper, clean bottles, and organic waste."
        ]
    },
    emergency: {
        title: "Emergency Needle-Stick & Blood Spill Incident Protocol",
        summary: "In the event of an accidental needle-stick or sharp injury: Immediately wash the wound under cool running tap water with mild soap for five minutes. Do not squeeze, press, suck, or scrub the puncture site violently. Cover with a sterile waterproof dressing. Immediately notify the ward sister or Infection Control Officer. Initiate Post-Exposure Prophylaxis for HIV and Hepatitis B within two hours. For blood or body fluid spills: Cordon off the area, wear full PPE, cover the liquid spill with absorbent paper towels, pour freshly prepared one percent sodium hypochlorite solution with ten thousand ppm available chlorine over the towels, allow twenty minutes contact time, scoop into a yellow bag with tongs, and mop with hospital disinfectant.",
        steps: [
            "Needle-Stick Step 1: Wash puncture wound immediately under running tap water with soap for 5 minutes.",
            "Needle-Stick Step 2: Do NOT suck, squeeze, or scrub the wound harshly. Apply sterile bandage.",
            "Needle-Stick Step 3: Report incident immediately to supervisor and receive PEP evaluation within 2 hours.",
            "Spill Step 1: Cordon off spill area and don full PPE including nitrile gloves and shoe covers.",
            "Spill Step 2: Cover liquid spill with absorbent towels and soak with 1% sodium hypochlorite solution.",
            "Spill Step 3: Wait 20 minutes contact time, scoop towels with tongs into yellow bag, and mop thoroughly."
        ]
    }
};

// Global State
const AudioState = {
    synth: window.speechSynthesis || null,
    currentUtterance: null,
    activeSectionId: null,
    isPlaying: false,
    isPaused: false,
    currentSpeed: 1.0,
    selectedVoice: null,
    availableVoices: [],
    stepHighlightTimer: null,
    progressInterval: null,
    elapsedSeconds: 0,
    estimatedTotalSeconds: 30
};

// Initialize Speech Engine & UI on Load
document.addEventListener("DOMContentLoaded", () => {
    initSpeechSynthesis();
    initFilterTabs();
    initSearchFilter();
    initSpeedChips();
});

/* =========================================================
   SPEECH SYNTHESIS ENGINE
   ========================================================= */

function initSpeechSynthesis() {
    if (!AudioState.synth) {
        console.warn("Speech Synthesis API not supported in this browser.");
        showAudioToast("Speech synthesis not supported in this browser. Please use Chrome, Edge, or Safari.", true);
        return;
    }

    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    }
}

function loadVoices() {
    if (!AudioState.synth) return;
    const voices = AudioState.synth.getVoices();
    if (!voices || voices.length === 0) return;

    AudioState.availableVoices = voices.filter(v => v.lang.startsWith("en") || v.lang.startsWith("hi"));
    if (AudioState.availableVoices.length === 0) {
        AudioState.availableVoices = voices;
    }

    // Populate voice dropdown if present
    const voiceSelect = document.getElementById("voiceSelect");
    if (voiceSelect) {
        voiceSelect.innerHTML = "";
        AudioState.availableVoices.forEach((v, index) => {
            const opt = document.createElement("option");
            opt.value = index;
            opt.textContent = `${v.name} (${v.lang})${v.default ? ' — Default' : ''}`;
            voiceSelect.appendChild(opt);
        });

        // Pick preferred natural voice (e.g. Google UK/US, Natural, or first English)
        const preferredIdx = AudioState.availableVoices.findIndex(v => 
            v.name.includes("Natural") || 
            v.name.includes("Google") || 
            v.name.includes("Samantha") ||
            v.name.includes("Jenny") ||
            v.name.includes("India")
        );
        if (preferredIdx !== -1) {
            voiceSelect.selectedIndex = preferredIdx;
            AudioState.selectedVoice = AudioState.availableVoices[preferredIdx];
        } else {
            AudioState.selectedVoice = AudioState.availableVoices[0];
        }

        voiceSelect.addEventListener("change", (e) => {
            const idx = parseInt(e.target.value, 10);
            AudioState.selectedVoice = AudioState.availableVoices[idx];
            showAudioToast(`Voice changed to ${AudioState.selectedVoice.name}`);
            if (AudioState.isPlaying && AudioState.activeSectionId) {
                const active = AudioState.activeSectionId;
                stopAudio(active);
                playSectionAudio(active);
            }
        });
    }
}

/**
 * Play/Toggle Audio for a given section ID ('master', 'yellow', 'red', etc.)
 */
function toggleSectionAudio(sectionId) {
    if (!AudioState.synth) {
        showAudioToast("Text-to-speech not available in browser.", true);
        return;
    }

    // If already playing this section, toggle pause/play
    if (AudioState.activeSectionId === sectionId) {
        if (AudioState.isPlaying && !AudioState.isPaused) {
            pauseAudio(sectionId);
        } else if (AudioState.isPaused) {
            resumeAudio(sectionId);
        } else {
            playSectionAudio(sectionId);
        }
        return;
    }

    // If another section is playing, stop it first
    if (AudioState.activeSectionId && AudioState.activeSectionId !== sectionId) {
        stopAudio(AudioState.activeSectionId);
    }

    playSectionAudio(sectionId);
}

/**
 * Start speech narration for a specific section
 */
function playSectionAudio(sectionId) {
    const data = PRECAUTION_TRANSCRIPTS[sectionId];
    if (!data) return;

    if (AudioState.synth.speaking) {
        AudioState.synth.cancel();
    }

    const textToSpeak = `${data.title}. ${data.summary}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    if (AudioState.selectedVoice) {
        utterance.voice = AudioState.selectedVoice;
    }
    utterance.rate = AudioState.currentSpeed;
    utterance.pitch = 1.0;
    utterance.lang = "en-US";

    AudioState.currentUtterance = utterance;
    AudioState.activeSectionId = sectionId;
    AudioState.isPlaying = true;
    AudioState.isPaused = false;
    AudioState.elapsedSeconds = 0;

    // Estimate duration based on word count (approx 140 words per min at 1.0x)
    const wordCount = textToSpeak.split(/\s+/).length;
    AudioState.estimatedTotalSeconds = Math.max(10, Math.round((wordCount / (140 * AudioState.currentSpeed)) * 60));

    // Update UI Elements
    updatePlayerUIState(sectionId, "playing");

    // Progress Bar Ticker
    clearInterval(AudioState.progressInterval);
    AudioState.progressInterval = setInterval(() => {
        if (AudioState.isPlaying && !AudioState.isPaused) {
            AudioState.elapsedSeconds++;
            const pct = Math.min(100, Math.round((AudioState.elapsedSeconds / AudioState.estimatedTotalSeconds) * 100));
            updateProgressBar(sectionId, pct, AudioState.elapsedSeconds, AudioState.estimatedTotalSeconds);
        }
    }, 1000);

    // Sentence/Step-by-step visual tracker
    startStepHighlighting(sectionId, data.steps);

    // Utterance boundary tracking
    utterance.onboundary = (event) => {
        // Can be used for fine-grained word highlighting if desired
    };

    utterance.onend = () => {
        stopAudio(sectionId, true);
        showAudioToast(`Finished narration for ${data.title}`);
    };

    utterance.onerror = (e) => {
        console.warn("Speech synthesis error:", e);
        stopAudio(sectionId, false);
    };

    AudioState.synth.speak(utterance);
    showAudioToast(`Listening to: ${data.title}`);
}

/**
 * Pause Audio
 */
function pauseAudio(sectionId) {
    if (AudioState.synth && AudioState.synth.speaking) {
        AudioState.synth.pause();
        AudioState.isPaused = true;
        updatePlayerUIState(sectionId, "paused");
        showAudioToast("Narration paused");
    }
}

/**
 * Resume Audio
 */
function resumeAudio(sectionId) {
    if (AudioState.synth && AudioState.synth.paused) {
        AudioState.synth.resume();
        AudioState.isPaused = false;
        updatePlayerUIState(sectionId, "playing");
        showAudioToast("Resumed narration");
    }
}

/**
 * Stop Audio and reset UI
 */
function stopAudio(sectionId, completed = false) {
    if (AudioState.synth) {
        AudioState.synth.cancel();
    }

    clearInterval(AudioState.progressInterval);
    clearTimeout(AudioState.stepHighlightTimer);
    removeStepHighlights(sectionId);

    const targetSec = sectionId || AudioState.activeSectionId;
    if (targetSec) {
        updatePlayerUIState(targetSec, "stopped");
        updateProgressBar(targetSec, completed ? 100 : 0, 0, AudioState.estimatedTotalSeconds);
    }

    AudioState.isPlaying = false;
    AudioState.isPaused = false;
    AudioState.activeSectionId = null;
    AudioState.currentUtterance = null;
}

/**
 * Synchronized step-by-step highlighter during speech
 */
function startStepHighlighting(sectionId, steps) {
    if (!steps || steps.length === 0) return;
    removeStepHighlights(sectionId);

    const stepElements = document.querySelectorAll(`#section-${sectionId} .step-item`);
    if (!stepElements || stepElements.length === 0) return;

    // Time per step
    const stepDurationMs = Math.max(3500, Math.round((AudioState.estimatedTotalSeconds * 1000) / stepElements.length));

    let currentStepIdx = 0;
    function highlightNext() {
        if (!AudioState.isPlaying || AudioState.isPaused) return;

        stepElements.forEach((el, i) => {
            if (i === currentStepIdx) {
                el.classList.add("speech-highlight");
            } else {
                el.classList.remove("speech-highlight");
            }
        });

        currentStepIdx++;
        if (currentStepIdx < stepElements.length) {
            AudioState.stepHighlightTimer = setTimeout(highlightNext, stepDurationMs);
        }
    }

    highlightNext();
}

function removeStepHighlights(sectionId) {
    const stepElements = document.querySelectorAll(`#section-${sectionId} .step-item, .step-item`);
    stepElements.forEach(el => el.classList.remove("speech-highlight"));
}

/**
 * Update UI controls & equalizer for playing/paused/stopped state
 */
function updatePlayerUIState(sectionId, state) {
    const playerBar = document.getElementById(`player-${sectionId}`);
    const playBtn = document.getElementById(`playBtn-${sectionId}`);
    const statusText = document.getElementById(`audioStatus-${sectionId}`);

    // Master Hero banner buttons
    if (sectionId === "master") {
        const masterBtn = document.getElementById("masterPlayBtn");
        if (masterBtn) {
            if (state === "playing") {
                masterBtn.innerHTML = `<i class="fa-solid fa-pause"></i> Pause Audio Guide`;
                masterBtn.style.background = "#fef08a";
                masterBtn.style.color = "#854d0e";
            } else if (state === "paused") {
                masterBtn.innerHTML = `<i class="fa-solid fa-play"></i> Resume Audio Guide`;
                masterBtn.style.background = "#ffffff";
                masterBtn.style.color = "#0c8c66";
            } else {
                masterBtn.innerHTML = `<i class="fa-solid fa-headphones"></i> Listen to Complete Safety Guide`;
                masterBtn.style.background = "#ffffff";
                masterBtn.style.color = "#0c8c66";
            }
        }
    }

    if (!playerBar || !playBtn) return;

    if (state === "playing") {
        playerBar.classList.add("is-playing");
        playBtn.innerHTML = `<i class="fa-solid fa-pause"></i>`;
        playBtn.title = "Pause Narration";
        if (statusText) statusText.textContent = "Narration Playing • Click to Pause";
    } else if (state === "paused") {
        playerBar.classList.remove("is-playing");
        playBtn.innerHTML = `<i class="fa-solid fa-play"></i>`;
        playBtn.title = "Resume Narration";
        if (statusText) statusText.textContent = "Narration Paused • Click to Resume";
    } else {
        playerBar.classList.remove("is-playing");
        playBtn.innerHTML = `<i class="fa-solid fa-play"></i>`;
        playBtn.title = "Listen to Instructions";
        if (statusText) statusText.textContent = "Audio Ready • Click Play to Listen";
    }
}

/**
 * Update Progress Bar and Timers
 */
function updateProgressBar(sectionId, percent, elapsedSec, totalSec) {
    const fill = document.getElementById(`progressFill-${sectionId}`);
    const timeCurrent = document.getElementById(`timeCurrent-${sectionId}`);
    const timeTotal = document.getElementById(`timeTotal-${sectionId}`);

    if (fill) fill.style.width = `${percent}%`;

    if (timeCurrent) {
        const mins = Math.floor(elapsedSec / 60);
        const secs = elapsedSec % 60;
        timeCurrent.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    if (timeTotal && totalSec) {
        const mins = Math.floor(totalSec / 60);
        const secs = totalSec % 60;
        timeTotal.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
}

/**
 * Change Playback Speed (0.8x, 1x, 1.25x, 1.5x)
 */
function setPlaybackSpeed(sectionId, speed) {
    AudioState.currentSpeed = parseFloat(speed);

    // Update speed UI chips in section and globally
    const chips = document.querySelectorAll(`#player-${sectionId} .speed-opt, .speed-chip`);
    chips.forEach(chip => {
        if (parseFloat(chip.dataset.speed) === AudioState.currentSpeed) {
            chip.classList.add("active");
        } else {
            chip.classList.remove("active");
        }
    });

    showAudioToast(`Playback speed set to ${speed}x`);

    // If currently speaking, restart with new rate smoothly
    if (AudioState.isPlaying && AudioState.activeSectionId === sectionId) {
        const sec = AudioState.activeSectionId;
        stopAudio(sec);
        playSectionAudio(sec);
    }
}

function initSpeedChips() {
    document.querySelectorAll(".speed-chip").forEach(chip => {
        chip.addEventListener("click", () => {
            const speed = chip.dataset.speed;
            AudioState.currentSpeed = parseFloat(speed);
            document.querySelectorAll(".speed-chip").forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            showAudioToast(`Global speed set to ${speed}x`);
            if (AudioState.isPlaying && AudioState.activeSectionId) {
                const sec = AudioState.activeSectionId;
                stopAudio(sec);
                playSectionAudio(sec);
            }
        });
    });
}

/* =========================================================
   CATEGORY FILTER TABS
   ========================================================= */

function initFilterTabs() {
    const pills = document.querySelectorAll(".filter-pill");
    const sections = document.querySelectorAll(".precaution-section");

    pills.forEach(pill => {
        pill.addEventListener("click", () => {
            pills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");

            const filter = pill.dataset.filter;

            sections.forEach(sec => {
                if (filter === "all") {
                    sec.style.display = "block";
                } else {
                    const secCat = sec.dataset.category;
                    if (secCat === filter) {
                        sec.style.display = "block";
                    } else {
                        sec.style.display = "none";
                    }
                }
            });

            // Smooth scroll to top of precaution list
            const container = document.querySelector(".precautions-container");
            if (container && filter !== "all") {
                container.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });
}

/* =========================================================
   LIVE SEARCH FILTER
   ========================================================= */

function initSearchFilter() {
    const input = document.getElementById("precautionsSearchInput");
    if (!input) return;

    input.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        const sections = document.querySelectorAll(".precaution-section");

        sections.forEach(sec => {
            const text = sec.textContent.toLowerCase();
            if (!query || text.includes(query)) {
                sec.style.display = "block";
            } else {
                sec.style.display = "none";
            }
        });
    });
}

/* =========================================================
   PRINT / EXPORT QUICK ACTIONS
   ========================================================= */

function printPrecautionsSOP() {
    window.print();
}

function copyAllEmergencyGuidelines() {
    const data = PRECAUTION_TRANSCRIPTS.emergency.summary + "\n\nSteps:\n" + PRECAUTION_TRANSCRIPTS.emergency.steps.join("\n");
    if (navigator.clipboard) {
        navigator.clipboard.writeText(data).then(() => {
            showAudioToast("Emergency protocol copied to clipboard!");
        });
    } else {
        showAudioToast("Unable to access clipboard", true);
    }
}

/* =========================================================
   FLOATING NOTIFICATION TOAST
   ========================================================= */

let toastTimeout = null;
function showAudioToast(message, isError = false) {
    let toast = document.getElementById("precautionsToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "precautionsToast";
        toast.className = "precautions-toast";
        document.body.appendChild(toast);
    }

    clearTimeout(toastTimeout);
    toast.innerHTML = isError ? 
        `<i class="fa-solid fa-triangle-exclamation" style="color:#ef4444;"></i> <span>${message}</span>` : 
        `<i class="fa-solid fa-volume-high" style="color:#86efac;"></i> <span>${message}</span>`;
    
    toast.classList.add("show");
    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 3200);
}
