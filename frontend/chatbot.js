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
            reply: "Hello! I am your **MedWaste AI Clinical Specialist**. You can ask me anything about hospital waste segregation (Red, Blue, Yellow, White, Black/Green bins), clinical item handling, emergency SOPs, or healthcare safety protocols.",
            category_tag: "General",
            recommended_action: "Ask any question about waste bins, hospital items, or emergency procedures.",
            suggested_followups: [
                "What goes into the Blue or Red bin?",
                "Which bin do used plastic syringes go into?",
                "What is the emergency first-aid for a needle-stick injury?"
            ],
            engine: "MedWaste AI Cognitive Reasoner"
        };
    }

    // -------------------------------------------------------------
    // 1. GREETINGS & CASUAL SOCIAL CONVERSATION (HUMAN-LIKE)
    // -------------------------------------------------------------
    const pureGreeting = (
        Boolean(q.match(/^(hi+|hello+|hey+|namaste|yo|heya|howdy|greetings)\b/)) &&
        q.split(/\s+/).length <= 4 &&
        !["bin", "waste", "needle", "syringe", "plastic", "glass", "blood", "red", "blue", "yellow", "white", "black", "green"].some(w => q.includes(w))
    );

    if (pureGreeting) {
        return {
            reply: "Hey there! 👋 It's wonderful to connect with you! How are you doing today? How is your day or hospital shift going so far?\n\nWhether you need help sorting waste bins (like Red vs Blue), checking an emergency protocol, or just chatting, I'm right here with you! What can I help you with?",
            category_tag: "General",
            recommended_action: "Feel free to ask any question or chat anytime.",
            suggested_followups: [
                "What goes into the Blue or Red bin?",
                "How are you doing today?",
                "Where do used plastic syringes go?"
            ],
            engine: "MedWaste AI Conversational Engine"
        };
    }

    // "How are you" / "How is your day"
    if (["how are you", "how r u", "how is your day", "how's your day", "hows your day", "how are things", "how's it going", "how is it going", "what's up", "whats up", "wassup", "how do you do"].some(k => q.includes(k)) &&
        !["bin", "waste", "needle", "glass", "red", "blue", "yellow"].some(w => q.includes(w))) {
        const prefix = (q.includes("morning") || q.includes("gm")) ? "Good morning! ☀️ " : (q.includes("afternoon") ? "Good afternoon! 🌤️ " : (q.includes("evening") ? "Good evening! 🌆 " : ""));
        return {
            reply: `${prefix}I'm doing really well, thank you so much for asking! 😊 My day has been going great. How about you? How is your day going? Are you working a busy shift at the clinic or hospital today, or taking things easy?`,
            category_tag: "General",
            recommended_action: "Stay positive, drink water, and have a wonderful day!",
            suggested_followups: [
                "I'm having a busy hospital shift today",
                "What goes into the Blue or Red bin?",
                "What is the emergency protocol for a needle-stick injury?"
            ],
            engine: "MedWaste AI Conversational Engine"
        };
    }

    // Empathy for hard shift / fatigue
    if (["tired", "exhausted", "busy day", "stressful", "hectic", "rough day", "hard shift", "long day", "tough day", "overwhelmed"].some(w => q.includes(w))) {
        return {
            reply: "Oh, hang in there! 💙 Working in healthcare and clinical environments can be mentally and physically demanding. Please remember to take a short breather, drink some water, and give yourself credit for the vital work you do keeping patients and staff safe every single day! 💪\n\nIs there anything I can help you with right now to take some load off your shoulders?",
            category_tag: "General",
            recommended_action: "Take a 5-minute breather and stay hydrated!",
            suggested_followups: [
                "What goes into the Blue or Red bin?",
                "Tell me a joke to cheer me up",
                "Where do used plastic syringes go?"
            ],
            engine: "MedWaste AI Conversational Engine"
        };
    }

    // Identity / Capabilities
    if (["who are you", "what are you", "what can you do", "are you human", "are you a bot", "are you ai", "what is your name", "your name"].some(k => q.includes(k))) {
        return {
            reply: "I'm **MedWaste AI**—your intelligent clinical AI companion and biomedical waste specialist! 🤖✨\n\nI'm designed to think through hospital scenarios and guide you naturally just like an experienced clinical colleague. You can ask me:\n- Detailed bin segregation (**Red, Blue, Yellow, White, Black/Green, Cytotoxic**)\n- Multi-bin comparisons (like *'What goes into the Blue or Red bin?'*)\n- How to dispose of specific items (syringes, glass vials, IV sets, expired medicines, pizza boxes)\n- Emergency protocols (needle sticks, blood spills, chemical leaks)\n- Scientific explanations (*'Why can't needles go into the red bin?'*)\n\nHow can I help you right now?",
            category_tag: "General",
            recommended_action: "Ask any question about waste bins, hospital items, or emergency procedures.",
            suggested_followups: [
                "What goes into the Blue or Red bin?",
                "What is the first-aid for a needle-stick injury?",
                "Where do expired medicines go?"
            ],
            engine: "MedWaste AI Conversational Engine"
        };
    }

    // Jokes / Humor
    if (["joke", "funny", "make me laugh", "humor"].some(k => q.includes(k))) {
        return {
            reply: "Here's a light healthcare one for you! 😄\n\n*Why did the recycling bin break up with the trash can?*\n**Because it felt like their relationship was just going to waste!** 🗑️💚\n\nHope that brought a smile to your shift! What else is on your mind?",
            category_tag: "General",
            recommended_action: "Keep smiling and stay energized!",
            suggested_followups: [
                "Tell me another joke",
                "What goes into the Blue or Red bin?",
                "Where do used plastic syringes go?"
            ],
            engine: "MedWaste AI Conversational Engine"
        };
    }

    // Gratitude
    if (["thank you", "thanks", "thx", "appreciate it", "awesome", "great job", "you are great", "you're great"].some(k => q.includes(k))) {
        return {
            reply: "You're so very welcome! 🥰 I'm really glad I could help make things clearer for you. Keep up the fantastic work keeping healthcare clean and safe. Let me know whenever you need anything else!",
            category_tag: "General",
            recommended_action: "Always here and happy to support you!",
            suggested_followups: [
                "What goes into the Blue or Red bin?",
                "What is the emergency protocol for a needle stick?",
                "How is your day going?"
            ],
            engine: "MedWaste AI Conversational Engine"
        };
    }

    // Farewell
    if (["bye", "goodbye", "good bye", "see you", "take care", "talk later"].some(k => q.includes(k))) {
        return {
            reply: "Goodbye for now! 👋 Take care of yourself, stay safe around the ward, and have a wonderful day ahead. Come back whenever you need anything!",
            category_tag: "General",
            recommended_action: "Stay safe and take care!",
            suggested_followups: ["Good morning!", "How are you doing?"],
            engine: "MedWaste AI Conversational Engine"
        };
    }

    // -------------------------------------------------------------
    // 2. EMERGENCY PROTOCOLS & ACCIDENT PROCEDURES
    // -------------------------------------------------------------
    // Needle-stick injury SOP
    if (["needle stick", "needlestick", "prick", "sharp injury", "punctured by needle", "pricked", "cut by blade"].some(k => q.includes(k))) {
        return {
            reply: "🚨 **EMERGENCY FIRST-AID: Needle-Stick / Sharps Injury Protocol**\n\nIf you have suffered an accidental needle-stick puncture, act immediately:\n\n1. **Wash Immediately:** Hold the wound under cool running tap water with soap for at least **5 minutes**.\n2. **DO NOT Squeeze or Suck:** Never squeeze, pinch, or suck the wound. Squeezing creates trauma and can draw virus particles deeper into vascular tissue.\n3. **Disinfect & Cover:** Pat dry with clean gauze and cover with a sterile waterproof adhesive bandage.\n4. **Report Promptly:** Inform your nursing in-charge or Infection Control Officer immediately.\n5. **Initiate PEP (Post-Exposure Prophylaxis):** Evaluation for HIV and Hepatitis B PEP must be started **within 2 hours** of exposure for maximum clinical efficacy.",
            category_tag: "Emergency",
            recommended_action: "Wash under running tap water for 5 minutes; report immediately for PEP within 2 hours.",
            suggested_followups: [
                "What PPE is required for handling sharps?",
                "Where should hypodermic needles be disposed?",
                "What goes into the Blue or Red bin?"
            ],
            engine: "MedWaste AI Cognitive Reasoner"
        };
    }

    // Blood or bodily fluid spill
    if (["spill", "leak", "blood spill", "vomit", "hypochlorite"].some(k => q.includes(k))) {
        return {
            reply: "⚠️ **CLINICAL BLOOD & FLUID SPILL MANAGEMENT SOP**\n\n1. **Cordon Off:** Mark the spill perimeter with warning cones to prevent foot traffic.\n2. **Don PPE:** Put on heavy utility gloves, eye protection/face shield, and a fluid-resistant apron.\n3. **Contain with Paper Towels:** Cover the liquid spill with absorbent paper towels to absorb the liquid and prevent spreading.\n4. **Disinfect with Hypochlorite:** Pour freshly prepared **1% Sodium Hypochlorite solution** (10,000 ppm available chlorine) generously over the towels.\n5. **Wait 20 Minutes:** Allow a mandatory **20-minute contact time** for full viral inactivation (HIV, HBV, HCV).\n6. **Disposal:** Using tongs, scoop soaked towels into a **Yellow Biohazard Bag**.\n7. **Mop & Sanitize:** Mop the area thoroughly with hospital-grade disinfectant.",
            category_tag: "Emergency",
            recommended_action: "Cover spill with towels + 1% Sodium Hypochlorite for 20 minutes; discard in Yellow bag.",
            suggested_followups: [
                "What items go into the Yellow bag?",
                "What PPE is mandatory for waste handlers?",
                "What is the first aid for a needle stick?"
            ],
            engine: "MedWaste AI Cognitive Reasoner"
        };
    }

    // Needle accidentally dropped in Red or Yellow bin (Near-miss)
    if (["needle", "sharp"].some(w => q.includes(w)) && ["wrong bin", "accidentally", "mistake", "dropped in", "dropped into", "mixed into"].some(w => q.includes(w))) {
        return {
            reply: "⚠️ **NEAR-MISS PROTOCOL: Needle Placed in Wrong Bin (Red or Yellow)**\n\n- **Why it is Dangerous:** Red waste goes to autoclaves and mechanical granulators. A metal needle can shatter shredder blades and severely injure recycling plant personnel.\n- **Corrective Action:**\n  1. Don heavy puncture-resistant utility gloves and eye protection.\n  2. **NEVER reach into the bin with bare or gloved hands!**\n  3. Use long forceps or tongs to carefully extract the needle.\n  4. Drop it immediately into the **White Puncture-Proof Sharps Container**.\n  5. Document the incident as an internal safety near-miss in the ward logbook.",
            category_tag: "Emergency",
            recommended_action: "Extract needle using forceps/tongs only; place in White container; log near-miss.",
            suggested_followups: [
                "Where do used plastic syringes go?",
                "What is the first-aid for a needle stick?",
                "What goes into the Blue or Red bin?"
            ],
            engine: "MedWaste AI Cognitive Reasoner"
        };
    }

    // -------------------------------------------------------------
    // 3. "WHY" & SCIENTIFIC REASONING QUESTIONS
    // -------------------------------------------------------------
    // Why can't needles go in red bin?
    if ((q.includes("needle") || q.includes("sharp")) && q.includes("red") && ["why", "cannot", "can't", "not allowed", "prohibit", "never"].some(w => q.includes(w))) {
        return {
            reply: "⚠️ **WHY NEEDLES CAN NEVER GO INTO THE RED BIN**\n\n1. **Severe Worker Puncture Hazard:** Red bin waste travels to recycling facilities where plastic items are sorted and fed into machines. A loose needle inside a Red bag poses an extreme risk of needle-stick injury and Hepatitis B/HIV infection to recycling workers.\n2. **Destruction of Shredding Machinery:** The Red stream goes directly to industrial granulators and rotating blade shredders. Hardened steel hypodermic needles jam, dull, and destroy mechanical shredder blades.\n3. **Regulatory Violation:** Under biomedical waste rules, all sharps must be placed strictly in puncture-proof White translucent containers.\n\n💡 **Proper Method:** Always cut the needle off at the hub using a needle destroyer before placing the plastic syringe barrel in the Red bin!",
            category_tag: "Educational",
            recommended_action: "Never put needles in Red bin; drop into White puncture-proof container.",
            suggested_followups: [
                "What goes into the Blue or Red bin?",
                "What is the emergency first-aid for a needle-stick injury?",
                "What goes into the White sharps container?"
            ],
            engine: "MedWaste AI Cognitive Reasoner"
        };
    }

    // Why can't chlorinated plastics / PVC go in yellow bin?
    if (["chlorinated", "pvc", "plastic"].some(w => q.includes(w)) && q.includes("yellow") && ["why", "cannot", "can't", "not allowed", "burn", "incinerat"].some(w => q.includes(w))) {
        return {
            reply: "🔥 **WHY CHLORINATED PLASTICS (PVC) ARE BANNED FROM YELLOW BAGS**\n\n1. **Dioxins & Furans Emission:** When chlorinated plastics (such as PVC IV tubing or blood bags) are incinerated, the chlorine reacts with organic compounds to produce **polychlorinated dibenzo-p-dioxins (PCDDs) and dibenzofurans (PCDFs)**. These are among the most toxic, carcinogenic environmental pollutants known.\n2. **Acid Gas Formation:** Burning chlorine generates hydrochloric acid (HCl) gas, which corrodes incinerator refractory brickwork and flue systems.\n3. **Proper Segregation:** All recyclable plastics belong in the **Red Bin** for steam sterilization (autoclaving), which uses zero combustion and produces zero dioxins.",
            category_tag: "Educational",
            recommended_action: "Place all plastics into Red bin for autoclaving; never incinerate chlorinated plastics.",
            suggested_followups: [
                "What items belong in the Yellow bag?",
                "What goes into the Red bin?",
                "How does an autoclave work?"
            ],
            engine: "MedWaste AI Cognitive Reasoner"
        };
    }

    // Why is recapping needles prohibited?
    if (q.includes("recap")) {
        return {
            reply: "🚫 **WHY RECAPPING NEEDLES BY HAND IS STRICTLY PROHIBITED**\n\n- **The Danger:** Clinical studies show that **over 80% of accidental needle-stick injuries** occur while healthcare workers attempt to slide the tiny plastic cap back onto a used needle with two hands.\n- **Safety Protocol:**\n  1. Destroy or snip the needle hub immediately using a needle burner or hub cutter at the point of care.\n  2. Drop the needle directly into the **White Puncture-Proof Sharps Box**.\n  3. If recapping is absolutely unavoidable (e.g. arterial blood gas collection), use the **Single-Handed 'Scoop' Technique** only (place cap on table, scoop with needle using one hand, then click in place).",
            category_tag: "White",
            recommended_action: "Never recap needles by hand; drop directly into White sharps box.",
            suggested_followups: [
                "What is the first-aid for a needle-stick injury?",
                "Where do plastic syringes go?",
                "What goes into the Blue or Red bin?"
            ],
            engine: "MedWaste AI Cognitive Reasoner"
        };
    }

    // Why segregate biomedical waste?
    if (["why segregate", "importance of segregation", "why separate", "why is biomedical waste", "why segregation"].some(k => q.includes(k))) {
        return {
            reply: "🏥 **WHY PROPER BIOMEDICAL WASTE SEGREGATION IS VITAL**\n\n1. **Only 15% is Hazardous:** In any hospital, approximately **85%** of waste is clean municipal trash (packaging, food, paper) and only **15%** is biohazardous. Without strict source segregation, the 85% clean waste becomes contaminated, escalating disposal costs by up to 10-fold.\n2. **Preventing Epidemics & Cross-Infection:** Segregation prevents dangerous bloodborne pathogens (HIV, Hepatitis B, Hepatitis C) from infecting sanitation workers, ragpickers, and the general community.\n3. **Eliminating Toxic Air Pollution:** Keeping plastics out of incinerators prevents toxic carcinogenic Dioxins and Furans from entering our atmosphere.\n4. **Worker Safety:** Keeping sharps contained in puncture-proof White boxes prevents life-threatening needle-stick punctures.\n5. **Resource Recovery:** Enables safe recycling of thousands of tons of high-grade clinical polymers and glass every year.",
            category_tag: "Educational",
            recommended_action: "Segregate strictly at source to prevent infection spread and environmental contamination.",
            suggested_followups: [
                "What goes into the Blue or Red bin?",
                "What are the 4 main color streams?",
                "What is the first-aid for a needle-stick injury?"
            ],
            engine: "MedWaste AI Cognitive Reasoner"
        };
    }

    // -------------------------------------------------------------
    // 4. MULTI-BIN COMPARISONS & REASONING
    // -------------------------------------------------------------
    const binColors = [];
    if (q.includes("blue")) binColors.push("blue");
    if (q.includes("red")) binColors.push("red");
    if (q.includes("yellow")) binColors.push("yellow");
    if (q.includes("white")) binColors.push("white");
    if (q.includes("black")) binColors.push("black");
    if (q.includes("green")) binColors.push("green");
    if (q.includes("purple") || q.includes("cytotoxic") || q.includes("chemo") || q.includes("oncology")) binColors.push("purple");

    // A. Blue OR Red (The user's direct question!)
    if ((binColors.includes("blue") && binColors.includes("red")) || ((q.includes("blue") || q.includes("red")) && (q.includes("or red") || q.includes("or blue") || q.includes("and red") || q.includes("and blue") || q.includes("blue vs red") || q.includes("red vs blue")))) {
        return {
            reply: "Great question! Both the **Blue container** and the **Red bin** handle recyclable hospital materials, but they are strictly separated because they contain completely different materials requiring different recycling technologies:\n\n🔵 **BLUE CONTAINER: Glassware & Metallic Implants**\n- **What goes here:**\n  - Medicine glass vials (broken or intact)\n  - Antibiotic glass ampoules\n  - Microscope glass slides and cover slips\n  - Contaminated orthopedic metal implants (pins, bone screws, plates, intramedullary rods)\n- **Why it goes to Blue:** Glass and metals CANNOT go into plastic shredders (they would destroy the shredder blades). Instead, they undergo chemical disinfection (1-2% Sodium Hypochlorite) or autoclaving, and are sent to licensed glass crushing recyclers and metal smelters.\n- **Safety Rule:** Always handle broken glass or ampoules with forceps or tongs—never with bare hands!\n\n🔴 **RED BIN: Contaminated Recyclable Plastics**\n- **What goes here:**\n  - Disposable plastic syringe barrels (**WITHOUT needles**)\n  - Intravenous (IV) infusion bottles and tubing sets\n  - Urinary catheters and drainage urine bags\n  - Dialysis kits and plastic tubing\n  - Vacutainer blood collection tubes (plastic bodies)\n- **Why it goes to Red:** These are high-grade recyclable polymers. They are sterilized via pressurized steam autoclaving (121°C @ 15 psi) or microwaving, then mechanically shredded into clean plastic granules to manufacture non-clinical plastic products.\n- **Crucial Rule:** The metal needle must ALWAYS be cut off at the hub using a needle destroyer before dropping the plastic syringe into the Red bin!\n\n💡 **Quick Summary to Remember:**\n- **Blue** = **Breakables & Metal Implants** (Glass vials, ampoules, orthopedic screws)\n- **Red** = **Recyclable Plastics** (Syringes, IV sets, catheters, urine bags)",
            category_tag: "Segregation",
            recommended_action: "Place glass vials/implants in Blue; place plastic syringes (no needle) and IV sets in Red.",
            suggested_followups: [
                "Where do the metal needles go?",
                "What items belong in the Yellow biohazard bag?",
                "What is the emergency first-aid for a needle-stick injury?"
            ],
            engine: "MedWaste AI Cognitive Reasoner"
        };
    }

    // B. Yellow vs Red
    if ((binColors.includes("yellow") && binColors.includes("red")) || (q.includes("yellow vs red") || q.includes("red vs yellow") || q.includes("yellow or red"))) {
        return {
            reply: "Here is the key distinction between the **Yellow bag** and the **Red bin**:\n\n🟡 **YELLOW BAG: Infectious & Anatomical (Destruction via Incineration)**\n- **Items:** Human anatomical tissues, organs, placentas, blood-soaked gauze, dressings, soiled cotton swabs, pus swabs, pathology cultures, and expired medicines.\n- **Fate:** High-temperature double-chamber incineration (800°C primary / 1050°C secondary) or plasma pyrolysis to convert biological hazards to inert ash.\n- **Rule:** Never put recyclable plastics or metals here.\n\n🔴 **RED BIN: Contaminated Plastics (Sterilization & Recycling)**\n- **Items:** Recyclable plastic equipment: plastic syringe barrels (without needle), IV tubing sets, saline bottles, catheters, urine bags.\n- **Fate:** Autoclaved with steam under pressure (121°C), then shredded and recycled into industrial plastic polymers.\n- **Rule:** Never put tissues, blood bags, or metal sharps in the Red bin!",
            category_tag: "Segregation",
            recommended_action: "Yellow is for infectious/anatomical incineration; Red is for recyclable plastics.",
            suggested_followups: [
                "What goes into the Blue container?",
                "Where do needle tips go?",
                "Why can't chlorinated plastics be incinerated?"
            ],
            engine: "MedWaste AI Cognitive Reasoner"
        };
    }

    // C. Blue vs White
    if ((binColors.includes("blue") && binColors.includes("white")) || (q.includes("blue vs white") || q.includes("white vs blue") || q.includes("blue or white"))) {
        return {
            reply: "Here is how to separate **Blue** vs **White** containers:\n\n🔵 **BLUE CONTAINER (Glassware & Metal Implants):**\n- Broken or unbroken glass vials, ampoules, slides, and orthopedic implants (pins, screws, plates).\n- Treated by chemical disinfection or autoclaving, then crushed and recycled.\n\n⚪ **WHITE TRANSLUCENT BOX (Puncture-Proof Sharps):**\n- Contaminated metal sharps: Hypodermic needles, surgical scalpels, suture needles, lancets, and broken sharp ampoule tips.\n- Translucent, rigid, puncture-proof box. Never recap needles! Sealed at 3/4 capacity and encapsulated in concrete or sent to sharp pits.",
            category_tag: "Segregation",
            recommended_action: "Glass vials & implants go in Blue; needles & scalpels go in White puncture-proof box.",
            suggested_followups: [
                "What goes into the Red bin?",
                "What is the first-aid for a needle-stick injury?",
                "Can empty glass vials be recycled?"
            ],
            engine: "MedWaste AI Cognitive Reasoner"
        };
    }

    // D. General overview of ALL bins
    if (["all bins", "every bin", "color code", "which bins", "all colors", "4 colors", "four colors", "list bins", "types of bins"].some(k => q.includes(k))) {
        return {
            reply: "Here is the complete color-coding guide for hospital biomedical waste segregation:\n\n🟡 **YELLOW BAG (Infectious & Anatomical Waste):**\n- Human tissues, organs, placentas, blood-soaked gauze, dressings, pus swabs, expired medicines, lab cultures.\n- **Treatment:** High-temperature incineration (800°C–1050°C).\n\n🔴 **RED BIN (Contaminated Recyclable Plastics):**\n- Disposable syringe bodies (no needle), IV tubing sets, catheters, urine bags, dialysis kits, plastic bottles.\n- **Treatment:** Autoclaving (121°C @ 15 psi) + mechanical shredding + plastic recycling.\n\n⚪ **WHITE CONTAINER (Metal Sharps):**\n- Hypodermic needles, scalpel blades, suture needles, lancets. Rigid puncture-proof box.\n- **Treatment:** Autoclaving/dry heat + encapsulation in concrete or deep sharp pits.\n\n🔵 **BLUE BOX (Glassware & Metal Implants):**\n- Medicine glass vials, antibiotic ampoules, microscope slides, orthopedic screws/plates/pins.\n- **Treatment:** Disinfection soak or autoclaving + glass recycling / metal smelting.\n\n🟢⚫ **GREEN & BLACK BINS (General Municipal Waste - 85% of total):**\n- Green: Wet/food leftovers, fruit peels, canteen scraps (composting).\n- Black: Clean dry paper, packaging boxes, clean plastic wrappers (municipal recycling).",
            category_tag: "Segregation",
            recommended_action: "Segregate strictly at source into Yellow, Red, White, Blue, and Municipal bins.",
            suggested_followups: [
                "What goes into the Blue or Red bin?",
                "Where do used plastic syringes go?",
                "What is the first-aid for a needle-stick injury?"
            ],
            engine: "MedWaste AI Cognitive Reasoner"
        };
    }

    // -------------------------------------------------------------
    // 5. ITEM-SPECIFIC REASONING ENGINE (100+ ITEMS)
    // -------------------------------------------------------------
    // Syringes (Plastic body vs needle)
    if (["syringe", "syringes"].some(k => q.includes(k))) {
        return {
            reply: "💉 **DISPOSAL OF USED SYRINGES: Step-by-Step Clinical Procedure**\n\nA used disposable syringe contains two distinct hazard components that MUST be separated at the point of use:\n\n1. **The Metal Needle:**\n   - Snip the needle at the hub using a point-of-use needle cutter or electric burner.\n   - Deposit the metal needle immediately into the **White Translucent Puncture-Proof Sharps Container**.\n   - **Never recap needles by hand!**\n\n2. **The Plastic Barrel & Plunger:**\n   - Drain any residual medication or fluid.\n   - Drop the needle-free plastic barrel into the **Red Bin**.\n   - It will be autoclaved at 121°C and shredded into plastic granules for safe polymer recycling.\n\n*(Note: If the syringe has a permanently fixed needle, such as an insulin syringe, do NOT attempt to break it; drop the entire unit into the White container).*",
            category_tag: "Red",
            recommended_action: "Snip needle into White sharps box; place plastic barrel into Red bin.",
            suggested_followups: [
                "What goes into the Blue container?",
                "What is the emergency first-aid for a needle-stick injury?",
                "What belongs in the Yellow biohazard bag?"
            ],
            engine: "MedWaste AI Cognitive Reasoner"
        };
    }

    // Needles / Scalpels / Blades / Sharps
    if (["needle", "needles", "scalpel", "blade", "lancet", "suture needle", "ampoule tip"].some(k => q.includes(k))) {
        return {
            reply: "🔪 **SHARPS DISPOSAL: Needles, Scalpels, and Blades**\n\n- **Designated Container:** **White Translucent Puncture-Proof Sharps Box**.\n- **Items Included:** Hypodermic needles, suture needles, surgical scalpel blades, disposable razors, lancets, and broken glass ampoule tips.\n- **Safety Protocol:**\n  1. Drop directly into the container immediately after use at bedside.\n  2. **NEVER recap needles with two hands.** If recapping is clinically necessary (e.g. arterial blood gas), use the single-handed 'scoop' technique.\n  3. Stop using and seal the container permanently when it reaches **3/4 capacity (75%)**.\n- **Final Treatment:** Autoclaving followed by concrete encapsulation or deep burial in a sharp pit.",
            category_tag: "White",
            recommended_action: "Drop directly into White puncture-proof container without recapping.",
            suggested_followups: [
                "What is the first-aid for an accidental needle-stick injury?",
                "Where do plastic syringes go?",
                "What goes into the Blue container?"
            ],
            engine: "MedWaste AI Cognitive Reasoner"
        };
    }

    // Glass vials / Ampoules / Slides
    if (["glass", "vial", "vials", "ampoule", "ampoules", "slide", "slides", "petri dish", "flask"].some(k => q.includes(k))) {
        return {
            reply: "🧪 **GLASSWARE DISPOSAL: Vials, Ampoules, and Slides**\n\n- **Designated Container:** **Blue Box or Blue-Marked Puncture-Resistant Bin**.\n- **Items Included:** Intact or broken medicine glass vials, antibiotic ampoules, laboratory glass slides, cover slips, and culture flasks.\n- **Safe Handling:**\n  - Never pick up broken glass fragments with bare hands or standard gloves; always use forceps, tongs, or a dustpan brush.\n  - Ensure the Blue container has a puncture-resistant bottom to prevent glass shards from piercing through.\n- **Recycling Path:** Glass items are disinfected in a sodium hypochlorite bath or autoclave, crushed into cullet, and remelted into industrial glass products.",
            category_tag: "Blue",
            recommended_action: "Use forceps to place glass vials and ampoules into Blue box.",
            suggested_followups: [
                "What goes into the Red bin?",
                "What goes into the Yellow bag?",
                "Where do metal implants go?"
            ],
            engine: "MedWaste AI Cognitive Reasoner"
        };
    }

    // IV sets / Catheters / Urine bags / Tubing
    if (["iv set", "iv tube", "iv bottle", "catheter", "urine bag", "dialysis", "tubing", "vacutainer"].some(k => q.includes(k))) {
        return {
            reply: "🩸 **PLASTIC TUBING & DRAINAGE: IV Sets, Catheters, and Urine Bags**\n\n- **Designated Container:** **Red Bin**.\n- **Categorized Items:** IV drip sets, infusion lines, plastic saline/dextrose bottles, Foley catheters, drainage bags, urine bags, dialysis kits, and plastic specimen vacutainers.\n- **Pre-Disposal Step:**\n  - Residual fluids (saline, urine, drained fluids) must be emptied into the sluice/sanitary drainage.\n  - Any attached metal needle or connector spike must be removed and placed into the White sharps container.\n- **Treatment:** Pressurized steam autoclaving (121°C @ 15 psi) followed by mechanical granulating and polymer recycling.",
            category_tag: "Red",
            recommended_action: "Drain fluids, remove any metal tips, and place plastic tubing/bags into Red bin.",
            suggested_followups: [
                "What goes into the Blue container?",
                "Where do blood-soaked bandages go?",
                "What is the 48-hour waste storage rule?"
            ],
            engine: "MedWaste AI Cognitive Reasoner"
        };
    }

    // Blood-soaked cotton / Gauze / Bandages / Plaster casts / Tissues
    if (["cotton", "gauze", "bandage", "bandages", "dressing", "dressings", "blood soaked", "placenta", "tissue", "anatomical", "biopsy", "organ", "flesh", "plaster cast", "pus swab"].some(k => q.includes(k))) {
        return {
            reply: "🟡 **INFECTIOUS & ANATOMICAL SOILS: Cotton, Gauze, Bandages, and Tissues**\n\n- **Designated Container:** **Yellow Non-Chlorinated Biohazard Bag**.\n- **Categorized Items:**\n  - Blood-soaked gauze, surgical dressings, and cotton swabs\n  - Pus swabs and contaminated wound packings\n  - Plaster of Paris casts contaminated with body fluids\n  - Human anatomical specimens: tissues, placentas, biopsy samples, amputated parts\n- **Why Yellow:** These items carry high biological pathogen loads (hepatitis, HIV, bacterial infections). They must be completely eliminated through double-chamber high-temperature incineration (800°C–1050°C) to prevent disease transmission.\n- **Storage:** Must be incinerated within **48 hours** under CPCB regulations.",
            category_tag: "Yellow",
            recommended_action: "Place infectious swabs and anatomical waste into Yellow bag; route for incineration.",
            suggested_followups: [
                "What goes into the Red bin?",
                "What is the emergency SOP for a blood spill?",
                "Where do used plastic syringes go?"
            ],
            engine: "MedWaste AI Cognitive Reasoner"
        };
    }

    // Gloves & Masks (Clinical vs General)
    if (["glove", "gloves", "mask", "masks", "ppe"].some(k => q.includes(k))) {
        return {
            reply: "🧤 **PPE DISPOSAL: Gloves and Masks Segregation Matrix**\n\nHow you dispose of gloves and masks depends strictly on their clinical contamination status:\n\n1. **Contaminated / Blood-Stained Gloves & Masks:**\n   - Any PPE used in isolation wards, ICU, COVID/infectious wards, or visibly stained with blood/fluids.\n   - ➡️ **Yellow Biohazard Bag** (for high-temperature incineration).\n\n2. **Routine Clean Examination Gloves (Latex/Nitrile):**\n   - Used for non-infectious routine checks, free of blood or body fluid contamination.\n   - ➡️ **Red Bin** (for autoclaving and polymer recycling).\n\n3. **Clean Paper Masks / Administrative Use:**\n   - Masks worn by receptionists, visitors, or non-clinical staff with zero infectious exposure.\n   - ➡️ **Black Municipal Bin** (general waste).",
            category_tag: "Segregation",
            recommended_action: "Blood-stained = Yellow bag; Clean clinical gloves = Red bin; Clean admin masks = Black bin.",
            suggested_followups: [
                "What items go into the Yellow bag?",
                "What goes into the Red bin?",
                "What PPE is mandatory for waste handlers?"
            ],
            engine: "MedWaste AI Cognitive Reasoner"
        };
    }

    // Expired Medicines / Discarded Drugs / Blister packs
    if (["medicine", "medicines", "drug", "drugs", "expired", "tablet", "tablets", "capsule", "capsules", "syrup", "paracetamol", "antibiotic", "blister pack"].some(k => q.includes(k))) {
        return {
            reply: "💊 **EXPIRED & DISCARDED PHARMACEUTICALS**\n\n- **Solid & Liquid Medicines:** Expired tablets, capsules, antibiotic syrups, and injectable solutions.\n  - ➡️ **Yellow Biohazard Bag** (sent for high-temperature incineration at authorized CBWTFs).\n  - **Crucial Rule:** Never flush antibiotics or expired drugs down the toilet or sink! This causes pharmaceutical contamination of municipal water and accelerates antimicrobial resistance.\n\n- **Empty Clean Blister Packs & Outer Cardboard Boxes:**\n  - If empty and clean (no drug residue), paper cartons go into the **Black Municipal Bin** for recycling.\n  - Contaminated foil blister packs with drug residue go into the **Yellow Bag**.",
            category_tag: "Yellow",
            recommended_action: "Deposit expired drugs into Yellow bag for high-temperature incineration; never flush.",
            suggested_followups: [
                "Where do chemotherapy drugs go?",
                "What goes into the Blue container?",
                "What belongs in the Red bin?"
            ],
            engine: "MedWaste AI Cognitive Reasoner"
        };
    }

    // Food waste / Pizza box / Lunch / Bottles / Packaging
    if (["food", "pizza", "lunch", "apple", "banana", "snack", "wrapper", "paper", "cardboard", "packaging", "water bottle", "cup", "tea"].some(k => q.includes(k))) {
        return {
            reply: "🥗📦 **GENERAL MUNICIPAL HOSPITAL WASTE (Food & Packaging)**\n\nFood scraps, lunch boxes, and packaging are non-hazardous municipal waste (part of the 85% general stream):\n\n1. **Food Leftovers & Organic Items:**\n   - Leftover patient meals, fruit peels, tea bags, food scraps.\n   - ➡️ **Green Bin** (Biodegradable / wet waste for composting).\n\n2. **Clean Paper, Pizza Boxes & Packaging:**\n   - Clean cardboard packaging, dry pizza boxes, snack wrappers, empty mineral water bottles, office paper.\n   - ➡️ **Black Bin** (Non-biodegradable / dry municipal waste for recycling).\n\n⚠️ **Hospital Tip:** If any food container was contaminated by blood or used in a strict infectious isolation ward, it must be treated as hazardous; otherwise, keep it strictly out of the expensive Yellow/Red biohazard streams!",
            category_tag: "General",
            recommended_action: "Food scraps go in Green bin; clean dry packaging and pizza boxes go in Black bin.",
            suggested_followups: [
                "What goes into the Blue or Red bin?",
                "What are the 4 main color streams?",
                "Where do used plastic syringes go?"
            ],
            engine: "MedWaste AI Cognitive Reasoner"
        };
    }

    // Thermometers & Mercury
    if (["mercury", "thermometer", "sphygmomanometer", "blood pressure apparatus"].some(k => q.includes(k))) {
        return {
            reply: "☣️ **CRITICAL PROTOCOL: Mercury & Clinical Thermometers**\n\n- **ABSOLUTE WARNING:** **NEVER incinerate or autoclave mercury.** When heated, mercury converts into a lethal, odorless, neurotoxic vapor.\n- **NEVER throw mercury into Yellow, Red, or general bins, and never wash down drains.**\n\n### Spill Management Protocol:\n1. Evacuate pregnant women and non-essential staff; ventilate the area immediately.\n2. Don nitrile gloves (never touch mercury or use a vacuum cleaner, which vaporizes it).\n3. Use two stiff pieces of cardboard or an eye-dropper to gather the beads together.\n4. Transfer droplets into a sealable plastic bottle containing a layer of water or oil to suppress vapors.\n5. Label container clearly: **'Hazardous Chemical Waste: Elemental Mercury'** and transfer to authorized hazardous waste facility.",
            category_tag: "Emergency",
            recommended_action: "Collect beads with cardboard into airtight water container; never incinerate or vacuum.",
            suggested_followups: [
                "What goes into the Blue container?",
                "What is the first-aid for a needle stick?",
                "What happens if mercury is incinerated?"
            ],
            engine: "MedWaste AI Cognitive Reasoner"
        };
    }

    // -------------------------------------------------------------
    // 6. SINGLE BIN IN-DEPTH GUIDES
    // -------------------------------------------------------------
    // Blue Container
    if (binColors.includes("blue") || ["blue bin", "blue container", "blue box", "blue bag"].some(k => q.includes(k))) {
        return {
            reply: "🔵 **BLUE CONTAINER: Glassware & Metallic Implants**\n\nThe Blue container is specially designated for breakable glass items and orthopedic implants:\n\n### What Goes In:\n- **Medicine Glass Vials:** Both intact and broken vaccine or medicine vials.\n- **Glass Ampoules:** Antibiotic ampoules, injection ampoules.\n- **Laboratory Glassware:** Microscope slides, cover slips, glass petri dishes, pipettes, and culture flasks.\n- **Contaminated Metal Implants:** Orthopedic pins, bone screws, compression plates, and intramedullary rods removed during surgeries.\n\n### Why it is Segregated Here:\nGlass and metal cannot be mixed with plastics (they would ruin shredder blades) or general trash. Blue box waste is pre-treated by soaking in 1-2% Sodium Hypochlorite or autoclaving, then crushed and safely recycled into commercial glass or smelted for metal recovery.\n\n### Practical Handling Tips:\n- Always use tongs or forceps to collect broken glass shards—never pick them up with your hands!\n- Ensure the blue box is puncture-resistant and leak-proof with a reinforced bottom.",
            category_tag: "Blue",
            recommended_action: "Use forceps to place glass vials, ampoules, slides, and metal implants into Blue container.",
            suggested_followups: [
                "What goes into the Red bin?",
                "Where do metal hypodermic needles go?",
                "What belongs in the Yellow biohazard bag?"
            ],
            engine: "MedWaste AI Cognitive Reasoner"
        };
    }

    // Red Bin
    if (binColors.includes("red") || ["red bin", "red container", "red bag", "red bucket"].some(k => q.includes(k))) {
        return {
            reply: "🔴 **RED BIN: Contaminated Recyclable Plastics**\n\nThe Red bin is exclusively for contaminated plastic clinical equipment that can be sterilized and recycled:\n\n### What Goes In:\n- **Plastic Syringes:** Disposable plastic syringe barrels and plungers (**metal needle MUST be removed**).\n- **IV Equipment:** Intravenous infusion tubes, IV drip sets, saline plastic bottles.\n- **Catheters & Drainage:** Urinary catheters, Foley catheters, drainage bags, urine collection bags.\n- **Dialysis Supplies:** Dialysis kits, plastic tubing, filter casings.\n- **Specimen Containers:** Plastic vacutainer blood tubes, plastic urine sample cups.\n- **Gloves:** Clean clinical examination gloves (nitrile or latex).\n\n### The 2 Golden Rules for Red Bins:\n1. **Never drop a needle in the Red bin!** Always snip the needle hub with a point-of-use needle cutter into the White sharps container.\n2. **Drain fluids first:** Empty residual urine, blood, or IV fluids into the sanitary sluice before bagging.\n\n### How It Is Treated:\nWaste is sterilized inside autoclaves (pressurized steam at 121°C @ 15 psi) or microwaves to eliminate 100% of pathogens, then mechanically shredded into clean plastic pellets for secondary industrial recycling.",
            category_tag: "Red",
            recommended_action: "Snip needle hub at point-of-use; drain fluids; place plastic body into Red bin.",
            suggested_followups: [
                "What goes into the Blue container?",
                "Why can't needles go into the Red bin?",
                "Where do blood-soaked bandages go?"
            ],
            engine: "MedWaste AI Cognitive Reasoner"
        };
    }

    // White Container
    if (binColors.includes("white") || ["white bin", "white container", "white box", "sharps container", "sharps box"].some(k => q.includes(k))) {
        return {
            reply: "⚪ **WHITE TRANSLUCENT CONTAINER: Contaminated Metal Sharps**\n\nThe White container is a rigid, puncture-proof, leak-proof, and tamper-evident container for dangerous metal sharps:\n\n### What Goes In:\n- **Needles:** Hypodermic injection needles, spinal needles, biopsy needles, fixed-needle syringes (like insulin syringes).\n- **Surgical Blades:** Scalpel blades, disposable razors, skin grafting blades.\n- **Suture Needles:** Curved surgical needles with or without suture attached.\n- **Lancets & Tips:** Blood lancets, contaminated broken ampoule tips.\n\n### Critical Safety Rules:\n- **NEVER recap needles by hand!** Recapping causes over 80% of accidental needle-stick injuries.\n- Do not bend, snap, or break needles manually.\n- Fill only up to **3/4 capacity** (never overfill or force sharps in).\n- Permanently lock the tamper-evident lid before dispatch.\n\n### Final Treatment:\nAutoclaving or dry-heat sterilization, followed by encapsulation inside concrete blocks or disposal in deep sealed sharp pits.",
            category_tag: "White",
            recommended_action: "Drop directly into White puncture-proof container without recapping.",
            suggested_followups: [
                "What is the first-aid for an accidental needle-stick injury?",
                "Where do plastic syringes without needles go?",
                "What goes into the Blue container?"
            ],
            engine: "MedWaste AI Cognitive Reasoner"
        };
    }

    // Yellow Bag
    if (binColors.includes("yellow") || ["yellow bin", "yellow bag", "yellow container"].some(k => q.includes(k))) {
        return {
            reply: "🟡 **YELLOW BAG: Infectious & Anatomical Biohazard Waste**\n\nThe Yellow bag is for highly infectious, anatomical, and chemical waste that requires complete thermal destruction:\n\n### What Goes In:\n- **Human Anatomical Waste:** Tissues, organs, amputated limbs, biopsy specimens, placentas, extracted teeth.\n- **Animal Waste:** Experimental animal carcasses, organs, body parts from research.\n- **Soiled Clinical Items:** Blood-soaked gauze, dressings, cotton swabs, pus swabs, plaster casts, blood bags.\n- **Expired & Discarded Medicines:** Antibiotics, expired tablets, syrups, contaminated injectables.\n- **Laboratory Cultures:** Microbiology cultures, biotechnology specimens, vaccine stocks.\n- **Soiled PPE:** Masks, caps, and gowns heavily contaminated with body fluids.\n\n### How It Is Treated:\nMust be placed in certified non-chlorinated yellow plastic bags and transported for **double-chamber high-temperature incineration** (primary chamber at 800°C ± 50°C, secondary chamber at 1050°C ± 50°C) or plasma pyrolysis.\n\n### Crucial Storage Rule:\nUntreated Yellow waste must **never be held past 48 hours** without informing the pollution control authorities.",
            category_tag: "Yellow",
            recommended_action: "Double-knot yellow bag when 3/4 full; route for high-temperature incineration within 48 hours.",
            suggested_followups: [
                "What goes into the Red bin?",
                "What items go into the Blue box?",
                "What is the emergency protocol for a blood spill?"
            ],
            engine: "MedWaste AI Cognitive Reasoner"
        };
    }

    // Black & Green Municipal
    if (binColors.includes("black") || binColors.includes("green") || ["black bin", "green bin", "municipal", "general waste", "office trash"].some(k => q.includes(k))) {
        return {
            reply: "🟢⚫ **BLACK & GREEN BINS: General Municipal Waste (Non-Biohazardous)**\n\nGeneral waste accounts for approximately **85%** of all waste generated in hospitals. It is completely non-hazardous:\n\n### 🟢 Green Bin (Wet / Biodegradable):**\n- Food leftovers from wards and hospital canteens\n- Fruit and vegetable peels\n- Tea bags and coffee grounds\n- Garden leaves and flowers\n- *Routed for composting and vermiculture.*\n\n### ⚫ Black Bin (Dry / Recyclable Municipal):**\n- Clean medicine packaging cartons and paper boxes\n- Paper wrappers and office stationery\n- Empty clean plastic water bottles\n- Newspaper and magazine reading materials\n- *Routed for municipal recycling.*\n\n⚠️ **Zero Contamination Rule:** Never throw blood-stained gauze, soiled gloves, needles, or clinical fluids into municipal bins!",
            category_tag: "General",
            recommended_action: "Segregate food scraps into Green bin and clean paper/packaging into Black bin.",
            suggested_followups: [
                "What goes into the Blue or Red bin?",
                "Where do used plastic syringes go?",
                "What happens if medical waste is mixed with municipal trash?"
            ],
            engine: "MedWaste AI Cognitive Reasoner"
        };
    }

    // Purple Cytotoxic
    if (binColors.includes("purple") || ["purple", "cytotoxic", "chemo", "oncology"].some(k => q.includes(k))) {
        return {
            reply: "🟣 **PURPLE / CYTOTOXIC CONTAINER: Chemotherapy & Oncology Waste**\n\nCytotoxic drugs are mutagenic, teratogenic, and carcinogenic, requiring the highest level of biosafety:\n\n### What Goes In:\n- Expired or leftover chemotherapy drug vials and ampoules\n- IV sets and infusion tubing used to administer cancer drugs\n- Gloves, gowns, and masks worn during cytotoxic preparation and infusion\n- Patient bodily waste (urine, vomitus) within 48 hours of chemotherapy administration\n\n### Safe Handling SOP:\n- Handlers must wear double chemotherapy-tested nitrile gloves, eye goggles, and a fluid-impermeable gown.\n- Prepare all doses under Class II Type B2 Biosafety Cabinets.\n- Seal tightly in designated Purple bags or Yellow bags labeled with the prominent Cytotoxic symbol.\n- Requires high-temperature destruction in dedicated incinerators at **exceeding 1200°C**.",
            category_tag: "Cytotoxic",
            recommended_action: "Double-glove, use Purple cytotoxic bags, and incinerate at >1200°C.",
            suggested_followups: [
                "What is the spill procedure for chemotherapy drugs?",
                "What goes into the Blue or Red bin?",
                "What PPE is mandatory in oncology wards?"
            ],
            engine: "MedWaste AI Cognitive Reasoner"
        };
    }

    // -------------------------------------------------------------
    // 7. DYNAMIC HUMAN-LIKE REASONING FALLBACK FOR ANY NOVEL QUESTION
    // -------------------------------------------------------------
    const ignoredWords = ["the","this","that","what","which","how","where","can","should","about","for","into","with","does","are","and","tell","explain","please","give","know","want"];
    const words = q.split(/\s+/).filter(w => w.length >= 3 && !ignoredWords.includes(w));
    const subjectTerm = words.slice(0, 4).join(" ") || raw_q;

    return {
        reply: `Let's think through how to handle **'${subjectTerm}'** by analyzing its material and clinical risk:\n\nTo determine the exact correct disposal, clinical staff evaluate three simple criteria:\n\n1. **Is it sharp or capable of puncturing?**\n   - *Metal needles, scalpels, surgical blades, lancets* ➡️ **White Puncture-Proof Container**.\n   - *Broken glass vials, ampoules, microscope slides* ➡️ **Blue Container**.\n\n2. **Is it heavily contaminated with blood, pus, or infectious body tissue?**\n   - *Blood-soaked gauze, dressings, anatomical tissues, expired medicines* ➡️ **Yellow Biohazard Bag** (for high-temperature incineration).\n\n3. **Is it a recyclable plastic medical item (without needles)?**\n   - *Disposable plastic syringe barrels, IV tubes, urine bags, catheters* ➡️ **Red Bin** (for autoclaving & polymer recycling).\n\n4. **Is it clean, dry general hospital trash?**\n   - *Clean packaging cartons, office paper, food packaging* ➡️ **Black or Green Municipal Bins**.\n\nCould you tell me a little more about **'${subjectTerm}'**—specifically, what material it is made of, and whether it came into contact with blood or infectious fluids?`,
        category_tag: "General",
        recommended_action: `Assess material type and contamination level of '${subjectTerm}' before disposal.`,
        suggested_followups: [
            "What goes into the Blue or Red bin?",
            "What items belong in the Yellow biohazard bag?",
            "Where do used plastic syringes go?"
        ],
        engine: "MedWaste AI Cognitive Reasoner"
    };
}
