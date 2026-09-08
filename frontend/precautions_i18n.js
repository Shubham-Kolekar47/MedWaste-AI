/**
 * MedWaste AI - 11 Indian Languages + English Precaution Audio Transcripts
 */
const SUPPORTED_LANGUAGES = {
    "en": {
        "name": "English",
        "native": "English",
        "tag": "en-IN",
        "fallbackTag": "en-US"
    },
    "hi": {
        "name": "Hindi",
        "native": "हिंदी",
        "tag": "hi-IN",
        "fallbackTag": "hi"
    },
    "mr": {
        "name": "Marathi",
        "native": "मराठी",
        "tag": "mr-IN",
        "fallbackTag": "mr"
    },
    "ta": {
        "name": "Tamil",
        "native": "தமிழ்",
        "tag": "ta-IN",
        "fallbackTag": "ta"
    },
    "te": {
        "name": "Telugu",
        "native": "తెలుగు",
        "tag": "te-IN",
        "fallbackTag": "te"
    },
    "bn": {
        "name": "Bengali",
        "native": "বাংলা",
        "tag": "bn-IN",
        "fallbackTag": "bn"
    },
    "gu": {
        "name": "Gujarati",
        "native": "ગુજરાતી",
        "tag": "gu-IN",
        "fallbackTag": "gu"
    },
    "kn": {
        "name": "Kannada",
        "native": "ಕನ್ನಡ",
        "tag": "kn-IN",
        "fallbackTag": "kn"
    },
    "ml": {
        "name": "Malayalam",
        "native": "മലയാളം",
        "tag": "ml-IN",
        "fallbackTag": "ml"
    },
    "pa": {
        "name": "Punjabi",
        "native": "ਪੰਜਾਬੀ",
        "tag": "pa-IN",
        "fallbackTag": "pa"
    },
    "or": {
        "name": "Odia",
        "native": "ଓଡ଼ିଆ",
        "tag": "or-IN",
        "fallbackTag": "or"
    },
    "ur": {
        "name": "Urdu",
        "native": "اردو",
        "tag": "ur-IN",
        "fallbackTag": "ur"
    }
};

