/**
 * MedWaste AI - Interactive Chatbot & Regulatory Knowledge Controller
 * Features:
 * - Dual Engine: Google Gemini 2.5 Flash LLM (with API key) + Advanced Neural Clinical Reasoner
 * - Natural language query understanding & tailored dynamic answering
 * - Web Speech API (Microphone Speech-to-Text input + Text-to-Speech narration)
 * - Dynamic FAQ filtering & accordion toggles
 * - Stream categorization (Yellow, Red, White, Blue, Cytotoxic, Emergency, Collection, Regulatory)
 */

// Global State for Chatbot
let isVoiceNarrationEnabled = true;
let speechRecognition = null;
let isRecording = false;
let currentFaqFilter = "All";
let cachedFaqs = [];
let currentEngineMode = localStorage.getItem("medwaste_engine_mode") || "neural"; // "neural" or "gemini"
let storedGeminiKey = localStorage.getItem("medwaste_gemini_key") || "";

// Built-in Curated FAQs
const CLIENT_FAQS = [
    {
        id: "faq-1",
        category: "Segregation",
        category_tag: "Red",
        question: "Which bin should I dispose of used plastic syringes and IV sets into?",
        answer: "Disposable plastic syringes (without needles), IV fluid administration sets, catheters, urine bags, and plastic dialysis tubing must be segregated into the **Red Container**. Crucial step: Always cut the needle hub using a point-of-use needle cutter before dropping the plastic syringe body into the Red bin.",
        recommended_action: "Snip needle hub at point-of-use, then place plastic barrel into RED bin."
    },
    {
        id: "faq-2",
        category: "Emergency",
        category_tag: "Emergency",
        question: "What is the emergency first-aid procedure for an accidental needle-stick injury?",
        answer: "1. **Immediately wash** the puncture wound under cool running tap water with soap for 5 minutes.\n2. **DO NOT** squeeze, press, or suck the wound violently, as this causes tissue trauma.\n3. Cover with a sterile waterproof bandage.\n4. **Report immediately** to the Infection Control Officer or supervisor.\n5. Initiate **Post-Exposure Prophylaxis (PEP)** for HIV and Hepatitis B evaluation within 2 hours.",
        recommended_action: "Wash under running tap water for 5 minutes. Report within 2 hours for PEP."
    },
    {
        id: "faq-3",
        category: "Collection",
        category_tag: "Collection",
        question: "What is the maximum time biomedical waste can be stored before collection?",
        answer: "According to the **Bio-Medical Waste Management Rules 2016 (CPCB)**, untreated biomedical waste must **never be stored beyond 48 hours**. If holding beyond 48 hours is unavoidable due to exceptional circumstances, the healthcare facility must inform the State Pollution Control Board and ensure cool refrigerated storage to prevent microbial growth.",
        recommended_action: "Ensure waste collection and dispatch within 48 hours."
    },
    {
        id: "faq-4",
        category: "Segregation",
        category_tag: "Yellow",
        question: "What items belong in the Yellow biohazard bag?",
        answer: "The **Yellow Bag** is for infectious and anatomical waste:\n- Human anatomical tissues, organs, placentas, biopsy specimens\n- Soiled waste: blood-soaked gauze, dressings, cotton swabs, plaster casts\n- Expired or discarded cytotoxic medicines\n- Microbiology and biotechnology laboratory cultures and specimens\n- Soiled masks and paper PPE contaminated with body fluids.",
        recommended_action: "Double-knot non-chlorinated yellow bag when 3/4 full."
    },
    {
        id: "faq-5",
        category: "Segregation",
        category_tag: "White",
        question: "Where should hypodermic needles, scalpels, and surgical blades be discarded?",
        answer: "All contaminated metal sharps—including hypodermic needles, scalpel blades, suture needles, lancets, and contaminated broken ampoule tips—must be dropped immediately into a **White Translucent, Puncture-Proof, Tamper-Evident Container**. Never recap needles by hand!",
        recommended_action: "Drop directly into White puncture-proof sharps box without recapping."
    },
    {
        id: "faq-6",
        category: "Segregation",
        category_tag: "Blue",
        question: "Which container is used for broken medicine glass ampoules and metal implants?",
        answer: "Broken or intact glass medicine vials, ampoules, microscope slides, and contaminated metal orthopedic implants (pins, screws, plates) must go into **Blue-marked puncture-resistant boxes or bins**. Never pick up broken glass with bare hands; always use forceps or tongs.",
        recommended_action: "Use tongs or forceps to place glass and implants into BLUE boxes."
    },
    {
        id: "faq-7",
        category: "Precautions",
        category_tag: "Precautions",
        question: "What PPE is required when handling biomedical waste bags and bins?",
        answer: "Waste handlers and clinical staff must wear:\n- Heavy-duty nitrile or utility puncture-resistant gloves\n- Fluid-impermeable apron or clinical gown\n- N95 respirator mask or 3-ply surgical mask\n- Protective eye goggles or full-face shield\n- Closed-toe impermeable rubber gumboots.\nNever compress or squeeze waste bags with bare hands.",
        recommended_action: "Don full PPE: heavy gloves, fluid apron, face shield, and gumboots."
    },
    {
        id: "faq-8",
        category: "Emergency",
        category_tag: "Emergency",
        question: "How should a blood or bodily fluid spill in a hospital ward be managed?",
        answer: "1. Cordon off the spill zone immediately.\n2. Don full protective PPE (gloves, face shield, apron).\n3. Cover the liquid spill with absorbent paper towels.\n4. Pour freshly prepared **1% Sodium Hypochlorite solution** (10,000 ppm available chlorine) over the towels.\n5. Allow a minimum of **20 minutes contact time** for viral/bacterial inactivation.\n6. Scoop soaked towels using a dustpan/tongs into a **Yellow Bag** and mop with hospital disinfectant.",
        recommended_action: "Cover with paper towels + 1% Sodium Hypochlorite for 20 minutes."
    },
    {
        id: "faq-9",
        category: "Collection",
        category_tag: "Collection",
        question: "What are barcoded bio-waste bags and why are they mandatory?",
        answer: "Under CPCB BMWM Rules, every biohazard bag and sharp container must bear a **unique Barcode and RFID tag** generated for that specific healthcare facility. This enables end-to-end digital tracking from the hospital ward through transport vehicles to the Common Bio-Medical Waste Treatment Facility (CBWTF), recording exact weight and transit timestamps.",
        recommended_action: "Scan and tag every bag with CPCB-compliant Barcode before handoff."
    },
    {
        id: "faq-10",
        category: "Precautions",
        category_tag: "Cytotoxic",
        question: "How should cytotoxic oncology and chemotherapy drugs be handled?",
        answer: "Chemotherapy agents are carcinogenic, mutagenic, and teratogenic. Waste (IV lines, gloves, drug residues, patient bodily waste within 48 hours of chemo) must be sealed in **dedicated Purple-labeled cytotoxic bags**. Handlers must wear double chemo-tested nitrile gloves and face shields. Final disposal requires high-temperature incineration exceeding 1200°C.",
        recommended_action: "Double-glove, use Purple cytotoxic bags, and incinerate at 1200°C."
    }
];

/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initSpeechRecognition();
    loadFaqs();
    updateEngineHeaderBadge();

    // Auto-focus input on desktop
    const chatInput = document.getElementById("chatInput");
    if (chatInput && window.innerWidth > 768) {
        chatInput.focus();
    }
});


/* =========================================================
   ENGINE SETTINGS MODAL
========================================================= */

function openEngineModal() {
    const modal = document.getElementById("engineModal");
    if (!modal) return;

    modal.style.display = "flex";

    // Sync current values
    const radioNeural = document.getElementById("engineModeNeural");
    const radioGemini = document.getElementById("engineModeGemini");
    const keyInput = document.getElementById("geminiApiKeyInput");

    if (currentEngineMode === "gemini") {
        if (radioGemini) radioGemini.checked = true;
    } else {
        if (radioNeural) radioNeural.checked = true;
    }

    if (keyInput) {
        keyInput.value = storedGeminiKey;
    }

    handleEngineChange();
}

