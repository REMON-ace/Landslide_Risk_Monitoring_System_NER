import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.resolve(__dirname, '../locales');

const translations = {
  en: {
    nav: {
      brand_title: "NER Landslide Alert",
      brand_subtitle: "East Khasi Hills • Early Warning Platform",
      home: "Home",
      about: "About",
      live_risk_map: "Live Risk Map",
      alerts: "Alerts",
      field_reports: "Field Reports",
      resources: "Resources",
      login_dashboard: "Login / Dashboard"
    },
    hero: {
      kicker: "SAFER COMMUNITIES  |  RESILIENT NORTHEAST",
      heading_white: "Predict. Prepare.",
      heading_green: "Protect.",
      description: "Real-time landslide early warning system for East Khasi Hills, Meghalaya — leveraging geospatial data, weather intelligence and community participation for a safer tomorrow.",
      btn_primary: "View Live Risk Map",
      btn_secondary: "Explore Platform",
      badge_early_warnings: "Early Warnings",
      badge_stronger_communities: "Stronger Communities",
      badge_safer_meghalaya: "A Safer Meghalaya",
      system_online: "System Online • Real-time Monitoring",
      quote_line1: "Mountains are beautiful.",
      quote_line2: "Let’s keep them safe.",
      quote_location1: "East Khasi Hills",
      quote_location2: "Meghalaya, India",
      scroll_explore: "Scroll to explore"
    },
    features: {
      kicker: "OUR FEATURES",
      heading: "Everything you need to understand and respond to landslide risk.",
      card1_title: "Real-Time Risk Monitoring",
      card1_desc: "Monitor rainfall, terrain and geospatial data to identify landslide-prone areas in real time.",
      card1_link: "View Risk Map",
      card2_title: "Community Alerts",
      card2_desc: "Receive timely alerts and safety information via SMS, mobile app and public channels.",
      card2_link: "View Alerts",
      card3_title: "Field Incident Reporting",
      card3_desc: "Enable citizens and field officials to report landslides, road blockages and other hazards from the field.",
      card3_link: "Submit a Report"
    },
    how_it_works: {
      kicker: "FROM DATA TO A SAFER TOMORROW",
      heading: "How It Works",
      step1_title: "1. Sensors & Rainfall",
      step1_desc: "Collect real-time data from weather stations, sensors and satellite sources.",
      step2_title: "2. AI Risk Engine",
      step2_desc: "Analyze data using AI/ML to detect landslide risk and generate early warnings.",
      step3_title: "3. Authorities & Communities",
      step3_desc: "Share alerts with district authorities, field teams and local communities for faster response."
    },
    live_risk: {
      kicker: "LIVE RISK VIEW",
      heading: "Know the Risk Before It Happens",
      description: "Explore real-time risk zones, monitoring stations, road networks and vulnerable communities across East Khasi Hills.",
      btn_open_map: "Open Live Risk Map",
      status_title: "CURRENT MONITORING STATUS",
      monitored_zones: "Monitored Zones",
      critical_zones: "Critical Zones",
      blocked_corridors: "Blocked Corridors",
      active_alerts: "Active Alerts",
      last_updated: "Last updated:"
    },
    stats: {
      stat1_value: "7",
      stat1_label: "Monitored Risk Zones",
      stat1_sub: "Across East Khasi Hills",
      stat2_value: "3",
      stat2_label: "High / Critical Zones",
      stat2_sub: "Requiring close monitoring",
      stat3_value: "2",
      stat3_label: "Blocked Road Corridors",
      stat3_sub: "NH-206 & NH-40 passes",
      stat4_value: "3",
      stat4_label: "Active Community Alerts",
      stat4_sub: "SMS & App notifications",
      stat5_value: "24/7",
      stat5_label: "Monitoring",
      stat5_sub: "For a safer tomorrow"
    },
    mission: {
      img_badge_line1: "Safer Communities",
      img_badge_line2: "Stronger Tomorrow",
      kicker: "OUR MISSION",
      heading: "Building a Safer, More Resilient Northeast",
      paragraph: "Landslides can develop rapidly, but better information can give communities valuable time to prepare. NER Landslide Alert brings spatial intelligence, environmental data, AI and community reporting together in one platform.",
      check1: "Early detection",
      check2: "Location-based warnings",
      check3: "Community reporting",
      check4: "Infrastructure monitoring",
      check5: "Data-driven decision making",
      check6: "Stronger, safer communities",
      btn_explore: "Explore the Platform",
      quote: "Technology and people together can build a safer Meghalaya."
    },
    cta: {
      heading: "Know the Risk. Act Before It Becomes a Disaster.",
      subtitle: "Stay informed, report hazards and help build safer communities across East Khasi Hills.",
      btn_risk: "Check Live Risk",
      btn_report: "Report an Incident"
    },
    footer: {
      brand_title: "NER Landslide Alert",
      dept: "East Khasi Hills • Meghalaya State Disaster Management",
      tagline: "Together for a Safer, Stronger Northeast.",
      heading_quick_links: "QUICK LINKS",
      link_home: "Home",
      link_platform: "Platform",
      link_risk_map: "Risk Map",
      link_alerts: "Alerts",
      link_field_reports: "Field Reports",
      link_about: "About",
      heading_support: "SUPPORT",
      link_emergency_info: "Emergency Information",
      link_safety_guidelines: "Safety Guidelines",
      link_contact_us: "Contact Us",
      heading_follow_us: "FOLLOW US",
      copyright: "© 2026 NER Landslide Alert. All rights reserved."
    }
  },

  kha: {
    nav: {
      brand_title: "NER Landslide Alert",
      brand_subtitle: "East Khasi Hills • Platform Maham Mardor",
      home: "Ing (Home)",
      about: "Shaphang",
      live_risk_map: "Map Jingmaham Live",
      alerts: "Ki Jingmaham",
      field_reports: "Ripot Jingjia",
      resources: "Ki Jingiarap",
      login_dashboard: "Login / Dashboard"
    },
    hero: {
      kicker: "KI SHNONG BA SHNGIAIN  |  KA NORTHEAST BA LA KHLIOH",
      heading_white: "Peit Lpa. Pynkhreh.",
      heading_green: "Iada.",
      description: "Ka platform maham mardor shaphang ka jingtwad khyndew ha East Khasi Hills, Meghalaya — da kaba pyndonkam ia ka geospatial data, ka suinbneng bad ka jingiashimbynta ki paidbah.",
      btn_primary: "Peit ia ka Map Jingmaham",
      btn_secondary: "Wad Bniah ia ka Platform",
      badge_early_warnings: "Jingmaham Kloi",
      badge_stronger_communities: "Ki Shnong ba Khlain",
      badge_safer_meghalaya: "Ka Meghalaya ba Shngiain",
      system_online: "System Online • Dang Peit Bniah",
      quote_line1: "Ki lum ki itynnat bha.",
      quote_line2: "To ngin sumar suk ia ki.",
      quote_location1: "East Khasi Hills",
      quote_location2: "Meghalaya, India",
      scroll_explore: "Pynhiar ban peit shuh"
    },
    features: {
      kicker: "KI JINGIARAP JONG NGI",
      heading: "Kiei kiei baroh ban sngewthuh bad iada na ka jingtwad khyndew.",
      card1_title: "Jingpeit Bniah ha ka Por ba Jia",
      card1_desc: "Peit bniah ia u slap, ka jinglong jong ka khyndew bad geospatial data ban tip ia ki jaka ba ma.",
      card1_link: "Peit ia ka Map",
      card2_title: "Jingmaham Paidbah",
      card2_desc: "Ioh ia ki jingmaham mardor lyngba ka SMS, mobile app bad ki lad pathai khubor.",
      card2_link: "Peit Jingmaham",
      card3_title: "Phah Ripot Jingjia na Madan",
      card3_desc: "Aibor ia ki paidbah bad ki nongtrei sorkar ban phah ripot mardor lada don kiba twad ne sah kut surok.",
      card3_link: "Phah ka Ripot"
    },
    how_it_works: {
      kicker: "NA KA DATA SHA KA LAWEI BA SHNGIAIN",
      heading: "Kumno ka Treikam",
      step1_title: "1. Ki Sensor & U Slap",
      step1_desc: "Lum data ha ka por ba shisha na ki weather station, sensor bad satellite.",
      step2_title: "2. AI Risk Engine",
      step2_desc: "Pynshongnia da ka AI/ML ban lap kloi ia ka jingtwad khyndew bad pynmih jingmaham.",
      step3_title: "3. Ki Bor Sorkar & Ki Shnong",
      step3_desc: "Sam ia ki jingmaham sha ki bor district, ki SDRF bad ki paidbah nongshong shnong."
    },
    live_risk: {
      kicker: "JINGPEIT JINGMAHAM LIVE",
      heading: "Tip Lpa ia ka Jingma Shuwa ban Jia",
      description: "Wad bniah ia ki jaka ba ma, ki station peit bniah, ki surok bad ki shnong ha East Khasi Hills.",
      btn_open_map: "Plie ia ka Map Live",
      status_title: "JINGLONG MYNTA HA DISTRICT",
      monitored_zones: "Jaka ba la Peit",
      critical_zones: "Jaka ba Shyrkhei Bha",
      blocked_corridors: "Surok ba la Khang",
      active_alerts: "Jingmaham ba Dang Trei",
      last_updated: "La pyn thymmai ha:"
    },
    stats: {
      stat1_value: "7",
      stat1_label: "Ki Jaka ba la Peit Bniah",
      stat1_sub: "Hapoh East Khasi Hills",
      stat2_value: "3",
      stat2_label: "Jaka ba Shyrkhei Bha",
      stat2_sub: "Donkam jingpeit thik-pa-thik",
      stat3_value: "2",
      stat3_label: "Surok ba la Khang",
      stat3_sub: "Surok NH-206 & NH-40",
      stat4_value: "3",
      stat4_label: "Jingmaham Paidbah",
      stat4_sub: "SMS & Mobile App",
      stat5_value: "24/7",
      stat5_label: "Jingpeit Bniah",
      stat5_sub: "Na ka bynta ka lawei ba shngiain"
    },
    mission: {
      img_badge_line1: "Ki Shnong ba Shngiain",
      img_badge_line2: "Ka Lawei ba Khlain",
      kicker: "KA THONG JONG NGI",
      heading: "Tei ia ka Northeast ba kham Shngiain bad Khlain",
      paragraph: "Ka jingtwad khyndew ka jia kloi bha, hynrei ka jingtip ba thikna ka ai por ia ki shnong ban pynkhreh. NER Landslide Alert ka kdup lang ia ka spatial intelligence, ka suinbneng, AI bad ka jingiatreilang ki paidbah ha kawei ka jaka.",
      check1: "Lap kloi ia ka jingma",
      check2: "Jingmaham katkum ka jaka",
      check3: "Ripot na ki paidbah",
      check4: "Peit bniah ia ki surok",
      check5: "Krai da ka data ba shisha",
      check6: "Ki shnong ba shngiain",
      btn_explore: "Wad Bniah ia ka Platform",
      quote: "Ka jingtip teknoloji bad ki paidbah ryngkat ki lah ban tei ia ka Meghalaya ba shngiain."
    },
    cta: {
      heading: "Tip ia ka Jingma. Leh Eiei Shuwa ban Kylla Jingeh.",
      subtitle: "Ioh khubor, phah ripot bad iatreilang ban pynlong ia ka East Khasi Hills kaba shngiain.",
      btn_risk: "Peit ia ka Jingmaham",
      btn_report: "Phah Ripot Jingjia"
    },
    footer: {
      brand_title: "NER Landslide Alert",
      dept: "East Khasi Hills • Meghalaya State Disaster Management",
      tagline: "Iatreilang na ka bynta ka Northeast ba Kham Shngiain.",
      heading_quick_links: "KI LINK BA DONKAM",
      link_home: "Ing (Home)",
      link_platform: "Platform",
      link_risk_map: "Map Jingmaham",
      link_alerts: "Ki Jingmaham",
      link_field_reports: "Ripot Jingjia",
      link_about: "Shaphang",
      heading_support: "JINGIARAP",
      link_emergency_info: "Khubor ba Mardor",
      link_safety_guidelines: "Ki Ain Jingiada",
      link_contact_us: "Kren bad Ngi",
      heading_follow_us: "BUD IA NGI",
      copyright: "© 2026 NER Landslide Alert. All rights reserved."
    }
  },

  hi: {
    nav: {
      brand_title: "NER Landslide Alert",
      brand_subtitle: "पूर्वी खासी हिल्स • पूर्व चेतावनी प्लेटफॉर्म",
      home: "होम",
      about: "हमारे बारे में",
      live_risk_map: "लाइव जोखिम मैप",
      alerts: "अलर्ट्स",
      field_reports: "फील्ड रिपोर्ट",
      resources: "संसाधन",
      login_dashboard: "लॉगिन / डैशबोर्ड"
    },
    hero: {
      kicker: "सुरक्षित समुदाय  |  सशक्त पूर्वोत्तर",
      heading_white: "पूर्वानुमान. तैयारी.",
      heading_green: "सुरक्षा.",
      description: "पूर्वी खासी हिल्स, मेघालय के लिए रीयल-टाइम भूस्खलन पूर्व चेतावनी प्रणाली — सुरक्षित कल के लिए भू-स्थानिक डेटा, मौसम विज्ञान और जन-भागीदारी का समन्वय।",
      btn_primary: "लाइव जोखिम मैप देखें",
      btn_secondary: "प्लेटफ़ॉर्म देखें",
      badge_early_warnings: "पूर्व चेतावनियाँ",
      badge_stronger_communities: "मजबूत समुदाय",
      badge_safer_meghalaya: "सुरक्षित मेघालय",
      system_online: "सिस्टम ऑनलाइन • रीयल-टाइम निगरानी",
      quote_line1: "पहाड़ सुंदर हैं।",
      quote_line2: "आइए इन्हें सुरक्षित रखें।",
      quote_location1: "पूर्वी खासी हिल्स",
      quote_location2: "मेघालय, भारत",
      scroll_explore: "नीचे स्क्रॉल करें"
    },
    features: {
      kicker: "हमारी विशेषताएं",
      heading: "भूस्खलन के जोखिम को समझने और प्रतिक्रिया देने के लिए सब कुछ।",
      card1_title: "रीयल-टाइम जोखिम निगरानी",
      card1_desc: "रीयल-टाइम में भूस्खलन संभावित क्षेत्रों की पहचान करने के लिए वर्षा, भूभाग और उपग्रह डेटा की निगरानी करें।",
      card1_link: "जोखिम मैप देखें",
      card2_title: "सामुदायिक अलर्ट",
      card2_desc: "एसएमएस, मोबाइल ऐप और सार्वजनिक माध्यमों से समय पर अलर्ट और सुरक्षा निर्देश प्राप्त करें।",
      card2_link: "अलर्ट देखें",
      card3_title: "फील्ड घटना रिपोर्टिंग",
      card3_desc: "नागरिकों और अधिकारियों को जमीनी स्तर से भूस्खलन, सड़क रुकावट की रिपोर्ट दर्ज करने में सक्षम बनाएं।",
      card3_link: "रिपोर्ट सबमिट करें"
    },
    how_it_works: {
      kicker: "डेटा से सुरक्षित कल की ओर",
      heading: "यह कैसे काम करता है",
      step1_title: "1. सेंसर और वर्षा",
      step1_desc: "मौसम स्टेशनों, आईएमडी और उपग्रह स्रोतों से रीयल-टाइम डेटा एकत्र करें।",
      step2_title: "2. एआई जोखिम इंजन",
      step2_desc: "भूस्खलन जोखिम का पता लगाने और पूर्व चेतावनी उत्पन्न करने के लिए एआई/एमएल से विश्लेषण।",
      step3_title: "3. प्रशासन और समुदाय",
      step3_desc: "तेज कार्रवाई के लिए जिला प्रशासन, एसडीआरएफ और स्थानीय समुदायों के साथ अलर्ट साझा करें।"
    },
    live_risk: {
      kicker: "लाइव जोखिम दृश्य",
      heading: "आपदा आने से पहले जोखिम को जानें",
      description: "पूर्वी खासी हिल्स में रीयल-टाइम जोखिम क्षेत्र, निगरानी स्टेशन, सड़क मार्ग और बस्तियों का अन्वेषण करें।",
      btn_open_map: "लाइव जोखिम मैप खोलें",
      status_title: "वर्तमान निगरानी स्थिति",
      monitored_zones: "निगरानी क्षेत्र",
      critical_zones: "अति संवेदनशील क्षेत्र",
      blocked_corridors: "अवरुद्ध मार्ग",
      active_alerts: "सक्रिय अलर्ट",
      last_updated: "अंतिम अपडेट:"
    },
    stats: {
      stat1_value: "7",
      stat1_label: "निगरानी जोखिम क्षेत्र",
      stat1_sub: "पूर्वी खासी हिल्स में",
      stat2_value: "3",
      stat2_label: "उच्च / गंभीर क्षेत्र",
      stat2_sub: "सख्त निगरानी की आवश्यकता",
      stat3_value: "2",
      stat3_label: "अवरुद्ध सड़क मार्ग",
      stat3_sub: "NH-206 और NH-40 दर्रे",
      stat4_value: "3",
      stat4_label: "सक्रिय सामुदायिक अलर्ट",
      stat4_sub: "एसएमएस और ऐप सूचनाएं",
      stat5_value: "24/7",
      stat5_label: "सतत निगरानी",
      stat5_sub: "सुरक्षित भविष्य के लिए"
    },
    mission: {
      img_badge_line1: "सुरक्षित समुदाय",
      img_badge_line2: "सशक्त भविष्य",
      kicker: "हमारा उद्देश्य",
      heading: "एक सुरक्षित, अधिक लचीले पूर्वोत्तर का निर्माण",
      paragraph: "भूस्खलन तेजी से घटित हो सकते हैं, लेकिन सटीक जानकारी समुदायों को तैयारी का मूल्यवान समय देती है। NER Landslide Alert स्थानिक बुद्धिमत्ता, मौसम डेटा, AI और जन-भागीदारी को एक मंच पर लाता है।",
      check1: "प्रारंभिक पहचान",
      check2: "स्थान-आधारित चेतावनियाँ",
      check3: "सामुदायिक रिपोर्टिंग",
      check4: "सड़क व बुनियादी ढांचा निगरानी",
      check5: "डेटा-आधारित निर्णय",
      check6: "मजबूत, सुरक्षित बस्तियाँ",
      btn_explore: "प्लेटफॉर्म एक्सप्लोर करें",
      quote: "प्रौद्योगिकी और जन-सहयोग मिलकर एक सुरक्षित मेघालय का निर्माण कर सकते हैं।"
    },
    cta: {
      heading: "जोखिम पहचानें। आपदा बनने से पहले सतर्क हों।",
      subtitle: "सूचित रहें, खतरों की रिपोर्ट करें और पूरे पूर्वी खासी हिल्स में सुरक्षित समाज बनाएं।",
      btn_risk: "लाइव जोखिम जांचें",
      btn_report: "घटना रिपोर्ट करें"
    },
    footer: {
      brand_title: "NER Landslide Alert",
      dept: "पूर्वी खासी हिल्स • मेघालय राज्य आपदा प्रबंधन प्राधिकरण",
      tagline: "सुरक्षित, सशक्त पूर्वोत्तर के लिए एकजुट।",
      heading_quick_links: "त्वरित लिंक",
      link_home: "होम",
      link_platform: "प्लेटफॉर्म",
      link_risk_map: "जोखिम मैप",
      link_alerts: "अलर्ट्स",
      link_field_reports: "फील्ड रिपोर्ट",
      link_about: "परिचय",
      heading_support: "सहायता",
      link_emergency_info: "आपातकालीन जानकारी",
      link_safety_guidelines: "सुरक्षा दिशानिर्देश",
      link_contact_us: "संपर्क करें",
      heading_follow_us: "हमसे जुड़ें",
      copyright: "© 2026 NER Landslide Alert. सर्वाधिकार सुरक्षित।"
    }
  },

  as: {
    nav: {
      brand_title: "NER Landslide Alert",
      brand_subtitle: "পূব খাছি পাহাৰ • আগতীয়া সতৰ্কবাৰ্তা মঞ্চ",
      home: "ঘৰ (Home)",
      about: "বিষয়ে",
      live_risk_map: "লাইভ বিপদৰ মেপ",
      alerts: "সতৰ্কবাৰ্তা",
      field_reports: "ফিল্ড ৰিপৰ্ট",
      resources: "সম্পদ",
      login_dashboard: "লগইন / ডেচবৰ্ড"
    },
    hero: {
      kicker: "সুৰক্ষিত সমাজ  |  স্থিতিস্থাপক উত্তৰ-পূৰ্বাঞ্চল",
      heading_white: "ভৱিষ্যদ্বাণী. প্ৰস্তুতি.",
      heading_green: "সুৰক্ষা.",
      description: "পূব খাছি পাহাৰ, মেঘালয়ৰ বাবে ৰিয়েল-টাইম ভূমিস্খলন আগতীয়া সতৰ্কবাৰ্তা প্ৰণালী — এটা সুৰক্ষিত ভৱিষ্যতৰ বাবে ভূ-স্থানিক তথ্য, বতৰ বিজ্ঞান আৰু জনসাধাৰণৰ অংশগ্ৰহণ।",
      btn_primary: "লাইভ বিপদৰ মেপ চাওক",
      btn_secondary: "মঞ্চ অন্বেষণ কৰক",
      badge_early_warnings: "আগতীয়া সতৰ্কতা",
      badge_stronger_communities: "শক্তিশালী সমাজ",
      badge_safer_meghalaya: "সুৰক্ষিত মেঘালয়",
      system_online: "ছিষ্টেম অনলাইন • ৰিয়েল-টাইম নিৰীক্ষণ",
      quote_line1: "পাহাৰবোৰ বৰ ধুনীয়া।",
      quote_line2: "আহক আমি সেইবোৰ সুৰক্ষিত ৰাখোঁ।",
      quote_location1: "পূব খাছি পাহাৰ",
      quote_location2: "মেঘালয়, ভাৰত",
      scroll_explore: "তললৈ স্ক্ৰল কৰক"
    },
    features: {
      kicker: "আমাৰ সুবিধাসমূহ",
      heading: "ভূমিস্খলনৰ বিপদ বুজিবলৈ আৰু প্ৰতিৰোধ কৰিবলৈ সকলো প্ৰয়োজনীয় তথ্য।",
      card1_title: "ৰিয়েল-টাইম বিপদ নিৰীক্ষণ",
      card1_desc: "ভূমিস্খলন প্ৰৱণ অঞ্চল চিনাক্ত কৰিবলৈ বৰষুণ, ভূ-খণ্ড আৰু উপগ্ৰহ তথ্য নিৰীক্ষণ কৰক।",
      card1_link: "বিপদৰ মেপ চাওক",
      card2_title: "সামাজিক সতৰ্কবাৰ্তা",
      card2_desc: "এছএমএছ, মোবাইল এপ আৰু ৰাজহুৱা চেনেলৰ জৰিয়তে সময়মতে সতৰ্কবাৰ্তা লাভ কৰক।",
      card2_link: "সতৰ্কবাৰ্তা চাওক",
      card3_title: "ফিল্ড ঘটনা ৰিপৰ্ট",
      card3_desc: "নাগৰিক আৰু বিষয়া সকলক ভূমিস্খলন বা পথ বন্ধৰ বিষয়ে পোনপটীয়াকৈ ৰিপৰ্ট কৰিবলৈ সক্ষম কৰক।",
      card3_link: "ৰিপৰ্ট দাখিল কৰক"
    },
    how_it_works: {
      kicker: "তথ্যৰ পৰা এটা সুৰক্ষিত ভৱিষ্যতলৈ",
      heading: "ই কেনেকৈ কাম কৰে",
      step1_title: "১. ছেন্সৰ আৰু বৰষুণ",
      step1_desc: "বতৰ কেন্দ্ৰ, ছেন্সৰ আৰু উপগ্ৰহৰ পৰা ৰিয়েল-টাইম তথ্য সংগ্ৰহ কৰা হয়।",
      step2_title: "২. AI ৰিস্ক ইঞ্জিন",
      step2_desc: "বিপদ চিনাক্ত কৰিবলৈ আৰু সতৰ্কবাৰ্তা সৃষ্টি কৰিবলৈ এআইৰ সহায়ত বিশ্লেষণ।",
      step3_title: "৩. প্ৰশাসন আৰু সমাজ",
      step3_desc: "ক্ষিপ্ৰ ব্যৱস্থাৰ বাবে জিলা প্ৰশাসন, এছডিআৰএফ আৰু ৰাইজৰ মাজত সতৰ্কবাৰ্তা প্ৰেৰণ।"
    },
    live_risk: {
      kicker: "লাইভ ৰিস্ক ভিউ",
      heading: "বিপদ ঘটাৰ আগতেই জানক",
      description: "পূব খাছি পাহাৰৰ সংকটপূৰ্ণ অঞ্চল, নিৰীক্ষণ কেন্দ্ৰ আৰু পথ নেটৱৰ্ক চাওক।",
      btn_open_map: "লাইভ মেপ খোলক",
      status_title: "বৰ্তমান নিৰীক্ষণ স্থিতি",
      monitored_zones: "নিৰীক্ষিত অঞ্চল",
      critical_zones: "সংকটজনক অঞ্চল",
      blocked_corridors: "অৱৰুদ্ধ পথ",
      active_alerts: "সক্ৰিয় সতৰ্কতা",
      last_updated: "অন্তিম আপডেট:"
    },
    stats: {
      stat1_value: "৭",
      stat1_label: "নিৰীক্ষিত সংকট অঞ্চল",
      stat1_sub: "পূব খাছি পাহাৰ জুৰি",
      stat2_value: "৩",
      stat2_label: "উচ্চ / সংকটজনক অঞ্চল",
      stat2_sub: "নিয়মীয়া নিৰীক্ষণৰ প্ৰয়োজন",
      stat3_value: "২",
      stat3_label: "অৱৰুদ্ধ পথ কৰিডৰ",
      stat3_sub: "NH-206 আৰু NH-40 পথ",
      stat4_value: "৩",
      stat4_label: "সক্ৰিয় সতৰ্কবাৰ্তা",
      stat4_sub: "SMS আৰু এপ সূচনা",
      stat5_value: "২৪/৭",
      stat5_label: "নিৰন্তৰ নিৰীক্ষণ",
      stat5_sub: "সুৰক্ষিত কাইলৈৰ বাবে"
    },
    mission: {
      img_badge_line1: "সুৰক্ষিত সমাজ",
      img_badge_line2: "শক্তিশালী কাইলৈ",
      kicker: "আমাৰ লক্ষ্য",
      heading: "এখন অধিক সুৰক্ষিত উত্তৰ-পূৰ্বাঞ্চল গঢ়ি তোলা",
      paragraph: "ভূমিস্খলন অতি দ্ৰুতভাৱে হ'ব পাৰে, কিন্তু সঠিক তথ্যই প্ৰস্তুতিৰ বাবে মূল্যবান সময় দিয়ে। NER Landslide Alert-এ স্থানভিত্তিক তথ্য, বতৰ, এআই আৰু সমাজক একত্ৰিত কৰে।",
      check1: "আগতীয়া চিনাক্তকৰণ",
      check2: "স্থানভিত্তিক সতৰ্কতা",
      check3: "সামাজিক ৰিপৰ্টিং",
      check4: "পথ আৰু আন্তঃগাঁথনি নিৰীক্ষণ",
      check5: "তথ্য-ভিত্তিক সিদ্ধান্ত",
      check6: "সুৰক্ষিত জনপদ",
      btn_explore: "মঞ্চ অন্বেষণ কৰক",
      quote: "প্ৰযুক্তি আৰু ৰাইজৰ সহযোগিতাই এখন সুৰক্ষিত মেঘালয় গঢ়িব পাৰে।"
    },
    cta: {
      heading: "বিপদক বুজক। দুৰ্যোগ হোৱাৰ আগতেই ব্যৱস্থা লওক।",
      subtitle: "সতৰ্ক থাকক, বিপদৰ ৰিপৰ্ট কৰক আৰু এখন সুৰক্ষিত সমাজ গঢ়াত সহায় কৰক।",
      btn_risk: "বিপদ পৰীক্ষা কৰক",
      btn_report: "ঘটনা ৰিপৰ্ট কৰক"
    },
    footer: {
      brand_title: "NER Landslide Alert",
      dept: "পূব খাছি পাহাৰ • মেঘালয় ৰাজ্যিক দুৰ্যোগ ব্যৱস্থাপনা প্ৰাধিকৰণ",
      tagline: "সুৰক্ষিত আৰু শক্তিশালী উত্তৰ-পূৰ্বাঞ্চলৰ বাবে একেলগে।",
      heading_quick_links: "প্ৰয়োজনীয় লিংক",
      link_home: "ঘৰ",
      link_platform: "মঞ্চ",
      link_risk_map: "বিপদৰ মেপ",
      link_alerts: "সতৰ্কবাৰ্তা",
      link_field_reports: "ফিল্ড ৰিপৰ্ট",
      link_about: "বিষয়ে",
      heading_support: "সহায়তা",
      link_emergency_info: "জৰুৰীকালীন তথ্য",
      link_safety_guidelines: "সুৰক্ষা নিয়ম",
      link_contact_us: "যোগাযোগ কৰক",
      heading_follow_us: "অনুসৰণ কৰক",
      copyright: "© ২০২৬ NER Landslide Alert. সৰ্বস্বত্ব সংৰক্ষিত।"
    }
  },

  bn: {
    nav: {
      brand_title: "NER Landslide Alert",
      brand_subtitle: "পূর্ব খাসি পাহাড় • পূর্ব সতর্কতা প্ল্যাটফর্ম",
      home: "হোম",
      about: "আমাদের সম্পর্কে",
      live_risk_map: "লাইভ ঝুঁকি মানচিত্র",
      alerts: "সতর্কবার্তা",
      field_reports: "ফিল্ড রিপোর্ট",
      resources: "রিসোর্স",
      login_dashboard: "লগইন / ড্যাশবোর্ড"
    },
    hero: {
      kicker: "নিরাপদ সম্প্রদায়  |  স্থিতিস্থাপক উত্তর-পূর্ব",
      heading_white: "পূর্বাভাস. প্রস্তুতি.",
      heading_green: "সুরক্ষা.",
      description: "পূর্ব খাসি পাহাড়, মেঘালয়ের জন্য রিয়েল-টাইম ভূমিধস পূর্ব সতর্কতা ব্যবস্থা — একটি নিরাপদ ভবিষ্যতের জন্য ভূ-স্থানিক ডেটা, আবহাওয়া ও নাগরিক সহযোগিতা।",
      btn_primary: "লাইভ ঝুঁকি মানচিত্র দেখুন",
      btn_secondary: "প্ল্যাটফর্ম অন্বেষণ করুন",
      badge_early_warnings: "পূর্ব সতর্কতা",
      badge_stronger_communities: "শক্তিশালী সম্প্রদায়",
      badge_safer_meghalaya: "নিরাপদ মেঘালয়",
      system_online: "সিস্টেম অনলাইন • রিয়েল-টাইম নজরদারি",
      quote_line1: "পাহাড়গুলি অপূর্ব সুন্দর।",
      quote_line2: "আসুন এদের সুরক্ষিত রাখি।",
      quote_location1: "পূর্ব খাসি পাহাড়",
      quote_location2: "মেঘালয়, ভারত",
      scroll_explore: "নিচে স্ক্রোল করুন"
    },
    features: {
      kicker: "আমাদের বৈশিষ্ট্য",
      heading: "ভূমিধসের ঝুঁকি বুঝতে এবং মোকাবিলা করতে আপনার যা কিছু প্রয়োজন।",
      card1_title: "রিয়েল-টাইম ঝুঁকি পর্যবেক্ষণ",
      card1_desc: "বৃষ্টিপাত, ভূমি ও স্যাটেলাইট ডেটা পর্যবেক্ষণ করে রিয়েল-টাইমে ঝুঁকিপূর্ণ এলাকা চিহ্নিত করুন।",
      card1_link: "ঝুঁকি মানচিত্র দেখুন",
      card2_title: "কমিউনিটি সতর্কতা",
      card2_desc: "এসএমএস, মোবাইল অ্যাপ এবং সর্বজনীন মাধ্যমে সময়মতো জরুরি সতর্কতা নির্দেশিকা পান।",
      card2_link: "সতর্কতা দেখুন",
      card3_title: "মাঠ পর্যায়ের ঘটনা রিপোর্টিং",
      card3_desc: "নাগরিক ও কর্মকর্তাদের ভূমিধস এবং রাস্তা অবরোধের ঘটনা সরাসরি রিপোর্ট করার ক্ষমতা প্রদান করুন।",
      card3_link: "রিপোর্ট দাখিল করুন"
    },
    how_it_works: {
      kicker: "ডেটা থেকে নিরাপদ আগামীর পথে",
      heading: "এটি কীভাবে কাজ করে",
      step1_title: "১. সেন্সর ও বৃষ্টিপাত",
      step1_desc: "আবহাওয়া কেন্দ্র, সেন্সর এবং উপগ্রহ থেকে তাৎক্ষণিক তথ্য সংগ্রহ করা হয়।",
      step2_title: "২. এআই রিস্ক ইঞ্জিন",
      step2_desc: "ভূমিধসের ঝুঁকি শনাক্ত এবং সতর্কবার্তা তৈরির জন্য এআই/এমএল বিশ্লেষণ।",
      step3_title: "৩. প্রশাসন ও সম্প্রদায়",
      step3_desc: "দ্রুত সাড়া দিতে জেলা প্রশাসন, এসডিআরএফ এবং স্থানীয় জনগণের সাথে সতর্কতা শেয়ার।"
    },
    live_risk: {
      kicker: "লাইভ রিস্ক ভিউ",
      heading: "দুর্যোগ ঘটার আগেই ঝুঁকি জানুন",
      description: "পূর্ব খাসি পাহাড়ের সংকটময় অঞ্চল, পর্যবেক্ষণ কেন্দ্র ও সড়ক নেটওয়ার্ক পর্যবেক্ষণ করুন।",
      btn_open_map: "লাইভ মানচিত্র খুলুন",
      status_title: "বর্তমান পর্যবেক্ষণ পরিস্থিতি",
      monitored_zones: "পর্যবেক্ষিত অঞ্চল",
      critical_zones: "সংকটজনক অঞ্চল",
      blocked_corridors: "অবরুদ্ধ সড়ক",
      active_alerts: "সক্রিয় সতর্কতা",
      last_updated: "সর্বশেষ আপডেট:"
    },
    stats: {
      stat1_value: "৭",
      stat1_label: "পর্যবেক্ষিত ঝুঁকিপূর্ণ অঞ্চল",
      stat1_sub: "পূর্ব খাসি পাহাড় জুড়ে",
      stat2_value: "৩",
      stat2_label: "উচ্চ / সংকটজনক অঞ্চল",
      stat2_sub: "নিয়মিত পর্যবেক্ষণের প্রয়োজন",
      stat3_value: "২",
      stat3_label: "অবরুদ্ধ সড়ক পথ",
      stat3_sub: "NH-206 ও NH-40 সড়ক",
      stat4_value: "৩",
      stat4_label: "সক্রিয় সতর্কতা",
      stat4_sub: "SMS ও মোবাইল অ্যাপ",
      stat5_value: "২৪/৭",
      stat5_label: "নিরবচ্ছিন্ন নজরদারি",
      stat5_sub: "নিরাপদ ভবিষ্যতের জন্য"
    },
    mission: {
      img_badge_line1: "নিরাপদ সমাজ",
      img_badge_line2: "শক্তিশালী আগামী",
      kicker: "আমাদের লক্ষ্য",
      heading: "একটি নিরাপদ ও স্থিতিস্থাপক উত্তর-পূর্ব গড়ে তোলা",
      paragraph: "ভূমিধস খুব দ্রুত ঘটতে পারে, তবে সঠিক তথ্য জনগণকে প্রস্তুতির মূল্যবান সময় দেয়। NER Landslide Alert স্থানিক তথ্য, আবহাওয়া, AI এবং জনসহযোগিতাকে একত্রিত করে।",
      check1: "প্রাথমিক শনাক্তকরণ",
      check2: "স্থান-ভিত্তিক সতর্কতা",
      check3: "নাগরিক রিপোর্টিং",
      check4: "সড়ক অবকাঠামো নজরদারি",
      check5: "ডেটা-চালিত সিদ্ধান্ত",
      check6: "নিরাপদ সম্প্রদায়",
      btn_explore: "প্ল্যাটফর্ম অন্বেষণ করুন",
      quote: "প্রযুক্তি এবং মানুষ একসাথে মিলে একটি নিরাপদ মেঘালয় গড়ে তুলতে পারে।"
    },
    cta: {
      heading: "ঝুঁকি জানুন। বিপর্যয় ঘটার আগেই পদক্ষেপ নিন।",
      subtitle: "সতর্ক থাকুন, বিপদের রিপোর্ট করুন এবং পূর্ব খাসি পাহাড়কে নিরাপদ রাখতে সাহায্য করুন।",
      btn_risk: "লাইভ ঝুঁকি দেখুন",
      btn_report: "ঘটনা রিপোর্ট করুন"
    },
    footer: {
      brand_title: "NER Landslide Alert",
      dept: "পূর্ব খাসি পাহাড় • মেঘালয় রাজ্য দুর্যোগ ব্যবস্থাপনা কর্তৃপক্ষ",
      tagline: "নিরাপদ ও শক্তিশালী উত্তর-পূর্বের জন্য একসাথে।",
      heading_quick_links: "প্রয়োজনীয় লিংক",
      link_home: "হোম",
      link_platform: "প্ল্যাটফর্ম",
      link_risk_map: "ঝুঁকি মানচিত্র",
      link_alerts: "সতর্কবার্তা",
      link_field_reports: "ফিল্ড রিপোর্ট",
      link_about: "সম্পর্কে",
      heading_support: "সহায়তা",
      link_emergency_info: "জরুরি তথ্য",
      link_safety_guidelines: "সুরক্ষা নির্দেশিকা",
      link_contact_us: "যোগাযোগ করুন",
      heading_follow_us: "অনুসরণ করুন",
      copyright: "© ২০২৬ NER Landslide Alert. সর্বস্বত্ব সংরক্ষিত।"
    }
  }
};

// For remaining languages (grt, lus, mni, brx, nag), fallback gracefully to English structured keys
const allLanguages = ['en', 'kha', 'hi', 'as', 'bn', 'grt', 'lus', 'mni', 'brx', 'nag'];

allLanguages.forEach((lang) => {
  const filePath = path.join(localesDir, lang, 'translation.json');
  if (fs.existsSync(filePath)) {
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      content.landing = translations[lang] || translations.en;
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8');
      console.log(`Updated locale: ${lang}`);
    } catch (e) {
      console.error(`Failed to update ${lang}:`, e);
    }
  }
});
