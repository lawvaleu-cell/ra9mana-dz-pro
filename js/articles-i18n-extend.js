/**
 * RA9MANA DZ — Legal Articles: interface strings
 * ------------------------------------------------------------
 * Adds an `articles` and `articleSubmit` namespace (and a small
 * `library.subnav` addition) to the site's existing RA9MANA_LOCALES
 * object (defined in js/locales.js), for every supported language.
 * Same pattern as compliance/i18n-extend.js: keeps the feature on the
 * same i18n engine as the rest of the site without touching the core
 * locale file. Load this script after js/locales.js and before
 * js/i18n.js.
 */
(() => {
  "use strict";
  if (typeof RA9MANA_LOCALES === "undefined") return;

  const strings = {
    fr: {
      library: {
        subnav: { references: "Références", articles: "Articles" }
      },
      articles: {
        meta: {
          title: "Articles juridiques — RA9MANA DZ",
          description: "Des articles juridiques rédigés par des chercheurs et professionnels du droit, à lire directement sur la Bibliothèque juridique RA9MANA DZ.",
          ogTitle: "Articles juridiques — RA9MANA DZ",
          ogDescription: "Un fil éditorial juridique : analyses et articles à lire directement, sans téléchargement."
        },
        eyebrow: "Bibliothèque juridique",
        title: "Articles juridiques",
        description: "Des analyses et articles juridiques rédigés par des chercheurs, universitaires et professionnels du droit, à lire directement, sans téléchargement.",
        ctaAdd: "Ajouter un article",
        searchPlaceholder: "Rechercher un article…",
        allCategories: "Toutes les catégories",
        loading: "Chargement des articles…",
        empty: { title: "Aucun article", desc: "Essayez d'autres mots-clés ou une autre catégorie." },
        sections: { introduction: "Introduction", body: "Développement", conclusion: "Conclusion" },
        authorAnonymous: "Contribution anonyme",
        publishedOn: "Publié le"
      },
      articleSubmit: {
        meta: { title: "Ajouter un article — RA9MANA DZ" },
        breadcrumb: "Ajouter un article",
        eyebrow: "Articles",
        title: "Rédigez un article pour la Bibliothèque juridique",
        subtitle: "Chercheurs, universitaires et professionnels du droit peuvent partager un article à lire directement par les visiteurs de la bibliothèque.",
        sectionArticle: "L'article",
        sectionAuthor: "Informations sur l'auteur",
        sectionVisibility: "Que souhaitez-vous rendre public ?",
        fields: {
          titleLabel: "Titre de l'article",
          titlePlaceholder: "Titre complet de l'article",
          categoryLabel: "Catégorie",
          categoryPlaceholder: "Ex. Droit numérique",
          introLabel: "Introduction",
          introPlaceholder: "Le paragraphe d'ouverture de l'article",
          bodyLabel: "Développement",
          bodyPlaceholder: "Rédigez le corps de l'article…",
          bodyHint: "Utilisez la barre d'outils pour ajouter des sous-titres, du gras, des listes ou des citations.",
          conclusionLabel: "Conclusion",
          conclusionPlaceholder: "Le paragraphe de clôture de l'article"
        },
        author: {
          nameLabel: "Nom complet",
          emailLabel: "E-mail",
          bioLabel: "Courte biographie",
          photoLabel: "Photo",
          websiteLabel: "Site web",
          linkedinLabel: "LinkedIn",
          facebookLabel: "Facebook",
          instagramLabel: "Instagram",
          xLabel: "X / Twitter",
          githubLabel: "GitHub",
          showName: "Afficher mon nom",
          showPhoto: "Afficher ma photo",
          showBio: "Afficher ma biographie",
          showLinks: "Afficher mes liens"
        },
        editor: {
          bold: "Gras", italic: "Italique", heading: "Sous-titre",
          list: "Liste", quote: "Citation", paragraph: "Paragraphe"
        },
        previewTitle: "Aperçu",
        previewEmpty: "L'aperçu de votre article apparaîtra ici au fur et à mesure de la saisie.",
        submitBtn: "Publier l'article",
        packageInstructions: "En cliquant sur « Publier l'article », votre contribution est envoyée pour validation. Elle sera publiée après approbation.",
        success: {
          title: "Votre article a été enregistré",
          desc: "Merci ! Votre article a été enregistré localement dans ce navigateur.",
          toast: "Article enregistré avec succès"
        },
        errors: {
          required: "Ce champ est obligatoire.",
          invalidType: "Format de fichier non pris en charge.",
          fileTooLarge: "Le fichier dépasse la taille autorisée."
        }
      }
    },
    en: {
      library: {
        subnav: { references: "References", articles: "Articles" }
      },
      articles: {
        meta: {
          title: "Legal Articles — RA9MANA DZ",
          description: "Legal articles written by researchers and legal professionals, to read directly on the RA9MANA DZ Legal Library.",
          ogTitle: "Legal Articles — RA9MANA DZ",
          ogDescription: "A legal editorial feed: analyses and articles to read directly, no download needed."
        },
        eyebrow: "Legal Library",
        title: "Legal Articles",
        description: "Analyses and legal articles written by researchers, academics and legal professionals, to read directly, with no download.",
        ctaAdd: "Add an article",
        searchPlaceholder: "Search articles…",
        allCategories: "All categories",
        loading: "Loading articles…",
        empty: { title: "No articles", desc: "Try different keywords or another category." },
        sections: { introduction: "Introduction", body: "Body", conclusion: "Conclusion" },
        authorAnonymous: "Anonymous contribution",
        publishedOn: "Published on"
      },
      articleSubmit: {
        meta: { title: "Add an Article — RA9MANA DZ" },
        breadcrumb: "Add an article",
        eyebrow: "Articles",
        title: "Write an article for the Legal Library",
        subtitle: "Researchers, academics and legal professionals can share an article for library visitors to read directly.",
        sectionArticle: "The article",
        sectionAuthor: "Author information",
        sectionVisibility: "What would you like to make public?",
        fields: {
          titleLabel: "Article title",
          titlePlaceholder: "Full title of the article",
          categoryLabel: "Category",
          categoryPlaceholder: "e.g. Digital law",
          introLabel: "Introduction",
          introPlaceholder: "The opening paragraph of the article",
          bodyLabel: "Body",
          bodyPlaceholder: "Write the body of the article…",
          bodyHint: "Use the toolbar to add subheadings, bold text, lists or quotes.",
          conclusionLabel: "Conclusion",
          conclusionPlaceholder: "The closing paragraph of the article"
        },
        author: {
          nameLabel: "Full name",
          emailLabel: "Email",
          bioLabel: "Short bio",
          photoLabel: "Photo",
          websiteLabel: "Website",
          linkedinLabel: "LinkedIn",
          facebookLabel: "Facebook",
          instagramLabel: "Instagram",
          xLabel: "X / Twitter",
          githubLabel: "GitHub",
          showName: "Show my name",
          showPhoto: "Show my photo",
          showBio: "Show my bio",
          showLinks: "Show my links"
        },
        editor: {
          bold: "Bold", italic: "Italic", heading: "Heading",
          list: "List", quote: "Quote", paragraph: "Paragraph"
        },
        previewTitle: "Preview",
        previewEmpty: "Your article preview will appear here as you type.",
        submitBtn: "Publish article",
        packageInstructions: "Clicking \u201cPublish article\u201d saves your contribution in this browser, as a preview — no data is sent to a server at this stage.",
        success: {
          title: "Your article has been saved",
          desc: "Thank you! Your article has been saved locally in this browser.",
          toast: "Article saved successfully"
        },
        errors: {
          required: "This field is required.",
          invalidType: "Unsupported file format.",
          fileTooLarge: "The file exceeds the allowed size."
        }
      }
    },
    ar: {
      library: {
        subnav: { references: "المراجع", articles: "المقالات" }
      },
      articles: {
        meta: {
          title: "المقالات القانونية — RA9MANA DZ",
          description: "مقالات قانونية بقلم باحثين ومختصين في القانون، تُقرأ مباشرة على المكتبة القانونية لـ RA9MANA DZ.",
          ogTitle: "المقالات القانونية — RA9MANA DZ",
          ogDescription: "فضاء تحريري قانوني: مقالات وتحليلات تُقرأ مباشرة دون الحاجة إلى تحميل."
        },
        eyebrow: "المكتبة القانونية",
        title: "المقالات القانونية",
        description: "تحليلات ومقالات قانونية بقلم باحثين وأكاديميين ومختصين في القانون، تُقرأ مباشرة دون الحاجة إلى تحميل أي ملف.",
        ctaAdd: "إضافة مقال",
        searchPlaceholder: "ابحث في المقالات…",
        allCategories: "كل التصنيفات",
        loading: "جارٍ تحميل المقالات…",
        empty: { title: "لا توجد مقالات", desc: "جرّب كلمات مفتاحية أخرى أو تصنيفًا مختلفًا." },
        sections: { introduction: "المقدمة", body: "العرض", conclusion: "الخاتمة" },
        authorAnonymous: "مساهمة مجهولة",
        publishedOn: "نُشر بتاريخ"
      },
      articleSubmit: {
        meta: { title: "إضافة مقال — RA9MANA DZ" },
        breadcrumb: "إضافة مقال",
        eyebrow: "المقالات",
        title: "أضف مقالًا إلى المكتبة القانونية",
        subtitle: "يمكن للباحثين والأكاديميين والمختصين في القانون مشاركة مقال يقرأه زوار المكتبة مباشرة.",
        sectionArticle: "المقال",
        sectionAuthor: "معلومات الناشر",
        sectionVisibility: "ماذا تريد أن يكون ظاهرًا للعموم؟",
        fields: {
          titleLabel: "عنوان المقال",
          titlePlaceholder: "العنوان الكامل للمقال",
          categoryLabel: "التصنيف",
          categoryPlaceholder: "مثال: القانون الرقمي",
          introLabel: "المقدمة",
          introPlaceholder: "الفقرة الافتتاحية للمقال",
          bodyLabel: "العرض",
          bodyPlaceholder: "اكتب متن المقال…",
          bodyHint: "استخدم شريط الأدوات لإضافة عناوين فرعية أو نص عريض أو قوائم أو اقتباسات.",
          conclusionLabel: "الخاتمة",
          conclusionPlaceholder: "الفقرة الختامية للمقال"
        },
        author: {
          nameLabel: "الاسم الكامل",
          emailLabel: "البريد الإلكتروني",
          bioLabel: "نبذة قصيرة",
          photoLabel: "الصورة",
          websiteLabel: "الموقع الإلكتروني",
          linkedinLabel: "LinkedIn",
          facebookLabel: "Facebook",
          instagramLabel: "Instagram",
          xLabel: "X / Twitter",
          githubLabel: "GitHub",
          showName: "إظهار اسمي",
          showPhoto: "إظهار صورتي",
          showBio: "إظهار نبذتي",
          showLinks: "إظهار روابطي"
        },
        editor: {
          bold: "عريض", italic: "مائل", heading: "عنوان فرعي",
          list: "قائمة", quote: "اقتباس", paragraph: "فقرة"
        },
        previewTitle: "معاينة",
        previewEmpty: "ستظهر هنا معاينة مقالك أثناء الكتابة.",
        submitBtn: "نشر المقال",
        packageInstructions: "بالضغط على «نشر المقال»، تُرسل مساهمتك للمراجعة. وسيتم نشرها بعد الموافقة عليها.",
        success: {
          title: "تم حفظ مقالك",
          desc: "شكرًا لك! تم حفظ مقالك محليًا داخل هذا المتصفح.",
          toast: "تم حفظ المقال بنجاح"
        },
        errors: {
          required: "هذا الحقل إلزامي.",
          invalidType: "صيغة الملف غير مدعومة.",
          fileTooLarge: "حجم الملف يتجاوز الحد المسموح به."
        }
      }
    }
  };

  function deepMerge(target, source) {
    Object.keys(source).forEach((key) => {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        if (!target[key] || typeof target[key] !== "object") target[key] = {};
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    });
  }

  Object.keys(strings).forEach((lang) => {
    if (!RA9MANA_LOCALES[lang]) RA9MANA_LOCALES[lang] = {};
    deepMerge(RA9MANA_LOCALES[lang], strings[lang]);
  });
})();