function closeEngineModal() {
    const modal = document.getElementById("engineModal");
    if (modal) modal.style.display = "none";
}

function handleEngineChange() {
    const radioGemini = document.getElementById("engineModeGemini");
    const cardNeural = document.getElementById("cardNeuralEngine");
    const cardGemini = document.getElementById("cardGeminiEngine");
    const apiKeyWrap = document.getElementById("apiKeyWrap");

    if (radioGemini && radioGemini.checked) {
        if (cardGemini) cardGemini.classList.add("active-engine-card");
        if (cardNeural) cardNeural.classList.remove("active-engine-card");
        if (apiKeyWrap) apiKeyWrap.style.display = "block";
    } else {
        if (cardNeural) cardNeural.classList.add("active-engine-card");
        if (cardGemini) cardGemini.classList.remove("active-engine-card");
        if (apiKeyWrap) apiKeyWrap.style.display = "none";
    }
}

function toggleKeyVisibility() {
    const keyInput = document.getElementById("geminiApiKeyInput");
    const icon = document.getElementById("keyEyeIcon");
    if (!keyInput || !icon) return;

    if (keyInput.type === "password") {
        keyInput.type = "text";
        icon.className = "fa-solid fa-eye-slash";
    } else {
        keyInput.type = "password";
        icon.className = "fa-solid fa-eye";
    }
}

function saveEngineSettings() {
    const radioGemini = document.getElementById("engineModeGemini");
    const keyInput = document.getElementById("geminiApiKeyInput");

    if (radioGemini && radioGemini.checked) {
        currentEngineMode = "gemini";
        storedGeminiKey = (keyInput ? keyInput.value.trim() : "");
        localStorage.setItem("medwaste_engine_mode", "gemini");
        localStorage.setItem("medwaste_gemini_key", storedGeminiKey);

        if (typeof showToast === "function") {
            showToast("AI Model switched to Google Gemini 2.5 Flash", "success");
        }
    } else {
        currentEngineMode = "neural";
        localStorage.setItem("medwaste_engine_mode", "neural");

        if (typeof showToast === "function") {
            showToast("AI Model set to MedWaste Clinical Reasoner", "info");
        }
    }

    updateEngineHeaderBadge();
    closeEngineModal();
}

function updateEngineHeaderBadge() {
    const label = document.getElementById("activeEngineLabel");
    if (!label) return;

    if (currentEngineMode === "gemini" && storedGeminiKey) {
        label.innerHTML = `<i class="fa-solid fa-sparkles" style="color: #0284c7;"></i> Gemini 2.5 Flash LLM (Active)`;
    } else {
        label.innerHTML = `<i class="fa-solid fa-microchip" style="color: #10b981;"></i> Neural AI Reasoner (Active)`;
    }
}


/* =========================================================
   FAQ HUB CONTROLLER
========================================================= */

async function loadFaqs() {
    const container = document.getElementById("faqListContainer");
    if (!container) return;

    container.innerHTML = `
        <div style="text-align: center; padding: 24px; color: #94a3b8;">
            <i class="fa-solid fa-spinner fa-spin"></i> Loading FAQs...
        </div>
    `;

    let faqs = CLIENT_FAQS;
    try {
        if (typeof apiCall === "function") {
            const res = await apiCall("/chat/faqs");
            if (res.ok && res.data && res.data.faqs && res.data.faqs.length > 0) {
                faqs = res.data.faqs;
            }
        }
    } catch (e) {
        console.warn("Using built-in FAQs:", e);
    }

    cachedFaqs = faqs;
    renderFaqList(currentFaqFilter);
}

function filterFaqs(category, tabBtn) {
    currentFaqFilter = category;

    document.querySelectorAll(".faq-filter-tabs .tab-btn").forEach(btn => {
        btn.classList.remove("active");
    });
    if (tabBtn) tabBtn.classList.add("active");

    renderFaqList(category);
}

