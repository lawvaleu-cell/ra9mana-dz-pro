/**
 * RA9MANA — Website Compliance Assessment: question bank
 * ------------------------------------------------------------
 * Single source of truth for the assessment. To add, edit, or reorder
 * a question, change this file only — the engine in app.js renders
 * whatever it finds here. Each question carries its own fr/en/ar text
 * (same pattern as js/products.js) so no separate translation file
 * needs to stay in sync.
 *
 * Question shape:
 *   id            unique string id
 *   category      id of an entry in RA9MANA_COMPLIANCE_CATEGORIES
 *   question      {fr,en,ar}
 *   description   {fr,en,ar} — optional helper text under the question
 *   type          "single" | "multiple"
 *   required      boolean — blocks "Next" until answered
 *   scored        boolean — whether the answer feeds the compliance score
 *                 (false = informational / branching-only question)
 *   options[]     { id, label:{fr,en,ar}, points (0-100, scored questions
 *                 only), isNone (marks a mutually-exclusive "none of the
 *                 above" option in multi-select questions) }
 *   showIf        { questionId, in: [optionId,...] } — only rendered
 *                 when a previous answer to `questionId` included one of
 *                 the listed option ids. Omit for root-level questions.
 *   recommendation {fr,en,ar} — shown in the results page when the given
 *                 answer scores below the "good" threshold (see rules.js)
 */

const RA9MANA_COMPLIANCE_CATEGORIES = [
  { id: "website-info", number: "01", icon: "website",
    title: { fr: "Informations du site", en: "Website Information", ar: "معلومات الموقع" } },
  { id: "personal-data", number: "02", icon: "info",
    title: { fr: "Données personnelles", en: "Personal Data", ar: "البيانات الشخصية" } },
  { id: "user-rights", number: "03", icon: "check",
    title: { fr: "Droits des utilisateurs", en: "User Rights", ar: "حقوق المستخدمين" } },
  { id: "cookies", number: "04", icon: "globe",
    title: { fr: "Cookies & suivi", en: "Cookies & Tracking", ar: "ملفات تعريف الارتباط والتتبع" } },
  { id: "third-party", number: "05", icon: "link",
    title: { fr: "Services tiers", en: "Third-Party Services", ar: "خدمات الأطراف الثالثة" } },
  { id: "security", number: "06", icon: "alert",
    title: { fr: "Pratiques de sécurité", en: "Security Practices", ar: "ممارسات الأمان" } },
  { id: "terms", number: "07", icon: "book",
    title: { fr: "Conditions générales", en: "Terms & Conditions", ar: "الشروط والأحكام" } },
  { id: "privacy-policy", number: "08", icon: "eye",
    title: { fr: "Politique de confidentialité", en: "Privacy Policy", ar: "سياسة الخصوصية" } },
  { id: "accounts", number: "09", icon: "plus",
    title: { fr: "Comptes utilisateurs", en: "User Accounts", ar: "حسابات المستخدمين" } },
  { id: "payments", number: "10", icon: "external",
    title: { fr: "Paiements & e-commerce", en: "Payments & E-commerce", ar: "المدفوعات والتجارة الإلكترونية" } },
  { id: "content", number: "11", icon: "upload",
    title: { fr: "Contenu & responsabilités", en: "Content & User Responsibilities", ar: "المحتوى والمسؤوليات" } },
  { id: "transparency", number: "12", icon: "search",
    title: { fr: "Transparence", en: "Transparency", ar: "الشفافية" } }
];

