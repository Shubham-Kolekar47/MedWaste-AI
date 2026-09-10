/**
 * MedWaste AI - Precautions & Safety Protocols Audio Controller
 * Provides Text-to-Speech narration, active step highlighting, sound equalizer animation,
 * category filtering, and live search.
 */

// Safety Content Transcripts for Text-to-Speech Narration
const PRECAUTION_TRANSCRIPTS = {
    master: {
        title: "Master Clinical Safety & Biomedical Waste Overview",
        summary: "Welcome to the MedWaste AI Clinical Safety and Waste Handling Guide. All healthcare workers, cleaning staff, and waste handlers must follow strict Bio-Medical Waste Management Rules. Segregate waste strictly at source using the four color-coded streams: Yellow for anatomical and infectious soiled waste; Red for recyclable contaminated plastics like IV sets and syringes; White translucent for sharp needles and scalpels in puncture-proof containers; and Blue for broken glass and metallic implants. In chemotherapy units, use dedicated purple cytotoxic bags. Always wear category-specific Personal Protective Equipment, never recap needles with bare hands, never compress waste bags, and report any accidental needle-stick injury immediately within two hours. Segregation saves lives.",
        steps: [
            "Always wear category-specific Personal Protective Equipment before touching any medical waste.",
            "Segregate waste strictly at point of generation into Yellow, Red, White, and Blue containers.",
            "Never recap, bend, or break needles by hand. Use point-of-use needle destroyers.",
            "Seal and tag all biohazard bags with barcodes when they reach three-quarters capacity.",
            "In case of needle-stick injury, wash under running water immediately and report within two hours."
        ]
    },
    yellow: {
        title: "Yellow Bin Guide: Infectious & Anatomical Waste",
        summary: "The Yellow Bin is exclusively designated for infectious, anatomical, and pathological biomedical waste. Items that come under the Yellow Bin include: human anatomical tissues, organs, body parts, and placentas; soiled dressings, cotton swabs, bandages, and plaster casts with blood; expired or discarded pharmaceutical medicines; and microbiology specimens, lab culture plates, and discarded live vaccines. Items that must never go into the Yellow Bin: never place needles, scalpels, blades, glass bottles, or recyclable plastics in yellow bags. Always use non-chlorinated yellow bags with the biohazard symbol, wear double nitrile gloves and an N95 mask, seal the bag at 75% capacity, and send for high-temperature incineration at 1050 degrees Celsius.",
        steps: [
            "Deposit only infectious, anatomical, and soiled items into certified non-chlorinated yellow biohazard bags.",
            "Include human tissues, organs, blood-soaked gauze, expired drugs, and microbiology cultures.",
            "Never place needles, sharps, glass bottles, or plastic syringes into yellow bags.",
            "Don full PPE: heavy-duty nitrile gloves, N95 mask, fluid-resistant apron, and eye protection.",
            "Tie and seal yellow bags with swan-neck knots strictly when they reach three-quarters capacity.",
            "Ensure transfer for high-temperature incineration at 1050°C within forty-eight hours."
        ]
    },
    red: {
        title: "Red Bin Guide: Contaminated Recyclable Plastics",
        summary: "The Red Bin is strictly reserved for contaminated recyclable plastic clinical items. Items that come under the Red Bin include: disposable plastic syringes with needles removed; intravenous IV bottles, infusion sets, and tubing; catheters, drainage tubes, and emptied urine bags; hemodialysis tubing kits; contaminated examination gloves; and blood collection vacutainer tubes. Items that must never go into the Red Bin: never throw needles, scalpels, blades, glass ampoules, or municipal trash in the red bin. Syringes must always have needle hubs cut at point of use, and all liquids must be completely drained before bagging. Disinfect with 1 to 2 percent sodium hypochlorite or autoclave before registered shredding and recycling.",
        steps: [
            "Cut syringe needle hubs using a point-of-use mechanical cutter before dropping into the red bin.",
            "Completely drain urine bags, IV lines, and suction canisters into sanitary drainage before disposal.",
            "Deposit IV bottles, tubing, catheters, rubber gloves, and vacutainer sample tubes.",
            "Never throw hypodermic needles, surgical blades, or glass vials into red bags.",
            "Wear heavy-duty puncture-resistant utility gloves and a splash-proof face shield.",
            "Disinfect with 1 to 2 percent sodium hypochlorite or autoclave prior to registered plastic recycling."
        ]
    },
    white: {
        title: "White Container Guide: Sharps, Needles & Blades",
        summary: "The White translucent container is strictly designated for contaminated metal sharps and needles that can cause puncture wounds. Items that come under the White Container include: hypodermic injection needles and fixed-needle syringes; surgical scalpel blades and handles; curved suture needles, blood lancets, and contaminated stylets; needles sheared by electric burners or hub cutters; and broken contaminated glass ampoule tips. Items that must never go into the White Container: never put soft gauze, bandages, plastic IV tubing, or general garbage here. Never recap needles using both hands. Lock the tamper-evident puncture-proof container permanently when three-quarters full for autoclaving and concrete encapsulation in a sharps pit.",
        steps: [
            "Discard all metal sharps directly at point of use into a rigid, translucent, puncture-proof white container.",
            "Include hypodermic needles, scalpel blades, suture needles, lancets, and broken glass ampoule tips.",
            "Never recap needles by hand. If unavoidable, use the single-handed scoop technique.",
            "Use bedside electric needle burners or hub cutters immediately after injection.",
            "Never put soft cotton, gauze, plastic tubing, or non-sharp waste into white containers.",
            "Permanently lock the lid at three-quarters fill line for autoclaving and concrete pit encapsulation."
        ]
    },
    blue: {
        title: "Blue Bin Guide: Glassware & Metallic Implants",
        summary: "The Blue container or cardboard box is specifically designated for clean or contaminated glassware and metallic surgical hardware. Items that come under the Blue Bin include: empty glass medicine ampoules and pharmaceutical vials; broken laboratory glassware, beakers, and test tubes; microscope glass slides and coverslips; and orthopedic metallic bone plates, screws, pins, rods, and surgical prosthetics. Items that must never go into the Blue Bin: never place needles, plastic syringes, blood-soaked cotton, or cytotoxic chemotherapy vials in the blue stream. Always handle broken glass with tongs or forceps, never with bare hands. Decontaminate with 1 percent sodium hypochlorite or autoclave before glass crushing and metal smelting.",
        steps: [
            "Segregate all intact or broken medicine ampoules, glass vials, and metallic orthopedic implants into blue containers.",
            "Include microscope slides, lab beakers, titanium bone plates, screws, and pins.",
            "Never pick up broken glass fragments with bare hands or thin gloves; always use forceps or tongs.",
            "Never mix needles, plastic syringes, soiled dressings, or cytotoxic chemo vials into the blue stream.",
            "Pre-treat with 1 percent sodium hypochlorite disinfectant soak or autoclave sterilization.",
            "Route decontaminated glass to authorized glass recyclers and metal implants to smelting foundries."
        ]
    },
    purple: {
        title: "Purple Stream Guide: Cytotoxic & Chemotherapy Waste",
        summary: "The Purple container or dedicated yellow cytotoxic bag is exclusively for hazardous cancer chemotherapy and antineoplastic waste. Items that come under the Purple Stream include: expired or leftover chemotherapy drug vials; contaminated cytotoxic IV infusion sets, bags, and tubing; gowns, masks, and gloves worn during chemo drug reconstitution; absorbent pads used for chemo spills; and patient bodily excreta within 48 hours of chemotherapy administration. Items that must never go into the Purple Stream: never discard in municipal trash or red bins, and never autoclave cytotoxic waste. Staff must double-glove with chemotherapy-rated nitrile gloves, prepare drugs in Class II biosafety cabinets, and incinerate at extreme temperatures above 1200 degrees Celsius.",
        steps: [
            "Place all chemotherapy drugs, contaminated IV tubing, and patient excreta into purple cytotoxic bags.",
            "Wear double chemotherapy-tested nitrile gloves, an impermeable gown, and full face shield.",
            "Reconstitute all antineoplastic chemotherapy agents only inside certified Class II Biosafety Cabinets.",
            "Never autoclave cytotoxic waste, as heating volatilizes dangerous carcinogenic chemical fumes.",
            "Keep dedicated cytotoxic spill kits with neutralizing absorbent pads immediately accessible.",
            "Destroy all cytotoxic waste by high-temperature incineration exceeding 1200 degrees Celsius."
        ]
    },
    general: {
        title: "General Waste Guide: Non-Hazardous Municipal Waste",
        summary: "General healthcare waste represents eighty to eighty-five percent of hospital waste and is non-hazardous. Items that come under General Waste include: clean cardboard, packaging boxes, paper stationery, food leftovers, disposable paper cups, and clean plastic wrappers. Segregate in green or black municipal bins. Strictly ensure no infectious dressings, gloves, needles, or blood-stained items enter general waste. Clean paper and cardboard should be compacted and sent for municipal recycling.",
        steps: [
            "Deposit clean cardboard, food waste, paper cups, and clean packaging into green or black bins.",
            "Never dispose of contaminated patient dressings, cotton swabs, or needles into general bins.",
            "Keep clean recycling bins separated at nursing stations, administrative offices, and cafeterias.",
            "Conduct routine spot checks to guarantee total absence of infectious clinical waste.",
            "Partner with authorized municipal recyclers for clean paper, cardboard, and compostable waste."
        ]
    },
    emergency: {
        title: "Emergency Protocol Guide: Needle-Stick & Blood Spills",
        summary: "Immediate emergency response protocols. For Needle-Stick Injury: Step 1, immediately wash the puncture wound under cool running tap water with soap for five minutes; Step 2, do not squeeze, press, or suck the wound, and apply a sterile waterproof dressing; Step 3, immediately notify your supervisor and the infection control officer; Step 4, begin Post-Exposure Prophylaxis PEP evaluation within two hours. For Blood Spills: Step 1, cordon off the area and don full PPE; Step 2, cover the spill with absorbent towels working from outside inward; Step 3, pour freshly prepared 1 percent sodium hypochlorite and wait 20 minutes; Step 4, collect towels with tongs into a yellow bag and mop the floor with disinfectant.",
        steps: [
            "Needle-Stick Step 1: Immediately wash puncture wound under running tap water with soap for 5 minutes.",
            "Needle-Stick Step 2: Do NOT suck, squeeze, or scrub the wound harshly. Apply a sterile waterproof bandage.",
            "Needle-Stick Step 3: Report incident immediately to supervisor and receive PEP evaluation within 2 hours.",
            "Spill Step 1: Cordon off spill area and don full PPE including nitrile gloves, gown, and shoe covers.",
            "Spill Step 2: Cover liquid spill with absorbent towels and soak with freshly prepared 1% sodium hypochlorite.",
            "Spill Step 3: Wait 20 minutes contact time, scoop towels with tongs into a yellow bag, and mop thoroughly."
        ]
    }
};

