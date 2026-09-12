// Hindi translations for MediLink's highest-traffic screens (Navbar,
// Home, Patient Profile). Keyed by the exact English string used in
// the UI -- see LanguageContext.jsx's t() helper. A string with no
// entry here simply falls back to English rather than breaking, so
// coverage can be extended to more pages/strings over time without
// any risk to what's already translated.
//
// Scope note: dynamically-composed sentences (e.g. medication safety
// explanations that interpolate a patient's actual drug/condition
// names) are intentionally left in English for now -- translating
// those would mean teaching the whole rules engine to compose
// sentences in two languages, which is a bigger project than
// translating this static page chrome.

export const HI = {
  // Navbar
  Home: 'होम',
  'Health Timeline': 'स्वास्थ्य समयरेखा',
  'Medication Safety': 'दवा सुरक्षा',
  'About MediLink': 'MediLink के बारे में',
  'Smart Health Ecosystem': 'स्मार्ट स्वास्थ्य इकोसिस्टम',
  Notifications: 'सूचनाएं',
  'No new notifications.': 'कोई नई सूचना नहीं।',
  'Patient Profile': 'मरीज़ प्रोफ़ाइल',
  'Sign out': 'साइन आउट',
  'Sign in': 'साइन इन',
  Patient: 'मरीज़',

  // Home -- hero
  'Your Health. Connected.': 'आपका स्वास्थ्य। जुड़ा हुआ।',
  'Your Medication.': 'आपकी दवा।',
  'Safer.': 'सुरक्षित।',
  'One secure health ecosystem connecting your complete healthcare journey with intelligent medication safety insights.':
    'एक सुरक्षित स्वास्थ्य इकोसिस्टम जो आपकी पूरी स्वास्थ्य यात्रा को बुद्धिमान दवा सुरक्षा जानकारी से जोड़ता है।',
  'View My Health Profile': 'मेरी स्वास्थ्य प्रोफ़ाइल देखें',
  'Medication Safety Check': 'दवा सुरक्षा जांच',
  'Smart Health Card': 'स्मार्ट हेल्थ कार्ड',
  'Sign in to see your patient identity, connected records and medication safety intelligence.':
    'अपनी मरीज़ पहचान, जुड़े रिकॉर्ड और दवा सुरक्षा जानकारी देखने के लिए साइन इन करें।',
  'Create your account': 'अपना खाता बनाएं',

  // Home -- patient quick overview
  'PATIENT QUICK OVERVIEW': 'मरीज़ का त्वरित विवरण',
  'CRITICAL HEALTH INFORMATION': 'महत्वपूर्ण स्वास्थ्य जानकारी',
  Allergy: 'एलर्जी',
  'CURRENT MEDICATIONS': 'वर्तमान दवाएं',

  // Home -- ecosystem cards
  'My Health Ecosystem': 'मेरा स्वास्थ्य इकोसिस्टम',
  'Everything about your health, connected in one place.': 'आपके स्वास्थ्य से जुड़ी हर चीज़, एक ही जगह पर।',
  'Personal information, medical history and complete health summary.': 'व्यक्तिगत जानकारी, चिकित्सा इतिहास और पूर्ण स्वास्थ्य सारांश।',
  'Medication history and real-time medication safety analysis.': 'दवा का इतिहास और रीयल-टाइम दवा सुरक्षा विश्लेषण।',
  'Clinic Visit': 'क्लिनिक विज़िट',
  'Consultations, diagnoses and prescriptions.': 'परामर्श, निदान और नुस्खे।',
  'Hospital Visit': 'अस्पताल विज़िट',
  'Admissions, treatments and discharge records.': 'भर्ती, उपचार और डिस्चार्ज रिकॉर्ड।',
  'Child Vaccination': 'बाल टीकाकरण',
  'Vaccination history and immunization records.': 'टीकाकरण इतिहास और प्रतिरक्षण रिकॉर्ड।',
  'Medical Insurance': 'मेडिकल बीमा',
  'Insurance policies, claims and healthcare coverage.': 'बीमा पॉलिसी, दावे और स्वास्थ्य कवरेज।',
  Open: 'खोलें',

  // Home -- timeline preview
  'My Health Timeline': 'मेरी स्वास्थ्य समयरेखा',
  'A connected view of your healthcare journey.': 'आपकी स्वास्थ्य यात्रा का एक जुड़ा हुआ दृश्य।',
  'View Complete Timeline': 'पूरी समयरेखा देखें',

  // Home -- medication safety preview
  'Medication Safety Intelligence': 'दवा सुरक्षा इंटेलिजेंस',
  'Transforming patient health information into actionable safety insights.': 'मरीज़ की स्वास्थ्य जानकारी को व्यावहारिक सुरक्षा जानकारी में बदलना।',
  'EXAMPLE: NEW MEDICATION': 'उदाहरण: नई दवा',
  'SYSTEM SAFETY ANALYSIS': 'सिस्टम सुरक्षा विश्लेषण',
  'Drug–Drug Interaction Check': 'दवा–दवा परस्पर प्रभाव जांच',
  'Drug–Disease Contraindication Check': 'दवा–रोग विरोधाभास जांच',
  'Drug Allergy Check': 'दवा एलर्जी जांच',
  'High risk (example)': 'उच्च जोखिम (उदाहरण)',
  'Potential Allergy-Related Risk Detected': 'संभावित एलर्जी-संबंधी जोखिम पाया गया',
  'A patient with a documented Penicillin allergy would be flagged here before this medicine is prescribed or dispensed.':
    'दर्ज पेनिसिलिन एलर्जी वाले मरीज़ को यह दवा लिखे या दिए जाने से पहले यहां चिह्नित किया जाएगा।',
  'CLINICAL DECISION SUPPORT ONLY': 'केवल क्लिनिकल निर्णय सहायता',
  'MediLink provides medication safety information to support healthcare professionals. It does not replace professional clinical judgment.':
    'MediLink स्वास्थ्य पेशेवरों की सहायता के लिए दवा सुरक्षा जानकारी प्रदान करता है। यह पेशेवर नैदानिक निर्णय का विकल्प नहीं है।',
  'YOUR MOST RECENT MEDICATION': 'आपकी सबसे हाल की दवा',
  'Not evaluated': 'मूल्यांकित नहीं',
  'Therapeutic Duplication': 'चिकित्सीय दोहराव',
  'Renal Function Review': 'गुर्दा कार्य समीक्षा',
  'Hepatic Function Review': 'यकृत कार्य समीक्षा',
  'Previous ADR History': 'पिछला प्रतिकूल दवा प्रतिक्रिया इतिहास',
  risk: 'जोखिम',
  LOW: 'निम्न',
  CAUTION: 'सावधानी',
  MODERATE: 'मध्यम',
  HIGH: 'उच्च',
  'View Full Analysis': 'पूरा विश्लेषण देखें',
  'Add a medication to see your personalized safety analysis here.': 'अपना व्यक्तिगत सुरक्षा विश्लेषण यहां देखने के लिए एक दवा जोड़ें।',
  'This section shows a live, patient-specific safety review the moment you add a medication on your Patient Profile.':
    'जैसे ही आप अपनी मरीज़ प्रोफ़ाइल में दवा जोड़ते हैं, यह खंड एक लाइव, मरीज़-विशिष्ट सुरक्षा समीक्षा दिखाता है।',
  'Run a Safety Check': 'सुरक्षा जांच चलाएं',

  // Home -- how it works
  'How MediLink Works': 'MediLink कैसे काम करता है',
  'From your Smart Health ID to an informed clinical decision.': 'आपकी स्मार्ट हेल्थ आईडी से लेकर एक सूचित नैदानिक निर्णय तक।',
  'Smart Health ID': 'स्मार्ट हेल्थ आईडी',
  'Patient Identification': 'मरीज़ पहचान',
  'Longitudinal Health Profile': 'दीर्घकालिक स्वास्थ्य प्रोफ़ाइल',
  'Healthcare Visit': 'स्वास्थ्य विज़िट',
  'Medication Entry': 'दवा प्रविष्टि',
  'Safety Analysis': 'सुरक्षा विश्लेषण',
  'Risk Identification': 'जोखिम पहचान',
  'Real-Time Alert': 'रीयल-टाइम अलर्ट',
  'Healthcare Professional Review': 'स्वास्थ्य पेशेवर समीक्षा',
  'Informed Clinical Decision': 'सूचित नैदानिक निर्णय',

  // Home -- impact
  'The MediLink Impact': 'MediLink का प्रभाव',
  'Practical outcomes for patients and the healthcare professionals treating them.': 'मरीज़ों और उनका इलाज करने वाले स्वास्थ्य पेशेवरों के लिए व्यावहारिक परिणाम।',
  'Connected Longitudinal Health Records': 'जुड़े हुए दीर्घकालिक स्वास्थ्य रिकॉर्ड',
  'Improved Continuity of Care': 'देखभाल की बेहतर निरंतरता',
  'Immediate Access to Critical Patient Information': 'महत्वपूर्ण मरीज़ जानकारी तक तत्काल पहुंच',
  'Patient-Specific Medication Safety Review': 'मरीज़-विशिष्ट दवा सुरक्षा समीक्षा',
  'Early Identification of Potential Medication Risks': 'संभावित दवा जोखिमों की शीघ्र पहचान',
  'Better-Informed Healthcare Decisions': 'बेहतर सूचित स्वास्थ्य निर्णय',
  'Enhanced Patient Safety': 'बढ़ी हुई मरीज़ सुरक्षा',

  // Patient Profile
  'Patient Health Profile': 'मरीज़ स्वास्थ्य प्रोफ़ाइल',
  'A unified view of essential patient health information.': 'आवश्यक मरीज़ स्वास्थ्य जानकारी का एक एकीकृत दृश्य।',
  'Edit Profile': 'प्रोफ़ाइल संपादित करें',
  'PERSONAL INFORMATION': 'व्यक्तिगत जानकारी',
  'Full name': 'पूरा नाम',
  Age: 'आयु',
  Gender: 'लिंग',
  'Blood Group': 'रक्त समूह',
  'MediLink Health ID': 'MediLink हेल्थ आईडी',
  'EMERGENCY INFORMATION': 'आपातकालीन जानकारी',
  'Emergency Contact': 'आपातकालीन संपर्क',
  Relationship: 'रिश्ता',
  'Emergency Phone': 'आपातकालीन फ़ोन',
  'Saving…': 'सहेजा जा रहा है…',
  'Save changes': 'परिवर्तन सहेजें',
  Cancel: 'रद्द करें',
  Name: 'नाम',
  'MEDICAL CONDITIONS': 'चिकित्सा स्थितियां',
  'Add Condition': 'स्थिति जोड़ें',
  'Condition name (e.g. Hypertension)': 'स्थिति का नाम (जैसे उच्च रक्तचाप)',
  Save: 'सहेजें',
  'No conditions recorded.': 'कोई स्थिति दर्ज नहीं है।',
  'DRUG ALLERGIES — HIGH PRIORITY MEDICAL ALERT': 'दवा एलर्जी — उच्च प्राथमिकता चिकित्सा चेतावनी',
  'Add Allergy': 'एलर्जी जोड़ें',
  'Allergy (e.g. Penicillin)': 'एलर्जी (जैसे पेनिसिलिन)',
  'High severity': 'उच्च गंभीरता',
  'Moderate severity': 'मध्यम गंभीरता',
  'Low severity': 'कम गंभीरता',
  'No known drug allergies.': 'कोई ज्ञात दवा एलर्जी नहीं।',
  'ADVERSE DRUG REACTION HISTORY': 'प्रतिकूल दवा प्रतिक्रिया इतिहास',
  'This prototype does not yet track ADR history — not evaluated, not a confirmed all-clear.':
    'यह प्रोटोटाइप अभी तक ADR इतिहास ट्रैक नहीं करता — मूल्यांकित नहीं, पुष्टि की गई सुरक्षा नहीं।',
  'Add Medication': 'दवा जोड़ें',
  'Medicine name': 'दवा का नाम',
  'Dose (e.g. 500mg)': 'खुराक (जैसे 500mg)',
  'Frequency (e.g. Twice daily)': 'आवृत्ति (जैसे दिन में दो बार)',
  'Duration (e.g. 7 days)': 'अवधि (जैसे 7 दिन)',
  'Save medication': 'दवा सहेजें',
  'No medications recorded yet.': 'अभी तक कोई दवा दर्ज नहीं है।',
  Medicine: 'दवा',
  Dose: 'खुराक',
  Frequency: 'आवृत्ति',
  Duration: 'अवधि',
  Status: 'स्थिति',
  'RECENT LABORATORY SUMMARY': 'हाल का प्रयोगशाला सारांश',
  'Add Lab Result': 'लैब परिणाम जोड़ें',
  'Test name (e.g. eGFR)': 'परीक्षण नाम (जैसे eGFR)',
  Value: 'मान',
  'Unit (e.g. mg/dL)': 'इकाई (जैसे mg/dL)',
  'No lab results recorded yet.': 'अभी तक कोई लैब परिणाम दर्ज नहीं है।',
  'DOCUMENTS & REPORTS': 'दस्तावेज़ और रिपोर्ट',
  'Upload Document': 'दस्तावेज़ अपलोड करें',
  'Uploading…': 'अपलोड हो रहा है…',
  Download: 'डाउनलोड करें',
  Delete: 'हटाएं',
  'No documents uploaded yet.': 'अभी तक कोई दस्तावेज़ अपलोड नहीं किया गया।',
  'Files are stored privately in your account and are only ever accessible through short-lived, secure links.':
    'फ़ाइलें आपके खाते में निजी रूप से संग्रहीत हैं और केवल अल्पकालिक, सुरक्षित लिंक के माध्यम से ही पहुंच योग्य हैं।',
  'Select…': 'चुनें…',
  Female: 'महिला',
  Male: 'पुरुष',
  Other: 'अन्य',
  'Prefer not to say': 'बताना नहीं चाहते',
  'Loading patient profile…': 'मरीज़ प्रोफ़ाइल लोड हो रही है…',

  // Patient Profile -- Share with a Doctor
  'Share with a Doctor': 'डॉक्टर के साथ साझा करें',
  'Create Share Link': 'साझा लिंक बनाएं',
  'Expires in': 'समाप्ति अवधि',
  '24 hours': '24 घंटे',
  '7 days': '7 दिन',
  '30 days': '30 दिन',
  'Label (optional, e.g. Dr. Sharma)': 'लेबल (वैकल्पिक, जैसे डॉ. शर्मा)',
  'Create Link': 'लिंक बनाएं',
  Copy: 'कॉपी करें',
  'Copied!': 'कॉपी हो गया!',
  Revoke: 'रद्द करें',
  'No active share links.': 'कोई सक्रिय साझा लिंक नहीं है।',
  Expires: 'समाप्ति',
  'This creates a temporary, read-only link — anyone with the link can view a summary of your profile, allergies, conditions, and active medications without logging in. Revoke it any time.':
    'यह एक अस्थायी, केवल-पढ़ने योग्य लिंक बनाता है — जिसके पास यह लिंक है वह बिना लॉग इन किए आपकी प्रोफ़ाइल, एलर्जी, स्थितियों और सक्रिय दवाओं का सारांश देख सकता है। इसे कभी भी रद्द किया जा सकता है।',
}
