/* ===================================================
   WVideoFlow — i18n Translations (EN / AR / FR)
   Author: WVideoFlow Team <wa2latia@gmail.com>
   =================================================== */
const I18N = {
  en: {
    dir: "ltr",
    appName: "WVideoFlow",
    tagline: "Smart Video Auto Editor & Silence Remover",
    developerContact: "Maintainer: wa2latia@gmail.com",
    
    // Welcome / Intro Modal
    welcomeTitle: "Welcome to WVideoFlow 🎬",
    welcomeSub: "Automated video editing & processing designed for content creators.",
    welcomeDesc: "WVideoFlow provides high-performance video tools optimized for low and mid-tier devices. Enjoy silence removal, HandBrake-style compression, animated watermarks, intro/outro welding, and photo slideshow albums without system lag.",
    feat1: "⚡ Smart CPU Throttling: Keeps CPU under 70% to prevent freezes.",
    feat2: "🎞️ Universal Format Support: Handles MP4, MKV, AVI, MOV, WMV, MP3, WAV & more.",
    feat3: "🔒 100% Local & Private: Processing happens on your local device.",
    agreeBtn: "Agree & Get Started",

    // Workflow Modes
    selectModeLabel: "Select Editing Workflow Mode",
    modeMaster: "🔀 Full Auto Pipeline (Silence + Intro/Outro + Logo + Transitions)",
    modeCompress: "🗜️ Video Compression & Optimization (HandBrake Presets)",
    modeSilence: "🔇 Silence Removal & Cutting",
    modeIntroOutro: "🎬 Intro & Outro Welding",
    modeWatermark: "🔖 Watermark & Logo Overlay (Static or Animated)",
    modeSlideshow: "🖼️ Photo Slideshow Album + Audio Track",

    // Mode Descriptions
    descMaster: "Runs the complete automated pipeline: detects silence, welds intro/outro, overlays logo watermark, and applies xfade transitions.",
    descCompress: "Reduces video file size using optimal HandBrake-style presets or custom CRF quality settings without losing visual clarity.",
    descSilence: "Automatically analyzes audio waveform, detects dead silence gaps, and trims them seamlessly with zero audio/video desync.",
    descIntroOutro: "Normalizes aspect ratio and welds intro and outro clips onto your video batch with smooth transition effects.",
    descWatermark: "Overlays your logo image on videos. Choose static corner positioning or dynamic animated bouncing across corners!",
    descSlideshow: "Turns a folder of images into a continuous HD video album synced with your background audio track.",

    // AI Studio Tab & Multi-Keys
    navAi: "🤖 AI Studio",
    navKeys: "🔑 Key Management",
    aiStudioTitle: "AI Prompt-to-Edit Studio",
    aiStudioSub: "Control your entire video studio using natural language commands powered by AI.",
    keysSub: "Configure multi-provider API keys and automatic key rotation pools.",
    manageKeysBtn: "Go to Key Management ➔",
    openAiStudioBtn: "Open AI Studio 🤖 ➔",
    aiPromptCardTitle: "💬 Natural Language Editing Instructions",
    aiKeysTitle: "🔑 API Key Management & Providers",
    aiKeysDesc: "Configure your AI providers (OpenRouter, Google Gemini, Groq, OpenAI). You can add MULTIPLE keys per provider (one key per line) for automatic failover & rotation!",
    aiProviderLabel: "Select AI Provider",
    aiMultiKeysLabel: "API Key Pool (Paste 1 or more keys - line separated)",
    aiModelLabel: "Custom Model Name / ID (Optional)",
    aiPromptLabel: "Describe what you want WVideoFlow to do with your videos in natural language:",
    aiPromptPlaceholder: "e.g. Cut out silence gaps, compress video for WhatsApp 720p, overlay watermark logo on top-right at 80% opacity with fade transition",
    aiApplyBtn: "✨ Auto-Configure Studio Settings",
    aiSaveKeysBtn: "Save API Keys & Config 💾",
    aiParsingStatus: "AI Analyzing prompt and configuring settings...",
    aiKeysSavedNotice: "API keys saved securely!",
    aiResultTitle: "📋 AI Configured Settings Summary",
    usageCommandsTitle: "💡 Usage Commands & Quick Prompts:",
    cmdCutSilenceCompress: "🔇 Cut silence & compress 720p",
    cmdWatermarkBounce: "🔖 Overlay animated logo watermark",
    cmdIntroOutroFade: "🎬 Weld Intro/Outro with Fade",
    cmdSlideshow3s: "🖼️ Create Photo Album Slideshow",
    
    // Dropdown Prompt Templates
    promptSelectLabel: "✨ Select Smart Suggested Prompt Template:",
    promptSelectPlaceholder: "-- 💡 Select a Smart Prompt Template --",
    promptTplFull: "🔀 Full Auto: Silence Trim + Intro/Outro + Bouncing Logo + 720p",
    promptTplSilence: "🔇 Trim Dead Silence: Remove gaps > 0.7s with -35dB threshold",
    promptTplCompress: "🗜️ WhatsApp & Discord 720p: Compress file size with CRF 23",
    promptTplWatermark: "🔖 Animated Watermark: Bounce logo across 4 corners at 80% opacity",
    promptTplIntroOutro: "🎬 Intro & Outro Weld: Normalize resolution with smooth 0.8s fade",
    promptTplSlideshow: "🖼️ Photo Slideshow Album: Turn photos into HD video album (3s/slide)",

    // Key Pool Manager List
    savedKeysCardTitle: "🔑 Saved API Key Pool & Key Manager",
    noSavedKeysNotice: "No active API keys stored yet. Paste your keys above and click Save!",
    clearAllKeysBtn: "Clear All Stored Keys 🗑️",
    copyKeyBtn: "Copy Key",
    deleteKeyBtn: "Delete Key",

    // Stepper UX
    stepperHeaderTitle: "🚀 4-Step Guided Video Editing Workflow",
    step1Title: "STEP 1: Choose Workflow Mode 🛠️",
    step2Title: "STEP 2: Select Media & Files 📁",
    step3Title: "STEP 3: AI Prompt & Fine-Tuning 🤖",
    step4Title: "STEP 4: Process Video 🚀",

    // Compression Controls
    compressTitle: "HandBrake-Style Video Compression Settings",
    compressPreset: "Compression Preset",
    presetFast720: "Fast 720p HD (Recommended)",
    presetVeryFast1080: "Very Fast 1080p Full HD",
    presetDiscord: "Small File Size (Discord / Email < 25MB)",
    presetCustom: "Custom Resolution & Quality",
    crfLabel: "Video Quality (CRF)",
    crfHint: "Lower CRF = Higher Quality (e.g., 18=Lossless, 23=Standard, 28=Compact)",

    // Watermark Extras
    posAnimated: "🌟 Dynamic Animated (Bouncing Across Corners)",

    // Slideshow Extra
    imagesFolderLabel: "Images Folder / Files",
    audioTrackLabel: "Background Audio Track (MP3/WAV/AAC)",
    slideDurLabel: "Duration per Photo (seconds)",

    // Auto-Save & Reset
    resetDefaultsBtn: "Restore Default Settings 🔄",
    autoSavedNotice: "Settings auto-saved automatically",
    defaultsRestoredNotice: "Default settings restored successfully",

    // Nav & System
    navInput: "📥 Input & Media", navTransitions: "✨ Transitions", navSettings: "⚙️ Settings", navOutputs: "📁 Outputs & History", navProcess: "⚡ Render & Process",
    resourceSection: "System Resource Profile (Hardware Optimization)",
    resourceEco: "🍃 Eco / Low Specs (Throttled max 70% CPU)",
    resourceBalanced: "⚖️ Balanced (Recommended for mid PCs)",
    resourcePerformance: "⚡ High Performance (Full Multi-threading)",
    sysCpu: "CPU Load",
    sysRam: "RAM Usage",
    sysCores: "CPU Cores",
    sysStatus: "System Status",
    throttlingNotice: "🍃 Eco Throttling Active: System CPU is breathing smoothly without lag.",

    // Inputs & General
    inputTitle: "Media Input & Configuration",
    inputFolderLabel: "Input Folder",
    inputFolderPlaceholder: "Browse or paste folder path...",
    browseFolderBtn: "Browse",
    scanBtn: "Scan Folder",
    noVideosFound: "No supported media files found",
    videosFound: "file(s) found",
    previewVideo: "Preview",
    introLabel: "Intro Clip",
    outroLabel: "Outro Clip",
    logoLabel: "Logo / Watermark",
    selectFile: "Select File",
    clearFile: "Clear",
    logoPosition: "Logo Position",
    logoOpacity: "Opacity",
    logoScale: "Scale",
    logoMargin: "Margin (px)",
    posTopLeft: "Top Left", posTopRight: "Top Right",
    posBotLeft: "Bottom Left", posBotRight: "Bottom Right", posCenter: "Center",
    outputFolder: "Output Folder",
    
    // Transitions
    transTitle: "Transition Effects",
    transSubtitle: "Choose how clips connect. Click to preview.",
    previewAll: "Preview All",
    generating: "Generating...",
    catAll: "All", catBasic: "Basic", catWipe: "Wipe", catSlide: "Slide",
    catSmooth: "Smooth", catShape: "Shape", catDiagonal: "Diagonal",
    catSpecial: "Special", catWind: "Wind", catOpen: "Open",
    transitionDuration: "Transition Duration",
    selectedTransition: "Selected",

    // Silence
    settingsTitle: "Processing Settings",
    silenceSection: "Silence Removal",
    silenceEnabled: "Remove Silence Gaps",
    silenceThreshold: "Silence Threshold (dB)",
    silenceThresholdHint: "Lower = more sensitive (e.g. -40 picks up more silence)",
    minSilence: "Minimum Silence Duration (s)",
    minSilenceHint: "Gaps shorter than this will NOT be removed",
    silencePadding: "Silence Padding (s)",
    silencePaddingHint: "Keep this much audio before/after each speech segment",

    // Process
    processTitle: "Process Media",
    startBtn: "Start Processing",
    stopBtn: "Stop",
    processingStatus: "Processing in background...",
    doneStatus: "Done!",
    errorStatus: "Error",
    progressFiles: "files processed",
    progressTime: "elapsed",
    logTitle: "Processing Log",
    openOutputBtn: "Open Output Folder",
    
    // History & Outputs
    outputsTitle: "Recent Outputs & History",
    noOutputsFound: "No processed videos found yet.",
    playVideo: "Play",
    downloadBtn: "Download",
    deleteBtn: "Delete",
    savedSilence: "Silence Saved",
    browserTitle: "Browse Files",
    browserBack: "Parent Folder",
    browserSelect: "Select",
    browserCancel: "Cancel",
    previewTitle: "Media Preview",
    duration: "Duration", size: "Size", resolution: "Resolution", fps: "FPS",
    selectAll: "Select All", deselectAll: "Deselect All",
    close: "Close", confirm: "Confirm",
    ready: "Ready", idle: "Idle",
    noFileSelected: "No file selected",
    settings: "Settings"
  },
  ar: {
    dir: "rtl",
    appName: "دبليو فيديو فلو",
    tagline: "محرر الفيديوهات وأتمتة المونتاج الذكي (WVideoFlow)",
    developerContact: "التواصل والدعم: wa2latia@gmail.com",

    welcomeTitle: "مرحباً بك في برنامج دبليو فيديو فلو 🎬",
    welcomeSub: "أداة المونتاج التلقائي وأتمتة الفيديوهات المصممة للمبدعين وصناع المحتوى.",
    welcomeDesc: "يقدم دبليو فيديو فلو مجموعة متكاملة من أدوات المعالجة المجهزة خصيصاً للأجهزة الضعيفة والمتوسطة. استمتع بحذف الصمت، ضغط الفيديوهات مثل HandBrake، الشعار المتحرك بين الأركان، دمج المقدمة والخاتمة، وألبومات الصور بصوت خلفي وبدون استهلاك مرتفع للجهاز.",
    feat1: "⚡ نظام الحماية الذكي: يمنع تهنيج الجهاز ويحافظ على استهلاك المعالج تحت 70%.",
    feat2: "🎞️ دعم شامل لجميع الصيغ: يتمل مع MP4, MKV, AVI, MOV, WMV, MP3, WAV وغيرها.",
    feat3: "🔒 آمن ومحلي 100%: جميع العمليات تتم على جهازك المحلي بالكامل.",
    agreeBtn: "موافق والبدء بالاستخدام",

    selectModeLabel: "اختر نمط الخدمة / نوع المونتاج المطلوب",
    modeMaster: "🔀 المونتاج الشامل المتكامل (حذف صمت + مقدمة وخاتمة + شعار + انتقالات)",
    modeCompress: "🗜️ ضغط وتصغير حجم الفيديو (معايير HandBrake المثالية)",
    modeSilence: "🔇 حذف الفراغات والصمت تلقائياً",
    modeIntroOutro: "🎬 دمج مقدمة وخاتمة مع مؤثرات انتقال",
    modeWatermark: "🔖 إضافة شعار وعلامة مائية (ثابت أو متحرك بين الأركان)",
    modeSlideshow: "🖼️ إنشاء ألبوم صور فيديو مع خلفية صوتية",

    descMaster: "يقوم بتطبيق خطة المونتاج الكاملة: حذف الصمت، إضافة المقدمة والخاتمة، الشعار، وانتقالات xfade الذكية دفعة واحدة.",
    descCompress: "تقليل حجم الفيديو مع الحفاظ على الجودة العالية باستخدام خيارات مثل HandBrake أو تخصيص درجة الضغط CRF.",
    descSilence: "تحليل موجة الصوت واكتشاف فترات الصمت وحذفها تلقائياً بدون أي اختلاف في مزامنة الصوت والفيديو.",
    descIntroOutro: "ضبط أبعاد الفيديو ودمج مقطعي المقدمة والخاتمة بسلاسة مع فيديوهاتك.",
    descWatermark: "إضافة اللوجو كعلامة مائية. اختر الموضع الثابت أو النمط المتحرك الذي ينتقل بمرونة بين أركان الشاشة!",
    descSlideshow: "تحويل مجلد صور إلى فيديو ألبوم متناسق عالي الدقة مدمج مع مقطع صوتي خلفي.",

    navAi: "🤖 الذكاء الاصطناعي",
    navKeys: "🔑 إدارة المفاتيح",
    aiStudioTitle: "استوديو الذكاء الاصطناعي والأوامر النصية",
    aiStudioSub: "التحكم الكامل بأدوات وإعدادات المونتاج بلغة طبيعية بسيطة عبر الذكاء الاصطناعي.",
    keysSub: "إعداد مفاتيح API ومزودي الخدمة وإدارة التنقل التلقائي بين المفاتيح عند التوقف.",
    manageKeysBtn: "الانتقال لإدارة المفاتيح ➔",
    openAiStudioBtn: "افتح استوديو الذكاء الاصطناعي 🤖 ➔",
    aiPromptCardTitle: "💬 أوامر الاستخدام وموجه الذكاء الاصطناعي",
    aiKeysTitle: "🔑 إدارة مفاتيح الـ API ومزودي الخدمة",
    aiKeysDesc: "قم بإعداد مفاتيح الذكاء الاصطناعي (OpenRouter, Google Gemini, Groq, OpenAI). يمكنك إضافة مفاتيح متعددة لكل مزود خدمة (مفتاح لكل سطر) للتنقل والمناوبة التلقائية عند التوقف!",
    aiProviderLabel: "اختر مزود خدمة الذكاء الاصطناعي",
    aiMultiKeysLabel: "مجموعة المفاتيح (مفتاح واحد أو أكثر - مفتاح بكل سطر)",
    aiModelLabel: "اسم النموذج (اختياري)",
    aiPromptLabel: "صف ما تريد أن يفعله البرنامج بالفيديوهات بلغة طبيعية بسيطة:",
    aiPromptPlaceholder: "مثال: اقطع الفراغات من الفيديوهات واضغط الحجم للواتس دقة 720p مع وضع اللوجو أعلى اليمين بشفافية 80% وانتقال تلاشي",
    aiApplyBtn: "✨ تطبيق الإعدادات بالذكاء الاصطناعي",
    aiSaveKeysBtn: "حفظ المفاتيح والإعدادات 💾",
    aiParsingStatus: "جارٍ تحليل الطلب بالذكاء الاصطناعي وتنسيق الإعدادات...",
    aiKeysSavedNotice: "تم حفظ مفاتيح الذكاء الاصطناعي بنجاح!",
    aiResultTitle: "📋 ملخص الإعدادات المُهيأة بالذكاء الاصطناعي",
    usageCommandsTitle: "💡 أوامر الاستخدام السريعة والبرومبت:",
    cmdCutSilenceCompress: "🔇 حذف الصمت وضغط 720p",
    cmdWatermarkBounce: "🔖 الشعار المتحرك بين الأركان",
    cmdIntroOutroFade: "🎬 دمج المقدمة والخاتمة مع تلاشي",
    cmdSlideshow3s: "🖼️ ألبوم صور بصوت خلفي",

    // Dropdown Prompt Templates
    promptSelectLabel: "✨ اختر برومبت نموذجي جاهز ذكي:",
    promptSelectPlaceholder: "-- 💡 اختر برومبت مقترح جاهز من القائمة --",
    promptTplFull: "🔀 المونتاج الشامل: حذف الصمت (-35dB) + مقدمة وخاتمة + شعار متحرك + 720p",
    promptTplSilence: "🔇 حذف الصمت الصارم: إزالة الصمت الأطول من 0.7 ثانية عند -35 ديسيبل",
    promptTplCompress: "🗜️ ضغط الواتس والديسكورد 720p: تقليل الحجم بمعامل جودة 23",
    promptTplWatermark: "🔖 الشعار المتحرك بين الأركان: تحريك العلامة المائية بشفافية 80%",
    promptTplIntroOutro: "🎬 دمج المقدمة والخاتمة: ضبط الأبعاد مع انتقال تلاشي ناعم 0.8 ثانية",
    promptTplSlideshow: "🖼️ ألبوم الصور الفيديو: تحويل مجلد الصور لفيديو 3 ثوانٍ لكل صورة",

    // Key Pool Manager List
    savedKeysCardTitle: "🔑 إدارة وقائمة المفاتيح المحفوظة النشطة",
    noSavedKeysNotice: "لا توجد مفاتيح محفوظة حالياً. أدخل المفاتيح بالأعلى واضغط حفظ!",
    clearAllKeysBtn: "مسح جميع المفاتيح المحفوظة 🗑️",
    copyKeyBtn: "نسخ المفتاح",
    deleteKeyBtn: "حذف المفتاح",

    // Stepper UX
    stepperHeaderTitle: "🚀 خطة العمل الموجهة للمونتاج (4 خطوات)",
    step1Title: "الخطوة 1: اختر نوع المونتاج 🛠️",
    step2Title: "الخطوة 2: حدد مجلد الملفات والوسائط 📁",
    step3Title: "الخطوة 3: موجه الذكاء الاصطناعي والإعدادات 🤖",
    step4Title: "الخطوة 4: بدء المعالجة 🚀",

    compressTitle: "إعدادات ضغط الفيديو (طراز HandBrake)",
    compressPreset: "خيارات الضغط الجاهزة",
    presetFast720: "سريع دقة HD 720p (موصى به)",
    presetVeryFast1080: "سريع جداً دقة Full HD 1080p",
    presetDiscord: "حجم صغير جداً (للإيميل والديسكورد أقل من 25 ميجا)",
    presetCustom: "تخصيص الدقة والجودة مخصص",
    crfLabel: "معامل جودة الفيديو (CRF)",
    crfHint: "قيمة أقل = جودة أعلى (مثال: 18 ممتاز، 23 قياسي، 28 حجم صغير)",

    posAnimated: "🌟 شعار متحرك (ينتقل بمرونة بين أركان الشاشة)",

    imagesFolderLabel: "مجلد أو ملفات الصور",
    audioTrackLabel: "المقطع الصوتي الخلفي (MP3/WAV/AAC)",
    slideDurLabel: "مدة عرض كل صورة (بالثواني)",

    resetDefaultsBtn: "استعادة الإعدادات الافتراضية 🔄",
    autoSavedNotice: "تم حفظ الإعدادات تلقائياً",
    defaultsRestoredNotice: "تم استعادة الإعدادات الافتراضية بنجاح",

    navInput: "📥 الوسائط والإدخال", navTransitions: "✨ الانتقالات البصرية", navSettings: "⚙️ الإعدادات", navOutputs: "📁 المخرجات والسجل", navProcess: "⚡ المعالجة والتصدير",
    resourceSection: "نمط استهلاك الموارد (تحسين للأجهزة الضعيفة والمتوسطة)",
    resourceEco: "🍃 النمط الاقتصادي / الأجهزة الضعيفة (حد أقصى 70% CPU للمنع من التهنيج)",
    resourceBalanced: "⚖️ النمط المتوازن (موصى به للأجهزة المتوسطة)",
    resourcePerformance: "⚡ النمط الأقصى (سرعة قصوى للأجهزة القوية)",
    sysCpu: "استهلاك المعالج CPU",
    sysRam: "استهلاك الذاكرة RAM",
    sysCores: "أنوية المعالج",
    sysStatus: "حالة النظام",
    throttlingNotice: "🍃 نظام الحماية النشط: المعالج يعمل بمرونة وبدون استهلاك مرتفع لتجنب اختناق الجهاز.",

    inputTitle: "إعداد ومدخلات الوسائط",
    inputFolderLabel: "مجلد الفيديوهات والملفات",
    inputFolderPlaceholder: "تصفح أو أدخل مسار المجلد...",
    browseFolderBtn: "تصفح",
    scanBtn: "مسح المجلد",
    noVideosFound: "لم يتم العثور على ملفات وسائط مدعومة",
    videosFound: "ملف جاهز للمعالجة",
    previewVideo: "معاينة",
    introLabel: "مقطع المقدمة",
    outroLabel: "مقطع الخاتمة",
    logoLabel: "الشعار / العلامة المائية",
    selectFile: "اختر ملف",
    clearFile: "إزالة",
    logoPosition: "موضع الشعار",
    logoOpacity: "الشفافية",
    logoScale: "الحجم",
    logoMargin: "الهامش (بكسل)",
    posTopLeft: "أعلى يسار", posTopRight: "أعلى يمين",
    posBotLeft: "أسفل يسار", posBotRight: "أسفل يمين", posCenter: "المركز",
    outputFolder: "مجلد المخرجات",
    
    transTitle: "مؤثرات الانتقال",
    transSubtitle: "اختر طريقة الانتقال بين المقاطع. انقر للمعاينة.",
    previewAll: "معاينة الكل",
    generating: "جارٍ التوليد...",
    catAll: "الكل", catBasic: "أساسية", catWipe: "مسح", catSlide: "انزلاق",
    catSmooth: "ناعم", catShape: "أشكال", catDiagonal: "قطري",
    catSpecial: "خاص", catWind: "ريح", catOpen: "فتح/إغلاق",
    transitionDuration: "مدة الانتقال",
    selectedTransition: "المختار",

    settingsTitle: "إعدادات المعالجة",
    silenceSection: "حذف الصمت",
    silenceEnabled: "حذف مقاطع الصمت",
    silenceThreshold: "حد الصمت (ديسيبل)",
    silenceThresholdHint: "أقل = أكثر حساسية (مثال: -40 يكشف صمتاً أكثر)",
    minSilence: "أقل مدة للصمت المحذوف (ثانية)",
    minSilenceHint: "الفراغات الأقصر من هذه المدة لن تُحذف",
    silencePadding: "هامش الصمت (ثانية)",
    silencePaddingHint: "قدر الصوت المحتفظ به قبل/بعد كل مقطع",

    processTitle: "بدء المعالجة",
    startBtn: "ابدأ المعالجة",
    stopBtn: "إيقاف",
    processingStatus: "جارٍ المعالجة بالخلفية...",
    doneStatus: "اكتمل!",
    errorStatus: "خطأ",
    progressFiles: "ملف معالج",
    progressTime: "الوقت المنقضي",
    logTitle: "سجل العمليات المباشر",
    openOutputBtn: "فتح مجلد المخرجات",
    
    outputsTitle: "الفيديوهات المعالجة والسجل",
    noOutputsFound: "لا توجد فيديوهات معالجة حالياً.",
    playVideo: "تشغيل",
    downloadBtn: "تحميل",
    deleteBtn: "حذف",
    savedSilence: "الصمت المحذوف",
    browserTitle: "تصفح الملفات",
    browserBack: "المجلد الأعلى",
    browserSelect: "اختيار",
    browserCancel: "إلغاء",
    previewTitle: "معاينة الوسائط",
    duration: "المدة", size: "الحجم", resolution: "الدقة", fps: "معدل الإطارات",
    selectAll: "تحديد الكل", deselectAll: "إلغاء تحديد الكل",
    close: "إغلاق", confirm: "تأكيد",
    ready: "جاهز", idle: "في انتظار",
    noFileSelected: "لم يتم اختيار ملف",
    settings: "الإعدادات"
  },
  fr: {
    dir: "ltr",
    appName: "WVideoFlow",
    tagline: "Éditeur Vidéo Automatique Intelligent & Suppresseur de Silence",
    developerContact: "Contact: wa2latia@gmail.com",

    welcomeTitle: "Bienvenue sur WVideoFlow 🎬",
    welcomeSub: "Édition vidéo automatisée conçue pour les créateurs de contenu.",
    welcomeDesc: "WVideoFlow offre un ensemble d'outils optimisés pour les appareils à faibles et moyennes performances. Profitez de la suppression des silences, de la compression style HandBrake, du filigrane animé, de la fusion d'intro/outro et des albums photo vidéo.",
    feat1: "⚡ Régulation CPU Intelligente : Maintient le CPU sous 70% pour éviter les ralentissements.",
    feat2: "🎞️ Support Format Universel : Prend en charge MP4, MKV, AVI, MOV, WMV, MP3, WAV...",
    feat3: "🔒 100% Local & Privé : Tout le traitement s'effectue sur votre machine.",
    agreeBtn: "Accepter & Commencer",

    selectModeLabel: "Sélectionnez le mode d'édition",
    modeMaster: "🔀 Pipeline Automatique Complet (Silence + Intro/Outro + Logo + Transitions)",
    modeCompress: "🗜️ Compression & Optimisation Vidéo (Presets HandBrake)",
    modeSilence: "🔇 Suppression des Silences",
    modeIntroOutro: "🎬 Fusion d'Intro & Outro",
    modeWatermark: "🔖 Filigrane & Logo (Statique ou Animé)",
    modeSlideshow: "🖼️ Album Diaporama Photo + Piste Audio",

    descMaster: "Exécute le pipeline automatisé complet : détection de silence, fusion intro/outro, logo filigrane et transitions xfade.",
    descCompress: "Réduit la taille des vidéos grâce à des préréglages optimisés type HandBrake ou un réglage CRF personnalisé.",
    descSilence: "Détecte les blancs et silences dans l'audio et les supprime sans aucun décalage audio/vidéo.",
    descIntroOutro: "Normalise le format d'image et assemble vos clips d'intro et outro sur vos vidéos.",
    descWatermark: "Superpose votre logo sur la vidéo. Choisissez un emplacement fixe ou le mode animé rebondissant dans les coins !",
    descSlideshow: "Transforme un dossier d'images en un album vidéo HD synchronisé avec une piste audio de fond.",

    navAi: "🤖 Studio IA",
    navKeys: "🔑 Gestion des Clés",
    aiStudioTitle: "Studio IA Prompt-to-Edit",
    aiStudioSub: "Contrôlez votre studio avec des commandes en langage naturel grâce à l'IA.",
    keysSub: "Configurez les clés API multi-fournisseurs et la rotation automatique.",
    manageKeysBtn: "Accéder à la gestion des clés ➔",
    openAiStudioBtn: "Ouvrir le Studio IA 🤖 ➔",
    aiPromptCardTitle: "💬 Instructions & Commandes d'utilisation",
    aiKeysTitle: "🔑 Gestion des Clés API & Fournisseurs",
    aiKeysDesc: "Configurez vos clés IA (OpenRouter, Google Gemini, Groq, OpenAI). Ajoutez plusieurs clés par fournisseur (1 par ligne) pour la rotation automatique !",
    aiProviderLabel: "Sélectionner le Fournisseur IA",
    aiMultiKeysLabel: "Pool de Clés API (Collés 1 ou plusieurs - 1 par ligne)",
    aiModelLabel: "Nom du Modèle Personnalisé (Optionnel)",
    aiPromptLabel: "Décrivez ce que vous souhaitez faire avec vos vidéos en langage naturel :",
    aiPromptPlaceholder: "ex: Supprimer les silences, compresser en 720p pour WhatsApp, ajouter le filigrane en haut à droite à 80% d'opacité avec transition fondu",
    aiApplyBtn: "✨ Configurer le Studio par l'IA",
    aiSaveKeysBtn: "Enregistrer les Clés API 💾",
    aiParsingStatus: "Analyse de la demande par l'IA...",
    aiKeysSavedNotice: "Clés API enregistrées avec succès !",
    aiResultTitle: "📋 Résumé des paramètres configurés par l'IA",
    usageCommandsTitle: "💡 Commandes d'utilisation rapides :",
    cmdCutSilenceCompress: "🔇 Couper le silence et compresser 720p",
    cmdWatermarkBounce: "🔖 Filigrane animé dans les coins",
    cmdIntroOutroFade: "🎬 Fusionner l'intro/outro avec fondu",
    cmdSlideshow3s: "🖼️ Album photo en diaporama",

    // Dropdown Prompt Templates
    promptSelectLabel: "✨ Sélectionner un modèle de prompt suggéré :",
    promptSelectPlaceholder: "-- 💡 Choisir un modèle de prompt IA --",
    promptTplFull: "🔀 Pipeline Auto Complet: Silences (-35dB) + Intro/Outro + Logo animé + 720p",
    promptTplSilence: "🔇 Couper les silences: Supprimer les blancs > 0.7s au seuil -35dB",
    promptTplCompress: "🗜️ WhatsApp & Discord 720p: Compresser la vidéo avec CRF 23",
    promptTplWatermark: "🔖 Filigrane animé: Rebondir le logo dans les 4 coins à 80% d'opacité",
    promptTplIntroOutro: "🎬 Fusion Intro & Outro: Normaliser avec transition fondu 0.8s",
    promptTplSlideshow: "🖼️ Album photo en diaporama: Convertir les photos en vidéo (3s/photo)",

    // Key Pool Manager List
    savedKeysCardTitle: "🔑 Pool de clés API enregistrées & Gestionnaire",
    noSavedKeysNotice: "Aucune clé API active enregistrée. Collez vos clés ci-dessus et cliquez sur Enregistrer !",
    clearAllKeysBtn: "Effacer toutes les clés enregistrées 🗑️",
    copyKeyBtn: "Copier",
    deleteKeyBtn: "Supprimer",

    // Stepper UX
    stepperHeaderTitle: "🚀 Flux d'édition vidéo guidé en 4 étapes",
    step1Title: "ÉTAPE 1 : Choisir le mode d'édition 🛠️",
    step2Title: "ÉTAPE 2 : Sélectionner les médias & fichiers 📁",
    step3Title: "ÉTAPE 3 : Prompt IA & Réglages 🤖",
    step4Title: "ÉTAPE 4 : Traiter la vidéo 🚀",

    compressTitle: "Paramètres de Compression Vidéo Style HandBrake",
    compressPreset: "Préréglages de Compression",
    presetFast720: "Rapide 720p HD (Recommandé)",
    presetVeryFast1080: "Très Rapide 1080p Full HD",
    presetDiscord: "Petite Taille (Discord / Email < 25 Mo)",
    presetCustom: "Résolution & Qualité Personnalisées",
    crfLabel: "Facteur de Qualité (CRF)",
    crfHint: "CRF plus bas = Meilleure qualité (ex: 18=Excellente, 23=Standard, 28=Compacte)",

    posAnimated: "🌟 Animé Dynamique (Rebondissant dans les coins)",

    imagesFolderLabel: "Dossier / Fichiers Images",
    audioTrackLabel: "Piste Audio de Fond (MP3/WAV/AAC)",
    slideDurLabel: "Durée par Photo (secondes)",

    resetDefaultsBtn: "Réinitialiser les paramètres 🔄",
    autoSavedNotice: "Paramètres sauvegardés automatiquement",
    defaultsRestoredNotice: "Paramètres par défaut restaurés",

    navInput: "📥 Entrée & Médias", navTransitions: "✨ Transitions", navSettings: "⚙️ Paramètres", navOutputs: "📁 Sorties & Historique", navProcess: "⚡ Rendu & Traitement",
    resourceSection: "Profil de Ressources Système (Optimisation Matérielle)",
    resourceEco: "🍃 Éco / Faibles Spécifications (Max 70% CPU)",
    resourceBalanced: "⚖️ Équilibré (Recommandé pour PC moyens)",
    resourcePerformance: "⚡ Haute Performance (Multi-threading maximal)",
    sysCpu: "Charge CPU",
    sysRam: "Utilisation RAM",
    sysCores: "Cœurs CPU",
    sysStatus: "État du Système",
    throttlingNotice: "🍃 Régulation Éco Active : Le CPU fonctionne en douceur sans ralentissement.",

    inputTitle: "Entrée Médias & Configuration",
    inputFolderLabel: "Dossier d'entrée",
    inputFolderPlaceholder: "Parcourir ou coller le chemin du dossier...",
    browseFolderBtn: "Parcourir",
    scanBtn: "Scanner le dossier",
    noVideosFound: "Aucun fichier média pris en charge",
    videosFound: "fichier(s) trouvé(s)",
    previewVideo: "Aperçu",
    introLabel: "Clip d'introduction",
    outroLabel: "Clip de conclusion",
    logoLabel: "Logo / Filigrane",
    selectFile: "Choisir un fichier",
    clearFile: "Effacer",
    logoPosition: "Position du logo",
    logoOpacity: "Opacité",
    logoScale: "Échelle",
    logoMargin: "Marge (px)",
    posTopLeft: "Haut gauche", posTopRight: "Haut droit",
    posBotLeft: "Bas gauche", posBotRight: "Bas droit", posCenter: "Centre",
    outputFolder: "Dossier de sortie",
    
    transTitle: "Effets de transition",
    transSubtitle: "Choisissez comment les clips se connectent. Cliquez pour aperçu.",
    previewAll: "Aperçu de tout",
    generating: "Génération...",
    catAll: "Tout", catBasic: "Basique", catWipe: "Balayage", catSlide: "Glissement",
    catSmooth: "Lisse", catShape: "Formes", catDiagonal: "Diagonal",
    catSpecial: "Spécial", catWind: "Vent", catOpen: "Ouverture",
    transitionDuration: "Durée de transition",
    selectedTransition: "Sélectionné",

    settingsTitle: "Paramètres de traitement",
    silenceSection: "Suppression des silences",
    silenceEnabled: "Supprimer les silences",
    silenceThreshold: "Seuil de silence (dB)",
    silenceThresholdHint: "Plus bas = plus sensible (ex: -40 détecte plus de silences)",
    minSilence: "Durée min. du silence (s)",
    minSilenceHint: "Les pauses plus courtes que ceci ne seront PAS supprimées",
    silencePadding: "Marge de silence (s)",
    silencePaddingHint: "Conserver ce temps audio avant/après chaque segment",

    processTitle: "Traiter les Médias",
    startBtn: "Démarrer le traitement",
    stopBtn: "Arrêter",
    processingStatus: "Traitement en arrière-plan...",
    doneStatus: "Terminé !",
    errorStatus: "Erreur",
    progressFiles: "fichier(s) traité(s)",
    progressTime: "temps écoulé",
    logTitle: "Journal de traitement",
    openOutputBtn: "Ouvrir le dossier de sortie",
    
    outputsTitle: "Vidéos Traitées & Historique",
    noOutputsFound: "Aucune vidéo traitée pour le moment.",
    playVideo: "Lire",
    downloadBtn: "Télécharger",
    deleteBtn: "Supprimer",
    savedSilence: "Silence éconimisé",
    browserTitle: "Parcourir les fichiers",
    browserBack: "Dossier parent",
    browserSelect: "Sélectionner",
    browserCancel: "Annuler",
    previewTitle: "Aperçu Média",
    duration: "Durée", size: "Taille", resolution: "Résolution", fps: "IPS",
    selectAll: "Tout sélectionner", deselectAll: "Tout désélectionner",
    close: "Fermer", confirm: "Confirmer",
    ready: "Prêt", idle: "En attente",
    noFileSelected: "Aucun fichier sélectionné",
    settings: "Paramètres"
  }
};

let currentLang = localStorage.getItem('vf_lang') || 'en';

function t(key) {
  return (I18N[currentLang] || I18N.en)[key] || (I18N.en[key] || key);
}

function setLang(lang) {
  if (!I18N[lang]) return;
  currentLang = lang;
  localStorage.setItem('vf_lang', lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = I18N[lang].dir;
  document.body.classList.toggle('rtl', I18N[lang].dir === 'rtl');
  applyTranslations();
  
  if (typeof updateModeVisibility === 'function') {
    updateModeVisibility();
  }
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const attr = el.getAttribute('data-i18n-attr');
    if (attr) el.setAttribute(attr, t(key));
    else el.textContent = t(key);
  });
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
}
