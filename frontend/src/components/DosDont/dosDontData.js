const dosDontData = {
  cyclone: {
    en: {
      before: ["Keep emergency kit ready", "Charge mobile phones", "Secure loose objects"],
      during: ["Stay indoors", "Do not go near the sea"],
      after: ["Avoid flood water", "Follow official instructions"],
      videos: ["https://www.youtube.com/embed/CcvOhT7n3y8?si=PcUjdZ5D3ihLZku-", "https://www.youtube.com/embed/B9qR2e3xyJo?si=Xx4scdXNy02ij8zR"]
    },
    hi: {
      before: ["आपातकालीन किट तैयार रखें", "मोबाइल फोन चार्ज करें", "ढीली वस्तुओं को सुरक्षित करें"],
      during: ["घर के अंदर रहें", "समुद्र के पास न जाएं"],
      after: ["बाढ़ के पानी से दूर रहें", "सरकारी निर्देशों का पालन करें"],
      videos: ["https://www.youtube.com/embed/CcvOhT7n3y8?si=PcUjdZ5D3ihLZku-", "https://www.youtube.com/embed/B9qR2e3xyJo?si=Xx4scdXNy02ij8zR"]
    },
    mr: {
      before: ["आपत्कालीन किट तयार ठेवा", "मोबाइल चार्ज ठेवा", "सैल वस्तू सुरक्षित ठेवा"],
      during: ["घरातच रहा", "समुद्राजवळ जाऊ नका"],
      after: ["पूराच्या पाण्यापासून दूर रहा", "शासकीय सूचनांचे पालन करा"],
      videos: ["https://www.youtube.com/embed/CcvOhT7n3y8?si=PcUjdZ5D3ihLZku-", "https://www.youtube.com/embed/B9qR2e3xyJo?si=Xx4scdXNy02ij8zR"]
    },
    gu: {
      before: ["આપાતકાલીન કિટ તૈયાર રાખો", "મોબાઇલ ફોન ચાર્જ કરો", "ઢીલી વસ્તુઓ સુરક્ષિત કરો"],
      during: ["ઘરની અંદર રહો", "સમુદ્ર પાસે ન જશો"],
      after: ["પૂરના પાણીથી દૂર રહો", "સત્તાવાર સૂચનાઓનું પાલન કરો"],
      videos: ["https://www.youtube.com/embed/CcvOhT7n3y8?si=PcUjdZ5D3ihLZku-", "https://www.youtube.com/embed/B9qR2e3xyJo?si=Xx4scdXNy02ij8zR"]
    },
    ta: {
      before: ["அவசரக் கிட் தயார் வைத்திருங்கள்", "மொபைல் போன்களை சார்ஜ் செய்யுங்கள்", "தளர்ந்த பொருட்களை பாதுகாக்கவும்"],
      during: ["உள்ளே இருங்கள்", "கடலுக்கு அருகில் செல்லாதீர்கள்"],
      after: ["வெள்ள நீரை தவிர்க்கவும்", "அதிகாரிகளின் அறிவுறுத்தல்களை பின்பற்றவும்"],
      videos: ["https://www.youtube.com/embed/CcvOhT7n3y8?si=PcUjdZ5D3ihLZku-", "https://www.youtube.com/embed/B9qR2e3xyJo?si=Xx4scdXNy02ij8zR"]
    },
    te: {
      before: ["అత్యవసర కిట్ సిద్ధంగా ఉంచండి", "మొబైల్ ఫోన్లు చార్జ్ చేయండి", "వదులుగా ఉన్న వస్తువులను భద్రపరచండి"],
      during: ["ఇంట్లోనే ఉండండి", "సముద్రానికి దగ్గరగా వెళ్లవద్దు"],
      after: ["వరద నీటిని నివారించండి", "అధికారుల సూచనలు పాటించండి"],
      videos: ["https://www.youtube.com/embed/CcvOhT7n3y8?si=PcUjdZ5D3ihLZku-", "https://www.youtube.com/embed/B9qR2e3xyJo?si=Xx4scdXNy02ij8zR"]
    }
  },

  flood: {
    en: { before: ["Move valuables to higher places", "Switch off electricity"], during: ["Avoid walking in flood water", "Stay alert"], after: ["Drink clean water only", "Clean your surroundings"], videos: ["https://www.youtube.com/embed/gTgrAsNAq_4?si=Kzn7X1lu8tfdk5IY","https://www.youtube.com/embed/8uVEwnIHHWk?si=sFvO6e18hzamgUXC"] },
    hi: { before: ["कीमती सामान ऊँचाई पर रखें","बिजली बंद करें"], during: ["बाढ़ के पानी में न चलें","सतर्क रहें"], after: ["साफ पानी पिएं","आसपास की सफाई करें"], videos: ["https://www.youtube.com/embed/gTgrAsNAq_4?si=Kzn7X1lu8tfdk5IY","https://www.youtube.com/embed/8uVEwnIHHWk?si=sFvO6e18hzamgUXC"] },
    mr: { before: ["मोलाची वस्तू उंच ठिकाणी ठेवा","वीज बंद करा"], during: ["पूराच्या पाण्यात चालू नका","सतर्क रहा"], after: ["स्वच्छ पाणी प्या","परिसर स्वच्छ ठेवा"], videos: ["https://www.youtube.com/embed/gTgrAsNAq_4?si=Kzn7X1lu8tfdk5IY","https://www.youtube.com/embed/8uVEwnIHHWk?si=sFvO6e18hzamgUXC"] },
    gu: { before: ["મૂલ્યવાન વસ્તુઓ ઊંચા સ્થળ પર મૂકો","વિજળી બંધ કરો"], during: ["વાર્નર પાણીમાં ન ચાલો","સચેત રહો"], after: ["સફલ પાણી પીઓ","આસપાસની સફાઈ કરો"], videos: ["https://www.youtube.com/embed/gTgrAsNAq_4?si=Kzn7X1lu8tfdk5IY","https://www.youtube.com/embed/8uVEwnIHHWk?si=sFvO6e18hzamgUXC"] },
    ta: { before: ["மதிப்புமிக்க பொருட்களை உயரமான இடத்தில் வைக்கவும்","மின்சாரம் அணைக்கவும்"], during: ["பெருக்கெண்ணிலே நடக்க வேண்டாம்","கவனமாக இருங்கள்"], after: ["தூய்மையான தண்ணீர் மட்டும் குடிக்கவும்","சுற்றுப்புறத்தை சுத்தம் செய்யவும்"], videos: ["https://www.youtube.com/embed/gTgrAsNAq_4?si=Kzn7X1lu8tfdk5IY","https://www.youtube.com/embed/8uVEwnIHHWk?si=sFvO6e18hzamgUXC"] },
    te: { before: ["విలువైన వస్తువులను ఎత్తైన స్థలంలో ఉంచండి","విద్యుత్ పవర్ ఆఫ్ చేయండి"], during: ["వరద నీటిలో నడవద్దు","హెచ్చరికతో ఉండండి"], after: ["క్లీన్స్ వాటర్ మాత్రమే త్రాగండి","పరిసరాలను శుభ్రం చేయండి"], videos: ["https://www.youtube.com/embed/gTgrAsNAq_4?si=Kzn7X1lu8tfdk5IY","https://www.youtube.com/embed/8uVEwnIHHWk?si=sFvO6e18hzamgUXC"] }
  },

  earthquake: {
    en: { before: ["Secure heavy furniture","Identify safe spots"], during: ["Drop, Cover and Hold","Stay away from windows"], after: ["Check for injuries","Expect aftershocks"], videos: ["https://www.youtube.com/embed/U4QLsUNPXnU?si=gUSQkyNqKpdvVbSs","https://www.youtube.com/embed/ePMPqEmQLeA?si=1pCH8wQ90lA9uBc8"] },
    hi: { before: ["भारी फर्नीचर सुरक्षित करें","सुरक्षित स्थान पहचानें"], during: ["झुकें, ढकें और पकड़ें","खिड़कियों से दूर रहें"], after: ["चोटों की जांच करें","आफ्टरशॉक के लिए तैयार रहें"], videos: ["https://www.youtube.com/embed/U4QLsUNPXnU?si=gUSQkyNqKpdvVbSs","https://www.youtube.com/embed/ePMPqEmQLeA?si=1pCH8wQ90lA9uBc8"] },
    mr: { before: ["जड फर्निचर सुरक्षित ठेवा","सुरक्षित जागा ओळखा"], during: ["वाका, आडोसा घ्या, धरून ठेवा","काचांपासून दूर रहा"], after: ["जखमांची तपासणी करा","आफ्टरशॉकसाठी तयार रहा"], videos: ["https://www.youtube.com/embed/U4QLsUNPXnU?si=gUSQkyNqKpdvVbSs","https://www.youtube.com/embed/ePMPqEmQLeA?si=1pCH8wQ90lA9uBc8"] },
    gu: { before: ["ભારી ફર્નિચર સુરક્ષિત કરો","સુરક્ષિત સ્થળો ઓળખો"], during: ["ડ્રોપ, કવર અને હોલ્ડ કરો","જાળકીઓથી દૂર રહો"], after: ["ચોટની તપાસ કરો","અફ્ટરશોકની તૈયારી રાખો"], videos: ["https://www.youtube.com/embed/U4QLsUNPXnU?si=gUSQkyNqKpdvVbSs","https://www.youtube.com/embed/ePMPqEmQLeA?si=1pCH8wQ90lA9uBc8"] },
    ta: { before: ["பெரிய மென்பொருட்களை பாதுகாக்கவும்","பாதுகாப்பான இடங்களை அடையாளம் காணவும்"], during: ["தாழ்ந்து, மூடி, பிடிக்கவும்","ஜன்னல்களுக்கு தொலைவில் இருங்கள்"], after: ["காயங்களை சரிபார்க்கவும்","பின்னர் அசையுதலுக்குத் தயாராக இருங்கள்"], videos: ["https://www.youtube.com/embed/U4QLsUNPXnU?si=gUSQkyNqKpdvVbSs","https://www.youtube.com/embed/ePMPqEmQLeA?si=1pCH8wQ90lA9uBc8"] },
    te: { before: ["భారీ ఫర్నిచర్‌ని భద్రపరచండి","భద్ర స్థలాలను గుర్తించండి"], during: ["డ్రాప్, కవర్ మరియు హోల్డ్ చేయండి","జనాల నుండి దూరంగా ఉండండి"], after: ["చోట్లను తనిఖీ చేయండి","ఆఫ్టర్‌షాక్స్‌ కోసం సిద్ధంగా ఉండండి"], videos: ["https://www.youtube.com/embed/U4QLsUNPXnU?si=gUSQkyNqKpdvVbSs","https://www.youtube.com/embed/ePMPqEmQLeA?si=1pCH8wQ90lA9uBc8"] }
  }
,




  fire: {
    en: {
      before: ["Check electrical wiring", "Keep fire extinguisher ready"],
      during: ["Use stairs, not lifts", "Cover nose with cloth"],
      after: ["Do not re-enter until safe", "Seek medical help if needed"],
      videos: ["https://www.youtube.com/embed/6hFqFZJ8mXU"]
    },
    hi: {
      before: ["बिजली की वायरिंग जांचें", "फायर एक्सटिंग्विशर तैयार रखें"],
      during: ["लिफ्ट का उपयोग न करें", "नाक को कपड़े से ढकें"],
      after: ["सुरक्षित होने तक अंदर न जाएं", "जरूरत हो तो चिकित्सा सहायता लें"],
      videos: ["https://www.youtube.com/embed/6hFqFZJ8mXU"]
    },
    mr: {
      before: ["विद्युत वायरिंग तपासा", "अग्निशामक यंत्र तयार ठेवा"],
      during: ["लिफ्ट वापरू नका", "नाक कापडाने झाका"],
      after: ["सुरक्षित होईपर्यंत आत जाऊ नका", "गरज असल्यास वैद्यकीय मदत घ्या"],
      videos: ["https://www.youtube.com/embed/6hFqFZJ8mXU"]
    },
    gu: {
      before: ["વિદ્યુત વાયરિંગ તપાસો", "અગ્નિશામક યંત્ર તૈયાર રાખો"],
      during: ["લિફ્ટ ન વાપરો", "નાક કપડાથી ઢાંકો"],
      after: ["સુરક્ષિત ના થાય ત્યાં સુધી અંદર ન જાવ", "આવશ્યક હોય તો ડોક્ટરની મદદ લ્યો"],
      videos: ["https://www.youtube.com/embed/6hFqFZJ8mXU"]
    },
    ta: {
      before: ["மின்சார கம்பிகளை சரிபார்க்கவும்", "தீ அணைக்கும் சாதனங்கள் தயாராக வைக்கவும்"],
      during: ["லிஃப்ட் பயன்படுத்த வேண்டாம்", "மூக்கை துணியால் மூடு"],
      after: ["பாதுகாப்பான வரை மீண்டும் நுழையாதீர்கள்", "தேவைப்பட்டால் மருத்துவரை அணுகவும்"],
      videos: ["https://www.youtube.com/embed/6hFqFZJ8mXU"]
    },
    te: {
      before: ["ఎలక్ట్రికల్ వైర్లను తనిఖీ చేయండి", "ఫైర్ ఎక్స్టింగ్విషర్ సిద్ధం ఉంచండి"],
      during: ["లిఫ్ట్ ఉపయోగించవద్దు", "మూకును దుస్తులతో మూసివేయండి"],
      after: ["భద్రమైన తర్వాత మాత్రమే తిరిగి వెళ్లండి", "తీగ కావాలి అయితే డాక్టర్‌ని సంప్రదించండి"],
      videos: ["https://www.youtube.com/embed/6hFqFZJ8mXU"]
    }
  },


  heatwave: {
    en: {
      before: ["Drink plenty of water", "Avoid outdoor activities in afternoon"],
      during: ["Stay in shade", "Wear light cotton clothes"],
      after: ["Cool the body gradually", "Consult doctor if unwell"],
      videos:  ["https://www.youtube.com/embed/qBVXhX_xbYQ?si=mPqHEtunQ4WdmaLI","https://www.youtube.com/embed/W1iqMZC5gUk?si=_BkcymRaYMq71_88"]
    },
    hi: {
      before: ["भरपूर पानी पिएं", "दोपहर में बाहर जाने से बचें"],
      during: ["छांव में रहें", "हल्के सूती कपड़े पहनें"],
      after: ["शरीर को धीरे-धीरे ठंडा करें", "तबीयत खराब हो तो डॉक्टर से मिलें"],
      videos:  ["https://www.youtube.com/embed/qBVXhX_xbYQ?si=mPqHEtunQ4WdmaLI","https://www.youtube.com/embed/W1iqMZC5gUk?si=_BkcymRaYMq71_88"]
    },
    mr: {
      before: ["भरपूर पाणी प्या", "दुपारी बाहेर जाणे टाळा"],
      during: ["सावलीत रहा", "हलके सुती कपडे घाला"],
      after: ["शरीर हळूहळू थंड करा", "तब्येत बिघडल्यास डॉक्टरांचा सल्ला घ्या"],
      videos: ["https://www.youtube.com/embed/qBVXhX_xbYQ?si=mPqHEtunQ4WdmaLI","https://www.youtube.com/embed/W1iqMZC5gUk?si=_BkcymRaYMq71_88"]
    },
     gu: {
      before: ["ઘણું પાણી પીવો", "બપોરે બહાર જતા ન રહો"],
      during: ["છાયામાં રહો", "હળવા કાપડ પહેરો"],
      after: ["શરીરને ધીમે ઠંડુ કરો", "બિમાર લાગ્યો તો ડૉક્ટરને જોઈ લો"],
      videos:  ["https://www.youtube.com/embed/qBVXhX_xbYQ?si=mPqHEtunQ4WdmaLI","https://www.youtube.com/embed/W1iqMZC5gUk?si=_BkcymRaYMq71_88"]
    },
    ta: {
      before: ["பல நீர் குடிக்கவும்", "மதியம் வெளியில் செல்லாதீர்கள்"],
      during: ["நிழலில் இருங்கள்", "எளிதான ஆடைகள் அணியுங்கள்"],
      after: ["உடலை மெதுவாக குளிர்ச்சியடையச் செய்யவும்", "நோயாக இருந்தால் டாக்டரை அணுகவும்"],
      videos:  ["https://www.youtube.com/embed/qBVXhX_xbYQ?si=mPqHEtunQ4WdmaLI","https://www.youtube.com/embed/W1iqMZC5gUk?si=_BkcymRaYMq71_88"]
    },
    te: {
      before: ["చాలా నీరు త్రాగండి", "మధ్యాహ్నం బయటకు వెళ్లవద్దు"],
      during: ["నన్ను నీడలో ఉంచండి", "లైట్ బట్టలు ధరిస్తూ ఉండండి"],
      after: ["శరీరాన్ని మెల్లగా చల్లబరచండి", "అసౌకర్యం ఉంటే డాక్టర్‌ని సంప్రదించండి"],
      videos:  ["https://www.youtube.com/embed/qBVXhX_xbYQ?si=mPqHEtunQ4WdmaLI","https://www.youtube.com/embed/W1iqMZC5gUk?si=_BkcymRaYMq71_88"]
    }
  },

  tsunami: {
    en: {
      before: ["Know evacuation routes", "Prepare emergency supplies"],
      during: ["Move to higher ground immediately", "Stay away from the coast"],
      after: ["Return only when authorities allow", "Avoid damaged buildings"],
      videos: ["https://www.youtube.com/embed/wCpjaXPc3eI?si=f2eySW9r7ZbbfiHc","https://www.youtube.com/embed/W7GHpxHpnzk?si=kK9mKsZ5fSIs1U3x"]
    },
    hi: {
      before: ["निकासी मार्गों को जानें", "आपातकालीन सामान तैयार रखें"],
      during: ["तुरंत ऊँचे स्थान पर जाएं", "तट से दूर रहें"],
      after: ["अनुमति मिलने पर ही लौटें", "क्षतिग्रस्त इमारतों से दूर रहें"],
      videos: ["https://www.youtube.com/embed/wCpjaXPc3eI?si=f2eySW9r7ZbbfiHc","https://www.youtube.com/embed/W7GHpxHpnzk?si=kK9mKsZ5fSIs1U3x"]
    },
    mr: {
      before: ["निर्गमन मार्ग ओळखा", "आपत्कालीन साहित्य तयार ठेवा"],
      during: ["तात्काळ उंच ठिकाणी जा", "किनाऱ्यापासून दूर रहा"],
      after: ["परवानगी मिळाल्यावरच परत या", "नुकसान झालेल्या इमारती टाळा"],
      videos: ["https://www.youtube.com/embed/wCpjaXPc3eI?si=f2eySW9r7ZbbfiHc","https://www.youtube.com/embed/W7GHpxHpnzk?si=kK9mKsZ5fSIs1U3x"]
    }, gu: {
      before: ["નિકાસ માર્ગ જાણો", "આપાતકાલીન સામગ્રી તૈયાર રાખો"],
      during: ["તાત્કાલિક ઊંચા સ્થળે જાઓ", "કિનારાથી દૂર રહો"],
      after: ["સત્તાવાર મંજૂરી પછી જ પરત જાઓ", "નુકસાન થયેલી ઈમારતો નજીક ન જાઓ"],
      videos: ["https://www.youtube.com/embed/wCpjaXPc3eI?si=f2eySW9r7ZbbfiHc","https://www.youtube.com/embed/W7GHpxHpnzk?si=kK9mKsZ5fSIs1U3x"]
    },
    ta: {
      before: ["வெளியேறும் பாதைகளை அறிக", "அவசரப் பொருட்களை தயார் செய்யவும்"],
      during: ["உடனே உயரமான இடத்திற்கு செல்லவும்", "கடற்கரை அருகில் இராதீர்கள்"],
      after: ["அதிகாரிகள் அனுமதித்தால் மட்டும் திரும்பவும்", "தேராத கட்டிடங்களுக்கு அருகில் செல்லாதீர்கள்"],
      videos: ["https://www.youtube.com/embed/wCpjaXPc3eI?si=f2eySW9r7ZbbfiHc","https://www.youtube.com/embed/W7GHpxHpnzk?si=kK9mKsZ5fSIs1U3x"]
    },
    te: {
      before: ["ఎవాక్యుయేషన్ మార్గాలను తెలుసుకోండి", "తక్షణ సరఫరాలు సిద్ధం ఉంచండి"],
      during: ["తక్షణమే ఎత్తైన స్థలానికి వెళ్ళండి", "తీరానికి దగ్గరగా ఉండవద్దు"],
      after: ["అధికారుల అనుమతితో మాత్రమే తిరిగి వచ్చి", "నష్టపోయిన భవనాల దగ్గరకు వెళ్ళవద్దు"],
      videos: ["https://www.youtube.com/embed/wCpjaXPc3eI?si=f2eySW9r7ZbbfiHc","https://www.youtube.com/embed/W7GHpxHpnzk?si=kK9mKsZ5fSIs1U3x"]
    }
  },
  

  landslide: {
    en: {
      before: ["Avoid building near slopes", "Watch for warning signs"],
      during: ["Move away from landslide path", "Stay alert"],
      after: ["Stay away from affected area", "Report damaged utilities"],
      videos: ["https://www.youtube.com/embed/xnoheMCY0jc?si=XsX2B76HYagJTpA6","https://www.youtube.com/embed/0M9OMkDV3_k?si=Q2zkBXBbE_A2rdXo"  ]
    },
    hi: {
      before: ["ढलान के पास निर्माण से बचें", "चेतावनी संकेतों पर ध्यान दें"],
      during: ["भूस्खलन के रास्ते से दूर जाएं", "सतर्क रहें"],
      after: ["प्रभावित क्षेत्र से दूर रहें", "क्षतिग्रस्त सेवाओं की सूचना दें"],
      videos: ["https://www.youtube.com/embed/xnoheMCY0jc?si=XsX2B76HYagJTpA6","https://www.youtube.com/embed/0M9OMkDV3_k?si=Q2zkBXBbE_A2rdXo","https://www.youtube.com/embed/-QAie-ECh40?si=0lJtlo9x-J_PiWoJ"   ]
    },
    mr: {
      before: ["उताराजवळ बांधकाम टाळा", "इशारा देणाऱ्या चिन्हांकडे लक्ष ठेवा"],
      during: ["भूस्खलन मार्गापासून दूर जा", "सतर्क रहा"],
      after: ["प्रभावित भागापासून दूर रहा", "तुटलेल्या सुविधा कळवा"],
      videos: ["https://www.youtube.com/embed/xnoheMCY0jc?si=XsX2B76HYagJTpA6","https://www.youtube.com/embed/0M9OMkDV3_k?si=Q2zkBXBbE_A2rdXo"  ]
    },
     gu: {
      before: ["ઢલાન નજીક બિલ્ડિંગ ટાળો", "ચેતવણી નિશાન પર ધ્યાન આપો"],
      during: ["ભૂસ્ખલન માર્ગથી દૂર રહો", "સાવચેત રહો"],
      after: ["પ્રભાવિત વિસ્તારમાંથી દૂર રહો", "નુકસાન થયેલી સેવાઓની જાણ કરો"],
      videos: ["https://www.youtube.com/embed/xnoheMCY0jc?si=XsX2B76HYagJTpA6","https://www.youtube.com/embed/0M9OMkDV3_k?si=Q2zkBXBbE_A2rdXo"  ]
    },
    ta: {
      before: ["செளரிய அடிவயல்களுக்கு அருகில் கட்டிடங்களை தவிர்க்கவும்", "எச்சரிக்கை சின்னங்களை கவனிக்கவும்"],
      during: ["பாறை சரிவின் பாதையை விட்டு விலகவும்", "கவனமாக இருங்கள்"],
      after: ["தேராத இடத்தை விட்டு விலகவும்", "கட்டட சேதங்களை அறிவிக்கவும்"],
      videos: ["https://www.youtube.com/embed/xnoheMCY0jc?si=XsX2B76HYagJTpA6","https://www.youtube.com/embed/0M9OMkDV3_k?si=Q2zkBXBbE_A2rdXo"  ]
    },
    te: {
      before: ["తారుపాయల దగ్గర భవనాలు నిర్మించడం నివారించండి", "హెచ్చరిక చిహ్నాలను గమనించండి"],
      during: ["భూకంప మార్గం నుండి దూరంగా ఉండండి", "హెచ్చరిగా ఉండండి"],
      after: ["ప్రభావిత ప్రాంతానికి దూరంగా ఉండండి", "నష్టం అయిన సదుపాయాలను నివేదించండి"],
      videos: ["https://www.youtube.com/embed/xnoheMCY0jc?si=XsX2B76HYagJTpA6","https://www.youtube.com/embed/0M9OMkDV3_k?si=Q2zkBXBbE_A2rdXo"  ]
    }

  },
 
  lightning: {
    en: {
      before: ["Stay indoors", "Avoid open fields", "Unplug electrical appliances"],
      during: ["Do not touch metal objects", "Avoid water bodies"],
      after: ["Check for damages", "Help neighbors if needed"],
      videos: ["https://www.youtube.com/embed/qHsORJg8Meo?si=cmll-mft1Y3y0LYB","https://www.youtube.com/embed/dJyLf0CS9Z8?si=AUXvS8wVA2XCmb4P"]
    },
    hi: {
      before: ["घर के अंदर रहें", "खुले मैदान से दूर रहें", "बिजली उपकरण अनप्लग करें"],
      during: ["धातु वस्तुओं को न छुएं", "जल स्रोतों से दूर रहें"],
      after: ["क्षति जांचें", "पड़ोसियों की मदद करें"],
      videos: ["https://www.youtube.com/embed/qHsORJg8Meo?si=cmll-mft1Y3y0LYB","https://www.youtube.com/embed/dJyLf0CS9Z8?si=AUXvS8wVA2XCmb4P"]
    },
    mr: {
      before: ["घरात रहा", "मोकळ्या जागेत जाऊ नका", "विद्युत उपकरण अनप्लग करा"],
      during: ["धातूच्या वस्तूला स्पर्श करू नका", "पाण्याच्या ठिकाणांपासून दूर रहा"],
      after: ["नुकसान तपासा", "शेजाऱ्यांना मदत करा"],
      videos: ["https://www.youtube.com/embed/qHsORJg8Meo?si=cmll-mft1Y3y0LYB","https://www.youtube.com/embed/dJyLf0CS9Z8?si=AUXvS8wVA2XCmb4P"]
    },
    ta: {
      before: ["உள்ளே இருங்கள்", "தெரிவிடங்களை தவிருங்கள்", "மின்சார சாதனங்களை பிளக் செய்யுங்கள்"],
      during: ["உலோகப் பொருட்களை தொட வேண்டாம்", "நீர்ப்பிடிகளில் இருந்து தொலைவில் இருங்கள்"],
      after: ["நீங்கள் பாதிப்புகளைச் சரிபார்க்கவும்", "அருகாமையில் உள்ளவர்களுக்கு உதவவும்"],
      videos: ["https://www.youtube.com/embed/qHsORJg8Meo?si=cmll-mft1Y3y0LYB","https://www.youtube.com/embed/dJyLf0CS9Z8?si=AUXvS8wVA2XCmb4P"]
    },
    te: {
      before: ["ఇంట్లో ఉండండి", "పొలాల్లోకి వెళ్ళవద్దు", "ఎలక్ట్రికల్ ఉపకరణాలు అన్ప్లగ్ చేయండి"],
      during: ["లోహ వస్తువులను తాకరాదు", "నీటి దగ్గరకి వెళ్ళవద్దు"],
      after: ["నష్టం తనిఖీ చేయండి", "పొరపాట్లకు సహాయం చేయండి"],
      videos: ["https://www.youtube.com/embed/qHsORJg8Meo?si=cmll-mft1Y3y0LYB","https://www.youtube.com/embed/dJyLf0CS9Z8?si=AUXvS8wVA2XCmb4P"]
    },
    gu: {
      before: ["ઘરમાં રહો", "ખુલ્લા મેદાનોથી દૂર રહો", "ઇલેક્ટ્રિકલ ઉપકરણો અનપ્લગ કરો"],
      during: ["ધાતુની વસ્તુઓને ન સ્પર્શો", "જળ સ્ત્રોતની નજીક ન જાઓ"],
      after: ["નુકસાન તપાસો", "પડોશીઓને મદદ કરો"],
      videos: ["https://www.youtube.com/embed/qHsORJg8Meo?si=cmll-mft1Y3y0LYB","https://www.youtube.com/embed/dJyLf0CS9Z8?si=AUXvS8wVA2XCmb4P"]
    }
  },

  coldwave: {
    en: {
      before: ["Keep warm clothes ready", "Check heating devices", "Stock emergency supplies"],
      during: ["Stay indoors", "Avoid prolonged exposure to cold"],
      after: ["Check on vulnerable people", "Avoid frostbite risks"],
      videos: ["https://www.youtube.com/embed/3dGT8jQQvLw?si=Kj36IV7UARIJ4F1","https://www.youtube.com/embed/FaBAqdkCQWA?si=-QbuyBt5FyelfZf5","https://www.youtube.com/embed/y3C4HYMYwZU?si=tt2T3mfO6aEUAjoa" ]
    },
    hi: {
      before: ["गर्म कपड़े तैयार रखें", "हीटिंग उपकरण जांचें", "आपातकालीन सामग्री रखें"],
      during: ["घर के अंदर रहें", "ठंड में लंबे समय तक बाहर न रहें"],
      after: ["जरूरतमंदों की मदद करें", "हिम जमे अंगों से बचें"],
      videos: ["https://www.youtube.com/embed/3dGT8jQQvLw?si=Kj36IV7UARIJ4F1","https://www.youtube.com/embed/FaBAqdkCQWA?si=-QbuyBt5FyelfZf5"]
    },
    mr: {
      before: ["गरम कपडे तयार ठेवा", "हीटिंग उपकरण तपासा", "आपत्कालीन साहित्य ठेवा"],
      during: ["घरात रहा", "थंडीत जास्त वेळ बाहेर जाऊ नका"],
      after: ["असहाय लोकांकडे लक्ष द्या", "हिमजमलेल्या भागापासून सावध रहा"],
      videos: ["https://www.youtube.com/embed/3dGT8jQQvLw?si=Kj36IV7UARIJ4F1","https://www.youtube.com/embed/FaBAqdkCQWA?si=-QbuyBt5FyelfZf5"]
    },
    ta: {
      before: ["சீனிவரம் உடைகள் தயாராக வைத்திருங்கள்", "ஹீட்டிங் சாதனங்களை சரிபார்க்கவும்", "அவசர பொருட்கள் வைத்திருங்கள்"],
      during: ["உள்ளே இருங்கள்", "சீற்றில் நீண்ட நேரம் வெளியில் இருக்க வேண்டாம்"],
      after: ["பலரையும் சரிபார்க்கவும்", "ஃபிராஸ்ட்பைட் ஆபத்துகளிலிருந்து விலகவும்"],
      videos: ["https://www.youtube.com/embed/3dGT8jQQvLw?si=Kj36IV7UARIJ4F1","https://www.youtube.com/embed/FaBAqdkCQWA?si=-QbuyBt5FyelfZf5"]
    },
    te: {
      before: ["వెచ్చని వస్త్రాలు సిద్ధం ఉంచండి", "హీటింగ్ పరికరాలు తనిఖీ చేయండి", "తక్షణ సరఫరాలు ఉంచండి"],
      during: ["ఇంట్లో ఉండండి", "చల్లదనం ఎక్కువగా ఎదుర్కోవద్దు"],
      after: ["పరిరక్షణ అవసరమైనవారిని చూసుకోండి", "ఫ్రాస్ట్‌బైట్ ప్రమాదాలను నివారించండి"],
      videos: ["https://www.youtube.com/embed/3dGT8jQQvLw?si=Kj36IV7UARIJ4F1","https://www.youtube.com/embed/FaBAqdkCQWA?si=-QbuyBt5FyelfZf5"]
    },
    gu: {
      before: ["ગરમ કપડા તૈયાર રાખો", "હીટિંગ ડિવાઇસ ચકાસો", "એમર્જન્સી સપ્લાય રાખો"],
      during: ["ઘરમાં રહો", "ઠંડીમાં લાંબા સમય સુધી બહાર ન રહો"],
      after: ["જરૂરી લોકોને તપાસો", "ફ્રોસ્ટબાઈટ જોખમ ટાળો"],
      videos: ["https://www.youtube.com/embed/3dGT8jQQvLw?si=Kj36IV7UARIJ4F1","https://www.youtube.com/embed/FaBAqdkCQWA?si=-QbuyBt5FyelfZf5"]
    }
  },

  forestfire: {
    en: {
      before: ["Clear dry leaves and debris", "Have fire extinguishers ready", "Plan escape routes"],
      during: ["Evacuate if instructed", "Stay low to avoid smoke inhalation"],
      after: ["Check property damage", "Report fire hazards"],
      videos: []
    },
    hi: {
      before: ["सूखी पत्तियां और कचरा हटाएं", "फायर एक्सटिंग्विशर तैयार रखें", "निकासी मार्ग योजना बनाएं"],
      during: ["निर्देश मिलने पर बाहर जाएं", "धुएं से बचने के लिए नीचे रहें"],
      after: ["संपत्ति की जांच करें", "आग के खतरों की सूचना दें"],
      videos: []
    },
    mr: {
      before: ["कोरडे पान आणि कचरा साफ करा", "अग्निशामक यंत्र तयार ठेवा", "निर्गमन मार्गांची योजना करा"],
      during: ["सूचना मिळाल्यास बाहेर पडा", "धूर श्वास घेण्यापासून खाली रहा"],
      after: ["मालमत्तेचे नुकसान तपासा", "आगच्या धोका नोंदवा"],
      videos: []
    },
    gu: {
      before: ["સૂકા પાન અને કચરો સાફ કરો", "ફાયર એક્સ્ટિંગ્યુશર તૈયાર રાખો", "એસ્કેપ માર્ગો પ્લાન કરો"],
      during: ["સૂચના મળવાથી બહાર નીકળો", "ધુમ્મસ ટાળવા માટે નીચે રહો"],
      after: ["સ્થિર મિલકત ચકાસો", "આગના જોખમોની જાણ કરો"],
      videos: []
    },
    ta: {
      before: ["உலர்ந்த இலைகள் மற்றும் கழிவுகளை அகற்றவும்", "தீ அணைக்கும் சாதனங்களை தயார் செய்யவும்", "வெளியேறும் வழிகளை திட்டமிடவும்"],
      during: ["ஆদেশம் வந்தால் வெளியேறவும்", "புகை மூச்சை தவிர்க்க கீழே இருங்கள்"],
      after: ["சொத்து சேதத்தை சரிபார்க்கவும்", "தீ அபாயங்களை அறிவிக்கவும்"],
      videos: []
    },
    te: {
      before: ["కడపని ఆకులు మరియు మురికిని తీయండి", "ఫైర్ ఎక్స్టింగ్విషర్ సిద్ధం ఉంచండి", "ఎస్కేప్ మార్గాలను ప్రణాళిక చేసుకోండి"],
      during: ["సూచన వచ్చినప్పుడు బయటకు వెళ్లండి", "దుమ్ము ఊపిరి తీసుకోకుండా కింద ఉండు"],
      after: ["సొంత ఆస్తిని తనిఖీ చేయండి", "ఫైర్ హజార్డ్స్ నివేదించండి"],
      videos: []

    }
  }
};



export default dosDontData;