const PRECAUTION_TRANSCRIPTS_I18N = {
    "en": {
        "master": {
            "title": "Master Clinical Safety & Biomedical Waste Overview",
            "summary": "Welcome to the MedWaste AI Clinical Safety and Waste Handling Guide. All healthcare workers, cleaning staff, and waste handlers must follow strict Bio-Medical Waste Management Rules. Always wear category-specific Personal Protective Equipment, including double nitrile gloves, N95 respirators, fluid-impermeable aprons, and eye protection. Segregate waste strictly at source using the four color-coded streams: Yellow for anatomical and infectious soiled waste; Red for recyclable contaminated plastics like IV sets and syringes; White translucent for sharp needles and scalpels in puncture-proof containers; and Blue for broken glass and metallic implants. In chemotherapy units, use dedicated purple cytotoxic bags. Never recap needles with bare hands, never compress waste bags, and report any accidental needle-stick injury immediately for post-exposure prophylaxis within two hours. Segregation saves lives.",
            "steps": [
                "Always wear category-specific Personal Protective Equipment before touching any medical waste.",
                "Segregate waste strictly at point of generation into Yellow, Red, White, and Blue containers.",
                "Never recap, bend, or break needles by hand. Use point-of-use needle destroyers.",
                "Seal and tag all biohazard bags with barcodes when they reach three-quarters capacity.",
                "In case of needle-stick injury, wash under running water immediately and report within two hours."
            ]
        },
        "yellow": {
            "title": "Yellow Category: Infectious & Anatomical Waste Precautions",
            "summary": "Yellow category waste contains high-risk biohazardous items such as human tissues, organs, body parts, placentas, biopsy specimens, blood-soaked gauze, dressings, cotton swabs, plaster casts, microbiology culture plates, expired cytotoxic medicines, and chemical waste. Always use non-chlorinated yellow bags bearing the international biohazard symbol. Wear double nitrile gloves, an N95 respirator, fluid-impermeable gown, and protective goggles. Never compress or squeeze yellow bags by hand. Securely tie and seal bags using zip-ties when three-quarters full. Never store infectious waste in ward corridors; transfer immediately to a designated cool waste storage room for maximum forty-eight hours prior to high-temperature incineration or autoclaving.",
            "steps": [
                "Don full PPE: heavy-duty nitrile gloves, N95 mask, fluid-resistant apron, and eye protection.",
                "Use only certified non-chlorinated yellow plastic bags bearing the biohazard symbol.",
                "Never pack bags beyond three-quarters capacity to ensure an airtight neck seal.",
                "Never compress, knead, or sit on waste bags to create more space.",
                "Transport bags in dedicated enclosed wheeled bins directly to the bio-waste holding room.",
                "Ensure incineration or authorized deep burial occurs within forty-eight hours."
            ]
        },
        "red": {
            "title": "Red Category: Contaminated Recyclable Plastics Precautions",
            "summary": "Red category waste comprises recyclable plastic clinical items contaminated with bodily fluids. This includes disposable plastic syringes without needles, intravenous tubing and sets, catheters, urine bags, dialysis kits, rubber gloves, and vacutainer tubes. All syringes must have their needle hubs destroyed using a needle cutter at point of use before dropping into the red bin to prevent illicit reuse. Empty all residual fluids before disposal. Autoclave, microwave, or soak in freshly prepared one to two percent sodium hypochlorite solution before shredding and sending to registered recyclers. Wear puncture-resistant utility gloves and a face shield. Never place needles, scalpels, or glass items into red bins.",
            "steps": [
                "Cut syringe needle hubs or tips using a mechanical cutter before disposing into the red bin.",
                "Completely drain urine bags, IV lines, and suction canisters into sanitary sewers before bagging.",
                "Wear heavy-duty puncture-resistant utility gloves and a splash-proof face shield.",
                "Never drop hypodermic needles, blades, or glass vials into red bags.",
                "Disinfect with one to two percent sodium hypochlorite or autoclave prior to shredding.",
                "Hand over shredded plastic only to authorized state pollution control board recyclers."
            ]
        },
        "white": {
            "title": "White Category: Sharps, Needles & Blades Precautions",
            "summary": "White category waste contains contaminated sharps that pose severe puncture, cut, and blood-borne virus risks. This includes hypodermic needles, scalpel blades, lancets, surgical suture needles, contaminated broken ampoule tips, and fixed-needle syringes. Always use rigid, puncture-proof, tamper-proof, and translucent white containers. Never attempt to recap, bend, break, or manually strip needles from syringes with bare hands. Use point-of-use electric needle burners or manual hub cutters immediately upon injection. Never fill sharp containers beyond three-quarters full. Once full, lock the tamper-proof lid permanently. Containers undergo autoclaving or dry-heat sterilization followed by encapsulation in concrete or sharp-pit disposal.",
            "steps": [
                "Immediately discard sharps at point of generation into a white puncture-proof container.",
                "Never recap needles by hand. If mandatory, use the single-handed scoop technique.",
                "Use electric needle burners or hub cutters directly at the bedside or nursing station.",
                "Do not exceed the three-quarters fill line marked on the container.",
                "Permanently lock the tamper-evident lid before handing over for final disposal.",
                "Ensure dry heat sterilization and encapsulation to permanently immobilize metal sharps."
            ]
        },
        "blue": {
            "title": "Blue Category: Glassware & Metallic Implants Precautions",
            "summary": "Blue category waste consists of broken or intact medicine ampoules, glass vials, microscope slides, glass culture flasks, and contaminated metallic orthopedic implants such as pins, plates, and screws. Store in rigid, puncture-resistant cardboard boxes or blue-coded plastic bins with blue biohazard markings. Always handle broken glassware using forceps, tongs, or a dustpan brush; never collect glass fragments with gloved hands. Disinfect glassware with sodium hypochlorite disinfectant or autoclaving before crushing. Return intact pharmaceutical glass bottles to licensed glass recycling facilities after thorough decontamination.",
            "steps": [
                "Segregate all glass vials, ampoules, and orthopedic metal implants into blue-labeled boxes.",
                "Never pick up shattered glass vials with bare hands or thin exam gloves; always use tongs.",
                "Pre-treat with one percent sodium hypochlorite disinfectant soak or autoclave sterilization.",
                "Ensure boxes have robust bottom reinforcement to prevent glass puncturing during transit.",
                "Route cleaned and crushed glass safely to approved industrial glass recyclers."
            ]
        },
        "purple": {
            "title": "Cytotoxic & Chemotherapy Oncology Waste Precautions",
            "summary": "Cytotoxic waste includes expired or residual chemotherapy drugs, contaminated intravenous lines, gloves, gowns, tubing, and patient bodily waste within forty-eight hours of chemotherapy administration. Cytotoxic agents are mutagens, teratogens, and carcinogens. Always use heavy-duty purple or yellow bags labeled with the prominent cytotoxic warning symbol. Oncology staff must double-glove using chemotherapy-tested nitrile gloves, an impermeable gown, and a full face shield. Prepare drugs only inside certified biological safety cabinets. In case of spills, immediately deploy the chemotherapy spill kit with neutralizing absorbent pads. Cytotoxic waste must be destroyed by high-temperature incineration at minimum twelve hundred degrees Celsius.",
            "steps": [
                "Wear double chemotherapy-rated nitrile gloves, impermeable gown, and face shield.",
                "Place all chemotherapy-contaminated items into designated purple cytotoxic containers.",
                "Prepare all intravenous antineoplastic drugs inside Class II Biological Safety Cabinets.",
                "Keep dedicated cytotoxic spill kits immediately accessible in oncology wards and labs.",
                "Incinerate all cytotoxic waste at extreme temperatures exceeding twelve hundred degrees Celsius."
            ]
        },
        "general": {
            "title": "General Non-Hazardous Healthcare Waste Precautions",
            "summary": "General healthcare waste represents eighty to eighty-five percent of all hospital waste and is non-hazardous. It includes clean packaging, paper cartons, administrative paperwork, food leftovers, disposable paper cups, and plastic wrappers. Segregate in green or black municipal bins. Strictly inspect that no infectious dressings, gloves, or needles contaminate general waste. Clean cardboard and office paper should be compacted and routed for municipal recycling. Proper pre-sorting prevents unnecessary and expensive biohazard incineration for safe municipal trash.",
            "steps": [
                "Deposit clean cardboard, food waste, wrappers, and paper towels into green or black bins.",
                "Never dispose of contaminated patient dressings, cotton, or gloves into general bins.",
                "Keep recycling bins cleanly separated at ward reception, administrative desks, and cafeterias.",
                "Conduct routine spot audits on general bins to ensure complete absence of clinical waste.",
                "Partner with municipal circular recycling initiatives for paper, clean bottles, and organic waste."
            ]
        },
        "emergency": {
            "title": "Emergency Needle-Stick & Blood Spill Incident Protocol",
            "summary": "In the event of an accidental needle-stick or sharp injury: Immediately wash the wound under cool running tap water with mild soap for five minutes. Do not squeeze, press, suck, or scrub the puncture site violently. Cover with a sterile waterproof dressing. Immediately notify the ward sister or Infection Control Officer. Initiate Post-Exposure Prophylaxis for HIV and Hepatitis B within two hours. For blood or body fluid spills: Cordon off the area, wear full PPE, cover the liquid spill with absorbent paper towels, pour freshly prepared one percent sodium hypochlorite solution with ten thousand ppm available chlorine over the towels, allow twenty minutes contact time, scoop into a yellow bag with tongs, and mop with hospital disinfectant.",
            "steps": [
                "Needle-Stick Step 1: Wash puncture wound immediately under running tap water with soap for 5 minutes.",
                "Needle-Stick Step 2: Do NOT suck, squeeze, or scrub the wound harshly. Apply sterile bandage.",
                "Needle-Stick Step 3: Report incident immediately to supervisor and receive PEP evaluation within 2 hours.",
                "Spill Step 1: Cordon off spill area and don full PPE including nitrile gloves and shoe covers.",
                "Spill Step 2: Cover liquid spill with absorbent towels and soak with 1% sodium hypochlorite solution.",
                "Spill Step 3: Wait 20 minutes contact time, scoop towels with tongs into yellow bag, and mop thoroughly."
            ]
        }
    },
    "hi": {
        "master": {
            "title": "मास्टर क्लिनिकल सुरक्षा और बायोमेडिकल कचरा प्रबंधन सारांश",
            "summary": "बायोमेडिकल कचरा प्रबंधन और क्लिनिकल सुरक्षा गाइड में आपका स्वागत है। सभी स्वास्थ्य कर्मियों, सफाई कर्मचारियों और कचरा उठाने वालों को भारत सरकार के बायोमेडिकल वेस्ट मैनेजमेंट नियमों का कड़ाई से पालन करना चाहिए। हमेशा उपयुक्त पीपीई किट पहनें, जिसमें डबल नाइट्राइल दस्ताने, एन-95 मास्क, वाटरप्रूफ एप्रन और सुरक्षात्मक चश्मा शामिल है। कचरे को चार रंगों में अलग करें: पीले बैग में मानव अंग और संक्रामक पट्टियां; लाल डिब्बे में प्लास्टिक जैसे सिरिंज और आईवी पाइप; सफेद कंटेनर में नुकीली सुइयां और ब्लेड; और नीले डिब्बे में कांच की दवा की शीशियां। कीमोथेरेपी कचरे के लिए बैंगनी थैली का इस्तेमाल करें। सुई को कभी न मोड़ें और सुई चुभने पर दो घंटे के भीतर तुरंत रिपोर्ट करें। कचरे का सही अलगाव जान बचाता है।",
            "steps": [
                "कचरा छूने से पहले हमेशा डबल दस्ताने, एन-95 मास्क और सुरक्षात्मक एप्रन पहनें।",
                "कचरे को स्रोत पर ही पीले, लाल, सफेद और नीले डिब्बों में अलग करें।",
                "सुई को कभी हाथ से दोबारा कैप न करें और न ही मोड़ें; कटर का इस्तेमाल करें।",
                "थैलियां तीन-चौथाई भरने पर बारकोड टैग लगाकर सुरक्षित रूप से सील करें।",
                "सुई चुभने पर तुरंत बहते पानी से पांच मिनट धोएं और दो घंटे में रिपोर्ट करें।"
            ]
        },
        "yellow": {
            "title": "पीला वर्ग: संक्रामक और शारीरिक कचरा सावधानियां",
            "summary": "पीले वर्ग में मानव अंग, ऊतक, खून से सनी पट्टियां, रूई, एक्सपायर्ड दवाएं और रासायनिक कचरा शामिल है। हमेशा बायोहाजार्ड चिन्ह वाली गैर-क्लोरीनेटेड पीली थैलियों का उपयोग करें। डबल नाइट्राइल दस्ताने, एन-95 मास्क और गाउन पहनें। पीली थैलियों को कभी हाथ से न दबाएं। तीन-चौथाई भरने पर सील करें। संक्रामक कचरे को 48 घंटे के भीतर इनसिनेरेशन के लिए भेजें।",
            "steps": [
                "डबल नाइट्राइल दस्ताने, एन-95 मास्क और वाटरप्रूफ एप्रन पहनें।",
                "केवल बायोहाजार्ड चिन्ह वाली प्रमाणित पीली थैलियों का उपयोग करें।",
                "थैली को कभी भी तीन-चौथाई से अधिक न भरें।",
                "थैली को हाथ या पैर से दबाकर जगह बनाने की कोशिश न करें।",
                "कचरे को बंद पहियों वाले डिब्बों में ही स्टोरेज रूम तक ले जाएं।",
                "48 घंटे के भीतर इनसिनेरेशन या अधिकृत निस्तारण सुनिश्चित करें।"
            ]
        },
        "red": {
            "title": "लाल वर्ग: दूषित पुनर्चक्रण योग्य प्लास्टिक सावधानियां",
            "summary": "लाल वर्ग में शरीर के तरल पदार्थों से दूषित प्लास्टिक कचरा जैसे बिना सुई की प्लास्टिक सिरिंज, आईवी सेट, कैथेटर, यूरिन बैग और रबर दस्ताने आते हैं। सुई को निडिल कटर से काटकर ही सिरिंज लाल डिब्बे में डालें। आईवी और यूरिन बैग को पूरी तरह खाली करें। प्लास्टिक को ऑटोक्लेव या एक प्रतिशत सोडियम हाइपोक्लोराइट में कीटाणुरहित करें।",
            "steps": [
                "सिरिंज की सुई को कटर से काटकर ही लाल डिब्बे में डालें।",
                "यूरिन बैग और आईवी नली से सारा तरल पदार्थ पूरी तरह निकालें।",
                "मजबूत पंचर-प्रतिरोधी दस्ताने और फेस शील्ड पहनें।",
                "लाल बैग में कभी भी कांच या सुई न डालें।",
                "एक से दो प्रतिशत सोडियम हाइपोक्लोराइट या ऑटोक्लेव से कीटाणुरहित करें।",
                "पुनर्चक्रण के लिए केवल अधिकृत रीसाइक्लर्स को ही प्लास्टिक सौंपें।"
            ]
        },
        "white": {
            "title": "सफेद वर्ग: नुकीले कचरे, सुई और सर्जिकल ब्लेड",
            "summary": "सफेद वर्ग में इस्तेमाल की गई सुइयां, सर्जिकल ब्लेड, लैंसेट और कांच की टूटी एम्प्यूल शामिल हैं। हमेशा सख्त और पंचर-प्रूफ सफेद डिब्बों का उपयोग करें। सुई को कभी हाथ से दोबारा कैप न करें और न ही मोड़ें। बेडसाइड पर इलेक्ट्रिक निडिल बर्नर का उपयोग करें। डिब्बा तीन-चौथाई भरने पर ढक्कन स्थायी रूप से लॉक कर दें।",
            "steps": [
                "उपयोग के तुरंत बाद सुई को सफेद पंचर-प्रूफ डिब्बे में डालें।",
                "सुई को हाथ से कभी न ढकें; केवल सुरक्षित स्कूप तकनीक अपनाएं।",
                "बेडसाइड पर इलेक्ट्रिक निडिल बर्नर का उपयोग करें।",
                "डिब्बे पर बनी तीन-चौथाई सीमा से अधिक कभी न भरें।",
                "भर जाने पर डिब्बे का ढक्कन हमेशा के लिए लॉक कर दें।",
                "कचरे का ड्राई हीट स्टरलाइजेशन और कंक्रीट एनकैप्सुलेशन कराएं।"
            ]
        },
        "blue": {
            "title": "नीला वर्ग: कांच का सामान और धातु के इम्प्लांट",
            "summary": "नीले वर्ग में दवा की कांच की शीशियां, एम्प्यूल, स्लाइड और ऑर्थोपेडिक धातु के पेंच या प्लेट शामिल हैं। इन्हें नीले कार्डबोर्ड बॉक्स या नीले डिब्बे में रखें। टूटे कांच को कभी हाथ से न उठाएं, हमेशा चिमटे का उपयोग करें। एक प्रतिशत सोडियम हाइपोक्लोराइट या ऑटोक्लेव से कीटाणुरहित करें।",
            "steps": [
                "सभी कांच की शीशियों और धातु के इम्प्लांट को नीले बॉक्स में रखें।",
                "टूटे कांच को कभी नंगे हाथों से न छुएं; हमेशा चिमटा इस्तेमाल करें।",
                "एक प्रतिशत सोडियम हाइपोक्लोराइट से कीटाणुरहित करें।",
                "कांच को सुरक्षित रूप से रीसाइक्लिंग के लिए भेजें।"
            ]
        },
        "purple": {
            "title": "साइटोटॉक्सिक और कीमोथेरेपी कैंसर कचरा",
            "summary": "साइटोटॉक्सिक कचरे में बची हुई कीमोथेरेपी दवाएं, दूषित आईवी लाइन और मरीज का शारीरिक कचरा शामिल है। हमेशा बैंगनी बायोहाजार्ड बैग का उपयोग करें। डबल कीमो-रेटेड दस्ताने और फेस शील्ड पहनें। रिसाव होने पर तुरंत कीमो स्पिल किट का उपयोग करें। बारह सौ डिग्री से अधिक तापमान पर इनसिनेरेशन करें।",
            "steps": [
                "डबल कीमो-रेटेड नाइट्राइल दस्ताने और फेस शील्ड पहनें।",
                "सभी कीमोथेरेपी कचरे को निर्धारित बैंगनी डिब्बे में डालें।",
                "कीमो स्पिल किट को हमेशा वार्ड में तैयार रखें।",
                "बारह सौ डिग्री सेल्सियस से ऊपर उच्च तापमान पर इनसिनेरेशन करें।"
            ]
        },
        "general": {
            "title": "सामान्य गैर-खतरनाक अस्पताल कचरा",
            "summary": "अस्पताल का अस्सी प्रतिशत कचरा गैर-खतरनाक होता है, जैसे साफ कागज, गत्ता, खाने का बचा हुआ हिस्सा और प्लास्टिक रैपर। इसे हरे या काले नगरपालिका डिब्बे में डालें। इसमें कभी भी संक्रामक कचरा या सुई न मिलाएं।",
            "steps": [
                "साफ कागज, खाने का कचरा और रैपर हरे या काले डिब्बे में डालें।",
                "संक्रामक पट्टियां या सुइयां इसमें कभी न डालें।",
                "वार्ड में रीसाइक्लिंग डिब्बे अलग रखें।"
            ]
        },
        "emergency": {
            "title": "आपातकालीन सुई चुभने और रक्त रिसाव प्रोटोकॉल",
            "summary": "सुई चुभने पर: घाव को तुरंत बहते पानी और साबुन से पांच मिनट तक धोएं। घाव को दबाएं या चूसे नहीं। वाटरप्रूफ पट्टी लगाएं और दो घंटे के भीतर पीईपी उपचार के लिए रिपोर्ट करें। रक्त रिसाव होने पर: क्षेत्र को सुरक्षित करें, पीपीई पहनें, सोखने वाले तौलिए बिछाएं और एक प्रतिशत सोडियम हाइपोक्लोराइट डालकर बीस मिनट बाद साफ करें।",
            "steps": [
                "सुई चुभने पर घाव को साबुन और बहते पानी से पांच मिनट धोएं।",
                "घाव को बिल्कुल न दबाएं; साफ पट्टी लगाएं।",
                "दो घंटे के भीतर नोडल अधिकारी को सूचित कर पीईपी शुरू करें।",
                "रक्त गिरने पर सोखने वाले कपड़े पर एक प्रतिशत ब्लीच डालें और बीस मिनट बाद पोंछें।"
            ]
        }
    },
    "mr": {
        "master": {
            "title": "मास्टर क्लिनिकल सुरक्षा आणि बायोमेडिकल कचरा व्यवस्थापन",
            "summary": "बायोमेडिकल कचरा व्यवस्थापन आणि क्लिनिकल सुरक्षा मार्गदर्शिकेत आपले स्वागत आहे. सर्व आरोग्य कर्मचारी आणि कचरा हाताळणाऱ्यांनी नियमांचे काटेकोरपणे पालन केले पाहिजे. पीपीई किट, दुहेरी नायट्रिल हातमोजे आणि एन-95 मास्क नेहमी वापरा. कचरा उत्पत्तीच्या ठिकाणी चार रंगांमध्ये वेगळा करा: पिवळा - संसर्गजन्य कचरा; लाल - पुनर्वापरयोग्य प्लास्टिक; पांढरा - टोकदार सुया आणि ब्लेड; आणि निळा - काचेच्या बाटल्या व धातू. सुई टोचल्यास दोन तासांत नोंद करा.",
            "steps": [
                "कचऱ्याला स्पर्श करण्यापूर्वी पूर्ण पीपीई आणि दुहेरी हातमोजे वापरा.",
                "कचरा चार रंगांच्या डब्यांमध्ये त्वरित वेगळा करा.",
                "सुईला हाताने टोपण लावू नका; कटरचा वापर करा.",
                "पिशवी पाऊण भरल्यावर बारकोड लावून सील करा.",
                "सुई टोचल्यास पाच मिनिटे साबणाने धुवा आणि त्वरित कळवा."
            ]
        },
        "yellow": {
            "title": "पिवळा वर्ग: संसर्गजन्य व अवयव कचरा खबरदारी",
            "summary": "पिवळ्या कचऱ्यामध्ये मानवी अवयव, रक्त लागलेले कापूस, मलमपट्टी आणि मुदत संपलेली औषधे येतात. बायोहॅझार्ड चिन्ह असलेली पिवळी पिशवी वापरा. पिशवी तीन चतुर्थांश भरल्यावर घट्ट बांधा. संसर्गजन्य कचरा ४८ तासांच्या आत इन्सिनरेशनसाठी पाठवा.",
            "steps": [
                "दुहेरी नायट्रिल हातमोजे आणि एन-९५ मास्क वापरा.",
                "बायोहॅझार्ड चिन्ह असलेली पिवळी पिशवीच वापरा.",
                "पिशवी पाऊणपेक्षा जास्त भरू नका.",
                "पिशवी हाताने किंवा पायाने दाबू नका.",
                "४८ तासांच्या आत कचऱ्याची विल्हेवाट लावा."
            ]
        },
        "red": {
            "title": "लाल वर्ग: दूषित पुनर्वापरयोग्य प्लास्टिक कचरा",
            "summary": "लाल कचऱ्यामध्ये सुई नसलेली प्लास्टिक सिरिंज, आयव्ही नळ्या, कॅथेटर आणि रबरी हातमोजे येतात. सुई कटरने कापूनच सिरिंज लाल डब्यात टाका. प्लास्टिकचे निर्जंतुकीकरण सोडियम हायपोक्लोराइटने किंवा ऑटोक्लेव्हने करा.",
            "steps": [
                "सिरिंजची सुई कटरने कापूनच लाल डब्यात टाका.",
                "आयव्ही आणि लघवीच्या पिशव्यांमधील द्रव पूर्णपणे रिकामे करा.",
                "मजबूत हातमोजे आणि फेस शील्ड वापरा.",
                "लाल पिशवीत काच किंवा सुई टाकू नका."
            ]
        },
        "white": {
            "title": "पांढरा वर्ग: टोकदार सुया, ब्लेड आणि धातू कचरा",
            "summary": "पांढऱ्या वर्गात इंजेक्शनच्या सुया, ब्लेड आणि टोकदार धातू येतात. नेहमी छिद्र-प्रतिरोधक पांढरा डबा वापरा. सुईला हाताने पुन्हा टोपण लावू नका. डबा भरल्यावर कायमस्वरूपी बंद करा.",
            "steps": [
                "सुई त्वरित पांढऱ्या छिद्र-प्रतिरोधक डब्यात टाका.",
                "सुई हाताने कधीही झाकू नका किंवा वाकवू नका.",
                "बेडजवळ इलेक्ट्रिक बर्नर वापरा.",
                "डबा भरल्यावर कायमस्वरूपी लॉक करा."
            ]
        },
        "blue": {
            "title": "निळा वर्ग: काचेच्या बाटल्या आणि धातूचे रोपण",
            "summary": "निळ्या कचऱ्यामध्ये काचेच्या बाटल्या, अँप्युल्स आणि ऑर्थोपेडिक धातूच्या प्लेट्स येतात. फुटलेली काच कधीही हाताने उचलू नका, चिमटा वापरा. १% सोडियम हायपोक्लोराइटने निर्जंतुक करा.",
            "steps": [
                "काचेच्या सर्व बाटल्या निळ्या डब्यात गोळा करा.",
                "फुटलेली काच हाताने न उचलता चिमट्याने उचला.",
                "सोडियम हायपोक्लोराइटने निर्जंतुक करा."
            ]
        },
        "purple": {
            "title": "सायटोटॉक्सिक आणि केमोथेरपी कर्करोग कचरा",
            "summary": "सायटोटॉक्सिक कचऱ्यात केमोथेरपी औषधे आणि दूषित नळ्या येतात. जांभळ्या बायोहॅझार्ड पिशवीत कचरा ठेवा. केमो-प्रमाणित हातमोजे वापरा. गळती झाल्यास स्पिल किट वापरा.",
            "steps": [
                "केमो-प्रमाणित दुहेरी हातमोजे वापरा.",
                "जांभळ्या पिशवीत सर्व केमो कचरा ठेवा.",
                "उच्च तापमानावर इन्सिनरेशन करा."
            ]
        },
        "general": {
            "title": "सामान्य बिनधोकादायक रुग्णालय कचरा",
            "summary": "स्वच्छ कागद, पुठ्ठा, उरलेले अन्न आणि पाण्याचे कप हिरव्या किंवा काळ्या डब्यात टाका. यात कोणताही संसर्गजन्य कचरा किंवा सुया मिसळू नका.",
            "steps": [
                "स्वच्छ कागद आणि उरलेले अन्न हिरव्या डब्यात टाका.",
                "संसर्गजन्य कचरा यात अजिबात टाकू नका."
            ]
        },
        "emergency": {
            "title": "तातडीची सुई टोचणे आणि रक्त गळती नियमावली",
            "summary": "सुई टोचल्यास: जखम वाहत्या पाण्याखाली साबणाने पाच मिनिटे धुवा. जखम दाबू नका. निर्जंतुक पट्टी बांधा आणि २ तासांच्या आत डॉक्टरांना कळवून पीईपी सुरू करा. रक्त सांडल्यास १% सोडियम हायपोक्लोराइट टाकून २० मिनिटांनी पुसून घ्या.",
            "steps": [
                "सुई टोचल्यास वाहत्या पाण्याखाली ५ मिनिटे साबणाने धुवा.",
                "जखम दाबू नका; स्वच्छ मलमपट्टी लावा.",
                "२ तासांच्या आत पीईपी औषधोपचार सुरू करा.",
                "रक्त सांडल्यास १% ब्लिच टाकून २० मिनिटांनी स्वच्छ करा."
            ]
        }
    },
    "ta": {
        "master": {
            "title": "மருத்துவ கழிவு பாதுகாப்பு மற்றும் மேலாண்மை சுருக்கம்",
            "summary": "மருத்துவக் கழிவு மேலாண்மை வழிகாட்டிக்கு வரவேற்கிறோம். மருத்துவப் பணியாளர்கள் அனைவரும் பிபிஇ கவச உடைகள், இரட்டை கையுறைகள் மற்றும் முகக்கவசங்களை கட்டாயம் அணிய வேண்டும். கழிவுகளை நான்கு வண்ணங்களில் பிரிக்கவும்: மஞ்சள் - தொற்று மற்றும் உடல் திசு கழிவுகள்; சிவப்பு - மறுசுழற்சி பிளாஸ்டிக்; வெள்ளை - ஊசிகள் மற்றும் பிளேடுகள்; நீலம் - கண்ணாடி பாட்டில்கள் மற்றும் உலோகங்கள். ஊசி குத்தினால் 2 மணி நேரத்திற்குள் மருத்துவரை அணுகவும்.",
            "steps": [
                "கழிவுகளை தொடுவதற்கு முன் முழு பிபிஇ கவச உடை அணியவும்.",
                "நான்கு வண்ண தொட்டிகளில் கழிவுகளை பிரிக்கவும்.",
                "ஊசிகளுக்கு கையால் மூடி போட வேண்டாம்.",
                "முக்கால் பங்கு நிறைந்த பைகளை சீல் செய்யவும்.",
                "ஊசி குத்தினால் 5 நிமிடங்கள் கழுவி 2 மணி நேரத்தில் தெரிவிக்கவும்."
            ]
        },
        "yellow": {
            "title": "மஞ்சள் பிரிவு: தொற்று மற்றும் உடற்கூறு கழிவுகள்",
            "summary": "மஞ்சள் பிரிவில் மனித திசுக்கள், ரத்தம் படிந்த பஞ்சு, கட்டுகள் மற்றும் காலாவதியான மருந்துகள் அடங்கும். மஞ்சள் நிற பைகளை பயன்படுத்தவும். முக்கால் பங்கு நிறைந்தவுடன் சீல் செய்து 48 மணி நேரத்திற்குள் அப்புறப்படுத்தவும்.",
            "steps": [
                "இரட்டை நைட்ரைல் கையுறைகள் அணியவும்.",
                "மஞ்சள் பைகளை மட்டுமே பயன்படுத்தவும்.",
                "48 மணி நேரத்திற்குள் அப்புறப்படுத்தவும்."
            ]
        },
        "red": {
            "title": "சிவப்பு பிரிவு: மறுசுழற்சி செய்யக்கூடிய பிளாஸ்டிக் கழிவுகள்",
            "summary": "ஊசி இல்லாத சிரின்ஞ்கள், ஐ.வி குழாய்கள் மற்றும் சிறுநீர் பைகள் சிவப்பு தொட்டியில் போடப்பட வேண்டும். ஊசியை கட்டர் கொண்டு வெட்டிய பின்பே சிரின்ஞ்களை போடவும். ஒரு சதவீத சோடியம் ஹைபோகுளோரைட் கொண்டு கிருமி நீக்கம் செய்யவும்.",
            "steps": [
                "ஊசியை வெட்டிய பின்பே சிரின்ஞ்களை போடவும்.",
                "திரவங்களை முழுமையாக வெளியேற்றவும்.",
                "கிருமி நீக்கம் செய்து மறுசுழற்சிக்கு அனுப்பவும்."
            ]
        },
        "white": {
            "title": "வெள்ளை பிரிவு: கூர்மையான ஊசிகள் மற்றும் பிளேடுகள்",
            "summary": "ஊசிகள், அறுவை சிகிச்சை பிளேடுகள் ஆகியவற்றை துளையிட முடியாத வெள்ளை கொள்கலனில் போடவும். ஊசிகளுக்கு கையால் மூடி போட வேண்டாம். கொள்கலன் முக்கால் பங்கு நிறைந்ததும் நிரந்தரமாக மூடவும்.",
            "steps": [
                "வெள்ளை பஞ்சர்-ப்ரூப் தொட்டியில் போடவும்.",
                "கையால் ரீகேப் செய்யக்கூடாது.",
                "முழுமையாக லாக் செய்யவும்."
            ]
        },
        "blue": {
            "title": "நீல பிரிவு: கண்ணாடி மற்றும் உலோகப் பொருட்கள்",
            "summary": "மருந்து கண்ணாடி பாட்டில்கள் மற்றும் உலோக தகடுகள் நீலப் பெட்டியில் சேகரிக்கப்படும். உடைந்த கண்ணாடியை கைகளால் தொடாமல் இடுக்கிகள் மூலம் எடுக்கவும்.",
            "steps": [
                "நீல பெட்டியில் கண்ணாடியை சேகரிக்கவும்.",
                "இடுக்கிகளை மட்டுமே பயன்படுத்தவும்."
            ]
        },
        "purple": {
            "title": "சைட்டோடாக்சிக் கீமோதெரபி புற்றுநோய் கழிவுகள்",
            "summary": "கீமோதெரபி மருந்துகள் மற்றும் கழிவுகளுக்கு ஊதா நிற பைகளை பயன்படுத்தவும். இரட்டை கையுறைகள் அணியவும். 1200 டிகிரிக்கு மேல் எரிக்கப்பட வேண்டும்.",
            "steps": [
                "இரட்டை கையுறைகள் அணியவும்.",
                "ஊதா பைகளில் சேகரிக்கவும்."
            ]
        },
        "general": {
            "title": "பொதுவான ஆபத்தில்லாத மருத்துவமனை கழிவுகள்",
            "summary": "காகித அட்டை, உணவு கழிவுகள் மற்றும் பிளாஸ்டிக் உறைகளை பச்சை அல்லது கருப்பு தொட்டியில் போடவும். மருத்துவ தொற்று கழிவுகளை இதில் கலக்காதீர்கள்.",
            "steps": [
                "உணவு மற்றும் காகித கழிவுகளை பச்சை தொட்டியில் போடவும்."
            ]
        },
        "emergency": {
            "title": "அவசர ஊசி குத்துதல் மற்றும் ரத்தக் கசிவு நெறிமுறை",
            "summary": "ஊசி குத்தினால்: 5 நிமிடங்கள் ஓடும் நீரில் சோப்பு போட்டு கழுவவும். காயத்தை அழுத்தவோ உறிஞ்சவோ கூடாது. 2 மணி நேரத்திற்குள் பிஇபி பரிசோதனை செய்யவும். ரத்தம் சிதறினால் 1% சோடியம் ஹைபோகுளோரைட் ஊற்றி 20 நிமிடங்கள் கழித்து சுத்தம் செய்யவும்.",
            "steps": [
                "ஓடும் நீரில் 5 நிமிடங்கள் கழுவவும்.",
                "2 மணி நேரத்திற்குள் பிஇபி தொடங்கவும்."
            ]
        }
    },
    "te": {
        "master": {
            "title": "మాస్టర్ క్లినికల్ భద్రత & బయోమెడికల్ వ్యర్థాల నిర్వహణ",
            "summary": "బయోమెడికల్ వ్యర్థాల నిర్వహణ మరియు సేఫ్టీ గైడ్‌కు స్వాగతం. ఆరోగ్య కార్యకర్తలు తప్పనిసరిగా పీపీఈ కిట్లు, డబుల్ గ్లోవ్స్ ధరించాలి. వ్యర్థాలను నాలుగు రంగులలో వేరు చేయండి: పసుపు - ఇన్ఫెక్షియస్ వ్యర్థాలు; ఎరుపు - రీసైకిల్ ప్లాస్టిక్స్; తెలుపు - సూదులు మరియు బ్లేడ్లు; నీలం - గాజు సీసాలు. సూది గుచ్చుకుంటే 2 గంటల్లో రిపోర్ట్ చేయండి.",
            "steps": [
                "కచరాను తాకే ముందు పీపీఈ కిట్ ధరించండి.",
                "నాలుగు రంగుల డబ్బాలలో వ్యర్థాలను వేరు చేయండి.",
                "సూదులను చేతులతో రీక్యాప్ చేయవద్దు.",
                "మూడు వంతులు నిండాక సీల్ చేయండి.",
                "సూది గుచ్చుకుంటే 5 నిమిషాలు కడిగి 2 గంటల్లో తెలపండి."
            ]
        },
        "yellow": {
            "title": "పసుపు విభాగం: ఇన్ఫెక్షియస్ & అనాటమికల్ వ్యర్థాలు",
            "summary": "పసుపు రంగులో మానవ కణజాలాలు, రక్తపు పట్టీలు, దూది మరియు కాలం చెల్లిన మందులు వేయాలి. పసుపు సంచులను మాత్రమే వాడండి. మూడు వంతులు నిండాక సీల్ చేసి 48 గంటల్లో ఇన్సిలరేషన్‌కు పంపండి.",
            "steps": [
                "డబుల్ గ్లోవ్స్ ధరించండి.",
                "పసుపు సంచులలోనే వేయండి.",
                "48 గంటల్లో విలేవారీ చేయండి."
            ]
        },
        "red": {
            "title": "ఎరుపు విభాగం: పునర్వినియోగ ప్లాస్టిక్ వ్యర్థాలు",
            "summary": "సూది లేని సిరంజీలు, ఐవీ ట్యూబ్‌లు ఎరుపు డబ్బాలో వేయాలి. సూది కట్టర్‌తో కట్ చేసి మాత్రమే సిరంజీ వేయండి. సోడియం హైపోక్లోరైట్‌తో క్రిమిసంహారక చేయండి.",
            "steps": [
                "సూదిని కత్తిరించి మాత్రమే వేయండి.",
                "ద్రవాలను పూర్తిగా తొలగించండి."
            ]
        },
        "white": {
            "title": "తెలుపు విభాగం: పదునైన సూదులు & బ్లేడ్లు",
            "summary": "సూదులు, స్కాల్పెల్ బ్లేడ్లను పంక్చర్-ప్రూఫ్ తెల్లటి డబ్బాలో వేయాలి. సూదులకు చేతులతో క్యాప్ పెట్టవద్దు. డబ్బా నిండాక శాశ్వతంగా లాక్ చేయండి.",
            "steps": [
                "తెల్లటి డబ్బాలోనే సూదులు వేయండి.",
                "చేత్తో క్యాప్ పెట్టవద్దు."
            ]
        },
        "blue": {
            "title": "నీలం విభాగం: గాజుసామాను & లోహపు ఇంప్లాంట్లు",
            "summary": "గాజు సీసాలు, యాంప్యూల్స్ మరియు మెటల్ ప్లేట్లను నీలి పెట్టెలో వేయాలి. పగిలిన గాజును చేతులతో తాకవద్దు, ఫోర్సెప్స్ వాడండి.",
            "steps": [
                "గాజు సామానును నీలి పెట్టెలో వేయండి.",
                "ఇక్కళతో మాత్రమే ఎత్తండి."
            ]
        },
        "purple": {
            "title": "సైటోటాక్సిక్ కీమోథెరపీ వ్యర్థాలు",
            "summary": "కీమోథెరపీ మందుల వ్యర్థాల కోసం ఊదా రంగు బ్యాగులను వాడండి. డబుల్ గ్లోవ్స్ ధరించాలి. పన్నెండు వందల డిగ్రీల వద్ద దహనం చేయండి.",
            "steps": [
                "ఊదా రంగు సంచులను వాడండి.",
                "అధిక ఉష్ణోగ్రత వద్ద దహనం చేయండి."
            ]
        },
        "general": {
            "title": "సాధారణ ప్రమాదకరం కాని ఆసుపత్రి వ్యర్థాలు",
            "summary": "కాగితాలు, ఆహార వ్యర్థాలను ఆకుపచ్చ లేదా నల్ల డబ్బాల్లో వేయాలి. బయోమెడికల్ వ్యర్థాలను ఇందులో కలపవద్దు.",
            "steps": [
                "సాధారణ చెత్తను ఆకుపచ్చ డబ్బాలో వేయండి."
            ]
        },
        "emergency": {
            "title": "అత్యవసర సూది గుచ్చుకోవడం & రక్తపు చిందటం నిబంధనలు",
            "summary": "సూది గుచ్చుకుంటే: 5 నిమిషాలు ప్రవహించే నీటితో సబ్బుతో కడగాలి. గాయాన్ని నొక్కవద్దు. 2 గంటల్లో వైద్యుడిని సంప్రదించి పెప్ చికిత్స పొందండి.",
            "steps": [
                "5 నిమిషాలు నీటితో కడగాలి.",
                "2 గంటల్లో పెప్ చికిత్స తీసుకోండి."
            ]
        }
    },
    "bn": {
        "master": {
            "title": "বায়োমেডিকেল বর্জ্য ও ক্লিনিকাল সুরক্ষা নির্দেশিকা",
            "summary": "মেডওয়েস্ট এআই ক্লিনিকাল সেফটি গাইডে স্বাগতম। সমস্ত স্বাস্থ্যকর্মীদের পিপিই কিট এবং গ্লাভস পরা বাধ্যতামূলক। চারটি রঙে বর্জ্য পৃথক করুন: হলুদ - সংক্রামক বর্জ্য; লাল - পুনর্ব্যবহারযোগ্য প্লাস্টিক; সাদা - সূঁচ ও ধারালো ব্লেড; নীল - কাঁচের শিশি ও ধাতু। সূঁচ ফুটলে ২ ঘণ্টার মধ্যে রিপোর্ট করুন।",
            "steps": [
                "বর্জ্য ছোঁয়ার আগে সম্পূর্ণ পিপিই পরুন।",
                "চারটি রঙের বাক্সে বর্জ্য আলাদা করুন।",
                "খালি হাতে সূঁচে ক্যাপ লাগাবেন না।",
                "তিন-চতুর্থাংশ পূর্ণ হলে ব্যাগ সিল করুন।",
                "সূঁচ ফুটলে ৫ মিনিট ধুয়ে ২ ঘণ্টায় রিপোর্ট করুন।"
            ]
        },
        "yellow": {
            "title": "হলুদ বিভাগ: সংক্রামক ও অঙ্গপ্রত্যঙ্গ বর্জ্য",
            "summary": "হলুদ ব্যাগে মানব অঙ্গ, রক্তমাখা গজ, ব্যান্ডেজ এবং মেয়াদোত্তীর্ণ ওষুধ ফেলতে হবে। নন-ক্লোরিনেটেড হলুদ ব্যাগ ব্যবহার করুন এবং তিন-চতুর্থাংশ পূর্ণ হলে বন্ধ করে ৪৮ ঘণ্টার মধ্যে বিনষ্ট করুন।",
            "steps": [
                "ডাবল গ্লাভস ব্যবহার করুন।",
                "হলুদ ব্যাগেই সংক্রামক বর্জ্য ফেলুন।",
                "৪৮ ঘণ্টায় বিনষ্ট করুন।"
            ]
        },
        "red": {
            "title": "লাল বিভাগ: দূষিত পুনর্ব্যবহারযোগ্য প্লাস্টিক",
            "summary": "সূঁচ ছাড়া প্লাস্টিক সিরিঞ্জ, আইভি টিউব লাল বাক্সে ফেলতে হবে। নিডল কাটার দিয়ে সুঁই কাটার পরেই সিরিঞ্জ ফেলুন। সোডিয়াম হাইপোক্লোরাইট দিয়ে জীবাণুমুক্ত করুন।",
            "steps": [
                "সূঁচ কেটে সিরিঞ্জ লাল বাক্সে ফেলুন।",
                "তরল সম্পূর্ণ খালি করুন।"
            ]
        },
        "white": {
            "title": "সাদা বিভাগ: ধারালো সূঁচ এবং ব্লেড সতর্কতা",
            "summary": "ইনজেকশন সূঁচ ও সার্জিকাল ব্লেড শক্ত সাদা বাক্সে ফেলতে হবে। খালি হাতে সূঁচে ক্যাপ লাগাবেন না। বাক্স পূর্ণ হলে সিল করে দিন।",
            "steps": [
                "শক্ত সাদা পাত্রে সূঁচ রাখুন।",
                "কখনো হাত দিয়ে সূঁচ ঢাকবেন না।"
            ]
        },
        "blue": {
            "title": "নীল বিভাগ: কাঁচের পাত্র এবং ধাতব ইমপ্লান্ট",
            "summary": "ওষুধের কাঁচের অ্যাম্পুল এবং ধাতব প্লেট নীল বাক্সে রাখতে হবে। ভাঙা কাঁচ কখনো হাত দিয়ে তুলবেন না, চিমটা ব্যবহার করুন।",
            "steps": [
                "কাঁচের শিশি নীল বক্সে রাখুন।",
                "চিমটা দিয়ে ভাঙা কাঁচ তুলুন।"
            ]
        },
        "purple": {
            "title": "সাইটোটক্সিক ও কেমোথেরাপি ক্যান্সার বর্জ্য",
            "summary": "কেমোথেরাপি ওষুধের বর্জ্যের জন্য বেগুনি ব্যাগ ব্যবহার করুন। ডাবল গ্লাভস পরুন এবং অতি উচ্চ তাপমাত্রায় পুড়িয়ে ফেলুন।",
            "steps": [
                "বেগুনি ব্যাগ ব্যবহার করুন।",
                "উচ্চ তাপমাত্রায় বিনষ্ট করুন।"
            ]
        },
        "general": {
            "title": "সাধারণ অ-বিপজ্জনক হাসপাতাল বর্জ্য",
            "summary": "কাগজ, খাবারের উচ্ছিষ্ট এবং প্যাকেট সবুজ বা কালো বিনে ফেলুন। কোনো ক্লিনিকাল বর্জ্য এতে মেশাবেন না।",
            "steps": [
                "সবুজ বা কালো বিনে সাধারণ বর্জ্য ফেলুন।"
            ]
        },
        "emergency": {
            "title": "জরুরি সূঁচ ফোটা এবং রক্ত ছিটকে পড়ার প্রটোকল",
            "summary": "সূঁচ ফুটলে: সাবান ও জল দিয়ে ৫ মিনিট ক্ষতস্থান ধোবেন। ক্ষত চিপবেন না। ২ ঘণ্টার মধ্যে পেপ মূল্যায়ন করান। রক্ত ছিটকে পড়লে ১% সোডিয়াম হাইপোক্লোরাইট দিয়ে ২০ মিনিট ভিজিয়ে পরিষ্কার করুন।",
            "steps": [
                "৫ মিনিট সাবান জলে ধোন।",
                "২ ঘণ্টার মধ্যে পেপ চিকিৎসা নিন।"
            ]
        }
    },
    "gu": {
        "master": {
            "title": "ક્લિનિકલ સલામતી અને બાયોમેડિકલ કચરો વ્યવસ્થાપન માર્ગદર્શિકા",
            "summary": "બાયોમેડિકલ વેસ્ટ મેનેજમેન્ટ ગાઇડમાં આપનું સ્વાગત છે. હંમેશા પીપીઈ કિટ અને નાઇટ્રાઇલ ગ્લોવ્ઝ પહેરો. કચરાને ચાર રંગોમાં અલગ કરો: પીળો - ચેપી કચરો; લાલ - પ્લાસ્ટિક સિરીંજ અને આઈવી સેટ; સફેદ - સોય અને બ્લેડ; વાદળી - કાચની શીશીઓ. સોય વાગે તો બે કલાકમાં જાણ કરો.",
            "steps": [
                "કચરો અડતાં પહેલાં પીપીઈ અને ગ્લોવ્ઝ પહેરો.",
                "ચાર રંગના ડબ્બાઓમાં કચરો અલગ કરો.",
                "સોયને હાથથી રીકેપ ન કરો.",
                "પોણી થેલી ભરાય ત્યારે સીલ કરો.",
                "સોય વાગે તો ૫ મિનિટ ધોઈ ૨ કલાકમાં જાણ કરો."
            ]
        },
        "yellow": {
            "title": "પીળો વર્ગ: ચેપી અને એનાટોમિકલ કચરો",
            "summary": "પીળી થેલીમાં માનવ અંગો, લોહીવાળા પાટા અને દબાયેલી દવાઓ નાખો. થેલી પોણી ભરાય ત્યારે સીલ કરી ૪૮ કલાકમાં ઇન્સિનરેશન માટે મોકલો.",
            "steps": [
                "પીળી થેલી જ વાપરો.",
                "૪૮ કલાકમાં નષ્ટ કરો."
            ]
        },
        "red": {
            "title": "લાલ વર્ગ: રિસાયકલ પ્લાસ્ટિક કચરો",
            "summary": "સોય વગરની પ્લાસ્ટિક સિરીંજ અને આઈવી પાઈપ લાલ ડબ્બામાં નાખો. સિરીંજની સોય કાપ્યા પછી જ ડબ્બામાં નાખો.",
            "steps": [
                "સોય કાપીને સિરીંજ લાલ ડબ્બામાં નાખો."
            ]
        },
        "white": {
            "title": "સફેદ વર્ગ: તીક્ષ્ણ સોય અને બ્લેડ",
            "summary": "ઇન્જેક્શનની સોય અને બ્લેડ પંચર-પ્રૂફ સફેદ કન્ટેનરમાં નાખો. સોયને હાથથી રીકેપ ન કરો.",
            "steps": [
                "સફેદ કન્ટેનરમાં સોય નાખો.",
                "હાથથી ઢાંકશો નહીં."
            ]
        },
        "blue": {
            "title": "વાદળી વર્ગ: કાચનો કચરો અને ધાતુઓ",
            "summary": "દવાની કાચની બોટલો વાદળી બોક્સમાં રાખો. તૂટેલા કાચને ચીપિયા વડે જ ઉપાડો.",
            "steps": [
                "કાચની બોટલો વાદળી બોક્સમાં રાખો.",
                "ચીપિયો વાપરો."
            ]
        },
        "purple": {
            "title": "સાયટોટોક્સિક કીમોથેરાપી કચરો",
            "summary": "કીમોથેરાપી કચરા માટે જાંબલી બેગ વાપરો અને બારસો ડિગ્રીથી વધુ તાપમાને નષ્ટ કરો.",
            "steps": [
                "જાંબલી થેલી વાપરો."
            ]
        },
        "general": {
            "title": "સામાન્ય બિન-જોખમી કચરો",
            "summary": "સાફ કાગળ અને વધેલું ભોજન લીલા અથવા કાળા ડબ્બામાં નાખો.",
            "steps": [
                "લીલા કે કાળા ડબ્બામાં કચરો નાખો."
            ]
        },
        "emergency": {
            "title": "ઇમરજન્સી સોય વાગવા અને બ્લડ સ્પિલ પ્રોટોકોલ",
            "summary": "સોય વાગે તો: ૫ મિનિટ વહેતા પાણી અને સાબુથી ઘા ધોવો. ૨ કલાકમાં પેપ સારવાર લો.",
            "steps": [
                "૫ મિનિટ સાબુથી ધોવો.",
                "૨ કલાકમાં સારવાર લો."
            ]
        }
    },
    "kn": {
        "master": {
            "title": "ಕ್ಲಿನಿಕಲ್ ಸುರಕ್ಷತೆ ಮತ್ತು ಬಯೋಮೆಡಿಕಲ್ ತ್ಯಾಜ್ಯ ಮಾರ್ಗದರ್ಶಿ",
            "summary": "ಬಯೋಮೆಡಿಕಲ್ ತ್ಯಾಜ್ಯ ವಿಲೇವಾರಿ ಮಾರ್ಗದರ್ಶಿಗೆ ಸುಸ್ವಾಗತ. ಆರೋಗ್ಯ ಸಿಬ್ಬಂದಿ ಕಡ್ಡಾಯವಾಗಿ ಪಿಪಿಇ ಕಿಟ್ ಮತ್ತು ಕೈಗವಸು ಧರಿಸಬೇಕು. ತ್ಯಾಜ್ಯವನ್ನು ನಾಲ್ಕು ಬಣ್ಣಗಳಲ್ಲಿ ವಿಂಗಡಿಸಿ: ಹಳದಿ - ಸೋಂಕು ತ್ಯಾಜ್ಯ; ಕೆಂಪು - ಪ್ಲಾಸ್ಟಿಕ್ ಸಿರಿಂಜ್‌ಗಳು; ಬಿಳಿ - ಸೂಜಿಗಳು ಮತ್ತು ಬ್ಲೇಡ್‌ಗಳು; ನೀಲಿ - ಗಾಜಿನ ಬಾಟಲಿಗಳು. ಸೂಜಿ ಚುಚ್ಚಿದರೆ 2 ಗಂಟೆಗಳಲ್ಲಿ ವರದಿ ಮಾಡಿ.",
            "steps": [
                "ತ್ಯಾಜ್ಯ ಮುಟ್ಟುವ ಮೊದಲು ಪಿಪಿಇ ಧರಿಸಿ.",
                "ನಾಲ್ಕು ಬಣ್ಣಗಳ ಡಬ್ಬಿಯಲ್ಲಿ ತ್ಯಾಜ್ಯ ಬೇರ್ಪಡಿಸಿ.",
                "ಸೂಜಿಗೆ ಕೈಯಿಂದ ಮುಚ್ಚಳ ಹಾಕಬೇಡಿ.",
                "ಚೀಲ ಮುಕ್ಕಾಲು ತುಂಬಿದಾಗ ಸೀಲ್ ಮಾಡಿ.",
                "ಸೂಜಿ ಚುಚ್ಚಿದರೆ 5 ನಿಮಿಷ ತೊಳೆದು 2 ಗಂಟೆಯೊಳಗೆ ವರದಿ ಮಾಡಿ."
            ]
        },
        "yellow": {
            "title": "ಹಳದಿ ವರ್ಗ: ಸೋಂಕು ಮತ್ತು ಅಂಗಾಂಶ ತ್ಯಾಜ್ಯ",
            "summary": "ಮಾನವ ಅಂಗಾಂಶಗಳು, ರಕ್ತದ ಬ್ಯಾಂಡೇಜ್‌ಗಳನ್ನು ಹಳದಿ ಚೀಲದಲ್ಲಿ ಹಾಕಿ 48 ಗಂಟೆಗಳ ಒಳಗೆ ವಿಲೇವಾರಿ ಮಾಡಿ.",
            "steps": [
                "ಹಳದಿ ಚೀಲ ಬಳಸಿ.",
                "48 ಗಂಟೆಗಳಲ್ಲಿ ವಿಲೇವಾರಿ ಮಾಡಿ."
            ]
        },
        "red": {
            "title": "ಕೆಂಪು ವರ್ಗ: ಮರುಬಳಕೆ ಪ್ಲಾಸ್ಟಿಕ್ ತ್ಯಾಜ್ಯ",
            "summary": "ಸೂಜಿ ಇಲ್ಲದ ಸಿರಿಂಜ್‌ಗಳು ಮತ್ತು ಐವಿ ಟ್ಯೂಬ್‌ಗಳನ್ನು ಕೆಂಪು ಡಬ್ಬದಲ್ಲಿ ಹಾಕಿ ಸೋಂಕು ನಿವಾರಣೆ ಮಾಡಿ.",
            "steps": [
                "ಸೂಜಿ ಕತ್ತರಿಸಿ ಸಿರಿಂಜ್ ಹಾಕಿ."
            ]
        },
        "white": {
            "title": "ಬಿಳಿ ವರ್ಗ: ಚೂಪಾದ ಸೂಜಿಗಳು ಮತ್ತು ಬ್ಲೇಡ್‌ಗಳು",
            "summary": "ಸೂಜಿಗಳನ್ನು ಪಂಕ್ಚರ್-ಪ್ರೂಫ್ ಬಿಳಿ ಡಬ್ಬದಲ್ಲಿ ಹಾಕಿ. ಕೈಯಿಂದ ಸೂಜಿಗೆ ಮುಚ್ಚಳ ಹಾಕಬೇಡಿ.",
            "steps": [
                "ಬಿಳಿ ಡಬ್ಬದಲ್ಲಿ ಸೂಜಿ ಹಾಕಿ."
            ]
        },
        "blue": {
            "title": "ನೀಲಿ ವರ್ಗ: ಗಾಜಿನ ಸಾಮಾನು ಮತ್ತು ಲೋಹ",
            "summary": "ಔಷಧದ ಗಾಜಿನ ಸೀಸೆಗಳನ್ನು ನೀಲಿ ಪೆಟ್ಟಿಗೆಯಲ್ಲಿ ಇರಿಸಿ. ಒಡೆದ ಗಾಜನ್ನು ಇಕ್ಕಳದಿಂದ ಮಾತ್ರ ಎತ್ತಿ.",
            "steps": [
                "ನೀಲಿ ಡಬ್ಬ ಬಳಸಿ."
            ]
        },
        "purple": {
            "title": "ಸೈಟೊಟಾಕ್ಸಿಕ್ ಕೀಮೋಥೆರಪಿ ತ್ಯಾಜ್ಯ",
            "summary": "ಕೀಮೋಥೆರಪಿ ತ್ಯಾಜ್ಯಕ್ಕೆ ನೇರಳೆ ಚೀಲಗಳನ್ನು ಬಳಸಿ ಮತ್ತು ಹೆಚ್ಚಿನ ತಾಪಮಾನದಲ್ಲಿ ಸುಟ್ಟುಹಾಕಿ.",
            "steps": [
                "ನೇರಳೆ ಚೀಲ ಬಳಸಿ."
            ]
        },
        "general": {
            "title": "ಸಾಮಾನ್ಯ ಅಪಾಯಕಾರಿಯಲ್ಲದ ತ್ಯಾಜ್ಯ",
            "summary": "ಕಾಗದ ಮತ್ತು ಆಹಾರದ ತ್ಯಾಜ್ಯವನ್ನು ಹಸಿರು ಅಥವಾ ಕಪ್ಪು ಡಬ್ಬದಲ್ಲಿ ಹಾಕಿ.",
            "steps": [
                "ಹಸಿರು ಡಬ್ಬ ಬಳಸಿ."
            ]
        },
        "emergency": {
            "title": "ತುರ್ತು ಸೂಜಿ ಚುಚ್ಚುವಿಕೆ ಪ್ರೋಟೋಕಾಲ್",
            "summary": "ಸೂಜಿ ಚುಚ್ಚಿದರೆ: 5 ನಿಮಿಷ ಹರಿಯುವ ನೀರಿನಲ್ಲಿ ಸಾಬೂನಿನಿಂದ ತೊಳೆಯಿರಿ ಮತ್ತು 2 ಗಂಟೆಯೊಳಗೆ ಪಿಇಪಿ ಪರೀಕ್ಷೆ ಮಾಡಿಸಿಕೊಳ್ಳಿ.",
            "steps": [
                "5 ನಿಮಿಷ ಸಾಬೂನಿನಿಂದ ತೊಳೆಯಿರಿ.",
                "2 ಗಂಟೆಯಲ್ಲಿ ಪಿಇಪಿ ಪರೀಕ್ಷೆ ಮಾಡಿ."
            ]
        }
    },
    "ml": {
        "master": {
            "title": "മാസ്റ്റർ ക്ലിനിക്കൽ സുരക്ഷയും ബയോമെഡിക്കൽ മാലിന്യ പരിപാലനവും",
            "summary": "ബയോമെഡിക്കൽ മാലിന്യ സംസ്കരണ ഗൈഡിലേക്ക് സ്വാഗതം. ആരോഗ്യ പ്രവർത്തകർ പിപിഇ കിറ്റ്, കയ്യുറകൾ എന്നിവ ധരിക്കണം. മാലിന്യങ്ങൾ നാല് നിറങ്ങളിലായി തരംതിരിക്കുക: മഞ്ഞ - അണുബാധയുള്ള മാലിന്യങ്ങൾ; ചുവപ്പ് - പ്ലാസ്റ്റിക് സിറിഞ്ചുകൾ; വെളുപ്പ് - സൂചികളും ബ്ലേഡുകളും; നീല - കുപ്പികളും ഗ്ലാസും. സൂചി കൊണ്ടാൽ 2 മണിക്കൂറിനകം റിപ്പോർട്ട് ചെയ്യുക.",
            "steps": [
                "മാലിന്യങ്ങൾ കൈകാര്യം ചെയ്യുമ്പോൾ പിപിഇ ധരിക്കുക.",
                "നാല് നിറങ്ങളിലായി തരംതിരിക്കുക.",
                "സൂചികൾ റീക്യാപ്പ് ചെയ്യരുത്.",
                "മുക്കാൽ ഭാഗം നിറഞ്ഞാൽ സീൽ ചെയ്യുക.",
                "സൂചി കൊണ്ടാൽ 5 മിനിറ്റ് കഴുകി 2 മണിക്കൂറിൽ അറിയിക്കുക."
            ]
        },
        "yellow": {
            "title": "മഞ്ഞ വിഭാഗം: അണുബാധയുള്ള ജൈവ മാലിന്യങ്ങൾ",
            "summary": "ശരീരഭാഗങ്ങൾ, രക്തം പുരണ്ട പഞ്ഞി എന്നിവ മഞ്ഞ ബാഗിൽ നിക്ഷേപിച്ച് 48 മണിക്കൂറിനകം സംസ്കരിക്കുക.",
            "steps": [
                "മഞ്ഞ ബാഗിൽ നിക്ഷേപിക്കുക.",
                "48 മണിക്കൂറിനകം സംസ്കരിക്കുക."
            ]
        },
        "red": {
            "title": "ചുവപ്പ് വിഭാഗം: പുനരുപയോഗിക്കാവുന്ന പ്ലാസ്റ്റിക്",
            "summary": "സൂചി മാറ്റിയ സിറിഞ്ചുകളും ഐവി ട്യൂബുകളും ചുവന്ന ബിന്നിൽ നിക്ഷേപിക്കുക.",
            "steps": [
                "സൂചി മുറിച്ച ശേഷം ഇടുക."
            ]
        },
        "white": {
            "title": "വെള്ള വിഭാഗം: മൂർച്ചയുള്ള സൂചികളും ബ്ലേഡുകളും",
            "summary": "സൂചികൾ തുളച്ചുകയറാത്ത വെളുത്ത ബോക്സിൽ നിക്ഷേപിക്കുക. കൈകൊണ്ട് സൂചി റീക്യാപ്പ് ചെയ്യരുത്.",
            "steps": [
                "വെളുത്ത ബോക്സ് ഉപയോഗിക്കുക."
            ]
        },
        "blue": {
            "title": "നീല വിഭാഗം: ഗ്ലാസ് മരുന്ന് കുപ്പികൾ",
            "summary": "മരുന്ന് കുപ്പികൾ നീല പെട്ടിയിൽ സൂക്ഷിക്കുക. പൊട്ടിയ ഗ്ലാസ് കൈകൊണ്ട് എടുക്കരുത്.",
            "steps": [
                "നീല ബോക്സിൽ ഇടുക."
            ]
        },
        "purple": {
            "title": "കീമോതെറാപ്പി സൈറ്റോടോക്സിക് മാലിന്യങ്ങൾ",
            "summary": "കീമോതെറാപ്പി മാലിന്യങ്ങൾക്ക് പർപ്പിൾ ബാഗുകൾ ഉപയോഗിക്കുക.",
            "steps": [
                "പർപ്പിൾ ബാഗ് ഉപയോഗിക്കുക."
            ]
        },
        "general": {
            "title": "സാധാരണ ആശുപത്രി മാലിന്യങ്ങൾ",
            "summary": "ഭക്ഷണാവശിഷ്ടങ്ങളും പേപ്പറും പച്ച അല്ലെങ്കിൽ കറുപ്പ് ബിന്നിൽ ഇടുക.",
            "steps": [
                "പച്ച ബിൻ ഉപയോഗിക്കുക."
            ]
        },
        "emergency": {
            "title": "അടിയന്തര സൂചി മുറിവും രക്തം ചിന്തലും",
            "summary": "സൂചി കൊണ്ടാൽ: 5 മിനിറ്റ് ഒഴുകുന്ന വെള്ളത്തിൽ സോപ്പിട്ട് കഴുകുക. 2 മണിക്കൂറിനകം പെപ് എടുക്കുക.",
            "steps": [
                "5 മിനിറ്റ് കഴുകുക.",
                "2 മണിക്കൂറിനകം പെപ് എടുക്കുക."
            ]
        }
    },
    "pa": {
        "master": {
            "title": "ਕਲੀਨਿਕਲ ਸੁਰੱਖਿਆ ਅਤੇ ਬਾਇਓਮੈਡੀਕਲ ਕੂੜਾ ਪ੍ਰਬੰਧਨ",
            "summary": "ਬਾਇਓਮੈਡੀਕਲ ਕੂੜਾ ਪ੍ਰਬੰਧਨ ਗਾਈਡ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ। ਸਾਰੇ ਸਟਾਫ ਨੂੰ ਪੀਪੀਈ ਕਿੱਟ ਅਤੇ ਦਸਤਾਨੇ ਪਾਉਣੇ ਚਾਹੀਦੇ ਹਨ। ਕੂੜੇ ਨੂੰ ਚਾਰ ਰੰਗਾਂ ਵਿੱਚ ਵੰਡੋ: ਪੀਲਾ - ਲਾਗ ਵਾਲਾ ਕੂੜਾ; ਲਾਲ - ਪਲਾਸਟਿਕ ਸਰਿੰਜਾਂ; ਚਿੱਟਾ - ਸੂਈਆਂ ਅਤੇ ਬਲੇਡ; ਨੀਲਾ - ਕੱਚ ਦੀਆਂ ਸ਼ੀਸ਼ੀਆਂ। ਸੂਈ ਚੁੱਭਣ 'ਤੇ 2 ਘੰਟਿਆਂ ਵਿੱਚ ਰਿਪੋਰਟ ਕਰੋ।",
            "steps": [
                "ਕੂੜਾ ਛੂਹਣ ਤੋਂ ਪਹਿਲਾਂ ਪੀਪੀਈ ਪਾਓ।",
                "ਚਾਰ ਰੰਗਾਂ ਵਿੱਚ ਕੂੜਾ ਵੰਡੋ।",
                "ਸੂਈ ਨੂੰ ਹੱਥ ਨਾਲ ਕੈਪ ਨਾ ਕਰੋ।",
                "ਪੌਣਾ ਭਰ ਜਾਣ 'ਤੇ ਸੀਲ ਕਰੋ।",
                "ਸੂਈ ਚੁੱਭਣ 'ਤੇ 5 ਮਿੰਟ ਧੋਵੋ ਅਤੇ 2 ਘੰਟੇ ਵਿੱਚ ਦੱਸੋ।"
            ]
        },
        "yellow": {
            "title": "ਪੀਲਾ ਵਰਗ: ਲਾਗ ਵਾਲਾ ਅਤੇ ਸਰੀਰਕ ਕੂੜਾ",
            "summary": "ਮਨੁੱਖੀ ਅੰਗ ਅਤੇ ਖੂਨ ਨਾਲ ਭਰੀਆਂ ਪੱਟੀਆਂ ਪੀਲੇ ਬੈਗ ਵਿੱਚ ਪਾਓ ਅਤੇ 48 ਘੰਟਿਆਂ ਵਿੱਚ ਨਸ਼ਟ ਕਰੋ।",
            "steps": [
                "ਪੀਲੇ ਬੈਗ ਵਿੱਚ ਪਾਓ।",
                "48 ਘੰਟੇ ਵਿੱਚ ਨਸ਼ਟ ਕਰੋ।"
            ]
        },
        "red": {
            "title": "ਲਾਲ ਵਰਗ: ਰੀਸਾਈਕਲ ਪਲਾਸਟਿਕ ਕੂੜਾ",
            "summary": "ਬਿਨਾਂ ਸੂਈ ਵਾਲੀਆਂ ਪਲਾਸਟਿਕ ਸਰਿੰਜਾਂ ਅਤੇ ਆਈਵੀ ਸੈੱਟ ਲਾਲ ਡੱਬੇ ਵਿੱਚ ਪਾਓ।",
            "steps": [
                "ਸੂਈ ਕੱਟ ਕੇ ਸਰਿੰਜ ਪਾਓ।"
            ]
        },
        "white": {
            "title": "ਚਿੱਟਾ ਵਰਗ: ਤਿੱਖੀਆਂ ਸੂਈਆਂ ਅਤੇ ਬਲੇਡ",
            "summary": "ਸੂਈਆਂ ਅਤੇ ਸਰਜੀਕਲ ਬਲੇਡ ਚਿੱਟੇ ਪੰਕਚਰ-ਪਰੂਫ ਡੱਬੇ ਵਿੱਚ ਪਾਓ। ਹੱਥ ਨਾਲ ਸੂਈ ਨੂੰ ਕੈਪ ਨਾ ਕਰੋ।",
            "steps": [
                "ਚਿੱਟੇ ਡੱਬੇ ਵਿੱਚ ਸੂਈ ਪਾਓ।"
            ]
        },
        "blue": {
            "title": "ਨੀਲਾ ਵਰਗ: ਕੱਚ ਦੀਆਂ ਸ਼ੀਸ਼ੀਆਂ ਅਤੇ ਧਾਤ",
            "summary": "ਕੱਚ ਦੀਆਂ ਦਵਾਈਆਂ ਦੀਆਂ ਸ਼ੀਸ਼ੀਆਂ ਨੀਲੇ ਬਕਸੇ ਵਿੱਚ ਰੱਖੋ। ਟੁੱਟੇ ਕੱਚ ਨੂੰ ਚਿਮਟੇ ਨਾਲ ਚੁੱਕੋ।",
            "steps": [
                "ਨੀਲੇ ਬਕਸੇ ਵਿੱਚ ਰੱਖੋ।"
            ]
        },
        "purple": {
            "title": "ਕੀਮੋਥੈਰੇਪੀ ਕੈਂਸਰ ਕੂੜਾ",
            "summary": "ਕੀਮੋਥੈਰੇਪੀ ਕੂੜੇ ਲਈ ਜਾਮਣੀ ਬੈਗ ਵਰਤੋ ਅਤੇ ਉੱਚ ਤਾਪਮਾਨ 'ਤੇ ਸਾੜੋ।",
            "steps": [
                "ਜਾਮਣੀ ਬੈਗ ਵਰਤੋ।"
            ]
        },
        "general": {
            "title": "ਆਮ ਗੈਰ-ਖਤਰਨਾਕ ਕੂੜਾ",
            "summary": "ਸਾਫ਼ ਕਾਗਜ਼ ਅਤੇ ਭੋਜਨ ਹਰੇ ਜਾਂ ਕਾਲੇ ਡੱਬੇ ਵਿੱਚ ਪਾਓ।",
            "steps": [
                "ਹਰੇ ਜਾਂ ਕਾਲੇ ਡੱਬੇ ਵਿੱਚ ਪਾਓ।"
            ]
        },
        "emergency": {
            "title": "ਐਮਰਜੈਂਸੀ ਸੂਈ ਚੁੱਭਣ ਦਾ ਪ੍ਰੋਟੋਕੋਲ",
            "summary": "ਸੂਈ ਚੁੱਭਣ 'ਤੇ: 5 ਮਿੰਟ ਵਗਦੇ ਪਾਣੀ ਅਤੇ ਸਾਬਣ ਨਾਲ ਧੋਵੋ ਅਤੇ 2 ਘੰਟਿਆਂ ਦੇ ਅੰਦਰ ਪੈਪ ਇਲਾਜ ਲਵੋ।",
            "steps": [
                "5 ਮਿੰਟ ਸਾਬਣ ਨਾਲ ਧੋਵੋ।",
                "2 ਘੰਟੇ ਵਿੱਚ ਪੈਪ ਇਲਾਜ ਲਓ।"
            ]
        }
    },
    "or": {
        "master": {
            "title": "ମାଷ୍ଟର କ୍ଲିନିକାଲ ସୁରକ୍ଷା ଏବଂ ବାୟୋମେଡିକାଲ ବର୍ଜ୍ୟବସ୍ତୁ ପରିଚାଳନା",
            "summary": "ବାୟୋମେଡିକାଲ ବର୍ଜ୍ୟବସ୍ତୁ ପରିଚାଳନା ଗାଇଡରେ ଆପଣଙ୍କୁ ସ୍ୱାଗତ। ସମସ୍ତ କର୍ମଚାରୀ ପିପିଇ କିଟ୍ ଏବଂ ଗ୍ଲୋଭସ୍ ବ୍ୟବହାର କରିବା ଉଚିତ। ବର୍ଜ୍ୟବସ୍ତୁକୁ ଚାରି ରଙ୍ଗରେ ପୃଥକ କରନ୍ତୁ: ହଳଦିଆ - ସଂକ୍ରାମକ ବର୍ଜ୍ୟ; ଲାଲ୍ - ପ୍ଲାଷ୍ଟିକ ସିରିଞ୍ଜ; ଧଳା - ଛୁଞ୍ଚି ଏବଂ ବ୍ଲେଡ୍; ନୀଳ - କାଚ ବୋତଲ। ଛୁଞ୍ଚି ଫୁଟିଲେ ୨ ଘଣ୍ଟା ମଧ୍ୟରେ ଜଣାନ୍ତୁ।",
            "steps": [
                "ବର୍ଜ୍ୟ ଛୁଇଁବା ପୂର୍ବରୁ ପିପିଇ ପିନ୍ଧନ୍ତୁ।",
                "ଚାରି ରଙ୍ଗରେ ବର୍ଜ୍ୟ ଅଲଗା କରନ୍ତୁ।",
                "ଛୁଞ୍ଚିରେ ହାତରେ ଠିପି ଲଗାନ୍ତୁ ନାହିଁ।",
                "ପାଉଣ ଭରିଲେ ସିଲ୍ କରନ୍ତୁ।",
                "ଛୁଞ୍ଚି ଫୁଟିଲେ ୫ ମିନିଟ୍ ଧୋଇ ୨ ଘଣ୍ଟାରେ ଜଣାନ୍ତୁ।"
            ]
        },
        "yellow": {
            "title": "ହଳଦିଆ ବର୍ଗ: ସଂକ୍ରାମକ ଏବଂ ଶାରୀରିକ ବର୍ଜ୍ୟ",
            "summary": "ରକ୍ତଭିଜା ପଟି, ତୁଳା ଏବଂ ଶାରୀରିକ ଅଂଶକୁ ହଳଦିଆ ବ୍ୟାଗରେ ରଖି ୪୮ ଘଣ୍ଟା ମଧ୍ୟରେ ନଷ୍ଟ କରନ୍ତୁ।",
            "steps": [
                "ହଳଦିଆ ବ୍ୟାଗ୍ ବ୍ୟବହାର କରନ୍ତୁ।",
                "୪୮ ଘଣ୍ଟାରେ ନଷ୍ଟ କରନ୍ତୁ।"
            ]
        },
        "red": {
            "title": "ଲାଲ୍ ବର୍ଗ: ପୁନଃବ୍ୟବହାରଯୋଗ୍ୟ ପ୍ଲାଷ୍ଟିକ",
            "summary": "ଛୁଞ୍ଚି ବିହୀନ ପ୍ଲାଷ୍ଟିକ ସିରିଞ୍ଜ ଏବଂ ଆଇଭି ପାଇପ୍ ଲାଲ୍ ଡବାରେ ପକାନ୍ତୁ।",
            "steps": [
                "ଛୁଞ୍ଚି କାଟି ସିରିଞ୍ଜ ପକାନ୍ତୁ।"
            ]
        },
        "white": {
            "title": "ଧଳା ବର୍ଗ: ଧାରୁଆ ଛୁଞ୍ଚି ଏବଂ ବ୍ଲେଡ୍",
            "summary": "ଛୁଞ୍ଚି ଏବଂ ବ୍ଲେଡକୁ ଧଳା ପଙ୍କଚର-ପ୍ରୁଫ୍ ପାତ୍ରରେ ରଖନ୍ତୁ। ହାତରେ ଛୁଞ୍ଚି ଠିପି ଲଗାନ୍ତୁ ନାହିଁ।",
            "steps": [
                "ଧଳା ପାତ୍ରରେ ଛୁଞ୍ଚି ରଖନ୍ତୁ।"
            ]
        },
        "blue": {
            "title": "ନୀଳ ବର୍ଗ: କାଚ ସାମଗ୍ରୀ ଏବଂ ଧାତୁ",
            "summary": "ଔଷଧ କାଚ ଶିଶି ନୀଳ ବାକ୍ସରେ ରଖନ୍ତୁ। ଭଙ୍ଗା କାଚକୁ ଚିମୁଟା ସାହାଯ୍ୟରେ ଉଠାନ୍ତୁ।",
            "steps": [
                "ନୀଳ ବାକ୍ସରେ ରଖନ୍ତୁ।"
            ]
        },
        "purple": {
            "title": "କେମୋଥେରାପି କର୍କଟ ବର୍ଜ୍ୟ",
            "summary": "କେମୋଥେରାପି ବର୍ଜ୍ୟ ପାଇଁ ବାଇଗଣୀ ବ୍ୟାଗ୍ ବ୍ୟବହାର କରନ୍ତୁ।",
            "steps": [
                "ବାଇଗଣୀ ବ୍ୟାଗ୍ ବ୍ୟବହାର କରନ୍ତୁ।"
            ]
        },
        "general": {
            "title": "ସାଧାରଣ ବିପଦମୁକ୍ତ ବର୍ଜ୍ୟ",
            "summary": "କାଗଜ ଏବଂ ଖାଦ୍ୟ ବଳକା ସବୁଜ କିମ୍ବା କଳା ଡବାରେ ପକାନ୍ତୁ।",
            "steps": [
                "ସବୁଜ କିମ୍ବା କଳା ଡବାରେ ପକାନ୍ତୁ।"
            ]
        },
        "emergency": {
            "title": "ଜରୁରୀକାଳୀନ ଛୁଞ୍ଚି ଫୁଟିବା ନିୟମ",
            "summary": "ଛୁଞ୍ଚି ଫୁଟିଲେ: ୫ ମିନିଟ୍ ଧରି ଚାଲୁଥିବା ପାଣି ଏବଂ ସାବୁନରେ ଧୁଅନ୍ତୁ ଏବଂ ୨ ଘଣ୍ଟା ମଧ୍ୟରେ ପେପ୍ ଚିକିତ୍ସା କରାନ୍ତୁ।",
            "steps": [
                "୫ ମିନିଟ୍ ସାବୁନରେ ଧୁଅନ୍ତୁ।",
                "୨ ଘଣ୍ଟାରେ ପେପ୍ ନିଅନ୍ତୁ।"
            ]
        }
    },
    "ur": {
        "master": {
            "title": "بائیو میڈیکل ویسٹ اور طبی حفاظتی رہنمائی",
            "summary": "بائیو میڈیکل ویسٹ مینجمنٹ گائیڈ میں خوش آمدید۔ تمام طبی عملے کو پی پی ای اور دستانے لازمی پہننے چاہئیں۔ کچرے کو چار رنگوں میں الگ کریں: پیلا - متعدی اور جسمانی فضلہ؛ سرخ - ری سائیکل پلاسٹک؛ سفید - سوئیاں اور بلیڈ؛ نیلا - شیشے کی بوتلیں اور دھات۔ سوئی چبھنے پر دو گھنٹے کے اندر رپورٹ کریں۔",
            "steps": [
                "فضلہ چھونے سے پہلے مکمل پی پی ای پہنیں۔",
                "چار رنگوں کے ڈبوں میں کچرا الگ کریں۔",
                "سوئی پر ہاتھ سے ڈھکن نہ لگائیں۔",
                "تین چوتھائی بھر جانے پر سیل کریں۔",
                "سوئی چبھنے پر پانچ منٹ دھوئیں اور دو گھنٹے میں رپورٹ کریں۔"
            ]
        },
        "yellow": {
            "title": "پیلا زمرہ: متعدی اور جسمانی فضلہ",
            "summary": "خون آلود پٹیاں، روئی اور انسانی اعضاء پیلے تھیلے میں ڈالیں اور 48 گھنٹے کے اندر تلف کریں۔",
            "steps": [
                "پیلے تھیلے کا استعمال کریں۔",
                "48 گھنٹے میں تلف کریں۔"
            ]
        },
        "red": {
            "title": "سرخ زمرہ: ری سائیکل پلاسٹک فضلہ",
            "summary": "سوئی کے بغیر پلاسٹک سرنج اور آئی وی سیٹ سرخ ڈبے میں ڈالیں۔ سوئی کاٹنے کے بعد ہی سرنج ڈالیں۔",
            "steps": [
                "سوئی کاٹ کر سرنج سرخ ڈبے میں ڈالیں۔"
            ]
        },
        "white": {
            "title": "سفید زمرہ: تیز دھار سوئیاں اور بلیڈ",
            "summary": "سوئیاں اور سرجیکل بلیڈ سفید سخت کنٹینر میں ڈالیں۔ سوئی کو ہاتھ سے دوبارہ بند نہ کریں۔",
            "steps": [
                "سفید کنٹینر میں سوئیاں ڈالیں۔"
            ]
        },
        "blue": {
            "title": "نیلا زمرہ: شیشے کے برتن اور دھات",
            "summary": "شیشے کی شیشیاں نیلے ڈبے میں رکھیں۔ ٹوٹا ہوا شیشہ چمٹے سے اٹھائیں۔",
            "steps": [
                "نیلے ڈبے میں رکھیں۔"
            ]
        },
        "purple": {
            "title": "کیموتھراپی کینسر کا فضلہ",
            "summary": "کیموتھراپی کے فضلے کے لیے جامنی تھیلے استعمال کریں اور انتہائی درجہ حرارت پر جلائیں۔",
            "steps": [
                "جامنی تھیلے استعمال کریں۔"
            ]
        },
        "general": {
            "title": "عام غیر مضر ہسپتال کا فضلہ",
            "summary": "کاغذ اور بچا ہوا کھانا سبز یا کالے ڈبے میں ڈالیں۔",
            "steps": [
                "سبز یا کالے ڈبے میں ڈالیں۔"
            ]
        },
        "emergency": {
            "title": "ہنگامی سوئی چبھنے کا پروٹوکول",
            "summary": "سوئی چبھنے پر: 5 منٹ بہتے پانی اور صابن سے دھوئیں اور 2 گھنٹے کے اندر پی ای پی علاج حاصل کریں۔",
            "steps": [
                "5 منٹ صابن سے دھوئیں।",
                "2 گھنٹے میں علاج لیں۔"
            ]
        }
    }
};

if (typeof window !== "undefined") {
    window.SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;
    window.PRECAUTION_TRANSCRIPTS_I18N = PRECAUTION_TRANSCRIPTS_I18N;
}