// Global State
const AudioState = {
    synth: window.speechSynthesis || null,
    audioElement: null,
    currentUtterance: null,
    activeSectionId: null,
    isPlaying: false,
    isPaused: false,
    currentSpeed: 1.0,
    selectedLanguage: "en",
    selectedVoice: null,
    selectedVoiceMode: "auto",
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
   SPEECH SYNTHESIS & MULTI-LANGUAGE ENGINE
   ========================================================= */

function initSpeechSynthesis() {
    loadVoices();
    if (window.speechSynthesis && speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Sync UI with default language
    const langSelect = document.getElementById("languageSelect");
    if (langSelect) {
        langSelect.value = AudioState.selectedLanguage;
    }
}

/**
 * Find the best matching browser speech synthesis voice for an Indian language
 */
function findBestVoiceForLanguage(langCode) {
    if (!AudioState.synth) return null;
    const voices = AudioState.synth.getVoices();
    if (!voices || voices.length === 0) return null;

    const config = (typeof SUPPORTED_LANGUAGES !== "undefined" && SUPPORTED_LANGUAGES[langCode]) 
                || { tag: "en-IN", fallbackTag: "en", name: "English", native: "English" };

    // 1. Exact match by BCP-47 tag (e.g. 'hi-IN', 'mr-IN', 'ta-IN')
    let voice = voices.find(v => v.lang && v.lang.toLowerCase().replace("_", "-") === config.tag.toLowerCase());

    // 2. Starts with language code (e.g. 'hi', 'mr', 'ta', 'bn')
    if (!voice) {
        voice = voices.find(v => v.lang && (v.lang.toLowerCase().startsWith(config.fallbackTag.toLowerCase()) || v.lang.toLowerCase().startsWith(langCode.toLowerCase())));
    }

    // 3. Name includes language name (e.g. 'Google Hindi', 'Lekha', 'Shruti')
    if (!voice) {
        voice = voices.find(v => v.name && (v.name.toLowerCase().includes(config.name.toLowerCase()) || (config.native && v.name.toLowerCase().includes(config.native.toLowerCase()))));
    }

    return voice || null;
}

/**
 * Load and filter voices based on active language
 */
function loadVoices() {
    if (!AudioState.synth) return;
    const voices = AudioState.synth.getVoices();
    if (!voices || voices.length === 0) return;

    const lang = AudioState.selectedLanguage || "en";
    const config = (typeof SUPPORTED_LANGUAGES !== "undefined" && SUPPORTED_LANGUAGES[lang]) 
                || { tag: "en-IN", fallbackTag: "en", name: "English", native: "English" };

    // Match voices for current selected language
    let langVoices = voices.filter(v => 
        v.lang && (
            v.lang.toLowerCase().replace("_", "-") === config.tag.toLowerCase() ||
            v.lang.toLowerCase().startsWith(config.fallbackTag.toLowerCase()) ||
            v.lang.toLowerCase().startsWith(lang.toLowerCase()) ||
            v.name.toLowerCase().includes(config.name.toLowerCase())
        )
    );

    // Fallback if OS has no specific regional TTS pack installed
    if (langVoices.length === 0) {
        langVoices = voices.filter(v => v.lang && (v.lang.startsWith("en") || v.lang.startsWith("hi")));
        if (langVoices.length === 0) langVoices = voices;
    }

    AudioState.availableVoices = langVoices;

    // Populate voice dropdown
    const voiceSelect = document.getElementById("voiceSelect");
    if (voiceSelect) {
        voiceSelect.innerHTML = "";

        const autoOpt = document.createElement("option");
        autoOpt.value = "auto";
        autoOpt.textContent = `🌟 Natural Voice (${config.native} - ${config.name})`;
        voiceSelect.appendChild(autoOpt);

        AudioState.availableVoices.forEach((v, index) => {
            const opt = document.createElement("option");
            opt.value = `browser_${index}`;
            opt.textContent = `Device: ${v.name} (${v.lang})`;
            voiceSelect.appendChild(opt);
        });

        // Default to natural high-fidelity voice mode
        voiceSelect.value = "auto";
        AudioState.selectedVoiceMode = "auto";
        AudioState.selectedVoice = null;

        voiceSelect.onchange = (e) => {
            const val = e.target.value;
            if (val === "auto") {
                AudioState.selectedVoiceMode = "auto";
                AudioState.selectedVoice = null;
                showAudioToast(`🌟 Natural High-Fidelity Voice selected for ${config.native}`);
            } else if (val.startsWith("browser_")) {
                const idx = parseInt(val.replace("browser_", ""), 10);
                if (AudioState.availableVoices[idx]) {
                    AudioState.selectedVoiceMode = "browser";
                    AudioState.selectedVoice = AudioState.availableVoices[idx];
                    showAudioToast(`Device Voice set to ${AudioState.selectedVoice.name}`);
                }
            }
            if (AudioState.isPlaying && AudioState.activeSectionId) {
                const active = AudioState.activeSectionId;
                stopAudio(active);
                playSectionAudio(active);
            }
        };
    }
}

/**
 * Change Narration Language across 11 Indian Languages + English
 */
function changeNarrationLanguage(langCode) {
    const config = (typeof SUPPORTED_LANGUAGES !== "undefined" && SUPPORTED_LANGUAGES[langCode]) 
                || (typeof SUPPORTED_LANGUAGES !== "undefined" && SUPPORTED_LANGUAGES["en"])
                || { name: "Hindi", native: "हिंदी" };

    AudioState.selectedLanguage = langCode;

    // 1. Sync dropdown
    const selectEl = document.getElementById("languageSelect");
    if (selectEl && selectEl.value !== langCode) {
        selectEl.value = langCode;
    }

    // 2. Sync quick pills
    document.querySelectorAll(".lang-pill").forEach(pill => {
        if (pill.getAttribute("data-lang") === langCode) {
            pill.classList.add("active");
        } else {
            pill.classList.remove("active");
        }
    });

    // 3. Update master audio banner badge
    const masterBadge = document.getElementById("masterLangBadge");
    if (masterBadge) {
        masterBadge.innerText = `${config.native} (${config.name})`;
    }

    // 4. Reload voice options for this language
    loadVoices();

    // 5. Toast notification in user's chosen language
    showAudioToast(`🎙️ Language: ${config.native} (${config.name}) - Narrator Ready!`);

    // 6. If audio is currently playing, immediately restart in new language!
    if (AudioState.isPlaying && AudioState.activeSectionId) {
        const active = AudioState.activeSectionId;
        stopAudio(active);
        playSectionAudio(active);
    }
}

window.changeNarrationLanguage = changeNarrationLanguage;

/**
 * Play/Toggle Audio for a given section ID ('master', 'yellow', 'red', etc.)
 */
function toggleSectionAudio(sectionId) {
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
 * Start speech narration for a specific section in the selected language
 */
function playSectionAudio(sectionId) {
    const lang = AudioState.selectedLanguage || "en";
    const i18nSet = (typeof PRECAUTION_TRANSCRIPTS_I18N !== "undefined" && PRECAUTION_TRANSCRIPTS_I18N[lang]) 
                 || (typeof PRECAUTION_TRANSCRIPTS_I18N !== "undefined" && PRECAUTION_TRANSCRIPTS_I18N["en"])
                 || PRECAUTION_TRANSCRIPTS;

    const data = i18nSet[sectionId] || PRECAUTION_TRANSCRIPTS[sectionId];
    if (!data) return;

    // 1. Stop any currently active audio or synthesis
    if (AudioState.audioElement) {
        AudioState.audioElement.pause();
        AudioState.audioElement.currentTime = 0;
    }
    if (AudioState.synth && AudioState.synth.speaking) {
        AudioState.synth.cancel();
    }
    clearInterval(AudioState.progressInterval);
    clearTimeout(AudioState.stepHighlightTimer);

    const textToSpeak = `${data.title}. ${data.summary}`;
    const config = (typeof SUPPORTED_LANGUAGES !== "undefined" && SUPPORTED_LANGUAGES[lang]) 
                || { tag: "en-IN", name: "English", native: "English" };

    AudioState.activeSectionId = sectionId;
    AudioState.isPlaying = true;
    AudioState.isPaused = false;
    AudioState.elapsedSeconds = 0;

    // Estimate initial duration
    const wordCount = textToSpeak.split(/\s+/).length;
    AudioState.estimatedTotalSeconds = Math.max(10, Math.round((wordCount / (130 * AudioState.currentSpeed)) * 60));

    // Update UI Elements
    updatePlayerUIState(sectionId, "playing");

    // Sentence/Step-by-step visual tracker
    startStepHighlighting(sectionId, data.steps);

    // If user explicitly chose a device browser voice
    if (AudioState.selectedVoiceMode === "browser" && AudioState.selectedVoice && AudioState.synth) {
        playWithBrowserSynth(sectionId, textToSpeak, config, data);
        return;
    }

    // Default & High-Fidelity: Play via Native Audio Engine (Backend / Local Cache / Google Cloud TTS)
    playWithHighFidelityAudio(sectionId, textToSpeak, lang, config, data);
}

function playWithHighFidelityAudio(sectionId, textToSpeak, lang, config, data) {
    const apiHost = (window.location && window.location.hostname) ? window.location.hostname : "127.0.0.1";
    const primaryUrl = `http://${apiHost}:5000/api/tts?lang=${encodeURIComponent(lang)}&text=${encodeURIComponent(textToSpeak)}`;
    const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(lang)}&client=tw-ob&q=${encodeURIComponent(textToSpeak)}`;

    if (!AudioState.audioElement) {
        AudioState.audioElement = new Audio();
    }
    const audio = AudioState.audioElement;
    audio.playbackRate = AudioState.currentSpeed;
    audio.preservesPitch = true;

    // Setup event handlers
    audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
            AudioState.estimatedTotalSeconds = Math.round(audio.duration);
        }
    };

    audio.ontimeupdate = () => {
        if (AudioState.isPlaying && !AudioState.isPaused) {
            AudioState.elapsedSeconds = Math.floor(audio.currentTime);
            const total = AudioState.estimatedTotalSeconds || Math.max(1, Math.floor(audio.duration) || 20);
            const pct = Math.min(100, Math.round((audio.currentTime / total) * 100));
            updateProgressBar(sectionId, pct, AudioState.elapsedSeconds, total);
        }
    };

    audio.onended = () => {
        stopAudio(sectionId, true);
        showAudioToast(`Finished narration for ${data.title}`);
    };

    audio.onerror = (e) => {
        console.warn("High-fidelity audio load failed, trying direct fallback:", e);
        if (audio.src !== fallbackUrl && !audio.src.includes("translate_tts")) {
            audio.src = fallbackUrl;
            audio.play().catch(() => playWithBrowserSynth(sectionId, textToSpeak, config, data));
        } else {
            playWithBrowserSynth(sectionId, textToSpeak, config, data);
        }
    };

    audio.src = primaryUrl;
    audio.play().then(() => {
        showAudioToast(`🔊 Speaking in ${config.native} (${config.name}): ${data.title}`);
    }).catch(err => {
        console.warn("Primary audio play failed, falling back to direct stream:", err);
        audio.src = fallbackUrl;
        audio.play().then(() => {
            showAudioToast(`🔊 Speaking in ${config.native}: ${data.title}`);
        }).catch(() => {
            playWithBrowserSynth(sectionId, textToSpeak, config, data);
        });
    });
}

function playWithBrowserSynth(sectionId, textToSpeak, config, data) {
    if (!AudioState.synth) return;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = config.tag || "en-US";
    const voice = AudioState.selectedVoice || findBestVoiceForLanguage(AudioState.selectedLanguage);
    if (voice) {
        utterance.voice = voice;
    }
    utterance.rate = AudioState.currentSpeed;
    utterance.pitch = 1.0;

    utterance.onend = () => {
        stopAudio(sectionId, true);
        showAudioToast(`Finished narration for ${data.title}`);
    };

    utterance.onerror = (e) => {
        console.warn("Speech synthesis error:", e);
        stopAudio(sectionId, false);
    };

    clearInterval(AudioState.progressInterval);
    AudioState.progressInterval = setInterval(() => {
        if (AudioState.isPlaying && !AudioState.isPaused) {
            AudioState.elapsedSeconds++;
            const pct = Math.min(100, Math.round((AudioState.elapsedSeconds / AudioState.estimatedTotalSeconds) * 100));
            updateProgressBar(sectionId, pct, AudioState.elapsedSeconds, AudioState.estimatedTotalSeconds);
        }
    }, 1000);

    AudioState.currentUtterance = utterance;
    AudioState.synth.speak(utterance);
    showAudioToast(`🔊 Listening in ${config.native}: ${data.title}`);
}

/**
 * Pause Audio
 */
function pauseAudio(sectionId) {
    if (AudioState.audioElement && !AudioState.audioElement.paused) {
        AudioState.audioElement.pause();
    }
    if (AudioState.synth && AudioState.synth.speaking) {
        AudioState.synth.pause();
    }
    AudioState.isPaused = true;
    updatePlayerUIState(sectionId, "paused");
    showAudioToast("Narration paused");
}

/**
 * Resume Audio
 */
function resumeAudio(sectionId) {
    if (AudioState.audioElement && AudioState.audioElement.paused) {
        AudioState.audioElement.play().catch(e => console.warn(e));
    } else if (AudioState.synth && AudioState.synth.paused) {
        AudioState.synth.resume();
    }
    AudioState.isPaused = false;
    updatePlayerUIState(sectionId, "playing");
    showAudioToast("Resumed narration");
}

/**
 * Stop Audio and reset UI
 */
function stopAudio(sectionId, completed = false) {
    if (AudioState.audioElement) {
        AudioState.audioElement.pause();
        AudioState.audioElement.currentTime = 0;
    }
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

    // Update HTML5 audio playback speed dynamically without stopping!
    if (AudioState.audioElement) {
        AudioState.audioElement.playbackRate = AudioState.currentSpeed;
    }

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

    // If using browser speech synthesis, restart with new rate smoothly
    if (AudioState.selectedVoiceMode === "browser" && AudioState.isPlaying && AudioState.activeSectionId === sectionId) {
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
            if (AudioState.audioElement) {
                AudioState.audioElement.playbackRate = AudioState.currentSpeed;
            }
            document.querySelectorAll(".speed-chip").forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            showAudioToast(`Global speed set to ${speed}x`);
            if (AudioState.selectedVoiceMode === "browser" && AudioState.isPlaying && AudioState.activeSectionId) {
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