function renderFaqList(category) {
    const container = document.getElementById("faqListContainer");
    if (!container) return;

    let list = cachedFaqs;
    if (category && category !== "All") {
        list = cachedFaqs.filter(item => item.category.toLowerCase() === category.toLowerCase());
    }

    if (list.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #94a3b8;">
                <i class="fa-regular fa-folder-open" style="font-size: 28px; margin-bottom: 8px;"></i>
                <p>No questions found in this category.</p>
            </div>
        `;
        return;
    }

    let html = "";
    list.forEach((faq, index) => {
        const streamClass = (faq.category_tag || "general").toLowerCase();
        html += `
            <div class="faq-item" id="faqItem-${faq.id || index}">
                <button type="button" class="faq-question-btn" onclick="toggleFaqAccordion('${faq.id || index}')" aria-expanded="false">
                    <div class="faq-question-content">
                        <span class="stream-badge ${streamClass}">
                            ${faq.category}
                        </span>
                        <span class="faq-q-text">${escapeHtml(faq.question)}</span>
                    </div>
                    <i class="fa-solid fa-chevron-down faq-arrow"></i>
                </button>
                <div class="faq-answer-collapse">
                    <div class="faq-answer-text">${formatBotText(faq.answer)}</div>
                    <div class="faq-ask-action">
                        <button type="button" class="faq-ask-btn" onclick="askFaqQuestion('${escapeHtml(faq.question)}')">
                            <i class="fa-solid fa-comment-dots"></i> Ask in Chat
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function toggleFaqAccordion(id) {
    const item = document.getElementById(`faqItem-${id}`);
    if (!item) return;

    const isOpen = item.classList.contains("open");

    document.querySelectorAll(".faq-item.open").forEach(el => {
        if (el !== item) {
            el.classList.remove("open");
            const btn = el.querySelector(".faq-question-btn");
            if (btn) btn.setAttribute("aria-expanded", "false");
        }
    });

    if (isOpen) {
        item.classList.remove("open");
        const btn = item.querySelector(".faq-question-btn");
        if (btn) btn.setAttribute("aria-expanded", "false");
    } else {
        item.classList.add("open");
        const btn = item.querySelector(".faq-question-btn");
        if (btn) btn.setAttribute("aria-expanded", "true");
    }
}

function askFaqQuestion(questionText) {
    const input = document.getElementById("chatInput");
    if (input) {
        input.value = questionText;
        submitUserMessage(questionText);
    }
}


/* =========================================================
   CHAT ENGINE & INTERACTION
========================================================= */

function handleChatSubmit(event) {
    if (event) event.preventDefault();
    const input = document.getElementById("chatInput");
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    input.value = "";
    submitUserMessage(text);
}

function askQuickPrompt(promptText) {
    const input = document.getElementById("chatInput");
    if (input) input.value = promptText;
    submitUserMessage(promptText);
}

async function submitUserMessage(userText) {
    const messagesContainer = document.getElementById("chatMessages");
    const typingIndicator = document.getElementById("typingIndicator");
    if (!messagesContainer) return;

    // 1. Append User Message
    appendMessageRow({
        sender: "user",
        text: userText,
        time: getCurrentTime()
    });

    // 2. Show Typing Indicator
    if (typingIndicator) {
        messagesContainer.appendChild(typingIndicator);
        typingIndicator.style.display = "flex";
        scrollChatToBottom();
    }

    // 3. Request Answer
    let botResult = null;
    const apiKeyToSend = (currentEngineMode === "gemini" && storedGeminiKey) ? storedGeminiKey : "";

    try {
        if (typeof apiCall === "function") {
            const res = await apiCall("/chat", "POST", {
                message: userText,
                api_key: apiKeyToSend
            });
            if (res.ok && res.data && res.data.success) {
                botResult = res.data;
            }
        }
    } catch (err) {
        console.warn("Backend chat error, using client reasoner fallback:", err);
    }

    // Fallback to client reasoning engine
    if (!botResult) {
        botResult = clientBiomedicalKnowledgeEngine(userText);
        const q_lower = (userText || "").toLowerCase().trim();
        if (botResult.engine !== "MedWaste Conversational AI") {
            if (q_lower.match(/\b(good\s*morning|morning|gm)\b/) && !botResult.reply.toLowerCase().startsWith("good morning")) {
                botResult.reply = "Good morning! ☀️ Hope your day is off to a great start!\n\n" + botResult.reply;
            } else if (q_lower.match(/\b(good\s*afternoon|afternoon)\b/) && !botResult.reply.toLowerCase().startsWith("good afternoon")) {
                botResult.reply = "Good afternoon! 🌤️ Hope your day is going well!\n\n" + botResult.reply;
            } else if (q_lower.match(/\b(good\s*evening|evening)\b/) && !botResult.reply.toLowerCase().startsWith("good evening")) {
                botResult.reply = "Good evening! 🌆 Hope you had a fulfilling day!\n\n" + botResult.reply;
            } else if (q_lower.match(/\b(hi+|hello+|hey+|namaste)\b/) && !["hi", "hello", "hey", "namaste"].some(x => botResult.reply.toLowerCase().startsWith(x))) {
                botResult.reply = "Hello! 👋 Great to connect with you!\n\n" + botResult.reply;
            }
        }
    }

    // Realistic delay for reading comfort
    await new Promise(r => setTimeout(r, 450));

    // 4. Hide Typing Indicator
    if (typingIndicator) {
        typingIndicator.style.display = "none";
    }

    // 5. Append Bot Message
    appendMessageRow({
        sender: "bot",
        text: botResult.reply,
        categoryTag: botResult.category_tag || "General",
        recommendedAction: botResult.recommended_action || "",
        followups: botResult.suggested_followups || [],
        engine: botResult.engine || (currentEngineMode === "gemini" ? "Gemini 2.5 Flash" : "MedWaste Clinical Reasoner"),
        time: getCurrentTime()
    });

    // 6. Voice Narration if enabled
    if (isVoiceNarrationEnabled && window.speechSynthesis) {
        speakCleanText(botResult.reply);
    }
}

function appendMessageRow({ sender, text, categoryTag, recommendedAction, followups, engine, time }) {
    const messagesContainer = document.getElementById("chatMessages");
    const typingIndicator = document.getElementById("typingIndicator");
    if (!messagesContainer) return;

    const row = document.createElement("div");
    row.className = `message-row ${sender === "user" ? "user-row" : "bot-row"}`;

    if (sender === "user") {
        row.innerHTML = `
            <div class="msg-avatar user-msg-avatar">
                <i class="fa-solid fa-user"></i>
            </div>
            <div class="msg-bubble-wrap">
                <div class="msg-bubble user-bubble">
                    ${escapeHtml(text)}
                </div>
                <div class="msg-meta">
                    <span>${time}</span>
                </div>
            </div>
        `;
    } else {
        const streamClass = (categoryTag || "general").toLowerCase();
        let formattedBody = formatBotText(text);

        let takeawayHtml = "";
        if (recommendedAction) {
            takeawayHtml = `
                <div class="takeaway-box">
                    <i class="fa-solid fa-clipboard-check"></i>
                    <div><strong>Key Action:</strong> ${escapeHtml(recommendedAction)}</div>
                </div>
            `;
        }

        let followupsHtml = "";
        if (followups && followups.length > 0) {
            followupsHtml = `
                <div class="suggestions-box">
                    <div class="suggestions-title">
                        <i class="fa-solid fa-lightbulb"></i> Suggested Follow-Ups:
                    </div>
                    <div class="prompt-chips-wrap">
                        ${followups.map(f => `
                            <button type="button" class="prompt-chip" onclick="askQuickPrompt('${escapeHtml(f)}')">
                                ${escapeHtml(f)}
                            </button>
                        `).join("")}
                    </div>
                </div>
            `;
        }

        const rawTextForSpeech = escapeQuote(cleanTextForSpeech(text));

        row.innerHTML = `
            <div class="msg-avatar bot-msg-avatar">
                <i class="fa-solid fa-robot"></i>
            </div>
            <div class="msg-bubble-wrap">
                <div class="msg-bubble bot-bubble">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                        <span class="stream-badge ${streamClass}">
                            <i class="fa-solid fa-tag"></i> ${escapeHtml(categoryTag || "General")}
                        </span>
                        <span style="font-size: 11px; color: #94a3b8; display: flex; align-items: center; gap: 4px;">
                            <i class="fa-solid fa-brain"></i> ${escapeHtml(engine || "AI Reasoner")}
                        </span>
                    </div>
                    <div>${formattedBody}</div>
                    ${takeawayHtml}
                    ${followupsHtml}
                </div>
                <div class="msg-meta">
                    <span>${time}</span>
                    <button type="button" class="msg-action-btn" title="Read Aloud" onclick="speakCleanText('${rawTextForSpeech}')">
                        <i class="fa-solid fa-headphones"></i>
                    </button>
                    <button type="button" class="msg-action-btn" title="Copy Answer" onclick="copyMessageText(this, '${rawTextForSpeech}')">
                        <i class="fa-regular fa-copy"></i>
                    </button>
                </div>
            </div>
        `;
    }

    if (typingIndicator && typingIndicator.parentNode === messagesContainer) {
        messagesContainer.insertBefore(row, typingIndicator);
    } else {
        messagesContainer.appendChild(row);
    }

    scrollChatToBottom();
}

function scrollChatToBottom() {
    const container = document.getElementById("chatMessages");
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}

function clearConversation() {
    const container = document.getElementById("chatMessages");
    if (!container) return;

    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }

    container.innerHTML = `
        <div class="message-row bot-row">
            <div class="msg-avatar bot-msg-avatar">
                <i class="fa-solid fa-robot"></i>
            </div>
            <div class="msg-bubble-wrap">
                <div class="msg-bubble bot-bubble">
                    <span class="stream-badge general">
                        <i class="fa-solid fa-rotate-left"></i> Conversation Reset
                    </span>
                    <p>
                        Conversation cleared. What would you like to ask about biomedical waste segregation, 
                        collection logistics, or clinical safety precautions?
                    </p>
                    <div class="suggestions-box">
                        <div class="suggestions-title">
                            <i class="fa-solid fa-bolt"></i> Popular Inquiries:
                        </div>
                        <div class="prompt-chips-wrap">
                            <button type="button" class="prompt-chip" onclick="askQuickPrompt('Good morning! How is your day going?')">
                                ☀️ Good morning! How is your day going?
                            </button>
                            <button type="button" class="prompt-chip" onclick="askQuickPrompt('Where do used plastic syringes and IV sets go?')">
                                💉 Where do plastic syringes go?
                            </button>
                            <button type="button" class="prompt-chip" onclick="askQuickPrompt('What is the emergency protocol for a needle-stick injury?')">
                                🚨 Needle-stick injury emergency SOP
                            </button>
                            <button type="button" class="prompt-chip" onclick="askQuickPrompt('What is the 48-hour waste storage rule?')">
                                ⏱️ 48-hour bio-waste storage rule
                            </button>
                        </div>
                    </div>
                </div>
                <div class="msg-meta">
                    <span>Just now</span>
                </div>
            </div>
        </div>
        <div class="message-row bot-row" id="typingIndicator">
            <div class="msg-avatar bot-msg-avatar">
                <i class="fa-solid fa-robot"></i>
            </div>
            <div class="typing-indicator" style="display: flex;">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        </div>
    `;

    if (typeof showToast === "function") {
        showToast("Conversation cleared", "info");
    }
}


/* =========================================================
   TEXT FORMATTING & SPEECH HELPERS
========================================================= */

function formatBotText(raw) {
    if (!raw) return "";
    let text = escapeHtml(raw);

    // Bold formatting: **bold**
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Headers: ### Title
    text = text.replace(/###\s+(.*?)$/gm, "<h4 style='font-size: 14.5px; margin: 8px 0 4px; color: #0f172a;'>$1</h4>");

    const lines = text.split("\n");
    let inList = false;
    let formatted = [];

    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            if (!inList) {
                formatted.push("<ul>");
                inList = true;
            }
            formatted.push(`<li>${trimmed.substring(2)}</li>`);
        } else if (/^\d+\.\s/.test(trimmed)) {
            if (!inList) {
                formatted.push("<ol>");
                inList = true;
            }
            const itemText = trimmed.replace(/^\d+\.\s/, "");
            formatted.push(`<li>${itemText}</li>`);
        } else {
            if (inList) {
                formatted.push("</ul>");
                inList = false;
            }
            if (trimmed) {
                formatted.push(`<p>${trimmed}</p>`);
            }
        }
    });

    if (inList) formatted.push("</ul>");
    return formatted.join("");
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeQuote(str) {
    if (!str) return "";
    return String(str).replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

function cleanTextForSpeech(str) {
    if (!str) return "";
    return str
        .replace(/\*\*/g, "")
        .replace(/###/g, "")
        .replace(/[\n\r]+/g, " ")
        .replace(/^[-\*\d\.]+\s/gm, "")
        .replace(/[🚨⚠️🔴⚪🔵🟡🟣🟢⚫🚛🛡️⏱️💉⚙️⚖️🧤☣️👋😊]/g, "")
        .trim();
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function copyMessageText(btn, text) {
    const decoded = text.replace(/&quot;/g, '"').replace(/\\'/g, "'");
    navigator.clipboard.writeText(decoded).then(() => {
        if (typeof showToast === "function") showToast("Copied to clipboard!", "success");
        if (btn) {
            const icon = btn.querySelector("i");
            if (icon) {
                icon.className = "fa-solid fa-check";
                setTimeout(() => { icon.className = "fa-regular fa-copy"; }, 1500);
            }
        }
    }).catch(() => {
        if (typeof showToast === "function") showToast("Failed to copy text", "error");
    });
}


/* =========================================================
   AUDIO & SPEECH RECOGNITION
========================================================= */

function toggleSound() {
    isVoiceNarrationEnabled = !isVoiceNarrationEnabled;
    const btn = document.getElementById("soundToggleBtn");
    const icon = document.getElementById("soundIcon");

    if (isVoiceNarrationEnabled) {
        if (btn) btn.classList.add("active-sound");
        if (icon) icon.className = "fa-solid fa-volume-high";
        if (typeof showToast === "function") showToast("Voice narration enabled", "info");
    } else {
        if (btn) btn.classList.remove("active-sound");
        if (icon) icon.className = "fa-solid fa-volume-xmark";
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        if (typeof showToast === "function") showToast("Voice narration muted", "info");
    }
}

function speakCleanText(rawText) {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const clean = cleanTextForSpeech(rawText);
    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = "en-US";

    window.speechSynthesis.speak(utterance);
}

function initSpeechRecognition() {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
        const btn = document.getElementById("voiceInputBtn");
        if (btn) {
            btn.title = "Speech recognition is not supported in this browser";
            btn.style.opacity = "0.5";
        }
        return;
    }

    speechRecognition = new SpeechRecognitionAPI();
    speechRecognition.continuous = false;
    speechRecognition.interimResults = false;
    speechRecognition.lang = "en-US";

    speechRecognition.onstart = () => {
        isRecording = true;
        const btn = document.getElementById("voiceInputBtn");
        const icon = document.getElementById("voiceIcon");
        if (btn) btn.classList.add("recording");
        if (icon) icon.className = "fa-solid fa-microphone-lines";
        if (typeof showToast === "function") showToast("Listening... speak your question", "info");
    };

    speechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const input = document.getElementById("chatInput");
        if (input && transcript) {
            input.value = transcript;
            submitUserMessage(transcript);
        }
    };

    speechRecognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (typeof showToast === "function") {
            showToast("Microphone error: " + (event.error || "Unable to capture audio"), "warning");
        }
        stopVoiceRecognition();
    };

    speechRecognition.onend = () => {
        stopVoiceRecognition();
    };
}

function toggleVoiceRecognition() {
    if (!speechRecognition) {
        if (typeof showToast === "function") {
            showToast("Voice speech input is not supported on this browser. Try Chrome/Edge.", "warning");
        }
        return;
    }

    if (isRecording) {
        speechRecognition.stop();
    } else {
        try {
            speechRecognition.start();
        } catch (e) {
            console.error(e);
            stopVoiceRecognition();
        }
    }
}

function stopVoiceRecognition() {
    isRecording = false;
    const btn = document.getElementById("voiceInputBtn");
    const icon = document.getElementById("voiceIcon");
    if (btn) btn.classList.remove("recording");
    if (icon) icon.className = "fa-solid fa-microphone";
}


/* =========================================================
   CLIENT KNOWLEDGE REASONER (INSTANT DYNAMIC ENGINE)
========================================================= */

function clientBiomedicalKnowledgeEngine(query) {
    const raw_q = (query || "").trim();
    const q = raw_q.toLowerCase();

    if (!q) {
        return {
            reply: "Hello! I am your **MedWaste AI Clinical & Regulatory Assistant**. You can ask me any question about biomedical waste segregation (Yellow, Red, White, Blue streams), collection schedules, barcoding, CPCB 2016 rules, and clinical safety precautions.",
            category_tag: "General",
            recommended_action: "Type any waste item or question to get instant segregation guidance.",
            suggested_followups: [
                "Which bin do used syringes go into?",
                "What is the needle-stick injury emergency SOP?",
                "What is the 48-hour waste storage rule?"
            ],
            engine: "MedWaste Neural Reasoner"
        };
    }

    // Check if clinical query
    const exactClinicalWords = ["bin", "bins", "waste", "red", "blue", "ppe", "pus", "sharp", "sharps"];
    const queryTokens = (q.match(/\b[a-z0-9_]+\b/g) || []);
    const hasExactClinicalWord = queryTokens.some(t => exactClinicalWords.includes(t));
    const multiwordOrStems = [
        "needle", "syringe", "iv set", "iv tube", "catheter", "scalpel", "blade",
        "lancet", "glass", "ampoule", "vial", "yellow bag", "yellow bin", "white container",
        "cytotoxic", "chemo", "spill", "leak", "hypochlorite", "vomit", "vomited",
        "blood", "prick", "needlestick", "infection", "hazard", "segregat", "cpcb",
        "spcb", "48 hour", "48hr", "storage", "collection", "pickup", "autoclave",
        "incinerat", "glove", "mask", "gowns", "mercury", "disinfect", "cotton",
        "gauze", "dressing", "placenta", "tissue", "anatomical", "pathology",
        "dialysis", "overfill", "recap"
    ];
    const isClinicalQuery = hasExactClinicalWord || multiwordOrStems.some(k => q.includes(k));

    // 1. CASUAL CONVERSATION & SOCIAL INTERACTION (HUMAN-LIKE)
    if (!isClinicalQuery) {
        // A. How are you / How is your day / What's up
        if (["how are you", "how r u", "how is your day", "how's your day", "how is ur day", "hows your day", "how are you doing", "how are things", "how's it going", "how is it going", "what's up", "whats up", "wassup", "sup", "how do you do"].some(k => q.includes(k))) {
            const prefix = (q.includes("morning") || q.includes("gm")) ? "Good morning! ☀️ " : (q.includes("afternoon") ? "Good afternoon! 🌤️ " : (q.includes("evening") ? "Good evening! 🌆 " : ""));
            return {
                reply: `${prefix}I'm doing really well, thank you so much for asking! 😊 My day has been going great. How about you? How is your day going? Are you working a busy shift at the hospital today or taking things easy?`,
                category_tag: "General",
                recommended_action: "Stay positive, drink water, and have a wonderful day!",
                suggested_followups: [
                    "I'm having a busy shift today",
                    "Which bin do used plastic syringes go into?",
                    "What is the emergency protocol for a needle-stick injury?"
                ],
                engine: "MedWaste Conversational AI"
            };
        }

        // B. Good Morning
        if (["good morning", "morning", "mornin", "gm"].some(k => q.includes(k))) {
            return {
                reply: "Good morning! ☀️ Hope your day is off to a wonderful start! How is your day going so far? Let me know if you need any help with waste segregation, hospital protocols, or anything around the ward today. Wishing you a smooth, safe, and productive day ahead! 😊",
                category_tag: "General",
                recommended_action: "Have a wonderful, safe, and productive morning!",
                suggested_followups: [
                    "How are you doing today?",
                    "Where do used plastic syringes go?",
                    "What is the 48-hour waste storage rule?"
                ],
                engine: "MedWaste Conversational AI"
            };
        }

        // C. Good Afternoon
        if (["good afternoon", "afternoon"].some(k => q.includes(k))) {
            return {
                reply: "Good afternoon! 🌤️ Hope you're having a pleasant and productive day. How is your shift or workday going so far? I'm right here if you need a quick hand with clinical waste sorting, storage rules, or anything else today!",
                category_tag: "General",
                recommended_action: "Stay energized and have a great afternoon!",
                suggested_followups: [
                    "How are you doing?",
                    "What belongs in the Yellow biohazard bag?",
                    "What PPE is required for waste handling?"
                ],
                engine: "MedWaste Conversational AI"
            };
        }

        // D. Good Evening / Good Night
        if (["good evening", "evening"].some(k => q.includes(k))) {
            return {
                reply: "Good evening! 🌆 Hope you had a fulfilling day today. How are things winding down for you? Feel free to ask if you're wrapping up ward duties, checking storage logs, or just checking in!",
                category_tag: "General",
                recommended_action: "Wishing you a calm and peaceful evening!",
                suggested_followups: [
                    "How was your day?",
                    "What is the 48-hour waste storage rule?",
                    "What goes into the White sharps container?"
                ],
                engine: "MedWaste Conversational AI"
            };
        }

        if (["good night", "goodnight"].some(k => q.includes(k))) {
            return {
                reply: "Good night! 🌙 Wishing you a peaceful and restful night! If you're on the night shift, stay safe, alert, and take good care of yourself. I'm always here if you need any guidance!",
                category_tag: "General",
                recommended_action: "Have a restful night and stay safe on night shifts!",
                suggested_followups: [
                    "What is the emergency protocol for a needle stick?",
                    "Where do plastic IV sets go?",
                    "Tell me a joke"
                ],
                engine: "MedWaste Conversational AI"
            };
        }

        // E. Casual Greetings
        if (q.match(/^(hi+|hello+|hey+|heya|namaste|yo|greetings)\b/)) {
            return {
                reply: "Hey there! 👋 It's great to see you! How are you doing today? How's your day going so far?\n\nWhether you have a quick question about waste segregation, need an emergency protocol, or just want to chat, I'm right here with you! What's on your mind today?",
                category_tag: "General",
                recommended_action: "Feel free to ask any question or chat anytime.",
                suggested_followups: [
                    "How are you doing?",
                    "Which bin do used syringes go into?",
                    "What is the emergency protocol for a needle-stick injury?"
                ],
                engine: "MedWaste Conversational AI"
            };
        }

        // F. Work Shift Feelings & Empathy
        if (["tired", "exhausted", "busy day", "stressful", "hectic", "rough day", "hard shift", "long day", "tough day", "overwhelmed"].some(w => q.includes(w))) {
            return {
                reply: "Oh, hang in there! 💙 Healthcare and hospital work can be so demanding and mentally draining. Please remember to take a short breather, drink some water, and give yourself credit for the incredible work you do keeping people safe every single day! 💪\n\nIs there anything I can help you with right now to take some load off your shoulders?",
                category_tag: "General",
                recommended_action: "Take a 5-minute breather and remember to stay hydrated!",
                suggested_followups: [
                    "Where do used plastic syringes go?",
                    "What is the 48-hour waste storage rule?",
                    "Tell me a joke"
                ],
                engine: "MedWaste Conversational AI"
            };
        }

        // G. User doing good
        if (["i'm good", "im good", "doing well", "doing good", "all good", "i am good", "fine thanks", "great thanks", "doing fine"].some(k => q.includes(k))) {
            return {
                reply: "That's wonderful to hear! 😊 So glad to know you're doing well today. Is there anything on your mind I can help you with—whether it's checking a waste bin rule, collection schedule, or safety precaution?",
                category_tag: "General",
                recommended_action: "Let me know whenever you have any question or need help!",
                suggested_followups: [
                    "Which bin do used plastic syringes go into?",
                    "What is the needle-stick injury emergency SOP?",
                    "What is the 48-hour waste storage rule?"
                ],
                engine: "MedWaste Conversational AI"
            };
        }

        // H. Short confirmations
        if (["ok", "okay", "alright", "got it", "cool", "sure", "yep", "yes", "gotcha"].includes(q)) {
            return {
                reply: "Sounds great! 👍 I'm right here whenever you need anything. Wishing you a safe and smooth rest of your day!",
                category_tag: "General",
                recommended_action: "Ask anytime if you need more information.",
                suggested_followups: [
                    "Where do used plastic syringes go?",
                    "What belongs in the Yellow biohazard bag?",
                    "What is the emergency protocol for a needle stick?"
                ],
                engine: "MedWaste Conversational AI"
            };
        }

        // I. Gratitude & Compliments
        if (["thank you", "thanks", "thx", "appreciate it", "awesome", "good job", "great job", "you're great", "you are great", "you're awesome", "you are awesome", "cool", "love you", "nice bot", "good bot"].some(k => q.includes(k))) {
            return {
                reply: "You're so very welcome! 🥰 It really makes my day to know I could help you out! Thank you for the kind words. How is the rest of your day looking? Let me know whenever you need anything else!",
                category_tag: "General",
                recommended_action: "Always here and happy to support you!",
                suggested_followups: [
                    "How's your day going?",
                    "What are the 4 main color-coded waste streams?",
                    "What is the emergency protocol for a needle stick?"
                ],
                engine: "MedWaste Conversational AI"
            };
        }

        // J. Farewells
        if (["bye", "goodbye", "good bye", "see you", "cya", "take care", "talk later", "ttyl", "see ya"].some(k => q.includes(k))) {
            return {
                reply: "Goodbye for now! 👋 It was wonderful chatting with you. Have a fantastic rest of your day, take care of yourself, and stay safe out there! Come back anytime!",
                category_tag: "General",
                recommended_action: "Stay safe and have a wonderful day ahead!",
                suggested_followups: [
                    "Good morning!",
                    "How are you doing today?",
                    "What is the 48-hour waste storage rule?"
                ],
                engine: "MedWaste Conversational AI"
            };
        }

        // K. Jokes & Humor
        if (["joke", "funny", "make me laugh", "humor"].some(k => q.includes(k))) {
            return {
                reply: "Here's a light one for you! 😄\n\n*Why did the recycling bin break up with the trash can?*\n**Because it felt like their relationship was just going to waste!** 🗑️💚\n\nHope that brought a little smile to your day! How are things going with you today?",
                category_tag: "General",
                recommended_action: "Keep smiling and have a wonderful day!",
                suggested_followups: [
                    "Tell me another joke",
                    "How are you doing today?",
                    "Where do used plastic syringes go?"
                ],
                engine: "MedWaste Conversational AI"
            };
        }

        // L. Identity & Purpose
        if (["who are you", "what are you", "what can you do", "are you human", "are you a bot", "are you ai", "what is your name", "your name", "help me"].some(k => q.includes(k))) {
            return {
                reply: "I'm **MedWaste AI**—your friendly digital companion and healthcare waste guide! 🤖✨\n\nWhile I am an AI, I love chatting just like a friendly human colleague on your hospital team. You can talk to me casually, ask me how my day is going, or consult me on serious hospital topics like waste segregation (Yellow, Red, White, Blue bins), emergency needle-stick SOPs, and CPCB regulations.\n\nHow are you doing today? How can I help make your day a little easier?",
                category_tag: "General",
                recommended_action: "Chat casually or ask about biomedical waste protocols.",
                suggested_followups: [
                    "Good morning! How are you?",
                    "Which bin do used syringes go into?",
                    "What is the emergency protocol for a needle stick?"
                ],
                engine: "MedWaste Conversational AI"
            };
        }
    }

    // 3. WHY / HAZARDS
    if ((q.includes("why") || q.includes("importance") || q.includes("hazard") || q.includes("risk") || q.includes("danger")) && 
        (q.includes("segregate") || q.includes("segregation") || q.includes("biomedical") || q.includes("waste") || q.includes("separate"))) {
        return {
            reply: "### Why Proper Biomedical Waste Segregation is Crucial:\n\n1. **Infection & Disease Transmission:** Untreated medical waste can transmit bloodborne pathogens like **Hepatitis B (HBV)**, **Hepatitis C (HCV)**, and **HIV** to hospital staff, waste handlers, and the public.\n2. **Toxic Emissions:** If chlorinated plastics (like PVC tubing) are accidentally incinerated with Yellow waste, they release **Dioxins and Furans**, which are potent environmental carcinogens.\n3. **Preventing Illegal Reuse:** Unsegregated plastic syringes and needles can be scavenged, illicitly repackaged, and resold without sterilization.\n4. **Worker Safety:** Exposed sharps in general bags cause accidental punctures and severe injuries to sanitation staff.\n5. **Economic Efficiency:** Only **15%** of hospital waste is hazardous. Proper segregation prevents treating 85% of general waste as biohazardous, saving significant incineration costs.",
            category_tag: "Educational",
            recommended_action: "Segregate strictly at source to prevent infectious disease spread and toxic emissions.",
            suggested_followups: [
                "What are the 4 main color-coded streams?",
                "What happens if needles are placed in the Red bin?",
                "What is the legal penalty for improper segregation?"
            ],
            engine: "MedWaste Neural Reasoner"
        };
    }

    // 4. WHAT IF: MISTAKES & SCENARIOS
    if (q.includes("what if") || q.includes("accidentally") || q.includes("wrong bin") || q.includes("mistake") || q.includes("recap") || q.includes("overflow") || q.includes("overfill")) {
        // Needle in wrong bin
        if ((q.includes("needle") || q.includes("sharp")) && (q.includes("red") || q.includes("yellow") || q.includes("plastic"))) {
            return {
                reply: "⚠️ **CRITICAL HAZARD: Needle Placed in Wrong Bin (Red or Yellow)**\n\n- **Why it is Dangerous:** Red bin waste goes to autoclaving and mechanical granulators/shredders. A loose steel needle will damage shredding machinery and poses an extreme puncture/infection risk to plastic recycling plant workers.\n- **Immediate Corrective Action:**\n  1. Don heavy-duty puncture-resistant utility gloves and a face shield.\n  2. **Do NOT reach in with bare hands.** Use forceps or tongs to carefully extract the needle.\n  3. Immediately deposit the needle into the **White Translucent Puncture-Proof Container**.\n  4. Document the incident as a near-miss safety violation in the ward logbook.",
                category_tag: "Emergency",
                recommended_action: "Use tongs to extract needle; place into White sharps box; report near-miss.",
                suggested_followups: [
                    "What is the proper procedure for needle disposal?",
                    "Where do plastic syringes without needles go?",
                    "What is the needle-stick injury emergency SOP?"
                ],
                engine: "MedWaste Neural Reasoner"
            };
        }

        // Infectious waste in general municipal bin
        if (["yellow", "blood", "gauze", "cotton", "infectious"].some(w => q.includes(w)) && ["general", "black", "green", "municipal"].some(w => q.includes(w))) {
            return {
                reply: "🚨 **CRITICAL VIOLATION: Infectious Waste in General Municipal Bin**\n\n- **Consequences:** Mixing infectious blood-soaked items into municipal trash contaminates city garbage trucks and landfills, creating widespread public health risks and violating the Environment (Protection) Act 1986.\n- **Corrective Protocol:**\n  1. Cordon off the bin.\n  2. Don full PPE (nitrile gloves, N95 mask, fluid apron).\n  3. Transfer the contaminated items using tongs into a **Yellow Non-Chlorinated Biohazard Bag**.\n  4. Disinfect the general bin using **1% Sodium Hypochlorite solution**.\n  5. Re-educate ward staff on strict source segregation.",
                category_tag: "Emergency",
                recommended_action: "Transfer contaminated waste into Yellow bag with tongs; disinfect general bin with 1% hypochlorite.",
                suggested_followups: [
                    "What items belong in the Yellow bag?",
                    "What are the penalties under BMWM Rules 2016?",
                    "How to clean up a blood spill?"
                ],
                engine: "MedWaste Neural Reasoner"
            };
        }

        // Overflowing bin
        if (["overflow", "full", "overfilled", "capacity", "spilling"].some(w => q.includes(w))) {
            return {
                reply: "⚠️ **OVERFLOWING BIN PROTOCOL**\n\n- **The Rule:** Biohazard bags must **never exceed 3/4 capacity (75%)**.\n- **Action Required:**\n  1. **NEVER push, stomp, or compress** the waste with hands or feet to make room.\n  2. Immediately seal the overfilled bag using a zip-tie or double knot.\n  3. Affix the CPCB Barcode label.\n  4. Place a fresh replacement liner in the bin.\n  5. Request an immediate collection dispatch via MedWaste AI.",
                category_tag: "Collection",
                recommended_action: "Never compress waste; seal tightly at 3/4 full and request collection.",
                suggested_followups: [
                    "What is the 48-hour waste storage rule?",
                    "How do I schedule a pickup?",
                    "What PPE is needed when tying waste bags?"
                ],
                engine: "MedWaste Neural Reasoner"
            };
        }

        // Recapping needles
        if (q.includes("recap")) {
            return {
                reply: "🚫 **STRICTLY PROHIBITED: Recapping Needles by Hand**\n\n- **The Risk:** Over **80% of accidental needle-stick injuries** in hospitals occur while trying to put the plastic cap back on a used needle.\n- **Regulatory Mandate (CPCB):** Recapping with two hands is strictly banned.\n- **Correct Handling:**\n  1. Destroy the needle hub immediately after injection using an electric needle burner or mechanical hub cutter at point-of-use.\n  2. If recapping is absolutely mandatory for blood gas sampling, use the **Single-Handed 'Scoop' Technique** only.\n  3. Drop directly into the **White Puncture-Proof Sharps Box**.",
                category_tag: "White",
                recommended_action: "Never recap needles by hand. Use electric needle burner or hub cutter immediately.",
                suggested_followups: [
                    "What is the single-handed scoop technique?",
                    "What is the emergency protocol for a needle-stick injury?",
                    "What belongs in the White sharps container?"
                ],
                engine: "MedWaste Neural Reasoner"
            };
        }
    }

    // 5. NEEDLE-STICK
    if (q.includes("needle stick") || q.includes("needlestick") || q.includes("prick") || q.includes("sharp injury") || q.includes("punctured") || q.includes("pricked") || q.includes("cut by blade")) {
        return {
            reply: "🚨 **EMERGENCY PROTOCOL: Needle-Stick / Sharps Injury**\n\n1. **Immediate Irrigation:** Wash the puncture wound immediately under cool running tap water with mild soap for at least **5 minutes**.\n2. **DO NOT Squeeze or Suck:** Never squeeze the wound or suck it with your mouth; this creates localized pressure and tissue trauma.\n3. **Disinfect & Cover:** Pat dry with sterile gauze and apply a sterile waterproof bandage.\n4. **Report Instantly:** Notify the Nursing Supervisor and Infection Control Officer immediately.\n5. **Post-Exposure Prophylaxis (PEP):** Must be evaluated and initiated within **2 hours** for HIV and Hepatitis B baseline testing.",
            category_tag: "Emergency",
            recommended_action: "Wash under running water for 5 min. Report within 2 hours for PEP.",
            suggested_followups: [
                "What PPE is required for handling sharps?",
                "Where should hypodermic needles be disposed?",
                "How do I manage a blood spill?"
            ],
            engine: "MedWaste Neural Reasoner"
        };
    }

    // 6. SPILL
    if (["spill", "leak", "hypochlorite", "vomit", "vomited", "fluid on floor"].some(k => q.includes(k)) ||
        (["blood", "urine", "body fluid", "pus"].some(b => q.includes(b)) && ["floor", "clean", "drop", "wipe", "puddle", "flow", "spill", "ward"].some(w => q.includes(w)))) {
        return {
            reply: "⚠️ **CLINICAL BLOOD & FLUID SPILL MANAGEMENT**\n\n1. **Cordon Off:** Mark the spill perimeter to prevent foot traffic.\n2. **Don PPE:** Wear heavy nitrile gloves, eye protection/face shield, and fluid-resistant apron.\n3. **Contain Spill:** Cover the liquid spill with absorbent paper towels to contain spread.\n4. **Disinfect:** Flood paper towels with freshly prepared **1% Sodium Hypochlorite solution** (10,000 ppm available chlorine).\n5. **Contact Time:** Allow exactly **20 minutes** for viral inactivation (HIV, HBV, HCV).\n6. **Disposal:** Scoop soaked towels with forceps/dustpan into a **Yellow Biohazard Bag**.\n7. **Mop:** Clean area with neutral hospital disinfectant.",
            category_tag: "Emergency",
            recommended_action: "Apply absorbent towels + 1% Sodium Hypochlorite for 20 minutes.",
            suggested_followups: [
                "Which bin does soiled gauze go into?",
                "What PPE is mandatory for waste handlers?",
                "What is the 48-hour waste storage rule?"
            ],
            engine: "MedWaste Neural Reasoner"
        };
    }

    // 7. MERCURY
    if (q.includes("mercury") || q.includes("thermometer") || q.includes("sphygmomanometer")) {
        return {
            reply: "☣️ **SPECIAL PROTOCOL: Mercury Spill Management**\n\n- **CRITICAL WARNING:** **NEVER incinerate or autoclave mercury.** Mercury vaporizes into an odorless, neurotoxic heavy metal gas.\n- **NEVER put mercury in biohazard bags or down the drain.**\n- **Spill Handling Steps:**\n  1. Evacuate pregnant women and non-essential staff; ventilate the room.\n  2. Put on nitrile gloves (never use a vacuum cleaner).\n  3. Use two stiff cardboard pieces or an eyedropper to collect beads together.\n  4. Place mercury droplets into an airtight plastic container containing a layer of water or oil to suppress vapors.\n  5. Seal, label as **'Hazardous Mercury Waste'**, and route to an authorized hazardous waste treatment facility.",
            category_tag: "Emergency",
            recommended_action: "Collect beads with cardboard into sealed water container; never incinerate or vacuum.",
            suggested_followups: [
                "Where do broken glass thermometer parts go?",
                "What are the toxic risks of mercury vapors?",
                "What items go into the Blue container?"
            ],
            engine: "MedWaste Neural Reasoner"
        };
    }

    // 8. RED BIN
    if (q.includes("syringe") || q.includes("iv set") || q.includes("iv tube") || q.includes("catheter") || q.includes("urine bag") || q.includes("dialysis")) {
        return {
            reply: "🔴 **RED BIN: Contaminated Recyclable Plastics**\n\n- **Categorized Items:** Disposable plastic syringes (WITHOUT needles), IV infusion tubing sets, urinary catheters, drainage urine bags, dialysis kits, and plastic specimen vacutainers.\n- **Point-of-Use Preparation:**\n  1. The metal needle MUST be cut off at the hub using a needle destroyer or cutter before disposal.\n  2. Drain all residual urine, IV fluids, or blood into sanitary sewage before bagging.\n- **Treatment Method:** Autoclaving (121°C @ 15 psi) or microwaving, followed by mechanical shredding and polymer recycling by state-authorized recyclers.",
            category_tag: "Red",
            recommended_action: "Cut needle hub at point-of-use; drain fluids; place plastic body into RED bin.",
            suggested_followups: [
                "Where do needle tips and scalpels go?",
                "What happens to shredded plastic after autoclaving?",
                "What items go into the Yellow bin?"
            ],
            engine: "MedWaste Neural Reasoner"
        };
    }

    // 9. SHARPS WHITE
    if (q.includes("needle") || q.includes("sharp") || q.includes("scalpel") || q.includes("blade") || q.includes("lancet")) {
        return {
            reply: "⚪ **WHITE TRANSLUCENT CONTAINER: Contaminated Sharps**\n\n- **Categorized Items:** Hypodermic needles, fixed-needle syringes, surgical scalpel blades, suture needles, lancets, and broken glass ampoule tips.\n- **Container Specifications:** Rigid, puncture-proof, leak-proof, tamper-evident white translucent box.\n- **Essential Handling Rules:**\n  - **NEVER recap needles by hand.**\n  - Do not bend, shear, or break needles manually.\n  - Fill strictly up to **3/4 capacity** (never overfill).\n  - Permanently engage the tamper-proof lid before handoff.\n- **Final Disposal:** Autoclaving or dry-heat sterilization followed by encapsulation in cement or deep sharp-pit burial.",
            category_tag: "White",
            recommended_action: "Drop directly into WHITE puncture-proof container without recapping.",
            suggested_followups: [
                "What is the first aid for needle-stick injuries?",
                "Where do used plastic syringes go?",
                "What goes into the Blue container?"
            ],
            engine: "MedWaste Neural Reasoner"
        };
    }

    // 10. BLUE BOX
    if (q.includes("glass") || q.includes("ampoule") || q.includes("vial") || q.includes("implant") || q.includes("screw") || q.includes("plate") || q.includes("pin")) {
        return {
            reply: "🔵 **BLUE BOX: Glassware & Metallic Implants**\n\n- **Categorized Items:** Broken or intact medicine glass vials, antibiotic ampoules, microscope glass slides, glass flasks, and contaminated metallic orthopedic implants (pins, screws, plates, intramedullary rods).\n- **Handling SOP:**\n  - Never pick up broken glass shards with bare or gloved hands; always use forceps, tongs, or a dustpan brush.\n  - Cardboard or blue boxes must have reinforced puncture-resistant bottoms.\n- **Pre-treatment & Recycling:** Disinfection with 1-2% sodium hypochlorite soak or autoclaving, followed by industrial glass crushing and metal recycling.",
            category_tag: "Blue",
            recommended_action: "Use forceps to place glass vials and metal implants into BLUE box.",
            suggested_followups: [
                "Where do expired medicines go?",
                "What goes into the Yellow bag?",
                "What is the collection frequency for biomedical waste?"
            ],
            engine: "MedWaste Neural Reasoner"
        };
    }

    // 11. YELLOW BAG
    if (q.includes("yellow") || q.includes("cotton") || q.includes("gauze") || q.includes("bandage") || q.includes("dressing") || q.includes("placenta") || q.includes("tissue") || q.includes("diaper") || q.includes("pathology")) {
        return {
            reply: "🟡 **YELLOW BAG: Infectious & Anatomical Waste**\n\n- **Categorized Items:** Human anatomical waste (tissues, organs, placentas, biopsy specimens), blood-soaked gauze, soiled cotton dressings, diapers soiled with infectious bodily fluids, pus swabs, plaster casts, microbiology culture plates, soiled paper masks, and expired cytotoxic medicines.\n- **Liner Specifications:** Certified non-chlorinated yellow plastic bags bearing the prominent international biohazard symbol.\n- **Storage Limit:** Must be incinerated within **48 hours** under CPCB regulations.\n- **Treatment Method:** Double-chamber high-temperature incineration (primary chamber 800°C ± 50°C, secondary chamber 1050°C ± 50°C with 2-second retention time) or plasma pyrolysis.",
            category_tag: "Yellow",
            recommended_action: "Tie non-chlorinated yellow bag securely at 3/4 full; route for high-temp incineration.",
            suggested_followups: [
                "Where do plastic IV bags and syringes go?",
                "What is the maximum time waste can be stored?",
                "What PPE is needed for handling Yellow bags?"
            ],
            engine: "MedWaste Neural Reasoner"
        };
    }

    // 12. CYTOTOXIC
    if (q.includes("chemo") || q.includes("cytotoxic") || q.includes("oncology") || q.includes("cancer")) {
        return {
            reply: "🟣 **CYTOTOXIC & ONCOLOGY DRUG WASTE (Purple / Yellow with Cytotoxic Emblem)**\n\n- **Hazard Profile:** Mutagenic, teratogenic, and carcinogenic.\n- **Categorized Items:** Expired chemotherapy vials, infused IV tubing, contaminated gloves, gowns, and patient excreta/vomitus within 48 hours of chemotherapy administration.\n- **Segregation:** Dedicated heavy-duty purple or yellow bags labeled with the prominent Cytotoxic hazard symbol.\n- **Precautions:** Double-glove with chemotherapy-tested nitrile gloves, wear impermeable gown and face shield. Prepare under Class II Biosafety Cabinets.\n- **Treatment:** High-temperature incineration at minimum **1200°C**.",
            category_tag: "Cytotoxic",
            recommended_action: "Double-glove, use Purple cytotoxic bags, and incinerate at >1200°C.",
            suggested_followups: [
                "What is the spill procedure for chemotherapy drugs?",
                "Where do non-hazardous hospital items go?",
                "What PPE is mandatory in hospital wards?"
            ],
            engine: "MedWaste Neural Reasoner"
        };
    }

    // 13. RULES & PENALTIES
    if (q.includes("rule") || q.includes("law") || q.includes("penalty") || q.includes("fine") || q.includes("cpcb") || q.includes("spcb") || q.includes("legal")) {
        return {
            reply: "⚖️ **REGULATORY COMPLIANCE: Bio-Medical Waste Management Rules 2016**\n\n- **Governing Law:** Issued under the **Environment (Protection) Act, 1986** by the Ministry of Environment, Forest and Climate Change (MoEFCC).\n- **Mandatory Duties of Healthcare Facilities:**\n  - Obtain official authorization from the State Pollution Control Board (SPCB).\n  - Ensure 100% source segregation into color-coded containers.\n  - Implement Barcode and RFID tagging on every bag.\n  - Submit the Annual Compliance Report by **June 30th** every year.\n  - Immunize all healthcare and waste workers against Hepatitis B and Tetanus.\n- **Legal Penalties (Section 15, EPA 1986):** Non-compliance or unauthorized dumping can result in **imprisonment up to 5 years** and/or fines up to **₹1,00,000**, with facility closure orders.",
            category_tag: "Regulatory",
            recommended_action: "Ensure valid SPCB authorization, 100% barcoding, and annual report filing.",
            suggested_followups: [
                "What is the 48-hour waste storage rule?",
                "What is the mandatory immunization for waste handlers?",
                "What are the 4 main color categories of waste?"
            ],
            engine: "MedWaste Neural Reasoner"
        };
    }

    // 14. TREATMENT (AUTOCLAVE, INCINERATOR)
    if (q.includes("autoclave") || q.includes("incinerat") || q.includes("shredder") || q.includes("microwave")) {
        return {
            reply: "⚙️ **TREATMENT & DESTRUCTION TECHNOLOGIES**\n\n- **Incineration (Yellow Waste):** Double-chamber thermal destruction. Primary chamber operates at **800°C ± 50°C** for gasification; secondary chamber operates at **1050°C ± 50°C** with 2-second gas retention to destroy dioxins/furans. Flue gas scrubbers neutralize acidic gases.\n- **Autoclaving (Red Waste):** Pressurized saturated steam sterilization at **121°C @ 15 psi for 30 min** (or 135°C @ 31 psi for 15 min). Validated with *Geobacillus stearothermophilus* spore testing.\n- **Mechanical Shredding:** Destroys sterilized plastics and sharps into unidentifiable granules to prevent reuse.\n- **Encapsulation (White Sharps):** Sharps boxes are filled with 1:2 cement-lime mortar, solidified into impermeable blocks, and sent to secured landfills.",
            category_tag: "Educational",
            recommended_action: "Ensure continuous validation of autoclave spore indicators and incinerator CEMS.",
            suggested_followups: [
                "Why can't chlorinated plastics be incinerated?",
                "What belongs in the Yellow bin vs Red bin?",
                "What is the 48-hour waste storage rule?"
            ],
            engine: "MedWaste Neural Reasoner"
        };
    }

    // 15. LOGISTICS, STORAGE & CPCB 48-HOUR RULE
    if (["collection", "storage", "48 hour", "48hr", "pickup", "transport", "cbwtf", "barcode", "rfid", "schedule", "truck", "van"].some(k => q.includes(k))) {
        return {
            reply: "🚛 **BIOMEDICAL WASTE COLLECTION & LOGISTICS PROTOCOLS**\n\n1. **The 48-Hour CPCB Rule:** Untreated biomedical waste must **never be stored beyond 48 hours**. If collection is delayed due to an emergency, the facility must inform the State Pollution Control Board and keep waste in cool refrigerated storage.\n2. **CPCB Barcoding Mandate:** Every biohazard bag and sharps box must bear a unique GPS-traceable Barcode label and RFID tag to record origin ward, weight, and handoff timestamp.\n3. **Internal Transport:** Use covered, dedicated wheeled trolleys marked with biohazard symbols. Never drag or transport bags manually along general patient pathways.\n4. **CBWTF Hand-off:** Registered Central Treatment Facilities send GPS-monitored vehicles to weigh and log each barcoded consignment.",
            category_tag: "Collection",
            recommended_action: "Ensure bag barcoding and CBWTF collection within 48 hours.",
            suggested_followups: [
                "How do I schedule a pickup on MedWaste AI?",
                "What are the penalties for delayed waste collection?",
                "What are the 4 main color categories of waste?"
            ],
            engine: "MedWaste Neural Reasoner"
        };
    }

    // 16. PPE & CLINICAL SAFETY CHECKLISTS
    if (["ppe", "precaution", "safety", "protect", "immuniz", "hepatitis b vaccine", "glove", "mask"].some(k => q.includes(k))) {
        return {
            reply: "🛡️ **MANDATORY PPE CHECKLIST & CLINICAL PRECAUTIONS**\n\n1. **Gloves:** Double nitrile gloves for patient procedures; heavy-duty puncture-resistant utility gloves for waste handling.\n2. **Masks:** N95 particulate respirator or 3-ply surgical mask.\n3. **Body:** Fluid-impermeable long-sleeve gown or rubber apron.\n4. **Eyes & Face:** Goggles or full-face splash shield.\n5. **Footwear:** Closed-toe heavy rubber gumboots.\n6. **Mandatory Worker Protection:** Complete **Hepatitis B vaccination (3 doses)** and **Tetanus Toxoid booster** are legally mandatory for all staff handling medical waste.",
            category_tag: "Precautions",
            recommended_action: "Always don full PPE and ensure complete Hepatitis B vaccination.",
            suggested_followups: [
                "What is the emergency protocol for a needle-stick injury?",
                "How to manage an accidental blood spill?",
                "What items belong in the Yellow biohazard bag?"
            ],
            engine: "MedWaste Neural Reasoner"
        };
    }

    // 17. DYNAMIC CONTEXTUAL FALLBACK (Subject-specific)
    const words = q.split(/\s+/).filter(w => w.length > 2 && !["the","this","that","what","which","how","where","can","should","about","for","into","with","does"].includes(w));
    const subject = words.slice(0, 3).join(" ") || raw_q;

    return {
        reply: `Regarding your inquiry on **'${subject}'**:\n\nTo determine the correct handling under the **Bio-Medical Waste Management Rules 2016**:\n- **If it is an infectious anatomical or soiled item (cotton/gauze):** Place into **Yellow Non-Chlorinated Biohazard Bag**.\n- **If it is recyclable contaminated plastic (IV tube/catheter/syringe without needle):** Place into **Red Container**.\n- **If it is a metal sharp (needle/scalpel/blade):** Drop immediately into **White Puncture-Proof Sharps Box**.\n- **If it is broken glass or metal implant (vials/ampoules/pins):** Deposit into **Blue-marked Container**.\n- **If it is clean municipal waste (paper/food):** Place into **Black or Green General Bins**.\n\nCould you specify whether this item is contaminated with blood, what material it is made of, or what clinical procedure it was used in?`,
        category_tag: "General",
        recommended_action: `Verify material and contamination level of '${subject}' before disposal.`,
        suggested_followups: [
            "Which bin do used plastic syringes go into?",
            "What is the needle-stick injury emergency SOP?",
            "What is the 48-hour waste storage rule?"
        ],
        engine: "MedWaste Neural Reasoner"
    };
}
