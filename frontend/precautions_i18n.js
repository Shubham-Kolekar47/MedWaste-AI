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
            "summary": "Welcome to the MedWaste AI Clinical Safety and Waste Handling Guide. All healthcare workers, cleaning staff, and waste handlers must follow strict Bio-Medical Waste Management Rules. Segregate waste strictly at source using the four color-coded streams: Yellow for anatomical and infectious soiled waste; Red for recyclable contaminated plastics like IV sets and syringes; White translucent for sharp needles and scalpels in puncture-proof containers; and Blue for broken glass and metallic implants. In chemotherapy units, use dedicated purple cytotoxic bags. Always wear category-specific Personal Protective Equipment, never recap needles with bare hands, never compress waste bags, and report any accidental needle-stick injury immediately within two hours. Segregation saves lives.",
            "steps": [
                "Always wear category-specific Personal Protective Equipment before touching any medical waste.",
                "Segregate waste strictly at point of generation into Yellow, Red, White, and Blue containers.",
                "Never recap, bend, or break needles by hand. Use point-of-use needle destroyers.",
                "Seal and tag all biohazard bags with barcodes when they reach three-quarters capacity.",
                "In case of needle-stick injury, wash under running water immediately and report within two hours."
            ]
        },
        "yellow": {
            "title": "Yellow Bin Guide: Infectious & Anatomical Waste",
            "summary": "The Yellow Bin is exclusively designated for infectious, anatomical, and pathological biomedical waste. Items that come under the Yellow Bin include: human anatomical tissues, organs, body parts, and placentas; soiled dressings, cotton swabs, bandages, and plaster casts with blood; expired or discarded pharmaceutical medicines; and microbiology specimens, lab culture plates, and discarded live vaccines. Items that must never go into the Yellow Bin: never place needles, scalpels, blades, glass bottles, or recyclable plastics in yellow bags. Always use non-chlorinated yellow bags with the biohazard symbol, wear double nitrile gloves and an N95 mask, seal the bag at 75% capacity, and send for high-temperature incineration at 1050 degrees Celsius.",
            "steps": [
                "Deposit only infectious, anatomical, and soiled items into certified non-chlorinated yellow biohazard bags.",
                "Include human tissues, organs, blood-soaked gauze, expired drugs, and microbiology cultures.",
                "Never place needles, sharps, glass bottles, or plastic syringes into yellow bags.",
                "Don full PPE: heavy-duty nitrile gloves, N95 mask, fluid-resistant apron, and eye protection.",
                "Tie and seal yellow bags with swan-neck knots strictly when they reach three-quarters capacity.",
                "Ensure transfer for high-temperature incineration at 1050°C within forty-eight hours."
            ]
        },
        "red": {
            "title": "Red Bin Guide: Contaminated Recyclable Plastics",
            "summary": "The Red Bin is strictly reserved for contaminated recyclable plastic clinical items. Items that come under the Red Bin include: disposable plastic syringes with needles removed; intravenous IV bottles, infusion sets, and tubing; catheters, drainage tubes, and emptied urine bags; hemodialysis tubing kits; contaminated examination gloves; and blood collection vacutainer tubes. Items that must never go into the Red Bin: never throw needles, scalpels, blades, glass ampoules, or municipal trash in the red bin. Syringes must always have needle hubs cut at point of use, and all liquids must be completely drained before bagging. Disinfect with 1 to 2 percent sodium hypochlorite or autoclave before registered shredding and recycling.",
            "steps": [
                "Cut syringe needle hubs using a point-of-use mechanical cutter before dropping into the red bin.",
                "Completely drain urine bags, IV lines, and suction canisters into sanitary drainage before disposal.",
                "Deposit IV bottles, tubing, catheters, rubber gloves, and vacutainer sample tubes.",
                "Never throw hypodermic needles, surgical blades, or glass vials into red bags.",
                "Wear heavy-duty puncture-resistant utility gloves and a splash-proof face shield.",
                "Disinfect with 1 to 2 percent sodium hypochlorite or autoclave prior to registered plastic recycling."
            ]
        },
        "white": {
            "title": "White Container Guide: Sharps, Needles & Blades",
            "summary": "The White translucent container is strictly designated for contaminated metal sharps and needles that can cause puncture wounds. Items that come under the White Container include: hypodermic injection needles and fixed-needle syringes; surgical scalpel blades and handles; curved suture needles, blood lancets, and contaminated stylets; needles sheared by electric burners or hub cutters; and broken contaminated glass ampoule tips. Items that must never go into the White Container: never put soft gauze, bandages, plastic IV tubing, or general garbage here. Never recap needles using both hands. Lock the tamper-evident puncture-proof container permanently when three-quarters full for autoclaving and concrete encapsulation in a sharps pit.",
            "steps": [
                "Discard all metal sharps directly at point of use into a rigid, translucent, puncture-proof white container.",
                "Include hypodermic needles, scalpel blades, suture needles, lancets, and broken glass ampoule tips.",
                "Never recap needles by hand. If unavoidable, use the single-handed scoop technique.",
                "Use bedside electric needle burners or hub cutters immediately after injection.",
                "Never put soft cotton, gauze, plastic tubing, or non-sharp waste into white containers.",
                "Permanently lock the lid at three-quarters fill line for autoclaving and concrete pit encapsulation."
            ]
        },
        "blue": {
            "title": "Blue Bin Guide: Glassware & Metallic Implants",
            "summary": "The Blue container or cardboard box is specifically designated for clean or contaminated glassware and metallic surgical hardware. Items that come under the Blue Bin include: empty glass medicine ampoules and pharmaceutical vials; broken laboratory glassware, beakers, and test tubes; microscope glass slides and coverslips; and orthopedic metallic bone plates, screws, pins, rods, and surgical prosthetics. Items that must never go into the Blue Bin: never place needles, plastic syringes, blood-soaked cotton, or cytotoxic chemotherapy vials in the blue stream. Always handle broken glass with tongs or forceps, never with bare hands. Decontaminate with 1 percent sodium hypochlorite or autoclave before glass crushing and metal smelting.",
            "steps": [
                "Segregate all intact or broken medicine ampoules, glass vials, and metallic orthopedic implants into blue containers.",
                "Include microscope slides, lab beakers, titanium bone plates, screws, and pins.",
                "Never pick up broken glass fragments with bare hands or thin gloves; always use forceps or tongs.",
                "Never mix needles, plastic syringes, soiled dressings, or cytotoxic chemo vials into the blue stream.",
                "Pre-treat with 1 percent sodium hypochlorite disinfectant soak or autoclave sterilization.",
                "Route decontaminated glass to authorized glass recyclers and metal implants to smelting foundries."
            ]
        },
        "purple": {
            "title": "Purple Stream Guide: Cytotoxic & Chemotherapy Waste",
            "summary": "The Purple container or dedicated yellow cytotoxic bag is exclusively for hazardous cancer chemotherapy and antineoplastic waste. Items that come under the Purple Stream include: expired or leftover chemotherapy drug vials; contaminated cytotoxic IV infusion sets, bags, and tubing; gowns, masks, and gloves worn during chemo drug reconstitution; absorbent pads used for chemo spills; and patient bodily excreta within 48 hours of chemotherapy administration. Items that must never go into the Purple Stream: never discard in municipal trash or red bins, and never autoclave cytotoxic waste. Staff must double-glove with chemotherapy-rated nitrile gloves, prepare drugs in Class II biosafety cabinets, and incinerate at extreme temperatures above 1200 degrees Celsius.",
            "steps": [
                "Place all chemotherapy drugs, contaminated IV tubing, and patient excreta into purple cytotoxic bags.",
                "Wear double chemotherapy-tested nitrile gloves, an impermeable gown, and full face shield.",
                "Reconstitute all antineoplastic chemotherapy agents only inside certified Class II Biosafety Cabinets.",
                "Never autoclave cytotoxic waste, as heating volatilizes dangerous carcinogenic chemical fumes.",
                "Keep dedicated cytotoxic spill kits with neutralizing absorbent pads immediately accessible.",
                "Destroy all cytotoxic waste by high-temperature incineration exceeding 1200 degrees Celsius."
            ]
        },
        "general": {
            "title": "General Waste Guide: Non-Hazardous Municipal Waste",
            "summary": "General healthcare waste represents eighty to eighty-five percent of hospital waste and is non-hazardous. Items that come under General Waste include: clean cardboard, packaging boxes, paper stationery, food leftovers, disposable paper cups, and clean plastic wrappers. Segregate in green or black municipal bins. Strictly ensure no infectious dressings, gloves, needles, or blood-stained items enter general waste. Clean paper and cardboard should be compacted and sent for municipal recycling.",
            "steps": [
                "Deposit clean cardboard, food waste, paper cups, and clean packaging into green or black bins.",
                "Never dispose of contaminated patient dressings, cotton swabs, or needles into general bins.",
                "Keep clean recycling bins separated at nursing stations, administrative offices, and cafeterias.",
                "Conduct routine spot checks to guarantee total absence of infectious clinical waste.",
                "Partner with authorized municipal recyclers for clean paper, cardboard, and compostable waste."
            ]
        },
        "emergency": {
            "title": "Emergency Protocol Guide: Needle-Stick & Blood Spills",
            "summary": "Immediate emergency response protocols. For Needle-Stick Injury: Step 1, immediately wash the puncture wound under cool running tap water with soap for five minutes; Step 2, do not squeeze, press, or suck the wound, and apply a sterile waterproof dressing; Step 3, immediately notify your supervisor and the infection control officer; Step 4, begin Post-Exposure Prophylaxis PEP evaluation within two hours. For Blood Spills: Step 1, cordon off the area and don full PPE; Step 2, cover the spill with absorbent towels working from outside inward; Step 3, pour freshly prepared 1 percent sodium hypochlorite and wait 20 minutes; Step 4, collect towels with tongs into a yellow bag and mop the floor with disinfectant.",
            "steps": [
                "Needle-Stick Step 1: Immediately wash puncture wound under running tap water with soap for 5 minutes.",
                "Needle-Stick Step 2: Do NOT suck, squeeze, or scrub the wound harshly. Apply a sterile waterproof bandage.",
                "Needle-Stick Step 3: Report incident immediately to supervisor and receive PEP evaluation within 2 hours.",
                "Spill Step 1: Cordon off spill area and don full PPE including nitrile gloves, gown, and shoe covers.",
                "Spill Step 2: Cover liquid spill with absorbent towels and soak with freshly prepared 1% sodium hypochlorite.",
                "Spill Step 3: Wait 20 minutes contact time, scoop towels with tongs into a yellow bag, and mop thoroughly."
            ]
        }
    },
    "hi": {
        "master": {
            "title": "मास्टर क्लिनिकल सुरक्षा और बायोमेडिकल कचरा प्रबंधन सारांश",
            "summary": "बायोमेडिकल कचरा प्रबंधन और क्लिनिकल सुरक्षा गाइड में आपका स्वागत है। सभी स्वास्थ्य कर्मियों, सफाई कर्मचारियों और कचरा उठाने वालों को भारत सरकार के बायोमेडिकल वेस्ट मैनेजमेंट नियमों का कड़ाई से पालन करना चाहिए। कचरे को चार रंगों में अलग करें: पीले बैग में मानव अंग और संक्रामक पट्टियां; लाल डिब्बे में प्लास्टिक जैसे सिरिंज और आईवी पाइप; सफेद कंटेनर में नुकीली सुइयां और ब्लेड; और नीले डिब्बे में कांच की दवा की शीशियां व धातु। कीमोथेरेपी कचरे के लिए बैंगनी थैली का इस्तेमाल करें। सुई को कभी न मोड़ें और सुई चुभने पर दो घंटे के भीतर तुरंत रिपोर्ट करें। कचरे का सही अलगाव जान बचाता है।",
            "steps": [
                "कचरा छूने से पहले हमेशा डबल दस्ताने, एन-95 मास्क और सुरक्षात्मक एप्रन पहनें।",
                "कचरे को स्रोत पर ही पीले, लाल, सफेद और नीले डिब्बों में अलग करें।",
                "सुई को कभी हाथ से दोबारा कैप न करें और न ही मोड़ें; कटर का इस्तेमाल करें।",
                "थैलियां तीन-चौथाई भरने पर बारकोड टैग लगाकर सुरक्षित रूप से सील करें।",
                "सुई चुभने पर तुरंत बहते पानी से पांच मिनट धोएं और दो घंटे में रिपोर्ट करें।"
            ]
        },
        "yellow": {
            "title": "पीला डिब्बा गाइड: संक्रामक और मानव शारीरिक कचरा",
            "summary": "पीला डिब्बा केवल संक्रामक, शारीरिक और पैथोलॉजिकल बायोमेडिकल कचरे के लिए निर्धारित है। पीले डिब्बे में आने वाली चीजें हैं: मानव अंग, ऊतक, कटे हुए अंग और प्लेसेंटा; खून से सनी पट्टियां, रूई, गॉज और प्लास्टर कास्ट; एक्सपायर्ड या पुरानी दवाइयां; और माइक्रोबायोलॉजी लैब कल्चर व जीवित टीके। पीले डिब्बे में कभी भी सुई, नुकीले ब्लेड, कांच की शीशियां या प्लास्टिक की सिरिंज न डालें। हमेशा पीली गैर-क्लोरीनेटेड बायोहाजार्ड थैली का उपयोग करें, डबल दस्ताने और एन-95 मास्क पहनें, थैली को 75% भरने पर सील करें और 1050 डिग्री पर इनसिनेरेशन के लिए भेजें।",
            "steps": [
                "केवल संक्रामक और शारीरिक कचरे को पीली गैर-क्लोरीनेटेड बायोहाजार्ड थैली में डालें।",
                "मानव अंग, ऊतक, खून से सनी पट्टियां, पुरानी दवाइयां और लैब कल्चर शामिल हैं।",
                "पीले बैग में कभी भी सुई, ब्लेड, कांच या प्लास्टिक सिरिंज न डालें।",
                "डबल नाइट्राइल दस्ताने, एन-95 मास्क और वाटरप्रूफ एप्रन पहनें।",
                "थैली तीन-चौथाई भरने पर स्वान-नेक गांठ लगाकर सुरक्षित रूप से सील करें।",
                "48 घंटे के भीतर 1050 डिग्री तापमान पर इनसिनेरेशन सुनिश्चित करें।"
            ]
        },
        "red": {
            "title": "लाल डिब्बा गाइड: दूषित पुनर्चक्रण योग्य प्लास्टिक",
            "summary": "लाल डिब्बा केवल दूषित पुनर्चक्रण योग्य प्लास्टिक मेडिकल कचरे के लिए है। लाल डिब्बे में आने वाली चीजें हैं: बिना सुई वाली प्लास्टिक सिरिंज; आईवी की बोतलें, आईवी सेट और नलियां; कैथेटर और खाली किए गए यूरिन बैग; हेमोडायलिसिस किट; दूषित रबर के दस्ताने; और ब्लड सैंपल ट्यूब। लाल डिब्बे में कभी भी सुई, सर्जिकल ब्लेड, कांच या सामान्य कचरा न डालें। सिरिंज की सुई को कटर से काटकर और सारा तरल निकालकर ही डालें। 1 से 2 प्रतिशत सोडियम हाइपोक्लोराइट या ऑटोक्लेव से कीटाणुरहित करके रीसाइक्लिंग के लिए भेजें।",
            "steps": [
                "सिरिंज की सुई को कटर से काटकर ही लाल डिब्बे में डालें।",
                "यूरिन बैग और आईवी नली से सारा तरल पदार्थ पूरी तरह निकालें।",
                "आईवी बोतलें, कैथेटर, रबर दस्ताने और सैंपल ट्यूब लाल बैग में डालें।",
                "लाल बैग में कभी भी सुई, सर्जिकल ब्लेड या कांच की शीशी न डालें।",
                "मजबूत पंचर-प्रतिरोधी दस्ताने और फेस शील्ड पहनें।",
                "एक से दो प्रतिशत सोडियम हाइपोक्लोराइट या ऑटोक्लेव से कीटाणुरहित करें।"
            ]
        },
        "white": {
            "title": "सफेद डिब्बा गाइड: नुकीले कचरे, सुई और सर्जिकल ब्लेड",
            "summary": "सफेद पारभासी कंटेनर केवल धातु के नुकीले कचरे के लिए है जिससे चुभने या कटने का खतरा होता है। सफेद डिब्बे में आने वाली चीजें हैं: इंजेक्शन की सुइयां और फिक्स्ड-निडिल सिरिंज; सर्जिकल स्कैल्पल, डिस्पोजेबल ब्लेड और हैंडल; टांके लगाने की सुइयां, लैंसिट और स्टाइलट्स; इलेक्ट्रिक बर्नर से काटी गई सुइयां; और कांच की टूटी एम्प्यूल के नुकीले सिरे। इसमें कभी भी रूई, पट्टी, प्लास्टिक पाइप या सामान्य कचरा न डालें। सुई को हाथ से कभी न ढकें। तीन-चौथाई भरने पर ढक्कन स्थायी रूप से लॉक कर दें।",
            "steps": [
                "उपयोग के तुरंत बाद सुई को सफेद पंचर-प्रूफ डिब्बे में डालें।",
                "इंजेक्शन सुइयां, सर्जिकल ब्लेड, टांके की सुइयां और लैंसिट शामिल करें।",
                "सुई को हाथ से कभी न ढकें; केवल सुरक्षित स्कूप तकनीक अपनाएं।",
                "बेडसाइड पर इलेक्ट्रिक निडिल बर्नर का उपयोग करें।",
                "कंटेनर में कभी भी रूई, पट्टी या प्लास्टिक पाइप न डालें।",
                "तीन-चौथाई भरने पर डिब्बे का ढक्कन हमेशा के लिए लॉक कर दें।"
            ]
        },
        "blue": {
            "title": "नीला डिब्बा गाइड: कांच का सामान और धातु के इम्प्लांट",
            "summary": "नीला डिब्बा या कार्डबोर्ड बॉक्स केवल कांच के सामान और ऑर्थोपेडिक धातु के सामान के लिए है। नीले डिब्बे में आने वाली चीजें हैं: खाली कांच की दवा की शीशियां और एम्प्यूल; प्रयोगशाला के टूटे बीकर और टेस्ट ट्यूब; माइक्रोस्कोप की कांच की स्लाइड और कवरस्लिप; और ऑर्थोपेडिक धातु की प्लेटें, पेंच, पिन और प्रोस्थेटिक्स। नीले डिब्बे में कभी भी सुई, प्लास्टिक सिरिंज, खून से सनी रूई या कीमोथेरेपी दवाएं न डालें। टूटे कांच को कभी हाथ से न उठाएं, हमेशा चिमटे का उपयोग करें।",
            "steps": [
                "सभी कांच की शीशियों, एम्प्यूल और धातु के इम्प्लांट को नीले बॉक्स में रखें।",
                "माइक्रोस्कोप स्लाइड, टेस्ट ट्यूब, धातु की प्लेट और स्क्रू शामिल करें।",
                "टूटे कांच को कभी नंगे हाथों से न छुएं; हमेशा चिमटा इस्तेमाल करें।",
                "नीले डिब्बे में कभी भी सुई, प्लास्टिक सिरिंज या कीमो दवाएं न मिलाएं।",
                "एक प्रतिशत सोडियम हाइपोक्लोराइट या ऑटोक्लेव से कीटाणुरहित करें।",
                "कांच को रीसाइक्लिंग और धातु को पिघलाने के लिए अधिकृत केंद्रों को भेजें।"
            ]
        },
        "purple": {
            "title": "बैंगनी वर्ग गाइड: साइटोटॉक्सिक और कीमोथेरेपी कैंसर कचरा",
            "summary": "बैंगनी डिब्बा या थैली केवल कीमोथेरेपी कैंसर दवाओं और जहरीले कचरे के लिए है। बैंगनी डिब्बे में आने वाली चीजें हैं: बची हुई या एक्सपायर्ड कीमोथेरेपी दवाइयां और शीशियां; कीमोथेरेपी में प्रयुक्त आईवी बैग और पाइप; कीमो दवा बनाते समय पहने गए गाउन, मास्क और दस्ताने; और कीमो स्पिल किट के सोखने वाले पैड व मरीज का शारीरिक कचरा। इसे कभी भी सामान्य कचरे या लाल डिब्बे में न डालें और ऑटोक्लेव न करें। हमेशा डबल कीमो-रेटेड दस्ताने पहनें और 1200 डिग्री से अधिक तापमान पर इनसिनेरेशन करें।",
            "steps": [
                "सभी कीमोथेरेपी कचरे और आईवी सेट को निर्धारित बैंगनी डिब्बे में डालें।",
                "डबल कीमो-रेटेड नाइट्राइल दस्ताने, विशेष गाउन और फेस शील्ड पहनें।",
                "कीमो दवाएं केवल क्लास 2 बायोसेफ्टी कैबिनेट के अंदर ही तैयार करें।",
                "कीमो कचरे को कभी भी ऑटोक्लेव न करें, इससे जहरीली गैसें निकलती हैं।",
                "कीमो स्पिल किट को हमेशा वार्ड में तैयार रखें।",
                "बारह सौ डिग्री सेल्सियस से ऊपर उच्च तापमान पर इनसिनेरेशन करें।"
            ]
        },
        "general": {
            "title": "सामान्य कचरा गाइड: गैर-खतरनाक अस्पताल कचरा",
            "summary": "अस्पताल का अस्सी प्रतिशत कचरा गैर-खतरनाक होता है। सामान्य कचरे में आने वाली चीजें हैं: साफ कागज, गत्ता, पैकिंग बॉक्स, खाने का बचा हुआ हिस्सा, पानी के डिस्पोजेबल कप और साफ प्लास्टिक रैपर। इसे हरे या काले नगरपालिका डिब्बे में डालें। इसमें कभी भी संक्रामक पट्टियां, खून, दस्ताने या सुइयां न मिलाएं। साफ कागज और गत्ते को अलग रखकर रीसाइक्लिंग के लिए भेजें।",
            "steps": [
                "साफ कागज, खाने का कचरा और रैपर हरे या काले डिब्बे में डालें।",
                "संक्रामक पट्टियां, खून या सुइयां इसमें कभी न डालें।",
                "वार्ड और रिसेप्शन पर रीसाइक्लिंग डिब्बे अलग रखें।",
                "नियमित जांच करें कि इसमें कोई क्लिनिकल कचरा न मिले।"
            ]
        },
        "emergency": {
            "title": "आपातकालीन प्रोटोकॉल गाइड: सुई चुभने और रक्त रिसाव के नियम",
            "summary": "सुई चुभने और रक्त रिसाव पर तुरंत उठाए जाने वाले कदम। सुई चुभने पर: पहला कदम, घाव को तुरंत बहते पानी और साबुन से 5 मिनट धोएं; दूसरा कदम, घाव को दबाएं, निचोड़ें या मुंह से न चूसें, साफ वाटरप्रूफ पट्टी लगाएं; तीसरा कदम, तुरंत वार्ड इंचार्ज और संक्रमण नियंत्रण टीम को सूचित करें; चौथा कदम, दो घंटे के भीतर पीईपी (PEP) मूल्यांकन और दवा शुरू करें। रक्त रिसाव पर: पहला कदम, क्षेत्र की घेराबंदी करें और पीपीई पहनें; दूसरा कदम, सोखने वाले तौलिए बिछाएं; तीसरा कदम, 1% सोडियम हाइपोक्लोराइट डालकर 20 मिनट छोड़ें; चौथा कदम, चिमटे से तौलिए उठाकर पीली थैली में डालें और फर्श को पोंछें।",
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
            "summary": "बायोमेडिकल कचरा व्यवस्थापन आणि क्लिनिकल सुरक्षा मार्गदर्शिकेत आपले स्वागत आहे. सर्व आरोग्य कर्मचारी आणि कचरा हाताळणाऱ्यांनी नियमांचे काटेकोरपणे पालन केले पाहिजे. कचरा चार रंगांमध्ये वेगळा करा: पिवळा - संसर्गजन्य व अवयव कचरा; लाल - पुनर्वापरयोग्य प्लास्टिक; पांढरा - टोकदार सुया आणि ब्लेड; आणि निळा - काचेच्या बाटल्या व धातू. कीमोथेरपीसाठी जांभळी पिशवी वापरा. पीपीई किट नेहमी वापरा, सुईला हाताने टोपण लावू नका आणि सुई टोचल्यास दोन तासांत नोंद करा.",
            "steps": [
                "कचऱ्याला स्पर्श करण्यापूर्वी पूर्ण पीपीई आणि दुहेरी हातमोजे वापरा.",
                "कचरा चार रंगांच्या डब्यांमध्ये त्वरित वेगळा करा.",
                "सुईला हाताने टोपण लावू नका; कटरचा वापर करा.",
                "पिशवी पाऊण भरल्यावर बारकोड लावून सील करा.",
                "सुई टोचल्यास पाच मिनिटे साबणाने धुवा आणि त्वरित कळवा."
            ]
        },
        "yellow": {
            "title": "पिवळा डबा मार्गदर्शक: संसर्गजन्य व अवयव कचरा",
            "summary": "पिवळा डबा हा केवळ संसर्गजन्य, शारीरिक आणि पॅथॉलॉजिकल कचऱ्यासाठी राखीव आहे. पिवळ्या डब्यात येणाऱ्या वस्तू आहेत: मानवी अवयव, उती, शरीराचे भाग आणि वार (प्लेसेंटा); रक्ताने माखलेला कापूस, मलमपट्टी, गॉझ आणि प्लास्टर कास्ट; मुदत संपलेली किंवा जुनी औषधे; आणि मायक्रोबायोलॉजी लॅब कल्चर्स व जिवंत लस. पिवळ्या डब्यात सुया, ब्लेड, काचेच्या बाटल्या किंवा प्लास्टिक सिरिंज कधीही टाकू नका. नेहमी पिवळी बायोहॅझार्ड पिशवी वापरा, दुहेरी नायट्रिल हातमोजे घाला, पिशवी पाऊण भरल्यावर सील करा आणि १०५० अंश तापमानावर इन्सिनरेशनसाठी पाठवा.",
            "steps": [
                "फक्त संसर्गजन्य आणि शारीरिक कचरा पिवळ्या बायोहॅझार्ड पिशवीत टाका.",
                "मानवी अवयव, रक्ताने माखलेला कापूस, मुदत संपलेली औषधे आणि लॅब कल्चर समाविष्ट करा.",
                "पिवळ्या डब्यात सुया, ब्लेड, काच किंवा प्लास्टिक सिरिंज कधीही टाकू नका.",
                "दुहेरी नायट्रिल हातमोजे, एन-९५ मास्क आणि वॉटरप्रूफ एप्रन वापरा.",
                "पिशवी पाऊण भरल्यावर घट्ट बांधा आणि सील करा.",
                "४८ तासांच्या आत १०५० अंशांवर इन्सिनरेशन करा."
            ]
        },
        "red": {
            "title": "लाल डबा मार्गदर्शक: दूषित पुनर्वापरयोग्य प्लास्टिक",
            "summary": "लाल डबा फक्त प्लास्टिकच्या पुनर्वापरयोग्य मेडिकल कचऱ्यासाठी आहे. लाल डब्यात येणाऱ्या वस्तू आहेत: सुई नसलेली प्लास्टिक सिरिंज; आयव्ही बाटल्या, आयव्ही सेट आणि नळ्या; कॅथेटर आणि रिकाम्या केलेल्या लघवीच्या पिशव्या; डायलिसिस किट; दूषित रबरी हातमोजे; आणि रक्त नमुन्यांच्या व्हॅक्यूटेनर नळ्या. लाल डब्यात सुया, ब्लेड, काच किंवा सामान्य कचरा टाकू नका. सिरिंजची सुई कटरने कापून आणि सर्व द्रव रिकामे करूनच टाका. सोडियम हायपोक्लोराइटने किंवा ऑटोक्लेव्हने निर्जंतुक करून रीसायकलिंगला पाठवा.",
            "steps": [
                "सिरिंजची सुई कटरने कापूनच लाल डब्यात टाका.",
                "आयव्ही आणि लघवीच्या पिशव्यांमधील द्रव पूर्णपणे रिकामे करा.",
                "आयव्ही बाटल्या, कॅथेटर, रबरी हातमोजे आणि सॅम्पल ट्यूब लाल डब्यात टाका.",
                "लाल पिशवीत सुया, ब्लेड किंवा काच टाकू नका.",
                "मजबूत हातमोजे आणि फेस शील्ड वापरा.",
                "सोडियम हायपोक्लोराइटने किंवा ऑटोक्लेव्हने निर्जंतुक करा."
            ]
        },
        "white": {
            "title": "पांढरा डबा मार्गदर्शक: टोकदार सुया, ब्लेड आणि धातू कचरा",
            "summary": "पांढरा छिद्र-प्रतिरोधक डबा हा फक्त टोकदार सुया, ब्लेड आणि धातूच्या कचऱ्यासाठी आहे ज्यामुळे इजा होऊ शकते. पांढऱ्या डब्यात येणाऱ्या वस्तू आहेत: इंजेक्शनच्या सुया आणि फिक्स्ड सिरिंज; सर्जिकल स्कॅल्पल, ब्लेड आणि हँडल्स; टाके घालण्याच्या सुया आणि लॅन्सेट; इलेक्ट्रिक बर्नरने कापलेल्या सुया; आणि फुटलेल्या अँप्युल्सचे टोकदार तुकडे. यात कापूस, मलमपट्टी किंवा प्लास्टिक नळ्या टाकू नका. सुईला हाताने टोपण लावू नका. डबा पाऊण भरल्यावर कायमस्वरूपी लॉक करा.",
            "steps": [
                "सुई त्वरित पांढऱ्या छिद्र-प्रतिरोधक डब्यात टाका.",
                "इंजेक्शन सुया, सर्जिकल ब्लेड, टाके घालण्याच्या सुया समाविष्ट करा.",
                "सुई हाताने कधीही झाकू नका किंवा वाकवू नका.",
                "बेडजवळ इलेक्ट्रिक बर्नर किंवा कटर वापरा.",
                "यात कापूस, मलमपट्टी किंवा प्लास्टिक नळ्या टाकू नका.",
                "डबा पाऊण भरल्यावर कायमस्वरूपी लॉक करा."
            ]
        },
        "blue": {
            "title": "निळा डबा मार्गदर्शक: काचेच्या वस्तू आणि धातूचे रोपण",
            "summary": "निळा डबा किंवा बॉक्स हा फक्त काचेच्या वस्तू आणि ऑर्थोपेडिक धातूच्या रोपणासाठी आहे. निळ्या डब्यात येणाऱ्या वस्तू आहेत: रिकाम्या काचेच्या बाटल्या आणि अँप्युल्स; प्रयोगशाळेतील फुटलेले काचेचे बीकर आणि टेस्ट ट्यूब; मायक्रोस्कोपच्या काचेच्या स्लाइड्स; आणि ऑर्थोपेडिक धातूच्या प्लेट्स, स्क्रू, पिना व प्रोस्थेटिक्स. यात सुया, प्लास्टिक सिरिंज किंवा केमो औषधे टाकू नका. फुटलेली काच हाताळण्यासाठी नेहमी चिमटा वापरा.",
            "steps": [
                "काचेच्या सर्व बाटल्या आणि धातूचे रोपण निळ्या डब्यात गोळा करा.",
                "मायक्रोस्कोप स्लाइड्स, लॅब बीकर आणि धातूच्या प्लेट्स समाविष्ट करा.",
                "फुटलेली काच हाताने न उचलता चिमट्याने उचला.",
                "यात सुया, प्लास्टिक सिरिंज किंवा केमो औषधे टाकू नका.",
                "१% सोडियम हायपोक्लोराइटने निर्जंतुक करा.",
                "काच रीसायकलिंगला आणि धातू वितळवण्यासाठी पाठवा."
            ]
        },
        "purple": {
            "title": "जांभळा वर्ग मार्गदर्शक: सायटोटॉक्सिक आणि केमोथेरपी कर्करोग कचरा",
            "summary": "जांभळा डबा हा फक्त सायटोटॉक्सिक आणि केमोथेरपी कर्करोग कचऱ्यासाठी आहे. जांभळ्या डब्यात येणाऱ्या वस्तू आहेत: मुदत संपलेली किंवा उरलेली केमो औषधे आणि बाटल्या; केमोथेरपीचे आयव्ही बॅग्स आणि नळ्या; केमो औषध तयार करताना वापरलेले गाऊन, मास्क आणि हातमोजे; आणि केमो स्पिल किटचे पॅड्स व रुग्णाचे शारीरिक उत्सर्जन. हा कचरा सामान्य कचऱ्यात टाकू नका आणि ऑटोक्लेव करू नका. दुहेरी केमो हातमोजे वापरा आणि १२०० अंशांपेक्षा जास्त तापमानावर इन्सिनरेशन करा.",
            "steps": [
                "जांभळ्या पिशवीत सर्व केमो कचरा आणि आयव्ही सेट ठेवा.",
                "केमो-प्रमाणित दुहेरी हातमोजे, गाऊन आणि फेस शील्ड वापरा.",
                "केमो औषधे फक्त क्लास २ बायोसेफ्टी कॅबिनेटमध्ये तयार करा.",
                "केमो कचरा ऑटोक्लेव करू नका, विषारी वायू तयार होतात.",
                "स्पिल किट नेहमी वॉर्डमध्ये उपलब्ध ठेवा.",
                "१२०० अंश सेल्सिअसपेक्षा जास्त तापमानावर इन्सिनरेशन करा."
            ]
        },
        "general": {
            "title": "सामान्य कचरा मार्गदर्शक: बिनधोकादायक रुग्णालय कचरा",
            "summary": "स्वच्छ कागद, पुठ्ठा, पॅकिंग बॉक्स, उरलेले अन्न आणि पाण्याचे डिस्पोजेबल कप हिरव्या किंवा काळ्या डब्यात टाका. यात कोणताही संसर्गजन्य कचरा, मलमपट्टी, रक्त किंवा सुया मिसळू नका. स्वच्छ कागद आणि पुठ्ठा महानगरपालिकेच्या रीसायकलिंगला पाठवा.",
            "steps": [
                "स्वच्छ कागद आणि उरलेले अन्न हिरव्या डब्यात टाका.",
                "संसर्गजन्य कचरा यात अजिबात टाकू नका.",
                "रीसायकलिंग डबे वेगळे ठेवा."
            ]
        },
        "emergency": {
            "title": "तातडीची नियमावली मार्गदर्शक: सुई टोचणे आणि रक्त सांडण्यावर उपाय",
            "summary": "सुई टोचल्यास: १. जखम त्वरित नळाच्या वाहत्या पाण्याखाली साबणाने ५ मिनिटे धुवा; २. जखम दाबू नका किंवा चोळू नका, निर्जंतुक पट्टी लावा; ३. त्वरित वॉर्ड प्रमुखांना कळवा; ४. २ तासांच्या आत पीईपी उपचार सुरू करा. रक्त सांडल्यास: १. जागा सुरक्षित करा आणि पीपीई वापरा; २. सांडलेल्या रक्तावर टॉवेल टाकून १% सोडियम हायपोक्लोराइट टाका आणि २० मिनिटे थांबा; ३. चिमट्याने ते पिवळ्या पिशवीत भरा आणि फरशी स्वच्छ पुसा.",
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
            "summary": "மருத்துவக் கழிவு மேலாண்மை வழிகாட்டிக்கு வரவேற்கிறோம். கழிவுகளை நான்கு வண்ணங்களில் பிரிக்கவும்: மஞ்சள் - தொற்று மற்றும் உடல் திசு கழிவுகள்; சிவப்பு - மறுசுழற்சி பிளாஸ்டிக்; வெள்ளை - ஊசிகள் மற்றும் பிளேடுகள்; நீலம் - கண்ணாடி பாட்டில்கள் மற்றும் உலோகங்கள். பிபிஇ கவச உடைகளை கட்டாயம் அணியவும். ஊசிகளுக்கு கையால் மூடி போட வேண்டாம். ஊசி குத்தினால் 2 மணி நேரத்திற்குள் மருத்துவரை அணுகவும்.",
            "steps": [
                "கழிவுகளை தொடுவதற்கு முன் முழு பிபிஇ கவச உடை அணியவும்.",
                "நான்கு வண்ண தொட்டிகளில் கழிவுகளை பிரிக்கவும்.",
                "ஊசிகளுக்கு கையால் மூடி போட வேண்டாம்.",
                "முக்கால் பங்கு நிறைந்த பைகளை சீல் செய்யவும்.",
                "ஊசி குத்தினால் 5 நிமிடங்கள் கழுவி 2 மணி நேரத்தில் தெரிவிக்கவும்."
            ]
        },
        "yellow": {
            "title": "மஞ்சள் தொட்டி வழிகாட்டி: தொற்று மற்றும் உடற்கூறு கழிவுகள்",
            "summary": "மஞ்சள் தொட்டி தொற்று மற்றும் மனித உடற்கூறு கழிவுகளுக்கு மட்டுமே உரியது. மஞ்சள் தொட்டியில் போட வேண்டிய பொருட்கள்: மனித திசுக்கள், உறுப்புகள் மற்றும் நஞ்சுக்கொடி; ரத்தம் படிந்த பஞ்சு, கட்டுகள், கசிவு துணிகள் மற்றும் பிளாஸ்டர்; காலாவதியான மருந்துகள்; மைக்ரோபயாலஜி கலாச்சார தட்டுகள் மற்றும் தடுப்பூசிகள். மஞ்சள் பைகளில் ஊசிகள், கத்திகள், கண்ணாடி அல்லது பிளாஸ்டிக் போடக்கூடாது. மஞ்சள் பயோஹசார்ட் பைகளை பயன்படுத்தி 1050 டிகிரியில் எரிக்க வேண்டும்.",
            "steps": [
                "தொற்று மற்றும் உடல் கழிவுகளை மஞ்சள் பைகளில் போடவும்.",
                "மனித உறுப்புகள், ரத்தக் கட்டுகள் மற்றும் காலாவதி மருந்துகளை சேர்க்கவும்.",
                "ஊசிகள் அல்லது கண்ணாடியை இதில் போடக்கூடாது.",
                "இரட்டை நைட்ரைல் கையுறைகள் அணியவும்.",
                "முக்கால் பங்கு நிறைந்தவுடன் சீல் செய்யவும்."
            ]
        },
        "red": {
            "title": "சிவப்பு தொட்டி வழிகாட்டி: மறுசுழற்சி பிளாஸ்டிக் கழிவுகள்",
            "summary": "சிவப்பு தொட்டி மறுசுழற்சி செய்யக்கூடிய பிளாஸ்டிக் மருத்துவ கழிவுகளுக்கு மட்டுமே. இதில் போட வேண்டிய பொருட்கள்: ஊசி இல்லாத பிளாஸ்டிக் சிரிஞ்ச்கள், ஐவி பாட்டில்கள் மற்றும் குழாய்கள், சிறுநீர் பைகள், டயாலிசிஸ் குழாய்கள் மற்றும் ரப்பர் கையுறைகள். ஊசிகள் அல்லது கண்ணாடிகளை இதில் போடக்கூடாது. சிரிஞ்ச் முனையை வெட்டி, திரவங்களை முழுமையாக அகற்றி கிருமி நீக்கம் செய்து மறுசுழற்சிக்கு அனுப்பவும்.",
            "steps": [
                "ஊசியை வெட்டிய பின்பே சிரிஞ்ச்களை போடவும்.",
                "சிறுநீர் மற்றும் ஐவி திரவங்களை முழுமையாக வெளியேற்றவும்.",
                "ஐவி பாட்டில்கள், குழாய்கள் மற்றும் கையுறைகளை போடவும்.",
                "கிருமி நீக்கம் செய்து மறுசுழற்சிக்கு அனுப்பவும்."
            ]
        },
        "white": {
            "title": "வெள்ளை தொட்டி வழிகாட்டி: கூர்மையான ஊசிகள் மற்றும் பிளேடுகள்",
            "summary": "வெள்ளை ஒளிபுகும் கொள்கலன் கூர்மையான ஊசிகள் மற்றும் அறுவை சிகிச்சை பிளேடுகளுக்கு மட்டுமே. இதில் போட வேண்டியவை: ஊசிகள், சிரிஞ்ச்கள், அறுவை சிகிச்சை பிளேடுகள், தையல் ஊசிகள் மற்றும் உடைந்த கண்ணாடி துண்டுகள். இதில் பஞ்சு அல்லது பிளாஸ்டிக் போடக்கூடாது. ஊசிகளுக்கு கையால் ரீகேப் செய்யக்கூடாது. முக்கால் பங்கு நிறைந்தவுடன் கொள்கலனை நிரந்தரமாக மூடவும்.",
            "steps": [
                "வெள்ளை பஞ்சர்-ப்ரூப் தொட்டியில் ஊசிகளை போடவும்.",
                "ஊசிகள், பிளேடுகள் மற்றும் தையல் ஊசிகளை சேர்க்கவும்.",
                "கையால் ரீகேப் செய்யக்கூடாது.",
                "முக்கால் பங்கு நிறைந்ததும் நிரந்தரமாக லாக் செய்யவும்."
            ]
        },
        "blue": {
            "title": "நீல தொட்டி வழிகாட்டி: கண்ணாடி மற்றும் உலோகப் பொருட்கள்",
            "summary": "நீலப் பெட்டி கண்ணாடி பாட்டில்கள் மற்றும் உலோக எலும்பு தகடுகளுக்கு உரியது. இதில் போட வேண்டியவை: மருந்து ஆம்பூல்கள், கண்ணாடி பாட்டில்கள், ஆய்வக கண்ணாடி குடுவைகள் மற்றும் ஆர்த்தோபெடிக் உலோக தகடுகள் மற்றும் திருகுகள். உடைந்த கண்ணாடியை கையால் தொடாமல் இடுக்கிகள் மூலம் எடுக்கவும். கிருமி நீக்கம் செய்து மறுசுழற்சிக்கு அனுப்பவும்.",
            "steps": [
                "நீல பெட்டியில் கண்ணாடி மற்றும் உலோகங்களை சேகரிக்கவும்.",
                "உடைந்த கண்ணாடியை இடுக்கிகள் மூலம் மட்டுமே எடுக்கவும்.",
                "கிருமி நீக்கம் செய்து மறுசுழற்சிக்கு அனுப்பவும்."
            ]
        },
        "purple": {
            "title": "சைட்டோடாக்சிக் கீமோதெரபி புற்றுநோய் கழிவுகள்",
            "summary": "கீமோதெரபி மருந்துகள், பயன்படுத்தப்பட்ட ஐவி பைகள் மற்றும் புற்றுநோய் மருந்து கழிவுகளுக்கு ஊதா நிற பைகளை பயன்படுத்தவும். இரட்டை கையுறைகள் அணியவும். 1200 டிகிரிக்கு மேல் எரிக்கப்பட வேண்டும்.",
            "steps": [
                "ஊதா பைகளில் கீமோ கழிவுகளை சேகரிக்கவும்.",
                "இரட்டை கையுறைகள் அணியவும்.",
                "1200 டிகிரிக்கு மேல் எரிக்கவும்."
            ]
        },
        "general": {
            "title": "பொதுவான ஆபத்தில்லாத மருத்துவமனை கழிவுகள்",
            "summary": "காகித அட்டை, உணவு கழிவுகள் மற்றும் பிளாஸ்டிக் உறைகளை பச்சை அல்லது கருப்பு தொட்டியில் போடவும். மருத்துவ தொற்று கழிவுகளை இதில் கலக்காதீர்கள்.",
            "steps": [
                "காகிதம் மற்றும் உணவு கழிவுகளை பச்சை தொட்டியில் போடவும்.",
                "தொற்று கழிவுகளை இதில் கலக்காதீர்கள்."
            ]
        },
        "emergency": {
            "title": "அவசர ஊசி குத்துதல் மற்றும் ரத்த கசிவு வழிகாட்டி",
            "summary": "ஊசி குத்தினால்: 5 நிமிடங்கள் சோப்பு மற்றும் ஓடும் நீரில் கழுவவும். காயத்தை அழுத்தவோ உறிஞ்சவோ கூடாது. 2 மணி நேரத்திற்குள் பிஇபி சிகிச்சை தொடங்கவும். ரத்தம் சிந்தினால்: 1% சோடியம் ஹைபோகுளோரைட் ஊற்றி 20 நிமிடங்கள் கழித்து துடைக்கவும்.",
            "steps": [
                "5 நிமிடங்கள் ஓடும் நீரில் கழுவவும்.",
                "காயத்தை அழுத்த வேண்டாம்.",
                "2 மணி நேரத்தில் மருத்துவரை அணுகவும்."
            ]
        }
    },
    "te": {
        "master": {
            "title": "మాస్టర్ క్లినికల్ సేఫ్టీ మరియు బయోమెడికల్ వ్యర్థాల నిర్వహణ",
            "summary": "బయోమెడికల్ వ్యర్థాల నిర్వహణ గైడ్‌కు స్వాగతం. వ్యర్థాలను నాలుగు రంగుల్లో వేరు చేయండి: పసుపు - ఇన్ఫెక్షియస్ మరియు అవయవ వ్యర్థాలు; ఎరుపు - రీసైకిల్ ప్లాస్టిక్; తెలుపు - పదునైన సూదులు మరియు బ్లేడ్లు; నీలం - గాజు సీసాలు మరియు లోహాలు. పీపీఈ కిట్లు తప్పనిసరిగా ధరించండి. సూది గుచ్చుకుంటే 2 గంటల్లో రిపోర్ట్ చేయండి.",
            "steps": [
                "వ్యర్థాలను ముట్టుకునే ముందు పీపీఈ ధరించండి.",
                "నాలుగు రంగుల డబ్బాల్లో వ్యర్థాలను వేరు చేయండి.",
                "సూదులకు చేత్తో క్యాప్ పెట్టవద్దు.",
                "సూది గుచ్చుకుంటే 5 నిమిషాలు కడిగి 2 గంటల్లో తెలపండి."
            ]
        },
        "yellow": {
            "title": "పసుపు డబ్బా గైడ్: ఇన్ఫెక్షియస్ మరియు అవయవ వ్యర్థాలు",
            "summary": "పసుపు డబ్బా కేవలం ఇన్ఫెక్షన్ మరియు మానవ శరీర వ్యర్థాల కోసం మాత్రమే. ఇందులో వేయవలసిన వస్తువులు: మానవ కణజాలం, అవయవాలు మరియు మాయ (ప్లాసెంటా); రక్తంతో తడిసిన దూది, బ్యాండేజీలు మరియు ప్లాస్టర్ కాస్ట్‌లు; గడువు ముగిసిన మందులు; ల్యాబ్ కల్చర్స్ మరియు టీకాలు. ఇందులో సూదులు, బ్లేడ్లు లేదా గాజు వేయకూడదు. నాన్-క్లోరినేటెడ్ పసుపు బ్యాగులు ఉపయోగించి 1050 డిగ్రీల వద్ద దహనం చేయాలి.",
            "steps": [
                "ఇన్ఫెక్షన్ మరియు మానవ శరీర వ్యర్థాలను పసుపు బ్యాగులో వేయండి.",
                "రక్తంతో తడిసిన దూది, అవయవాలు మరియు గడువు ముగిసిన మందులు వేయండి.",
                "ఇందులో సూదులు లేదా ప్లాస్టిక్ వేయకూడదు.",
                "డబుల్ గ్లౌవ్స్ మరియు ఎన్-95 మాస్క్ ధరించండి."
            ]
        },
        "red": {
            "title": "ఎరుపు డబ్బా గైడ్: కలుషిత రీసైకిల్ ప్లాస్టిక్",
            "summary": "ఎరుపు డబ్బా కేవలం రీసైకిల్ చేయగల ప్లాస్టిక్ వ్యర్థాల కోసం. ఇందులో వేయవలసినవి: సూది లేని ప్లాస్టిక్ సిరంజిలు; ఐవి బాటిళ్లు, పైపులు; క్యాథెటర్లు మరియు యూరిన్ బ్యాగులు; రబ్బరు గ్లౌవ్స్. ఇందులో సూదులు లేదా గాజు వేయరాదు. సిరంజి సూదిని కట్టర్‌తో కట్ చేసి, ద్రవాలను పూర్తిగా తొలగించి రీసైక్లింగ్‌కు పంపండి.",
            "steps": [
                "సిరంజి సూదిని కట్ చేసి మాత్రమే ఎరుపు డబ్బాలో వేయండి.",
                "యూరిన్ మరియు ఐవి ద్రవాలను పూర్తిగా ఖాళీ చేయండి.",
                "ఐవి బాటిళ్లు మరియు రబ్బరు గ్లౌవ్స్ వేయండి.",
                "శుద్ధి చేసిన తర్వాత రీసైక్లింగ్‌కు పంపండి."
            ]
        },
        "white": {
            "title": "తెలుపు డబ్బా గైడ్: పదునైన సూదులు మరియు బ్లేడ్లు",
            "summary": "తెలుపు పంచర్-ప్రూఫ్ కంటైనర్ పదునైన సూదులు మరియు బ్లేడ్ల కోసం మాత్రమే. ఇందులో వేయవలసినవి: ఇంజెక్షన్ సూదులు, సర్జికల్ బ్లేడ్లు, కుట్ల సూదులు మరియు విరిగిన గాజు ముక్కలు. ఇందులో దూది లేదా ప్లాస్టిక్ వేయకూడదు. సూదికి చేత్తో క్యాప్ పెట్టవద్దు. ముప్పావు వంతు నిండిన తర్వాత మూత లాక్ చేయండి.",
            "steps": [
                "సూదులను వెంటనే తెలుపు పంచర్-ప్రూఫ్ డబ్బాలో వేయండి.",
                "ఇంజెక్షన్ సూదులు మరియు సర్జికల్ బ్లేడ్లు వేయండి.",
                "చేత్తో సూదికి క్యాప్ పెట్టవద్దు.",
                "నిండిన తర్వాత శాశ్వతంగా లాక్ చేయండి."
            ]
        },
        "blue": {
            "title": "నీలం డబ్బా గైడ్: గాజు సామాగ్రి మరియు లోహాలు",
            "summary": "నీలం డబ్బా గాజు సీసాలు మరియు ఆర్థోపెడిక్ లోహాల కోసం. ఇందులో మందు గాజు సీసాలు, ల్యాబ్ బీకర్లు, స్లైడ్లు మరియు లోహపు ప్లేట్లు వేయండి. విరిగిన గాజును చేత్తో తాకకుండా పట్టుకారుతో తీయండి. శుద్ధి చేసి రీసైక్లింగ్‌కు పంపండి.",
            "steps": [
                "గాజు సీసాలు మరియు లోహాలను నీలం డబ్బాలో వేయండి.",
                "విరిగిన గాజును పట్టుకారుతో మాత్రమే ఎత్తండి.",
                "డిసిన్‌ఫెక్ట్ చేసి రీసైక్లింగ్‌కు పంపండి."
            ]
        },
        "purple": {
            "title": "సైటోటాక్సిక్ కీమోథెరపీ క్యాన్సర్ వ్యర్థాలు",
            "summary": "కీమోథెరపీ మందులు, ఐవి బ్యాగులు మరియు వ్యర్థాలను ఊదా రంగు బ్యాగులో వేయండి. డబుల్ గ్లౌవ్స్ ధరించండి మరియు 1200 డిగ్రీల వద్ద దహనం చేయండి.",
            "steps": [
                "ఊదా బ్యాగులో కీమో వ్యర్థాలు వేయండి.",
                "డబుల్ గ్లౌవ్స్ ధరించండి.",
                "1200 డిగ్రీల వద్ద కాల్చండి."
            ]
        },
        "general": {
            "title": "సాధారణ ప్రమాదకరం కాని వ్యర్థాలు",
            "summary": "కాగితం, ఆహార వ్యర్థాలు మరియు ప్లాస్టిక్ కవర్లను ఆకుపచ్చ లేదా నలుపు డబ్బాలో వేయండి.",
            "steps": [
                "ఆకుపచ్చ డబ్బాలో కాగితం మరియు ఆహారం వేయండి."
            ]
        },
        "emergency": {
            "title": "అత్యవసర సూది గుచ్చుకోవడం మరియు రక్తపు చిందుల నియమావళి",
            "summary": "సూది గుచ్చుకుంటే: 5 నిమిషాలు ప్రవహించే నీరు మరియు సబ్బుతో కడగండి. గాయాన్ని నొక్కవద్దు. 2 గంటల్లో పెప్ చికిత్స ప్రారంభించండి. రక్తం చిందితే: 1% బ్లీచ్ పోసి 20 నిమిషాల తర్వాత తుడవండి.",
            "steps": [
                "5 నిమిషాలు నీటితో కడగండి.",
                "గాయాన్ని నొక్కవద్దు.",
                "2 గంటల్లో పెప్ తీసుకోండి."
            ]
        }
    },
    "bn": {
        "master": {
            "title": "মাস্টার ক্লিনিক্যাল সুরক্ষা এবং বায়োমেডিকেল বর্জ্য নির্দেশিকা",
            "summary": "বায়োমেডিকেল বর্জ্য ব্যবস্থাপনা নির্দেশিকায় স্বাগতম। চারটি রঙে বর্জ্য আলাদা করুন: হলুদ - সংক্রামক ও শারীরিক বর্জ্য; লাল - পুনর্ব্যবহারযোগ্য প্লাস্টিক; সাদা - ধারালো সূঁচ ও ব্লেড; নীল - কাচের বোতল ও ধাতু। সম্পূর্ণ পিপিই পরুন এবং সূঁচ ফুটলে ২ ঘণ্টার মধ্যে জানান।",
            "steps": [
                "পিপিই পরুন।",
                "চারটি রঙে বর্জ্য আলাদা করুন।",
                "সূঁচ ফুটলে ২ ঘণ্টায় রিপোর্ট করুন।"
            ]
        },
        "yellow": {
            "title": "হলুদ বিন নির্দেশিকা: সংক্রামক ও মানব শারীরিক বর্জ্য",
            "summary": "হলুদ বিন কেবল সংক্রামক, শারীরিক ও প্যাথলজিক্যাল বর্জ্যের জন্য। এতে ফেলতে হবে: মানব অঙ্গ, টিস্যু ও প্ল্যাসেন্টা; রক্তমাখা গজ, তুলো ও ব্যান্ডেজ; মেয়াদোত্তীর্ণ ওষুধ; এবং মাইক্রোবায়োলজি কালচার প্লেট ও টিকা। এতে সূঁচ, ব্লেড বা কাচ ফেলা যাবে না। হলুদ ব্যাগে রেখে ১০৫০ ডিগ্রিতে পুড়িয়ে ফেলতে হবে।",
            "steps": [
                "সংক্রামক ও শারীরিক বর্জ্য হলুদ ব্যাগে ফেলুন।",
                "মানব অঙ্গ ও রক্তমাখা তুলো অন্তর্ভুক্ত।",
                "সূঁচ বা কাচ ফেলবেন না।"
            ]
        },
        "red": {
            "title": "লাল বিন নির্দেশিকা: দূষিত পুনর্ব্যবহারযোগ্য প্লাস্টিক",
            "summary": "লাল বিন কেবল প্লাস্টিকের পুনর্ব্যবহারযোগ্য বর্জ্যের জন্য। এতে ফেলতে হবে: সূঁচহীন প্লাস্টিক সিরিঞ্জ, আইভি বোতল ও পাইপ, ক্যাথেটার, ইউরিন ব্যাগ এবং গ্লাভস। সূঁচ বা কাচ এতে ফেলবেন না। তরল সম্পূর্ণ বের করে এবং সূঁচ কেটে রিসাইক্লিংয়ে পাঠান।",
            "steps": [
                "সূঁচ কেটে সিরিঞ্জ লাল বিনে ফেলুন।",
                "আইভি বোতল ও ক্যাথেটার ফেলুন।",
                "জীবাণুমুক্ত করে রিসাইক্লিংয়ে পাঠান।"
            ]
        },
        "white": {
            "title": "সাদা পাত্র নির্দেশিকা: ধারালো সূঁচ ও ব্লেড",
            "summary": "সাদা পাংচার-প্রুফ পাত্র ধারালো সূঁচ, সার্জিক্যাল ব্লেড, সেলাইয়ের সূঁচ এবং কাচের ভাঙা অ্যাম্পুলের জন্য। এতে তুলো বা প্লাস্টিক ফেলবেন না। হাত দিয়ে সূঁচে ক্যাপ লাগাবেন না। পাত্রটি পূর্ণ হলে স্থায়ীভাবে লক করুন।",
            "steps": [
                "সাদা পাত্রে ধারালো সূঁচ ফেলুন।",
                "হাতে ক্যাপ লাগাবেন না।",
                "পূর্ণ হলে লক করুন।"
            ]
        },
        "blue": {
            "title": "নীল বিন নির্দেশিকা: কাচের সামগ্রী ও ধাতু",
            "summary": "নীল বাক্সে ওষুধের কাচের শিশি, অ্যাম্পুল, টেস্ট টিউব এবং অর্থোপেডিক ধাতব প্লেট ও স্ক্রু রাখুন। ভাঙা কাচ হাত দিয়ে না ধরে চিমটা দিয়ে তুলুন। জীবাণুমুক্ত করে রিসাইক্লিংয়ে পাঠান।",
            "steps": [
                "নীল বিনে কাচ ও ধাতু রাখুন।",
                "ভাঙা কাচ চিমটা দিয়ে তুলুন।"
            ]
        },
        "purple": {
            "title": "কেমোথেরাপির সাইটোটক্সিক ক্যান্সার বর্জ্য",
            "summary": "কেমোথেরাপির ওষুধ ও বর্জ্যের জন্য বেগুনি ব্যাগ ব্যবহার করুন। ডাবল গ্লাভস পরুন এবং ১২০০ ডিগ্রির বেশি তাপমাত্রায় পুড়িয়ে ফেলুন।",
            "steps": [
                "বেগুনি ব্যাগে কেমো বর্জ্য ফেলুন।",
                "১২০০ ডিগ্রিতে পুড়িয়ে ফেলুন।"
            ]
        },
        "general": {
            "title": "সাধারণ নিরাপদ বর্জ্য",
            "summary": "পরিষ্কার কাগজ, খাদ্য বর্জ্য ও মোড়ক সবুজ বা কালো বিনে ফেলুন। এতে সংক্রামক বর্জ্য মেশাবেন না।",
            "steps": [
                "সবুজ বিনে পরিষ্কার কাগজ ফেলুন।"
            ]
        },
        "emergency": {
            "title": "জরুরি সূঁচ ফোটা এবং রক্ত পড়ার নিয়ম",
            "summary": "সূঁচ ফুটলে: ৫ মিনিট ধরে সাবান ও জলে ধুয়ে ফেলুন। ক্ষতস্থান চাপবেন না। ২ ঘণ্টার মধ্যে পেপ চিকিৎসা শুরু করুন। রক্ত পড়লে: ১% ব্লিচ দিয়ে ২০ মিনিট পর মুছুন।",
            "steps": [
                "৫ মিনিট জলে ধুয়ে নিন।",
                "২ ঘণ্টায় পেপ নিন।"
            ]
        }
    },
    "gu": {
        "master": {
            "title": "ક્લિનિકલ સલામતી અને બાયોમેડિકલ કચરો વ્યવસ્થાપન",
            "summary": "બાયોમેડિકલ કચરા વ્યવસ્થાપન માર્ગદર્શિકામાં આપનું સ્વાગત છે. કચરાને ચાર રંગોમાં અલગ કરો: પીળો - ચેપી અને શારીરિક કચરો; લાલ - રિસાયકલ પ્લાસ્ટિક; સફેદ - તીક્ષ્ણ સોય અને બ્લેડ; વાદળી - કાચની બોટલ અને ધાતુ. પીપીઈ કીટ પહેરો અને સોય વાગે તો ૨ કલાકમાં જાણ કરો.",
            "steps": [
                "પીપીઈ પહેરો.",
                "ચાર રંગોમાં કચરો અલગ કરો.",
                "સોય વાગે તો ૨ કલાકમાં જાણ કરો."
            ]
        },
        "yellow": {
            "title": "પીળી કચરાપેટી માર્ગદર્શિકા: ચેપી અને શારીરિક કચરો",
            "summary": "પીળી કચરાપેટી ફક્ત ચેપી, શારીરિક અને પેથોલોજીકલ કચરા માટે છે. તેમાં નાખવાની વસ્તુઓ: માનવ અંગો, પેશીઓ અને પ્લેસેન્ટા; લોહીવાળો પાટો, રૂ અને પ્લાસ્ટર; એક્સપાયર દવાઓ; અને લેબ કલ્ચર તથા રસી. તેમાં સોય, બ્લેડ કે કાચ નાખશો નહીં. પીળી બેગમાં ભરીને ૧૦૫૦ ડિગ્રીએ બાળી નાખો.",
            "steps": [
                "ચેપી અને શારીરિક કચરો પીળી બેગમાં નાખો.",
                "માનવ અંગો અને લોહીવાળો પાટો સામેલ.",
                "સોય કે કાચ નાખશો નહીં."
            ]
        },
        "red": {
            "title": "લાલ કચરાપેટી માર્ગદર્શિકા: દૂષિત રિસાયકલ પ્લાસ્ટિક",
            "summary": "લાલ કચરાપેટી ફક્ત રિસાયકલ પ્લાસ્ટિક કચરા માટે છે. તેમાં નાખવાની વસ્તુઓ: સોય વગરની પ્લાસ્ટિક સિરીંજ, આઇવી બોટલ અને નળીઓ, કેથેટર, યુરીન બેગ અને ગ્લોવ્ઝ. સોય કે કાચ નાખશો નહીં. સિરીંજની સોય કાપીને અને પ્રવાહી ખાલી કરીને રિસાયક્લિંગમાં મોકલો.",
            "steps": [
                "સોય કાપીને સિરીંજ લાલ ડબ્બામાં નાખો.",
                "આઇવી બોટલ અને નળીઓ નાખો.",
                "રિસાયક્લિંગમાં મોકલો."
            ]
        },
        "white": {
            "title": "સફેદ કન્ટેનર માર્ગદર્શિકા: તીક્ષ્ણ સોય અને બ્લેડ",
            "summary": "સફેદ પંચર-પ્રૂફ કન્ટેનર ફક્ત તીક્ષ્ણ સોય, સર્જિકલ બ્લેડ, ટાંકાની સોય અને કાચના ટુકડા માટે છે. તેમાં રૂ કે પ્લાસ્ટિક નાખશો નહીં. હાથથી સોય ઢાંકશો નહીં. ભરાઈ ગયા પછી કન્ટેનર લોક કરો.",
            "steps": [
                "સફેદ કન્ટેનરમાં સોય નાખો.",
                "હાથથી કેપ ન લગાવો.",
                "લોક કરી દો."
            ]
        },
        "blue": {
            "title": "વાદળી કચરાપેટી માર્ગદર્શિકા: કાચ અને ધાતુ",
            "summary": "વાદળી બોક્સમાં દવાની કાચની બોટલ, એમ્પ્યુલ, ટેસ્ટ ટ્યુબ અને ઓર્થોપેડિક ધાતુની પ્લેટ તથા સ્ક્રૂ નાખો. તૂટેલા કાચને ચીપિયાથી ઉપાડો. જંતુમુક્ત કરીને રિસાયક્લિંગમાં મોકલો.",
            "steps": [
                "વાદળી બોક્સમાં કાચ અને ધાતુ નાખો.",
                "ચીપિયાથી કાચ ઉપાડો."
            ]
        },
        "purple": {
            "title": "સાયટોટોક્સિક કીમોથેરાપી કેન્સર કચરો",
            "summary": "કીમોથેરાપી દવાઓ અને કચરા માટે જાંબલી બેગ વાપરો. ડબલ ગ્લોવ્ઝ પહેરો અને ૧૨૦૦ ડિગ્રીથી વધુ તાપમાને બાળો.",
            "steps": [
                "જાંબલી બેગમાં કીમો કચરો નાખો.",
                "૧૨૦૦ ડિગ્રીએ બાળો."
            ]
        },
        "general": {
            "title": "સામાન્ય સલામત કચરો",
            "summary": "સ્વચ્છ કાગળ અને ખોરાક લીલા ડબ્બામાં નાખો. ચેપી કચરો ભેળવશો નહીં.",
            "steps": [
                "લીલા ડબ્બામાં કાગળ નાખો."
            ]
        },
        "emergency": {
            "title": "ઇમરજન્સી સોય વાગવા અંગેનો પ્રોટોકોલ",
            "summary": "સોય વાગે તો: ૫ મિનિટ સાબુ અને વહેતા પાણીથી ધુઓ. દબાવશો નહીં. ૨ કલાકમાં પેપ સારવાર શરૂ કરો. લોહી ઢોળાય તો: ૧% બ્લીચ નાખી ૨૦ મિનિટ પછી સાફ કરો.",
            "steps": [
                "૫ મિનિટ પાણીથી ધુઓ.",
                "૨ કલાકમાં પેપ લો."
            ]
        }
    },
    "kn": {
        "master": {
            "title": "ವೈದ್ಯಕೀಯ ತ್ಯಾಜ್ಯ ಸುರಕ್ಷತೆ ಮತ್ತು ನಿರ್ವಹಣೆ",
            "summary": "ತ್ಯಾಜ್ಯವನ್ನು ನಾಲ್ಕು ಬಣ್ಣಗಳಲ್ಲಿ ವಿಂಗಡಿಸಿ: ಹಳದಿ - ಸಾಂಕ್ರಾಮಿಕ ಮತ್ತು ಮಾನವ ಅಂಗಾಂಗ ತ್ಯಾಜ್ಯ; ಕೆಂಪು - ಪ್ಲಾಸ್ಟಿಕ್; ಬಿಳಿ - ಚೂಪಾದ ಸೂಜಿಗಳು; ನೀಲಿ - ಗಾಜಿನ ಬಾಟಲಿಗಳು ಮತ್ತು ಲೋಹಗಳು. ಪಿಪಿಇ ಕಿಟ್ ಧರಿಸಿ. ಸೂಜಿ ಚುಚ್ಚಿದರೆ ೨ ಗಂಟೆಗಳಲ್ಲಿ ವರದಿ ಮಾಡಿ.",
            "steps": [
                "ಪಿಪಿಇ ಧರಿಸಿ.",
                "ನಾಲ್ಕು ಬಣ್ಣಗಳಲ್ಲಿ ವಿಂಗಡಿಸಿ.",
                "ಸೂಜಿ ಚುಚ್ಚಿದರೆ ತಿಳಿಸಿ."
            ]
        },
        "yellow": {
            "title": "ಹಳದಿ ಬಿನ್ ಮಾರ್ಗದರ್ಶಿ: ಸಾಂಕ್ರಾಮಿಕ ಮತ್ತು ಅಂಗಾಂಗ ತ್ಯಾಜ್ಯ",
            "summary": "ಹಳದಿ ಬಿನ್ ಕೇವಲ ಸಾಂಕ್ರಾಮಿಕ ಮತ್ತು ಮಾನವ ಅಂಗಾಂಗ ತ್ಯಾಜ್ಯಕ್ಕಾಗಿ. ಇದರಲ್ಲಿ ಹಾಕಬೇಕಾದ ವಸ್ತುಗಳು: ಮಾನವ ಅಂಗಗಳು, ಅಂಗಾಂಶಗಳು ಮತ್ತು ಜರಾಯು; ರಕ್ತಸಿಕ್ತ ಹತ್ತಿ, ಬ್ಯಾಂಡೇಜ್ ಮತ್ತು ಪ್ಲಾಸ್ಟರ್; ಅವಧಿ ಮುಗಿದ ಔಷಧಿಗಳು; ಲ್ಯಾಬ್ ಕಲ್ಚರ್ ಮತ್ತು ಲಸಿಕೆಗಳು. ಇದರಲ್ಲಿ ಸೂಜಿ ಅಥವಾ ಗಾಜು ಹಾಕಬೇಡಿ. ಹಳದಿ ಚೀಲದಲ್ಲಿ ಹಾಕಿ ೧೦೫೦ ಡಿಗ್ರಿಯಲ್ಲಿ ಸುಟ್ಟುಹಾಕಿ.",
            "steps": [
                "ಹಳದಿ ಚೀಲದಲ್ಲಿ ಸಾಂಕ್ರಾಮಿಕ ತ್ಯಾಜ್ಯ ಹಾಕಿ.",
                "ಮಾನವ ಅಂಗಗಳು ಮತ್ತು ರಕ್ತಸಿಕ್ತ ಹತ್ತಿ ಸೇರಿವೆ.",
                "ಸೂಜಿ ಅಥವಾ ಗಾಜು ಹಾಕಬೇಡಿ."
            ]
        },
        "red": {
            "title": "ಕೆಂಪು ಬಿನ್ ಮಾರ್ಗದರ್ಶಿ: ಮರುಬಳಕೆಯ ಪ್ಲಾಸ್ಟಿಕ್",
            "summary": "ಕೆಂಪು ಬಿನ್ ಪ್ಲಾಸ್ಟಿಕ್ ತ್ಯಾಜ್ಯಕ್ಕಾಗಿ ಮಾತ್ರ. ಇದರಲ್ಲಿ ಸೂಜಿ ರಹಿತ ಪ್ಲಾಸ್ಟಿಕ್ ಸಿರಿಂಜ್, ಐವಿ ಬಾಟಲ್ ಮತ್ತು ಟ್ಯೂಬ್‌ಗಳು, ಕ್ಯಾತಿಟರ್ ಮತ್ತು ಮೂತ್ರದ ಚೀಲಗಳನ್ನು ಹಾಕಿ. ಸೂಜಿ ಅಥವಾ ಗಾಜು ಹಾಕಬೇಡಿ. ದ್ರವವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ತೆಗೆದು ಮರುಬಳಕೆಗೆ ಕಳುಹಿಸಿ.",
            "steps": [
                "ಸೂಜಿ ಕತ್ತರಿಸಿ ಸಿರಿಂಜ್ ಕೆಂಪು ಬಿನ್‌ನಲ್ಲಿ ಹಾಕಿ.",
                "ಐವಿ ಬಾಟಲ್ ಮತ್ತು ಟ್ಯೂಬ್ ಹಾಕಿ.",
                "ಮರುಬಳಕೆಗೆ ಕಳುಹಿಸಿ."
            ]
        },
        "white": {
            "title": "ಬಿಳಿ ಕಂಟೈನರ್ ಮಾರ್ಗದರ್ಶಿ: ಚೂಪಾದ ಸೂಜಿಗಳು ಮತ್ತು ಬ್ಲೇಡ್‌ಗಳು",
            "summary": "ಬಿಳಿ ಕಂಟೈನರ್ ಚೂಪಾದ ಸೂಜಿಗಳು, ಸರ್ಜಿಕಲ್ ಬ್ಲೇಡ್‌ಗಳು ಮತ್ತು ಹೊಲಿಗೆ ಸೂಜಿಗಳಿಗಾಗಿ ಮಾತ್ರ. ಕೈಯಿಂದ ಸೂಜಿಗೆ ಮುಚ್ಚಳ ಹಾಕಬೇಡಿ. ಮುಕ್ಕಾಲು ಭಾಗ ತುಂಬಿದ ನಂತರ ಲಾಕ್ ಮಾಡಿ.",
            "steps": [
                "ಬಿಳಿ ಕಂಟೈನರ್‌ನಲ್ಲಿ ಸೂಜಿ ಹಾಕಿ.",
                "ಕೈಯಿಂದ ಮುಚ್ಚಳ ಹಾಕಬೇಡಿ.",
                "ಲಾಕ್ ಮಾಡಿ."
            ]
        },
        "blue": {
            "title": "ನೀಲಿ ಬಿನ್ ಮಾರ್ಗದರ್ಶಿ: ಗಾಜು ಮತ್ತು ಲೋಹಗಳು",
            "summary": "ನೀಲಿ ಪೆಟ್ಟಿಗೆಯಲ್ಲಿ ಗಾಜಿನ ಔಷಧಿ ಬಾಟಲಿಗಳು, ಟ್ಯೂಬ್‌ಗಳು ಮತ್ತು ಆರ್ಥೋಪೆಡಿಕ್ ಲೋಹದ ಪ್ಲೇಟ್‌ಗಳನ್ನು ಹಾಕಿ. ಒಡೆದ ಗಾಜನ್ನು ಇಕ್ಕಳದಿಂದ ಎತ್ತಿ. ಮರುಬಳಕೆಗೆ ಕಳುಹಿಸಿ.",
            "steps": [
                "ನೀಲಿ ಬಿನ್‌ನಲ್ಲಿ ಗಾಜು ಮತ್ತು ಲೋಹ ಹಾಕಿ.",
                "ಇಕ್ಕಳದಿಂದ ಗಾಜು ಎತ್ತಿ."
            ]
        },
        "purple": {
            "title": "ಕೀಮೋಥೆರಪಿ ಕ್ಯಾನ್ಸರ್ ತ್ಯಾಜ್ಯ",
            "summary": "ಕೀಮೋಥೆರಪಿ ತ್ಯಾಜ್ಯಕ್ಕಾಗಿ ನೇರಳೆ ಚೀಲಗಳನ್ನು ಬಳಸಿ ಮತ್ತು ೧೨೦೦ ಡಿಗ್ರಿಗಿಂತ ಹೆಚ್ಚಿನ ತಾಪಮಾನದಲ್ಲಿ ಸುಟ್ಟುಹಾಕಿ.",
            "steps": [
                "ನೇರಳೆ ಚೀಲ ಬಳಸಿ.",
                "೧೨೦೦ ಡಿಗ್ರಿಯಲ್ಲಿ ಸುಡಿ."
            ]
        },
        "general": {
            "title": "ಸಾಮಾನ್ಯ ತ್ಯಾಜ್ಯ",
            "summary": "ಕಾಗದ ಮತ್ತು ಆಹಾರ ತ್ಯಾಜ್ಯವನ್ನು ಹಸಿರು ಬಿನ್‌ನಲ್ಲಿ ಹಾಕಿ.",
            "steps": [
                "ಹಸಿರು ಬಿನ್‌ನಲ್ಲಿ ಕಾಗದ ಹಾಕಿ."
            ]
        },
        "emergency": {
            "title": "ತುರ್ತು ಸೂಜಿ ಚುಚ್ಚುವಿಕೆ ನಿಯಮಾವಳಿ",
            "summary": "ಸೂಜಿ ಚುಚ್ಚಿದರೆ: ೫ ನಿಮಿಷ ಸೋಪು ಮತ್ತು ಹರಿಯುವ ನೀರಿನಲ್ಲಿ ತೊಳೆಯಿರಿ. ೨ ಗಂಟೆಯೊಳಗೆ ಪೆಪ್ ಚಿಕಿತ್ಸೆ ಪಡೆಯಿರಿ. ರಕ್ತ ಚೆಲ್ಲಿದರೆ: ೧% ಬ್ಲೀಚ್ ಹಾಕಿ ೨೦ ನಿಮಿಷ ಬಿಟ್ಟು ಸ್ವಚ್ಛಗೊಳಿಸಿ.",
            "steps": [
                "೫ ನಿಮಿಷ ನೀರಿನಲ್ಲಿ ತೊಳೆಯಿರಿ.",
                "೨ ಗಂಟೆಯಲ್ಲಿ ಪೆಪ್ ತೆಗೆದುಕೊಳ್ಳಿ."
            ]
        }
    },
    "ml": {
        "master": {
            "title": "മെഡിക്കൽ മാലിന്യ സുരക്ഷാ മാർഗ്ഗനിർദ്ദേശങ്ങൾ",
            "summary": "മാലിന്യങ്ങൾ നാല് നിറങ്ങളിലായി തരംതിരിക്കുക: മഞ്ഞ - അണുബാധയുള്ളതും ശാരീരികവുമായ മാലിന്യങ്ങൾ; ചുവപ്പ് - പ്ലാസ്റ്റിക്; വെള്ള - മൂർച്ചയുള്ള സൂചികൾ; നീല - ഗ്ലാസ് കുപ്പികളും ലോഹങ്ങളും. പിപിഇ കിറ്റ് നിർബന്ധമായും ധരിക്കുക.",
            "steps": [
                "പിപിഇ ധരിക്കുക.",
                "നാല് നിറങ്ങളിൽ തരംതിരിക്കുക.",
                "സൂചി കൊണ്ടാൽ ഉടൻ അറിയിക്കുക."
            ]
        },
        "yellow": {
            "title": "മഞ്ഞ ബിൻ ഗൈഡ്: അണുബാധയുള്ളതും ശാരീരികവുമായ മാലിന്യങ്ങൾ",
            "summary": "മഞ്ഞ ബിൻ അണുബാധയുള്ള മാലിന്യങ്ങൾക്കും മനുഷ്യ ശരീരഭാഗങ്ങൾക്കും വേണ്ടിയുള്ളതാണ്. ഇടേണ്ട വസ്തുക്കൾ: മനുഷ്യ അവയവങ്ങൾ, കോശങ്ങൾ, പ്ലാസന്റ; രക്തം പുരണ്ട പഞ്ഞി, ബാൻഡേജ്, പ്ലാസ്റ്റർ; കാലഹരണപ്പെട്ട മരുന്നുകൾ; ലാബ് കൾച്ചറുകൾ. സൂചികളോ ഗ്ലാസോ ഇടരുത്. മഞ്ഞ ബാഗിൽ സൂക്ഷിച്ചു 1050 ഡിഗ്രിയിൽ കത്തിക്കുക.",
            "steps": [
                "മഞ്ഞ ബാഗിൽ അണുബാധ മാലിന്യം ഇടുക.",
                "ശരീരഭാഗങ്ങളും രക്തം പുരണ്ട പഞ്ഞിയും ഉൾപ്പെടുന്നു.",
                "സൂചികളോ ഗ്ലാസോ ഇടരുത്."
            ]
        },
        "red": {
            "title": "ചുവപ്പ് ബിൻ ഗൈഡ്: പുനരുപയോഗിക്കാവുന്ന പ്ലാസ്റ്റിക്",
            "summary": "ചുവപ്പ് ബിൻ പ്ലാസ്റ്റിക് മാലിന്യങ്ങൾക്ക് മാത്രമുള്ളതാണ്. സൂചിയില്ലാത്ത സിറിഞ്ചുകൾ, ഐവി ബോട്ടിലുകൾ, ട്യൂബുകൾ, യൂറിൻ ബാഗുകൾ എന്നിവ ഇടുക. ദ്രാവകങ്ങൾ പൂർണ്ണമായി നീക്കം ചെയ്ത് റീസൈക്ലിംഗിന് അയക്കുക.",
            "steps": [
                "സൂചി മുറിച്ചു സിറിഞ്ച് ചുവപ്പ് ബിന്നിൽ ഇടുക.",
                "ഐവി ബോട്ടിലുകൾ ഇടുക.",
                "റീസൈക്ലിംഗിന് അയക്കുക."
            ]
        },
        "white": {
            "title": "വെള്ള കണ്ടെയ്നർ ഗൈഡ്: മൂർച്ചയുള്ള സൂചികളും ബ്ലേഡുകളും",
            "summary": "വെള്ള പഞ്ചർ പ്രൂഫ് ബോക്സ് മൂർച്ചയുള്ള സൂചികൾ, സർജിക്കൽ ബ്ലേഡുകൾ എന്നിവയ്ക്കുള്ളതാണ്. കൈകൊണ്ട് സൂചിക്ക് മൂടി ഇടരുത്. മുക്കാൽ ഭാഗം നിറഞ്ഞാൽ അടച്ചു പൂട്ടുക.",
            "steps": [
                "വെള്ള ബോക്സിൽ സൂചികൾ ഇടുക.",
                "കൈകൊണ്ട് മൂടി ഇടരുത്.",
                "ലോക്ക് ചെയ്യുക."
            ]
        },
        "blue": {
            "title": "നീല ബിൻ ഗൈഡ്: ഗ്ലാസും ലോഹങ്ങളും",
            "summary": "നീല പെട്ടിയിൽ മരുന്ന് ഗ്ലാസ് കുപ്പികളും ഓർത്തോപീഡിക് ലോഹ ഇംപ്ലാന്റുകളും ഇടുക. പൊട്ടിയ ഗ്ലാസ് കൊടിൽ ഉപയോഗിച്ച് എടുക്കുക.",
            "steps": [
                "നീല ബിന്നിൽ ഗ്ലാസും ലോഹങ്ങളും ഇടുക.",
                "കൊടിൽ ഉപയോഗിക്കുക."
            ]
        },
        "purple": {
            "title": "കീമോതെറാപ്പി കാൻസർ മാലിന്യങ്ങൾ",
            "summary": "കീമോതെറാപ്പി മാലിന്യങ്ങൾക്ക് പർപ്പിൾ ബാഗുകൾ ഉപയോഗിക്കുക. 1200 ഡിഗ്രിയിൽ കത്തിക്കുക.",
            "steps": [
                "പർപ്പിൾ ബാഗ് ഉപയോഗിക്കുക."
            ]
        },
        "general": {
            "title": "സാധാരണ ആശുപത്രി മാലിന്യങ്ങൾ",
            "summary": "ഭക്ഷണാവശിഷ്ടങ്ങളും പേപ്പറും പച്ച ബിന്നിൽ ഇടുക.",
            "steps": [
                "പച്ച ബിന്നിൽ പേപ്പർ ഇടുക."
            ]
        },
        "emergency": {
            "title": "സൂചി കൊണ്ടാൽ അടിയന്തര നടപടി",
            "summary": "സൂചി കൊണ്ടാൽ: 5 മിനിറ്റ് ഒഴുകുന്ന വെള്ളത്തിൽ സോപ്പിട്ട് കഴുകുക. 2 മണിക്കൂറിനകം പെപ് ചികിത്സ ആരംഭിക്കുക. രക്തം ചിന്തിയാൽ: 1% ബ്ലീച്ച് ഒഴിച്ച് 20 മിനിറ്റിനു ശേഷം തുടയ്ക്കുക.",
            "steps": [
                "5 മിനിറ്റ് വെള്ളത്തിൽ കഴുകുക.",
                "2 മണിക്കൂറിൽ പെപ് എടുക്കുക."
            ]
        }
    },
    "pa": {
        "master": {
            "title": "ਕਲੀਨਿਕਲ ਸੁਰੱਖਿਆ ਅਤੇ ਬਾਇਓਮੈਡੀਕਲ ਕੂੜਾ ਪ੍ਰਬੰਧਨ",
            "summary": "ਕੂੜੇ ਨੂੰ ਚਾਰ ਰੰਗਾਂ ਵਿੱਚ ਵੰਡੋ: ਪੀਲਾ - ਲਾਗ ਵਾਲਾ ਤੇ ਸਰੀਰਕ ਕੂੜਾ; ਲਾਲ - ਰੀਸਾਈਕਲ ਪਲਾਸਟਿਕ; ਚਿੱਟਾ - ਤਿੱਖੀਆਂ ਸੂਈਆਂ; ਨੀਲਾ - ਕੱਚ ਦੀਆਂ ਸ਼ੀਸ਼ੀਆਂ ਅਤੇ ਧਾਤ। ਪੀਪੀਈ ਕਿੱਟ ਪਹਿਨੋ ਅਤੇ ਸੂਈ ਚੁੱਭਣ 'ਤੇ ੨ ਘੰਟਿਆਂ ਵਿੱਚ ਰਿਪੋਰਟ ਕਰੋ।",
            "steps": [
                "ਪੀਪੀਈ ਪਹਿਨੋ।",
                "ਚਾਰ ਰੰਗਾਂ ਵਿੱਚ ਕੂੜਾ ਵੰਡੋ।",
                "ਸੂਈ ਚੁੱਭਣ 'ਤੇ ਦੱਸੋ।"
            ]
        },
        "yellow": {
            "title": "ਪੀਲਾ ਡੱਬਾ ਗਾਈਡ: ਲਾਗ ਵਾਲਾ ਅਤੇ ਸਰੀਰਕ ਕੂੜਾ",
            "summary": "ਪੀਲਾ ਡੱਬਾ ਸਿਰਫ਼ ਲਾਗ ਵਾਲੇ ਅਤੇ ਮਨੁੱਖੀ ਅੰਗਾਂ ਦੇ ਕੂੜੇ ਲਈ ਹੈ। ਇਸ ਵਿੱਚ ਪਾਉਣ ਵਾਲੀਆਂ ਚੀਜ਼ਾਂ: ਮਨੁੱਖੀ ਅੰਗ, ਟਿਸ਼ੂ ਅਤੇ ਪਲੈਸੈਂਟਾ; ਖੂਨ ਨਾਲ ਭਰੀਆਂ ਪੱਟੀਆਂ, ਰੂੰ ਅਤੇ ਪਲਾਸਟਰ; ਮਿਆਦ ਪੁੱਗ ਚੁੱਕੀਆਂ ਦਵਾਈਆਂ; ਲੈਬ ਕਲਚਰ। ਇਸ ਵਿੱਚ ਸੂਈਆਂ ਜਾਂ ਕੱਚ ਨਾ ਪਾਓ। ਪੀਲੇ ਬੈਗ ਵਿੱਚ ਪਾ ਕੇ ੧੦੫੦ ਡਿਗਰੀ 'ਤੇ ਸਾੜੋ।",
            "steps": [
                "ਪੀਲੇ ਬੈਗ ਵਿੱਚ ਲਾਗ ਵਾਲਾ ਕੂੜਾ ਪਾਓ।",
                "ਮਨੁੱਖੀ ਅੰਗ ਅਤੇ ਖੂਨ ਦੀਆਂ ਪੱਟੀਆਂ ਸ਼ਾਮਲ।",
                "ਸੂਈਆਂ ਜਾਂ ਕੱਚ ਨਾ ਪਾਓ।"
            ]
        },
        "red": {
            "title": "ਲਾਲ ਡੱਬਾ ਗਾਈਡ: ਰੀਸਾਈਕਲ ਪਲਾਸਟਿਕ ਕੂੜਾ",
            "summary": "ਲਾਲ ਡੱਬਾ ਪਲਾਸਟਿਕ ਦੇ ਕੂੜੇ ਲਈ ਹੈ। ਸੂਈ ਤੋਂ ਬਿਨਾਂ ਪਲਾਸਟਿਕ ਸਰਿੰਜਾਂ, ਆਈਵੀ ਬੋਤਲਾਂ ਅਤੇ ਪਾਈਪਾਂ, ਕੈਥੀਟਰ ਅਤੇ ਯੂਰੀਨ ਬੈਗ ਇਸ ਵਿੱਚ ਪਾਓ। ਸੂਈ ਕੱਟ ਕੇ ਅਤੇ ਤਰਲ ਪੂਰੀ ਤਰ੍ਹਾਂ ਕੱਢ ਕੇ ਰੀਸਾਈਕਲਿੰਗ ਲਈ ਭੇਜੋ।",
            "steps": [
                "ਸੂਈ ਕੱਟ ਕੇ ਸਰਿੰਜ ਲਾਲ ਡੱਬੇ ਵਿੱਚ ਪਾਓ।",
                "ਆਈਵੀ ਬੋਤਲਾਂ ਪਾਓ।",
                "ਰੀਸਾਈਕਲਿੰਗ ਲਈ ਭੇਜੋ।"
            ]
        },
        "white": {
            "title": "ਚਿੱਟਾ ਡੱਬਾ ਗਾਈਡ: ਤਿੱਖੀਆਂ ਸੂਈਆਂ ਅਤੇ ਬਲੇਡ",
            "summary": "ਚਿੱਟਾ ਪੰਕਚਰ-ਪਰੂਫ ਡੱਬਾ ਤਿੱਖੀਆਂ ਸੂਈਆਂ, ਸਰਜੀਕਲ ਬਲੇਡਾਂ ਅਤੇ ਟਾਂਕੇ ਵਾਲੀਆਂ ਸੂਈਆਂ ਲਈ ਹੈ। ਹੱਥ ਨਾਲ ਸੂਈ ਨੂੰ ਕੈਪ ਨਾ ਕਰੋ। ਭਰ ਜਾਣ 'ਤੇ ਲਾਕ ਕਰੋ।",
            "steps": [
                "ਚਿੱਟੇ ਡੱਬੇ ਵਿੱਚ ਸੂਈਆਂ ਪਾਓ।",
                "ਹੱਥ ਨਾਲ ਕੈਪ ਨਾ ਲਗਾਓ।",
                "ਲਾਕ ਕਰੋ।"
            ]
        },
        "blue": {
            "title": "ਨੀਲਾ ਡੱਬਾ ਗਾਈਡ: ਕੱਚ ਦੀਆਂ ਸ਼ੀਸ਼ੀਆਂ ਅਤੇ ਧਾਤ",
            "summary": "ਨੀਲੇ ਡੱਬੇ ਵਿੱਚ ਕੱਚ ਦੀਆਂ ਦਵਾਈਆਂ ਦੀਆਂ ਸ਼ੀਸ਼ੀਆਂ, ਟੈਸਟ ਟਿਊਬਾਂ ਅਤੇ ਹੱਡੀਆਂ ਦੀਆਂ ਧਾਤ ਦੀਆਂ ਪਲੇਟਾਂ ਪਾਓ। ਟੁੱਟੇ ਕੱਚ ਨੂੰ ਚਿਮਟੇ ਨਾਲ ਚੁੱਕੋ।",
            "steps": [
                "ਨੀਲੇ ਡੱਬੇ ਵਿੱਚ ਕੱਚ ਅਤੇ ਧਾਤ ਪਾਓ।",
                "ਚਿਮਟੇ ਨਾਲ ਕੱਚ ਚੁੱਕੋ।"
            ]
        },
        "purple": {
            "title": "ਕੀਮੋਥੈਰੇਪੀ ਕੈਂਸਰ ਕੂੜਾ",
            "summary": "ਕੀਮੋਥੈਰੇਪੀ ਕੂੜੇ ਲਈ ਜਾਮਣੀ ਬੈਗ ਵਰਤੋ ਅਤੇ ੧੨੦੦ ਡਿਗਰੀ 'ਤੇ ਸਾੜੋ।",
            "steps": [
                "ਜਾਮਣੀ ਬੈਗ ਵਰਤੋ।"
            ]
        },
        "general": {
            "title": "ਆਮ ਕੂੜਾ",
            "summary": "ਸਾਫ਼ ਕਾਗਜ਼ ਅਤੇ ਭੋਜਨ ਹਰੇ ਡੱਬੇ ਵਿੱਚ ਪਾਓ।",
            "steps": [
                "ਹਰੇ ਡੱਬੇ ਵਿੱਚ ਕਾਗਜ਼ ਪਾਓ।"
            ]
        },
        "emergency": {
            "title": "ਐਮਰਜੈਂਸੀ ਸੂਈ ਚੁੱਭਣ ਦਾ ਪ੍ਰੋਟੋਕੋਲ",
            "summary": "ਸੂਈ ਚੁੱਭਣ 'ਤੇ: ੫ ਮਿੰਟ ਵਗਦੇ ਪਾਣੀ ਅਤੇ ਸਾਬਣ ਨਾਲ ਧੋਵੋ। ਜ਼ਖ਼ਮ ਨੂੰ ਨਾ ਦਬਾਓ। ੨ ਘੰਟਿਆਂ ਅੰਦਰ ਪੈਪ ਇਲਾਜ ਸ਼ੁਰੂ ਕਰੋ। ਖੂਨ ਡੁੱਲ੍ਹਣ 'ਤੇ: ੧% ਬਲੀਚ ਪਾ ਕੇ ੨੦ ਮਿੰਟ ਬਾਅਦ ਸਾਫ਼ ਕਰੋ।",
            "steps": [
                "੫ ਮਿੰਟ ਪਾਣੀ ਨਾਲ ਧੋਵੋ।",
                "੨ ਘੰਟਿਆਂ ਵਿੱਚ ਪੈਪ ਲਵੋ।"
            ]
        }
    },
    "or": {
        "master": {
            "title": "ମାଷ୍ଟର କ୍ଲିନିକାଲ ସୁରକ୍ଷା ଏବଂ ବାୟୋମେଡିକାଲ ବର୍ଜ୍ୟ ପରିଚାଳନା",
            "summary": "ବର୍ଜ୍ୟବସ୍ତୁକୁ ଚାରି ରଙ୍ଗରେ ଅଲଗା କରନ୍ତୁ: ହଳଦିଆ - ସଂକ୍ରାମକ ଏବଂ ଶାରୀରିକ ବର୍ଜ୍ୟ; ଲାଲ୍ - ପ୍ଲାଷ୍ଟିକ୍; ଧଳା - ଧାରୁଆ ଛୁଞ୍ଚି; ନୀଳ - କାଚ ଶିଶି ଏବଂ ଧାତୁ। ପିପିଇ ପିନ୍ଧନ୍ତୁ ଏବଂ ଛୁଞ୍ଚି ଫୁଟିଲେ ୨ ଘଣ୍ଟା ମଧ୍ୟରେ ଜଣାନ୍ତୁ।",
            "steps": [
                "ପିପିଇ ପିନ୍ଧନ୍ତୁ।",
                "ଚାରି ରଙ୍ଗରେ ବର୍ଜ୍ୟ ଅଲଗା କରନ୍ତୁ।",
                "ଛୁଞ୍ଚି ଫୁଟିଲେ ଜଣାନ୍ତୁ।"
            ]
        },
        "yellow": {
            "title": "ହଳଦିଆ ଡବା ଗାଇଡ୍: ସଂକ୍ରାମକ ଏବଂ ଶାରୀରିକ ବର୍ଜ୍ୟ",
            "summary": "ହଳଦିଆ ଡବା କେବଳ ସଂକ୍ରାମକ ଏବଂ ମାନବ ଶାରୀରିକ ବର୍ଜ୍ୟ ପାଇଁ। ଏଥିରେ ପକାଇବା ସାମଗ୍ରୀ: ମାନବ ଅଙ୍ଗ, ତନ୍ତୁ ଏବଂ ପ୍ଲାସେଣ୍ଟା; ରକ୍ତଭିଜା ତୁଳା, ପଟି ଏବଂ ପ୍ଲାଷ୍ଟର; ମିଆଦ ପୁରିଥିବା ଔଷଧ; ଲ୍ୟାବ୍ କଲଚର୍। ଏଥିରେ ଛୁଞ୍ଚି ବା କାଚ ପକାନ୍ତୁ ନାହିଁ। ହଳଦିଆ ବ୍ୟାଗରେ ରଖି ୧୦୫୦ ଡିଗ୍ରୀରେ ଜଳାନ୍ତୁ।",
            "steps": [
                "ହଳଦିଆ ବ୍ୟାଗରେ ସଂକ୍ରାମକ ବର୍ଜ୍ୟ ରଖନ୍ତୁ।",
                "ମାନବ ଅଙ୍ଗ ଓ ରକ୍ତଭିଜା ତୁଳା ସାମିଲ।",
                "ଛୁଞ୍ଚି ବା କାଚ ପକାନ୍ତୁ ନାହିଁ।"
            ]
        },
        "red": {
            "title": "ଲାଲ୍ ଡବା ଗାଇଡ୍: ପୁନଃବ୍ୟବହାରଯୋଗ୍ୟ ପ୍ଲାଷ୍ଟିକ୍",
            "summary": "ଲାଲ୍ ଡବା କେବଳ ପ୍ଲାଷ୍ଟିକ୍ ବର୍ଜ୍ୟ ପାଇଁ। ଛୁଞ୍ଚି ବିହୀନ ପ୍ଲାଷ୍ଟିକ୍ ସିରିଞ୍ଜ, ଆଇଭି ବୋତଲ, ପାଇପ୍, କ୍ୟାଥେଟର ଏବଂ ପରିସ୍ରା ବ୍ୟାଗ୍ ଏଥିରେ ପକାନ୍ତୁ। ଛୁଞ୍ଚି କାଟି ଏବଂ ତରଳ ପଦାର୍ଥ ସମ୍ପୂର୍ଣ୍ଣ ବାହାର କରି ରିସାଇକ୍ଲିଂ ପାଇଁ ପଠାନ୍ତୁ।",
            "steps": [
                "ଛୁଞ୍ଚି କାଟି ସିରିଞ୍ଜ ଲାଲ୍ ଡବାରେ ପକାନ୍ତୁ।",
                "ଆଇଭି ବୋତଲ ପକାନ୍ତୁ।",
                "ରିସାଇକ୍ଲିଂ ପାଇଁ ପଠାନ୍ତୁ।"
            ]
        },
        "white": {
            "title": "ଧଳା ପାତ୍ର ଗାଇଡ୍: ଧାରୁଆ ଛୁଞ୍ଚି ଏବଂ ବ୍ଲେଡ୍",
            "summary": "ଧଳା ପାତ୍ର କେବଳ ଧାରୁଆ ଛୁଞ୍ଚି, ସର୍ଜିକାଲ୍ ବ୍ଲେଡ୍ ଏବଂ ସିଲେଇ ଛୁଞ୍ଚି ପାଇଁ। ହାତରେ ଛୁଞ୍ଚି ଠିପି ଲଗାନ୍ତୁ ନାହିଁ। ପୂର୍ଣ୍ଣ ହେଲେ ଲକ୍ କରନ୍ତୁ।",
            "steps": [
                "ଧଳା ପାତ୍ରରେ ଛୁଞ୍ଚି ରଖନ୍ତୁ।",
                "ହାତରେ ଠିପି ଲଗାନ୍ତୁ ନାହିଁ।",
                "ଲକ୍ କରନ୍ତୁ।"
            ]
        },
        "blue": {
            "title": "ନୀଳ ଡବା ଗାଇଡ୍: କାଚ ସାମଗ୍ରୀ ଏବଂ ଧାତୁ",
            "summary": "ନୀଳ ବାକ୍ସରେ ଔଷଧ କାଚ ଶିଶି, ଟେଷ୍ଟ ଟ୍ୟୁବ୍ ଏବଂ ଧାତୁ ପ୍ଲେଟ୍ ରଖନ୍ତୁ। ଭଙ୍ଗା କାଚକୁ ଚିମୁଟା ସାହାଯ୍ୟରେ ଉଠାନ୍ତୁ।",
            "steps": [
                "ନୀଳ ଡବାରେ କାଚ ଓ ଧାତୁ ରଖନ୍ତୁ।",
                "ଚିମୁଟା ବ୍ୟବହାର କରନ୍ତୁ।"
            ]
        },
        "purple": {
            "title": "କେମୋଥେରାପି କର୍କଟ ବର୍ଜ୍ୟ",
            "summary": "କେମୋଥେରାପି ବର୍ଜ୍ୟ ପାଇଁ ବାଇଗଣୀ ବ୍ୟାଗ୍ ବ୍ୟବହାର କରନ୍ତୁ ଏବଂ ୧୨୦୦ ଡିଗ୍ରୀରେ ଜଳାନ୍ତୁ।",
            "steps": [
                "ବାଇଗଣୀ ବ୍ୟାଗ୍ ବ୍ୟବହାର କରନ୍ତୁ।"
            ]
        },
        "general": {
            "title": "ସାଧାରଣ ବର୍ଜ୍ୟ",
            "summary": "କାଗଜ ଏବଂ ଖାଦ୍ୟ ବଳକା ସବୁଜ ଡବାରେ ପକାନ୍ତୁ।",
            "steps": [
                "ସବୁଜ ଡବାରେ କାଗଜ ପକାନ୍ତୁ।"
            ]
        },
        "emergency": {
            "title": "ଜରୁରୀକାଳୀନ ଛୁଞ୍ଚି ଫୁଟିବା ନିୟମ",
            "summary": "ଛୁଞ୍ଚି ଫୁଟିଲେ: ୫ ମିନିଟ୍ ଧରି ପାଣି ଏବଂ ସାବୁନରେ ଧୁଅନ୍ତୁ। କ୍ଷତକୁ ଚିପନ୍ତୁ ନାହିଁ। ୨ ଘଣ୍ଟା ମଧ୍ୟରେ ପେପ୍ ଚିକିତ୍ସା ନିଅନ୍ତୁ। ରକ୍ତ ପଡ଼ିଲେ: ୧% ବ୍ଲିଚ୍ ପକାଇ ୨୦ ମିନିଟ୍ ପରେ ପୋଛନ୍ତୁ।",
            "steps": [
                "୫ ମିନିଟ୍ ପାଣିରେ ଧୁଅନ୍ତୁ।",
                "୨ ଘଣ୍ଟାରେ ପେପ୍ ନିଅନ୍ତୁ।"
            ]
        }
    },
    "ur": {
        "master": {
            "title": "بائیو میڈیکل ویسٹ اور طبی حفاظتی رہنمائی",
            "summary": "کچرے کو چار رنگوں میں الگ کریں: پیلا - متعدی اور جسمانی فضلہ؛ سرخ - ری سائیکل پلاسٹک؛ سفید - تیز دھار سوئیاں اور بلیڈ؛ نیلا - شیشے کی بوتلیں اور دھات۔ مکمل پی پی ای پہنیں اور سوئی چبھنے پر دو گھنٹے کے اندر رپورٹ کریں۔",
            "steps": [
                "مکمل پی پی ای پہنیں۔",
                "چار رنگوں میں کچرا الگ کریں۔",
                "سوئی چبھنے پر رپورٹ کریں۔"
            ]
        },
        "yellow": {
            "title": "پیلا ڈبہ گائیڈ: متعدی اور جسمانی فضلہ",
            "summary": "پیلا ڈبہ صرف متعدی، انسانی اعضاء اور پیتھولوجیکل فضلے کے لیے مخصوص ہے۔ اس میں ڈالنے والی اشیاء: انسانی اعضاء، بافتیں اور نال؛ خون آلود پٹیاں، روئی، گوز اور پلستر؛ زائد المیعاد دوائیں؛ لیب کلچرز اور ویکسین۔ اس میں سوئیاں، بلیڈ یا شیشہ نہ ڈالیں۔ نان کلورینیٹڈ پیلے تھیلے میں رکھ کر 1050 ڈگری پر جلائیں۔",
            "steps": [
                "پیلے تھیلے میں متعدی فضلہ ڈالیں۔",
                "انسانی اعضاء اور خون آلود پٹیاں شامل ہیں۔",
                "سوئیاں یا شیشہ نہ ڈالیں۔"
            ]
        },
        "red": {
            "title": "سرخ ڈبہ گائیڈ: ری سائیکل پلاسٹک فضلہ",
            "summary": "سرخ ڈبہ صرف پلاسٹک کے ری سائیکل طبی فضلے کے لیے ہے۔ اس میں ڈالنے والی اشیاء: بغیر سوئی والی پلاسٹک سرنج، آئی وی بوتلیں اور ٹیوبیں، کیتھیٹر، پیشاب کے تھیلے اور دستانے۔ سوئیاں یا شیشہ نہ ڈالیں۔ سوئی کاٹنے اور سیال مکمل نکالنے کے بعد ری سائیکلنگ کے لیے بھیجیں۔",
            "steps": [
                "سوئی کاٹ کر سرنج سرخ ڈبے میں ڈالیں۔",
                "آئی وی بوتلیں اور نلیاں ڈالیں۔",
                "ری سائیکلنگ کے لیے بھیجیں۔"
            ]
        },
        "white": {
            "title": "سفید کنٹینر گائیڈ: تیز دھار سوئیاں اور بلیڈ",
            "summary": "سفید پنکچر پروف کنٹینر صرف تیز دھار سوئیوں، سرجیکل بلیڈوں اور ٹانکے والی سوئیوں کے لیے ہے۔ ہاتھ سے سوئی پر ڈھکن نہ لگائیں۔ تین چوتھائی بھر جانے پر مستقل طور پر لاک کریں۔",
            "steps": [
                "سفید کنٹینر میں سوئیاں ڈالیں۔",
                "ہاتھ سے ڈھکن نہ لگائیں۔",
                "لاک کریں۔"
            ]
        },
        "blue": {
            "title": "نیلا ڈبہ گائیڈ: شیشے کے برتن اور دھات",
            "summary": "نیلے ڈبے میں دوائیوں کی شیشے کی شیشیاں، ایمپول، ٹیسٹ ٹیوبیں اور ہڈیوں کی دھاتی پلیٹیں ڈالیں۔ ٹوٹا ہوا شیشہ چمٹے سے اٹھائیں۔",
            "steps": [
                "نیلے ڈبے میں شیشہ اور دھات رکھیں۔",
                "چمٹے سے شیشہ اٹھائیں۔"
            ]
        },
        "purple": {
            "title": "کیموتھراپی کینسر کا فضلہ",
            "summary": "کیموتھراپی کے فضلے کے لیے جامنی تھیلے استعمال کریں اور 1200 ڈگری سے زیادہ پر جلائیں۔",
            "steps": [
                "جامنی تھیلے استعمال کریں۔"
            ]
        },
        "general": {
            "title": "عام غیر مضر فضلہ",
            "summary": "صاف کاغذ اور بچا ہوا کھانا سبز ڈبے میں ڈالیں۔",
            "steps": [
                "سبز ڈبے میں کاغذ ڈالیں۔"
            ]
        },
        "emergency": {
            "title": "ہنگامی سوئی چبھنے کا پروٹوکول",
            "summary": "سوئی چبھنے پر: 5 منٹ بہتے پانی اور صابن سے دھوئیں اور 2 گھنٹے کے اندر پی ای پی علاج حاصل کریں۔ زخم کو نہ دبائیں۔ خون گرنے پر: 1% بلیچ ڈال کر 20 منٹ بعد صاف کریں۔",
            "steps": [
                "5 منٹ صابن سے دھوئیں।",
                "2 گھنٹے میں علاج لیں۔"
            ]
        }
    }
};

if (typeof window !== 'undefined') {
    window.SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;
    window.PRECAUTION_TRANSCRIPTS_I18N = PRECAUTION_TRANSCRIPTS_I18N;
}