const RA9MANA_COMPLIANCE_QUESTIONS = [
  // 01 — Website Information -------------------------------------------------
  {
    id: "q1", category: "website-info", type: "single", required: true, scored: false,
    question: {
      fr: "Quel type de site ou de plateforme exploitez-vous ?",
      en: "What type of website or platform do you operate?",
      ar: "ما نوع الموقع أو المنصة التي تديرها؟"
    },
    options: [
      { id: "showcase", label: { fr: "Site vitrine / institutionnel", en: "Business / showcase website", ar: "موقع تعريفي / مؤسسي" } },
      { id: "ecommerce", label: { fr: "Boutique en ligne / e-commerce", en: "Online store / e-commerce", ar: "متجر إلكتروني" } },
      { id: "media", label: { fr: "Blog / média", en: "Blog / media outlet", ar: "مدونة / موقع إعلامي" } },
      { id: "saas", label: { fr: "Application SaaS / plateforme de services", en: "SaaS application / service platform", ar: "تطبيق SaaS / منصة خدمات" } },
      { id: "other", label: { fr: "Autre", en: "Other", ar: "أخرى" } }
    ]
  },
  {
    id: "q2", category: "website-info", type: "single", required: true, scored: true,
    question: {
      fr: "Votre activité dispose-t-elle d'une existence légale (registre de commerce, statut d'auto-entrepreneur, association…) ?",
      en: "Does your business have a formal legal existence (commercial registration, freelance status, association, etc.)?",
      ar: "هل يملك نشاطك وجودًا قانونيًا رسميًا (سجل تجاري، صفة مقاول ذاتي، جمعية...)؟"
    },
    options: [
      { id: "yes", points: 100, label: { fr: "Oui", en: "Yes", ar: "نعم" } },
      { id: "inprogress", points: 50, label: { fr: "En cours de régularisation", en: "In progress", ar: "قيد التسوية" } },
      { id: "no", points: 10, label: { fr: "Non", en: "No", ar: "لا" } }
    ],
    recommendation: {
      fr: "Régularisez le statut légal de votre activité : c'est le socle sur lequel repose toute conformité (facturation, responsabilité, contrats).",
      en: "Formalize your business's legal status — it is the foundation every other compliance requirement (invoicing, liability, contracts) builds on.",
      ar: "قم بتسوية الوضع القانوني لنشاطك، فهو الأساس الذي تُبنى عليه بقية متطلبات الامتثال (الفوترة، المسؤولية، العقود)."
    }
  },

  // 02 — Personal Data ---------------------------------------------------------
  {
    id: "q3", category: "personal-data", type: "single", required: true, scored: false,
    question: {
      fr: "Votre site collecte-t-il des données personnelles auprès des utilisateurs ?",
      en: "Does your website collect personal data from users?",
      ar: "هل يقوم موقعك بجمع بيانات شخصية من المستخدمين؟"
    },
    options: [
      { id: "yes", label: { fr: "Oui", en: "Yes", ar: "نعم" } },
      { id: "no", label: { fr: "Non", en: "No", ar: "لا" } }
    ]
  },
  {
    id: "q4", category: "personal-data", type: "multiple", required: true, scored: false,
    showIf: { questionId: "q3", in: ["yes"] },
    question: {
      fr: "Quelles catégories de données collectez-vous ?",
      en: "Which categories of personal data do you collect?",
      ar: "ما هي فئات البيانات الشخصية التي تجمعها؟"
    },
    options: [
      { id: "name", label: { fr: "Nom et prénom", en: "Full name", ar: "الاسم واللقب" } },
      { id: "email", label: { fr: "Adresse e-mail", en: "Email address", ar: "البريد الإلكتروني" } },
      { id: "phone", label: { fr: "Numéro de téléphone", en: "Phone number", ar: "رقم الهاتف" } },
      { id: "location", label: { fr: "Localisation géographique", en: "Geographic location", ar: "الموقع الجغرافي" } },
      { id: "account", label: { fr: "Données de compte", en: "Account data", ar: "بيانات الحساب" } },
      { id: "payment", label: { fr: "Données de paiement", en: "Payment data", ar: "بيانات الدفع" } },
      { id: "none", isNone: true, label: { fr: "Je ne collecte aucune donnée personnelle", en: "I don't collect any personal data", ar: "لا أجمع أي بيانات شخصية" } }
    ]
  },
  {
    id: "q5", category: "personal-data", type: "single", required: true, scored: true,
    showIf: { questionId: "q3", in: ["yes"] },
    question: {
      fr: "Informez-vous clairement les utilisateurs de la finalité de la collecte, avant ou au moment de celle-ci ?",
      en: "Do you clearly inform users why their data is collected, before or at the time of collection?",
      ar: "هل تُعلم المستخدمين بوضوح بسبب جمع بياناتهم، قبل الجمع أو عند حدوثه؟"
    },
    options: [
      { id: "yes", points: 100, label: { fr: "Oui, systématiquement", en: "Yes, consistently", ar: "نعم، دائمًا" } },
      { id: "partially", points: 55, label: { fr: "Partiellement", en: "Partially", ar: "جزئيًا" } },
      { id: "no", points: 15, label: { fr: "Non", en: "No", ar: "لا" } }
    ],
    recommendation: {
      fr: "Précisez, au moment de chaque formulaire, la finalité exacte de la collecte de données (à quoi elles servent).",
      en: "State the exact purpose of the data you collect at the point of each form, so users know why it's needed.",
      ar: "وضّح الغرض الدقيق من جمع البيانات عند كل استمارة، حتى يعرف المستخدم سبب الحاجة إليها."
    }
  },
  {
    id: "q6", category: "personal-data", type: "single", required: true, scored: true,
    showIf: { questionId: "q3", in: ["yes"] },
    question: {
      fr: "Avez-vous défini une durée de conservation, après laquelle les données sont supprimées ou anonymisées ?",
      en: "Do you have a defined retention period, after which personal data is deleted or anonymized?",
      ar: "هل حددت مدة للاحتفاظ بالبيانات، يتم بعدها حذفها أو إخفاء هويتها؟"
    },
    options: [
      { id: "yes", points: 100, label: { fr: "Oui", en: "Yes", ar: "نعم" } },
      { id: "notsure", points: 40, label: { fr: "Je ne suis pas sûr(e)", en: "Not sure", ar: "غير متأكد" } },
      { id: "no", points: 10, label: { fr: "Non", en: "No", ar: "لا" } }
    ],
    recommendation: {
      fr: "Définissez une durée de conservation raisonnable par type de donnée, puis automatisez sa suppression ou son anonymisation.",
      en: "Define a reasonable retention period per data type, and automate deletion or anonymization once it expires.",
      ar: "حدد مدة احتفاظ معقولة لكل نوع من البيانات، ثم أتمتة حذفها أو إخفاء هويتها عند انتهائها."
    }
  },

  // 03 — User Rights -------------------------------------------------------
  {
    id: "q7", category: "user-rights", type: "single", required: true, scored: true,
    showIf: { questionId: "q3", in: ["yes"] },
    question: {
      fr: "Les utilisateurs peuvent-ils demander l'accès, la correction ou la suppression de leurs données ?",
      en: "Can users request access to, correction of, or deletion of their personal data?",
      ar: "هل يمكن للمستخدمين طلب الوصول إلى بياناتهم أو تصحيحها أو حذفها؟"
    },
    options: [
      { id: "yes", points: 100, label: { fr: "Oui", en: "Yes", ar: "نعم" } },
      { id: "partially", points: 50, label: { fr: "Partiellement", en: "Partially", ar: "جزئيًا" } },
      { id: "no", points: 10, label: { fr: "Non", en: "No", ar: "لا" } }
    ],
    recommendation: {
      fr: "Mettez en place un moyen simple (formulaire ou e-mail dédié) pour que les utilisateurs exercent ces droits.",
      en: "Provide a simple channel (a form or a dedicated email address) for users to exercise these rights.",
      ar: "وفّر وسيلة بسيطة (استمارة أو بريد إلكتروني مخصص) تتيح للمستخدمين ممارسة هذه الحقوق."
    }
  },
  {
    id: "q8", category: "user-rights", type: "single", required: true, scored: true,
    showIf: { questionId: "q3", in: ["yes"] },
    question: {
      fr: "Existe-t-il un processus documenté (contact dédié) pour traiter ces demandes ?",
      en: "Do you have a documented process (dedicated contact) for handling these requests?",
      ar: "هل يوجد إجراء موثّق (جهة اتصال مخصصة) لمعالجة هذه الطلبات؟"
    },
    options: [
      { id: "yes", points: 100, label: { fr: "Oui", en: "Yes", ar: "نعم" } },
      { id: "no", points: 20, label: { fr: "Non", en: "No", ar: "لا" } }
    ],
    recommendation: {
      fr: "Publiez une adresse de contact dédiée (ex. privacy@votredomaine) et un délai de réponse indicatif.",
      en: "Publish a dedicated contact address (e.g. privacy@yourdomain) with an indicative response time.",
      ar: "انشر بريدًا إلكترونيًا مخصصًا (مثل privacy@yourdomain) مع مدة استجابة إرشادية."
    }
  },
  {
    id: "q25", category: "user-rights", type: "single", required: true, scored: false,
    question: {
      fr: "Votre site s'adresse-t-il, ou est-il susceptible d'être utilisé, par des mineurs ?",
      en: "Is your website directed at, or knowingly used by, minors?",
      ar: "هل يستهدف موقعك القُصّر، أو من المحتمل أن يستخدمه قُصّر؟"
    },
    options: [
      { id: "yes", label: { fr: "Oui", en: "Yes", ar: "نعم" } },
      { id: "notsure", label: { fr: "Je ne suis pas sûr(e)", en: "Not sure", ar: "غير متأكد" } },
      { id: "no", label: { fr: "Non", en: "No", ar: "لا" } }
    ]
  },
  {
    id: "q26", category: "user-rights", type: "single", required: true, scored: true,
    showIf: { questionId: "q25", in: ["yes", "notsure"] },
    question: {
      fr: "Avez-vous des garanties spécifiques pour les mineurs (consentement parental, collecte de données limitée, vérification d'âge) ?",
      en: "Do you have specific safeguards for minors (parental consent, limited data collection, age screening)?",
      ar: "هل لديك ضمانات خاصة بالقُصّر (موافقة الوالدين، جمع بيانات محدود، التحقق من العمر)؟"
    },
    options: [
      { id: "yes", points: 100, label: { fr: "Oui", en: "Yes", ar: "نعم" } },
      { id: "no", points: 5, label: { fr: "Non", en: "No", ar: "لا" } }
    ],
    recommendation: {
      fr: "La protection des mineurs est un point sensible : limitez la collecte de données les concernant et envisagez un mécanisme de consentement parental.",
      en: "Protecting minors is a sensitive area: limit the data you collect from them and consider a parental-consent mechanism.",
      ar: "حماية القُصّر نقطة حساسة: قلّص جمع بياناتهم وفكّر في آلية لموافقة الوالدين."
    }
  },

  // 04 — Cookies & Tracking -------------------------------------------------
  {
    id: "q9", category: "cookies", type: "single", required: true, scored: false,
    question: {
      fr: "Votre site utilise-t-il des cookies ou technologies de suivi similaires (analyse d'audience, publicité…) ?",
      en: "Does your website use cookies or similar tracking technologies (analytics, ads, etc.)?",
      ar: "هل يستخدم موقعك ملفات تعريف ارتباط أو تقنيات تتبع مشابهة (تحليلات، إعلانات...)؟"
    },
    options: [
      { id: "yes", label: { fr: "Oui", en: "Yes", ar: "نعم" } },
      { id: "no", label: { fr: "Non", en: "No", ar: "لا" } }
    ]
  },
  {
    id: "q10", category: "cookies", type: "single", required: true, scored: true,
    showIf: { questionId: "q9", in: ["yes"] },
    question: {
      fr: "Affichez-vous une bannière de consentement avant de déposer des cookies non essentiels ?",
      en: "Do you display a consent banner before setting non-essential cookies?",
      ar: "هل تعرض شريط موافقة قبل وضع ملفات تعريف ارتباط غير أساسية؟"
    },
    options: [
      { id: "yes", points: 100, label: { fr: "Oui", en: "Yes", ar: "نعم" } },
      { id: "essentialonly", points: 85, label: { fr: "Je n'utilise que des cookies essentiels", en: "I only use essential cookies", ar: "أستخدم فقط ملفات تعريف ارتباط أساسية" } },
      { id: "no", points: 15, label: { fr: "Non", en: "No", ar: "لا" } }
    ],
    recommendation: {
      fr: "Ajoutez une bannière de consentement claire, permettant d'accepter ou de refuser les cookies non essentiels avant leur dépôt.",
      en: "Add a clear consent banner that lets visitors accept or refuse non-essential cookies before they are set.",
      ar: "أضف شريط موافقة واضحًا يتيح قبول أو رفض ملفات تعريف الارتباط غير الأساسية قبل وضعها."
    }
  },
  {
    id: "q11", category: "cookies", type: "single", required: true, scored: true,
    showIf: { questionId: "q9", in: ["yes"] },
    question: {
      fr: "Les utilisateurs peuvent-ils modifier ou retirer leur consentement aux cookies à tout moment ?",
      en: "Can users change or withdraw their cookie consent at any time?",
      ar: "هل يمكن للمستخدمين تعديل موافقتهم على ملفات تعريف الارتباط أو سحبها في أي وقت؟"
    },
    options: [
      { id: "yes", points: 100, label: { fr: "Oui", en: "Yes", ar: "نعم" } },
      { id: "no", points: 20, label: { fr: "Non", en: "No", ar: "لا" } }
    ],
    recommendation: {
      fr: "Ajoutez un lien permanent (ex. dans le pied de page) permettant de revenir sur ses préférences de cookies.",
      en: "Add a permanent link (e.g. in the footer) that lets visitors revisit their cookie preferences.",
      ar: "أضف رابطًا دائمًا (مثلاً في تذييل الصفحة) يتيح مراجعة تفضيلات ملفات تعريف الارتباط."
    }
  },

  // 05 — Third-Party Services -----------------------------------------------
  {
    id: "q12", category: "third-party", type: "multiple", required: true, scored: false,
    question: {
      fr: "Quels services tiers votre site intègre-t-il ?",
      en: "Which third-party services does your website integrate?",
      ar: "ما هي خدمات الأطراف الثالثة التي يدمجها موقعك؟"
    },
    options: [
      { id: "analytics", label: { fr: "Analyse d'audience (ex. Google Analytics)", en: "Analytics (e.g. Google Analytics)", ar: "تحليلات (مثل Google Analytics)" } },
      { id: "ads", label: { fr: "Publicité", en: "Advertising", ar: "إعلانات" } },
      { id: "payment", label: { fr: "Passerelle de paiement", en: "Payment gateway", ar: "بوابة دفع" } },
      { id: "chat", label: { fr: "Chat / support client", en: "Chat / customer support widget", ar: "دردشة / دعم العملاء" } },
      { id: "social", label: { fr: "Connexion via réseaux sociaux", en: "Social login", ar: "تسجيل الدخول عبر الشبكات الاجتماعية" } },
      { id: "email", label: { fr: "Marketing par e-mail", en: "Email marketing", ar: "التسويق عبر البريد الإلكتروني" } },
      { id: "none", isNone: true, label: { fr: "Aucun", en: "None", ar: "لا شيء" } }
    ]
  },
  {
    id: "q13", category: "third-party", type: "single", required: true, scored: true,
    showIf: { questionId: "q12", in: ["analytics", "ads", "payment", "chat", "social", "email"] },
    question: {
      fr: "Ces services tiers sont-ils mentionnés à vos utilisateurs (ex. dans votre politique de confidentialité) ?",
      en: "Are these third-party services disclosed to users (e.g. in your privacy policy)?",
      ar: "هل يتم الإفصاح عن هذه الخدمات للمستخدمين (مثلاً ضمن سياسة الخصوصية)؟"
    },
    options: [
      { id: "yes", points: 100, label: { fr: "Oui", en: "Yes", ar: "نعم" } },
      { id: "partially", points: 50, label: { fr: "Partiellement", en: "Partially", ar: "جزئيًا" } },
      { id: "no", points: 15, label: { fr: "Non", en: "No", ar: "لا" } }
    ],
    recommendation: {
      fr: "Listez les services tiers utilisés et leur rôle dans votre politique de confidentialité.",
      en: "List the third-party services you use, and what they do, in your privacy policy.",
      ar: "اذكر خدمات الأطراف الثالثة المستخدمة ودورها ضمن سياسة الخصوصية."
    }
  },

  // 06 — Security Practices --------------------------------------------------
  {
    id: "q14", category: "security", type: "single", required: true, scored: true,
    question: {
      fr: "Votre site est-il servi en connexion sécurisée (HTTPS) ?",
      en: "Is your website served over a secure connection (HTTPS)?",
      ar: "هل يعمل موقعك عبر اتصال آمن (HTTPS)؟"
    },
    options: [
      { id: "yes", points: 100, label: { fr: "Oui", en: "Yes", ar: "نعم" } },
      { id: "no", points: 0, label: { fr: "Non", en: "No", ar: "لا" } }
    ],
    recommendation: {
      fr: "Activez HTTPS sur l'ensemble du site (certificat SSL/TLS) : c'est une exigence de base, aujourd'hui gratuite sur la quasi-totalité des hébergeurs.",
      en: "Enable HTTPS across the whole site (an SSL/TLS certificate) — a baseline requirement, and free on virtually every host today.",
      ar: "فعّل HTTPS على كامل الموقع (شهادة SSL/TLS): متطلب أساسي، وهو مجاني اليوم لدى جل مزودي الاستضافة."
    }
  },
  {
    id: "q15", category: "security", type: "single", required: true, scored: true,
    question: {
      fr: "Appliquez-vous des pratiques de sécurité de base (mises à jour régulières, accès admin protégé, sauvegardes) ?",
      en: "Do you apply basic security practices (regular updates, protected admin access, backups)?",
      ar: "هل تطبق ممارسات أمان أساسية (تحديثات منتظمة، حماية الوصول الإداري، نسخ احتياطي)؟"
    },
    options: [
      { id: "yes", points: 100, label: { fr: "Oui", en: "Yes", ar: "نعم" } },
      { id: "partially", points: 55, label: { fr: "Partiellement", en: "Partially", ar: "جزئيًا" } },
      { id: "no", points: 10, label: { fr: "Non", en: "No", ar: "لا" } }
    ],
    recommendation: {
      fr: "Planifiez des mises à jour régulières, un mot de passe fort et unique pour l'administration, et des sauvegardes automatiques.",
      en: "Schedule regular updates, use a strong unique password for admin access, and set up automated backups.",
      ar: "خطط لتحديثات منتظمة، واستخدم كلمة مرور قوية وفريدة للوحة الإدارة، واعتمد نسخًا احتياطيًا تلقائيًا."
    }
  },

  // 07 — Terms & Conditions --------------------------------------------------
  {
    id: "q16", category: "terms", type: "single", required: true, scored: true,
    question: {
      fr: "Votre site dispose-t-il d'une page Conditions générales d'utilisation ?",
      en: "Does your website have a Terms & Conditions / Terms of Use page?",
      ar: "هل يملك موقعك صفحة للشروط والأحكام؟"
    },
    options: [
      { id: "yes", points: 100, label: { fr: "Oui", en: "Yes", ar: "نعم" } },
      { id: "inprogress", points: 45, label: { fr: "En préparation", en: "In progress", ar: "قيد الإعداد" } },
      { id: "no", points: 10, label: { fr: "Non", en: "No", ar: "لا" } }
    ],
    recommendation: {
      fr: "Rédigez des Conditions générales adaptées à votre activité (accès au service, responsabilités, litiges) et publiez-les.",
      en: "Draft Terms & Conditions suited to your activity (access to the service, liability, disputes) and publish them.",
      ar: "حرّر شروط وأحكام تلائم نشاطك (الوصول إلى الخدمة، المسؤوليات، النزاعات) وانشرها."
    }
  },

  // 08 — Privacy Policy -------------------------------------------------------
  {
    id: "q17", category: "privacy-policy", type: "single", required: true, scored: true,
    question: {
      fr: "Votre site dispose-t-il d'une page Politique de confidentialité dédiée ?",
      en: "Does your website have a dedicated Privacy Policy page?",
      ar: "هل يملك موقعك صفحة مخصصة لسياسة الخصوصية؟"
    },
    options: [
      { id: "yes", points: 100, label: { fr: "Oui", en: "Yes", ar: "نعم" } },
      { id: "inprogress", points: 45, label: { fr: "En préparation", en: "In progress", ar: "قيد الإعداد" } },
      { id: "no", points: 10, label: { fr: "Non", en: "No", ar: "لا" } }
    ],
    recommendation: {
      fr: "Rédigez une politique de confidentialité claire décrivant les données collectées, leur finalité et les droits des utilisateurs.",
      en: "Draft a clear privacy policy describing what data is collected, why, and what rights users have.",
      ar: "حرّر سياسة خصوصية واضحة تصف البيانات التي تُجمع، والغرض منها، وحقوق المستخدمين."
    }
  },
  {
    id: "q18", category: "privacy-policy", type: "single", required: true, scored: true,
    showIf: { questionId: "q17", in: ["yes", "inprogress"] },
    question: {
      fr: "Cette politique est-elle facile à trouver (ex. lien en pied de page) et rédigée en langage clair ?",
      en: "Is it easy to find (e.g. linked in the footer) and written in plain, accessible language?",
      ar: "هل يسهل الوصول إليها (مثلاً عبر رابط في تذييل الصفحة) وهل هي مكتوبة بلغة واضحة؟"
    },
    options: [
      { id: "yes", points: 100, label: { fr: "Oui", en: "Yes", ar: "نعم" } },
      { id: "partially", points: 55, label: { fr: "Partiellement", en: "Partially", ar: "جزئيًا" } },
      { id: "no", points: 20, label: { fr: "Non", en: "No", ar: "لا" } }
    ],
    recommendation: {
      fr: "Placez un lien visible vers la politique de confidentialité dans le pied de page et évitez le jargon juridique excessif.",
      en: "Add a visible footer link to the privacy policy and avoid excessive legal jargon.",
      ar: "ضع رابطًا ظاهرًا لسياسة الخصوصية في تذييل الصفحة، وتجنّب المصطلحات القانونية المفرطة."
    }
  },

  // 09 — User Accounts ----------------------------------------------------
  {
    id: "q19", category: "accounts", type: "single", required: true, scored: false,
    question: {
      fr: "Les utilisateurs créent-ils un compte (inscription / connexion) sur votre site ?",
      en: "Do users create accounts (sign up / log in) on your website?",
      ar: "هل ينشئ المستخدمون حسابات (تسجيل/دخول) على موقعك؟"
    },
    options: [
      { id: "yes", label: { fr: "Oui", en: "Yes", ar: "نعم" } },
      { id: "no", label: { fr: "Non", en: "No", ar: "لا" } }
    ]
  },
  {
    id: "q20", category: "accounts", type: "single", required: true, scored: true,
    showIf: { questionId: "q19", in: ["yes"] },
    question: {
      fr: "Les utilisateurs disposent-ils d'un moyen de supprimer définitivement leur compte et leurs données ?",
      en: "Can users permanently delete their account and associated data?",
      ar: "هل يمكن للمستخدمين حذف حسابهم وبياناتهم بشكل نهائي؟"
    },
    options: [
      { id: "yes", points: 100, label: { fr: "Oui", en: "Yes", ar: "نعم" } },
      { id: "no", points: 20, label: { fr: "Non", en: "No", ar: "لا" } }
    ],
    recommendation: {
      fr: "Ajoutez une option de suppression de compte dans les paramètres, ou à défaut un contact dédié pour en faire la demande.",
      en: "Add an account-deletion option in settings, or at minimum a dedicated contact for requesting it.",
      ar: "أضف خيار حذف الحساب ضمن الإعدادات، أو على الأقل جهة اتصال مخصصة لطلب ذلك."
    }
  },

  // 10 — Payments & E-commerce -----------------------------------------------
  {
    id: "q21", category: "payments", type: "single", required: true, scored: false,
    question: {
      fr: "Votre site traite-t-il des paiements en ligne ?",
      en: "Does your website process online payments?",
      ar: "هل يعالج موقعك مدفوعات عبر الإنترنت؟"
    },
    options: [
      { id: "yes", label: { fr: "Oui", en: "Yes", ar: "نعم" } },
      { id: "no", label: { fr: "Non", en: "No", ar: "لا" } }
    ]
  },
  {
    id: "q22", category: "payments", type: "single", required: true, scored: true,
    showIf: { questionId: "q21", in: ["yes"] },
    question: {
      fr: "Utilisez-vous une passerelle de paiement tierce agréée plutôt que de stocker vous-même les données de carte ?",
      en: "Do you use a licensed third-party payment processor instead of storing card data yourself?",
      ar: "هل تستخدم بوابة دفع خارجية معتمدة بدلاً من تخزين بيانات البطاقات بنفسك؟"
    },
    options: [
      { id: "yes", points: 100, label: { fr: "Oui", en: "Yes", ar: "نعم" } },
      { id: "notsure", points: 35, label: { fr: "Je ne suis pas sûr(e)", en: "Not sure", ar: "غير متأكد" } },
      { id: "no", points: 0, label: { fr: "Non, je stocke ces données moi-même", en: "No, I store this data myself", ar: "لا، أخزّن هذه البيانات بنفسي" } }
    ],
    recommendation: {
      fr: "Ne stockez jamais vous-même des données de carte bancaire : passez par un prestataire de paiement agréé (PCI-DSS).",
      en: "Never store card data yourself — route payments through a licensed, PCI-DSS-compliant payment provider.",
      ar: "لا تُخزّن بيانات البطاقات المصرفية بنفسك أبدًا؛ استعن بمزود دفع معتمد ومتوافق مع معيار PCI-DSS."
    }
  },

  // 11 — Content & User Responsibilities ---------------------------------
  {
    id: "q23", category: "content", type: "single", required: true, scored: false,
    question: {
      fr: "Votre site permet-il aux utilisateurs de publier du contenu (commentaires, avis, fichiers) ?",
      en: "Does your website allow users to publish content (comments, reviews, uploads)?",
      ar: "هل يتيح موقعك للمستخدمين نشر محتوى (تعليقات، آراء، ملفات)؟"
    },
    options: [
      { id: "yes", label: { fr: "Oui", en: "Yes", ar: "نعم" } },
      { id: "no", label: { fr: "Non", en: "No", ar: "لا" } }
    ]
  },
  {
    id: "q24", category: "content", type: "single", required: true, scored: true,
    showIf: { questionId: "q23", in: ["yes"] },
    question: {
      fr: "Disposez-vous d'une politique de modération / d'un moyen de signaler un contenu illicite ?",
      en: "Do you have a moderation policy or a way to report inappropriate or illegal content?",
      ar: "هل لديك سياسة إشراف أو وسيلة للإبلاغ عن محتوى غير قانوني؟"
    },
    options: [
      { id: "yes", points: 100, label: { fr: "Oui", en: "Yes", ar: "نعم" } },
      { id: "partially", points: 50, label: { fr: "Partiellement", en: "Partially", ar: "جزئيًا" } },
      { id: "no", points: 15, label: { fr: "Non", en: "No", ar: "لا" } }
    ],
    recommendation: {
      fr: "Ajoutez un bouton de signalement et définissez une procédure claire de modération des contenus publiés par les utilisateurs.",
      en: "Add a reporting button and define a clear moderation procedure for user-published content.",
      ar: "أضف زر إبلاغ وحدد إجراءً واضحًا للإشراف على المحتوى الذي ينشره المستخدمون."
    }
  },

  // 12 — Transparency -----------------------------------------------------
  {
    id: "q27", category: "transparency", type: "single", required: true, scored: true,
    question: {
      fr: "Votre identité (entreprise/organisation) et vos coordonnées de contact sont-elles clairement affichées (page À propos / Contact) ?",
      en: "Is your business/organization identity and contact information clearly displayed (About/Contact page)?",
      ar: "هل هوية نشاطك/مؤسستك ومعلومات الاتصال معروضة بوضوح (صفحة من نحن/اتصل بنا)؟"
    },
    options: [
      { id: "yes", points: 100, label: { fr: "Oui", en: "Yes", ar: "نعم" } },
      { id: "partially", points: 55, label: { fr: "Partiellement", en: "Partially", ar: "جزئيًا" } },
      { id: "no", points: 15, label: { fr: "Non", en: "No", ar: "لا" } }
    ],
    recommendation: {
      fr: "Publiez une page « À propos / Contact » avec votre identité et un moyen de vous joindre.",
      en: "Publish an About/Contact page with your identity and a way to reach you.",
      ar: "انشر صفحة \"من نحن/اتصل بنا\" تتضمن هويتك ووسيلة للتواصل معك."
    }
  }
];
