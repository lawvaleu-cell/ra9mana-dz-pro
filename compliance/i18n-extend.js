/**
 * RA9MANA — Website Compliance Assessment: interface strings
 * ------------------------------------------------------------
 * Adds a `compliance` namespace to the site's existing RA9MANA_LOCALES
 * object (defined in js/locales.js), for every supported language.
 * This keeps the feature on the same i18n engine as the rest of the
 * site (data-i18n attributes, RA9MANA_I18N.t(), RTL switching) without
 * touching the core locale files. Load this script after js/locales.js
 * and before app.js.
 */
(() => {
  "use strict";
  if (typeof RA9MANA_LOCALES === "undefined") return;

  const strings = {
    fr: {
      nav: { compliance: "Évaluation de conformité" },
      compliance: {
        meta: {
          title: "Website Compliance Assessment — RA9MANA DZ",
          description: "Évaluez gratuitement la conformité de votre site web aux bonnes pratiques légales et de sécurité essentielles, et obtenez un rapport détaillé.",
          ogTitle: "Website Compliance Assessment — RA9MANA DZ",
          ogDescription: "Un test guidé, 100% local, pour situer votre site sur les fondamentaux de conformité web."
        },
        eyebrow: "Website Compliance Assessment",
        title: "Évaluez la conformité de votre site web",
        lead: "Un parcours guidé de quelques minutes sur les fondamentaux légaux et de sécurité d'un site web : données personnelles, cookies, sécurité, politiques, paiements… Vos réponses restent dans votre navigateur.",
        startCta: "Démarrer l'évaluation",
        startNote: "Environ 5 à 8 minutes • Aucune donnée envoyée à un serveur",
        progressLabel: "Progression",
        questionOf: "Question {current} sur {total}",
        previous: "Précédent",
        next: "Suivant",
        seeResults: "Voir mes résultats",
        validationRequired: "Merci de répondre à cette question avant de continuer.",
        restart: "Recommencer l'évaluation",
        exitConfirm: "Quitter maintenant effacera votre progression. Continuer ?",
        result: {
          title: "Résultat de votre évaluation",
          scoreLabel: "Score global",
          scoreOutOf: "/ 100",
          statusLabel: "Statut de l'évaluation",
          categoryBreakdown: "Résultats par catégorie",
          notApplicable: "Non applicable",
          doingWell: "Ce que vous faites bien",
          improvement: "Points à améliorer",
          recommendedActions: "Actions recommandées",
          noneWell: "Aucun point fort scoré n'a encore été identifié — c'est l'occasion de progresser sur les recommandations ci-dessous.",
          noneImprovement: "Aucun point faible identifié dans vos réponses : beau travail.",
          restart: "Refaire l'évaluation"
        },
        disclaimer: {
          title: "Avis important",
          body: "Cette évaluation repose sur les informations et déclarations fournies par le responsable du site. Elle a un but informatif et d'évaluation préliminaire de conformité uniquement, et ne constitue ni un avis juridique, ni un audit de sécurité, ni une garantie de conformité à l'ensemble des lois et réglementations applicables. RA9MANA n'assume aucune responsabilité en cas d'informations inexactes, incomplètes, trompeuses ou fausses fournies par le répondant, ni pour les changements ultérieurs du site ou des lois applicables après l'évaluation. Le certificat atteste uniquement que le répondant a complété l'évaluation RA9MANA et obtenu le score correspondant, selon les critères en vigueur au moment de l'évaluation."
        },
        warning: {
          title: "Avertissement important",
          body: "Cette évaluation s'appuie sur les réponses et déclarations fournies par le répondant. RA9MANA n'est pas responsable des déclarations fausses, inexactes, incomplètes ou trompeuses. L'évaluation ne constitue ni un avis juridique, ni un test d'intrusion, ni un audit de cybersécurité, ni une garantie absolue de conformité légale ou de sécurité."
        },
        certificate: {
          eyebrow: "Certification",
          congratsTitle: "Félicitations !",
          congratsBody: "Votre site a complété avec succès l'évaluation de conformité RA9MANA.",
          notEligibleTitle: "Certificat non disponible pour ce score",
          notEligibleBody: "Un score minimum est requis pour obtenir le certificat. Améliorez les points listés ci-dessus puis refaites l'évaluation.",
          nameLabel: "Nom du site ou du projet",
          namePlaceholder: "ex. RA9MANA DZ",
          nameRequired: "Merci d'indiquer un nom de site avant de générer le certificat.",
          confirmLabel: "Je confirme que les informations fournies dans cette évaluation sont exactes et complètes, à ma connaissance. Je comprends que le résultat et le certificat sont fondés sur les informations que j'ai fournies.",
          confirmRequired: "La confirmation est requise pour générer le certificat.",
          generateCta: "Obtenir mon certificat RA9MANA",
          heading: "Certificat d'évaluation de conformité",
          brand: "RA9MANA",
          subheading: "Website Compliance Assessment Certificate",
          websiteLabel: "Site / Projet",
          scoreLabel: "Score de conformité",
          dateLabel: "Date de l'évaluation",
          idLabel: "Identifiant du certificat",
          notice: "Ce certificat atteste uniquement que le répondant a complété l'évaluation RA9MANA et obtenu le score indiqué, sur la base des informations qu'il a déclarées. Il ne constitue ni un avis juridique, ni une garantie de conformité légale ou de sécurité.",
          printCta: "Imprimer le certificat",
          verifyCta: "Vérifier ce certificat",
          scanNote: "Scannez pour vérifier ce certificat"
        },
        verify: {
          eyebrow: "Vérification",
          title: "Vérifier un certificat",
          lead: "Saisissez un identifiant de certificat RA9MANA pour vérifier sa validité.",
          inputLabel: "Identifiant du certificat",
          inputPlaceholder: "ex. RA9-COMP-2026-A1B2C3",
          verifyCta: "Vérifier",
          demoNotice: "Version statique : la vérification s'appuie sur les certificats générés dans ce navigateur et sur un jeu de données de démonstration local. La vérification centralisée en ligne sera ajoutée lors du branchement du serveur.",
          validTitle: "Certificat valide",
          invalidTitle: "Certificat introuvable",
          invalidBody: "Aucun certificat correspondant à cet identifiant n'a été trouvé dans les données disponibles localement.",
          resultWebsite: "Site / Projet",
          resultScore: "Score",
          resultDate: "Date d'évaluation",
          resultStatus: "Statut"
        },
        toast: {
          copied: "Identifiant copié"
        }
      }
    },
    en: {
      nav: { compliance: "Compliance Assessment" },
      compliance: {
        meta: {
          title: "Website Compliance Assessment — RA9MANA DZ",
          description: "Assess your website against essential legal and security best practices for free, and get a detailed report.",
          ogTitle: "Website Compliance Assessment — RA9MANA DZ",
          ogDescription: "A guided, 100% local test to see where your website stands on the fundamentals of web compliance."
        },
        eyebrow: "Website Compliance Assessment",
        title: "Assess your website's compliance",
        lead: "A guided, few-minute walkthrough of the legal and security fundamentals of a website: personal data, cookies, security, policies, payments and more. Your answers stay in your browser.",
        startCta: "Start the assessment",
        startNote: "About 5–8 minutes • No data sent to any server",
        progressLabel: "Progress",
        questionOf: "Question {current} of {total}",
        previous: "Previous",
        next: "Next",
        seeResults: "See my results",
        validationRequired: "Please answer this question before continuing.",
        restart: "Restart the assessment",
        exitConfirm: "Leaving now will erase your progress. Continue?",
        result: {
          title: "Your assessment result",
          scoreLabel: "Overall score",
          scoreOutOf: "/ 100",
          statusLabel: "Assessment status",
          categoryBreakdown: "Results by category",
          notApplicable: "Not applicable",
          doingWell: "What you are doing well",
          improvement: "Areas that need improvement",
          recommendedActions: "Recommended actions",
          noneWell: "No scored strengths identified yet — that's an opportunity to work through the recommendations below.",
          noneImprovement: "No weak points identified in your answers — well done.",
          restart: "Retake the assessment"
        },
        disclaimer: {
          title: "Important Notice",
          body: "This assessment is based on the information and declarations provided by the website owner or respondent. It is intended for informational and preliminary compliance-assessment purposes only and does not constitute legal advice, a legal opinion, a security audit, or a guarantee of compliance with all applicable laws or regulations. RA9MANA does not assume responsibility for inaccurate, incomplete, misleading, or false information provided by the respondent, nor for any changes to the website or applicable laws after the assessment. The certificate confirms only that the respondent completed the RA9MANA assessment and achieved the applicable score according to the assessment criteria in effect at the time of evaluation."
        },
        warning: {
          title: "Important Disclaimer",
          body: "The assessment relies on the answers and declarations provided by the respondent. RA9MANA is not responsible for false, inaccurate, incomplete or misleading statements. The assessment does not constitute legal advice, a legal opinion, a penetration test, a cybersecurity audit, or an absolute guarantee of legal compliance or security."
        },
        certificate: {
          eyebrow: "Certification",
          congratsTitle: "Congratulations!",
          congratsBody: "Your website has successfully completed the RA9MANA Compliance Assessment.",
          notEligibleTitle: "Certificate not available for this score",
          notEligibleBody: "A minimum score is required to receive the certificate. Work through the items listed above, then retake the assessment.",
          nameLabel: "Website or project name",
          namePlaceholder: "e.g. RA9MANA DZ",
          nameRequired: "Please enter a website name before generating the certificate.",
          confirmLabel: "I confirm that the information provided in this assessment is accurate and complete to the best of my knowledge. I understand that the result and certificate are based on the information I provided.",
          confirmRequired: "Confirmation is required to generate the certificate.",
          generateCta: "Get Your RA9MANA Certificate",
          heading: "Compliance Assessment Certificate",
          brand: "RA9MANA",
          subheading: "Website Compliance Assessment Certificate",
          websiteLabel: "Website / Project",
          scoreLabel: "Compliance Score",
          dateLabel: "Assessment Date",
          idLabel: "Certificate ID",
          notice: "This certificate confirms only that the respondent completed the RA9MANA assessment and achieved the score shown, based on the information they declared. It does not constitute legal advice or a guarantee of legal or security compliance.",
          printCta: "Print Certificate",
          verifyCta: "Verify this certificate",
          scanNote: "Scan to verify this certificate"
        },
        verify: {
          eyebrow: "Verification",
          title: "Verify a Certificate",
          lead: "Enter a RA9MANA certificate ID to check its validity.",
          inputLabel: "Certificate ID",
          inputPlaceholder: "e.g. RA9-COMP-2026-A1B2C3",
          verifyCta: "Verify",
          demoNotice: "Static version: verification checks certificates generated in this browser plus a local demo dataset. Real centralized online verification will be added once the server is connected.",
          validTitle: "Valid certificate",
          invalidTitle: "Certificate not found",
          invalidBody: "No certificate matching this ID was found in the data currently available locally.",
          resultWebsite: "Website / Project",
          resultScore: "Score",
          resultDate: "Assessment date",
          resultStatus: "Status"
        },
        toast: {
          copied: "ID copied"
        }
      }
    },
    ar: {
      nav: { compliance: "تقييم الامتثال" },
      compliance: {
        meta: {
          title: "تقييم امتثال الموقع الإلكتروني — RA9MANA DZ",
          description: "قيّم امتثال موقعك للممارسات القانونية والأمنية الأساسية مجانًا، واحصل على تقرير مفصل.",
          ogTitle: "تقييم امتثال الموقع الإلكتروني — RA9MANA DZ",
          ogDescription: "اختبار موجّه ومحلي بالكامل لمعرفة موقع موقعك من أساسيات الامتثال الرقمي."
        },
        eyebrow: "Website Compliance Assessment",
        title: "قيّم امتثال موقعك الإلكتروني",
        lead: "جولة موجهة تستغرق بضع دقائق حول الأساسيات القانونية والأمنية للموقع: البيانات الشخصية، ملفات تعريف الارتباط، الأمان، السياسات، المدفوعات وغيرها. إجاباتك تبقى داخل متصفحك فقط.",
        startCta: "ابدأ التقييم",
        startNote: "حوالي 5 إلى 8 دقائق • لا يتم إرسال أي بيانات إلى أي خادم",
        progressLabel: "التقدّم",
        questionOf: "السؤال {current} من {total}",
        previous: "السابق",
        next: "التالي",
        seeResults: "عرض نتائجي",
        validationRequired: "يرجى الإجابة على هذا السؤال قبل المتابعة.",
        restart: "إعادة التقييم",
        exitConfirm: "المغادرة الآن ستمحو تقدمك. المتابعة؟",
        result: {
          title: "نتيجة تقييمك",
          scoreLabel: "النتيجة الإجمالية",
          scoreOutOf: "/ 100",
          statusLabel: "حالة التقييم",
          categoryBreakdown: "النتائج حسب الفئة",
          notApplicable: "غير قابل للتطبيق",
          doingWell: "ما تقوم به بشكل جيد",
          improvement: "نقاط تحتاج إلى تحسين",
          recommendedActions: "إجراءات موصى بها",
          noneWell: "لم يتم تحديد نقاط قوة مقيَّمة بعد — هذه فرصة للعمل على التوصيات أدناه.",
          noneImprovement: "لم يتم تحديد أي نقطة ضعف في إجاباتك: عمل جيد.",
          restart: "إعادة التقييم"
        },
        disclaimer: {
          title: "إشعار هام",
          body: "يستند هذا التقييم إلى المعلومات والإقرارات المقدمة من صاحب الموقع أو المستجيب. وهو مخصص لأغراض إعلامية وتقييم أولي للامتثال فقط، ولا يشكل استشارة قانونية، أو رأيًا قانونيًا، أو تدقيقًا أمنيًا، أو ضمانًا للامتثال لجميع القوانين واللوائح المعمول بها. لا تتحمل RA9MANA مسؤولية المعلومات غير الدقيقة أو الناقصة أو المضللة أو الخاطئة المقدمة من المستجيب، ولا عن أي تغييرات على الموقع أو القوانين المعمول بها بعد التقييم. تؤكد الشهادة فقط أن المستجيب أكمل تقييم RA9MANA وحصل على النتيجة المطابقة وفقًا لمعايير التقييم المعمول بها وقت التقييم."
        },
        warning: {
          title: "تنبيه هام",
          body: "يعتمد التقييم على الإجابات والإقرارات المقدمة من المستجيب. RA9MANA غير مسؤولة عن التصريحات الخاطئة أو غير الدقيقة أو الناقصة أو المضللة. لا يشكل التقييم استشارة قانونية، أو اختبار اختراق، أو تدقيقًا للأمن السيبراني، أو ضمانًا مطلقًا للامتثال القانوني أو الأمني."
        },
        certificate: {
          eyebrow: "الشهادة",
          congratsTitle: "تهانينا!",
          congratsBody: "أكمل موقعك بنجاح تقييم RA9MANA للامتثال.",
          notEligibleTitle: "الشهادة غير متاحة لهذه النتيجة",
          notEligibleBody: "يتطلب الحصول على الشهادة نتيجة دنيا معينة. اعمل على النقاط المذكورة أعلاه ثم أعد التقييم.",
          nameLabel: "اسم الموقع أو المشروع",
          namePlaceholder: "مثال: RA9MANA DZ",
          nameRequired: "يرجى إدخال اسم الموقع قبل إنشاء الشهادة.",
          confirmLabel: "أؤكد أن المعلومات المقدمة في هذا التقييم دقيقة وكاملة على حد علمي. أفهم أن النتيجة والشهادة تستندان إلى المعلومات التي قدمتها.",
          confirmRequired: "التأكيد مطلوب لإنشاء الشهادة.",
          generateCta: "احصل على شهادة RA9MANA",
          heading: "شهادة تقييم الامتثال",
          brand: "RA9MANA",
          subheading: "Website Compliance Assessment Certificate",
          websiteLabel: "الموقع / المشروع",
          scoreLabel: "نتيجة الامتثال",
          dateLabel: "تاريخ التقييم",
          idLabel: "معرّف الشهادة",
          notice: "تؤكد هذه الشهادة فقط أن المستجيب أكمل تقييم RA9MANA وحصل على النتيجة الموضحة، استنادًا إلى المعلومات التي صرّح بها. لا تشكل استشارة قانونية ولا ضمانًا للامتثال القانوني أو الأمني.",
          printCta: "طباعة الشهادة",
          verifyCta: "التحقق من هذه الشهادة",
          scanNote: "امسح الرمز للتحقق من هذه الشهادة"
        },
        verify: {
          eyebrow: "التحقق",
          title: "التحقق من شهادة",
          lead: "أدخل معرّف شهادة RA9MANA للتحقق من صحتها.",
          inputLabel: "معرّف الشهادة",
          inputPlaceholder: "مثال: RA9-COMP-2026-A1B2C3",
          verifyCta: "تحقق",
          demoNotice: "نسخة ثابتة: يعتمد التحقق على الشهادات التي تم إنشاؤها في هذا المتصفح بالإضافة إلى مجموعة بيانات تجريبية محلية. سيتم إضافة التحقق المركزي الحقيقي عبر الإنترنت لاحقًا عند ربط الخادم.",
          validTitle: "شهادة صالحة",
          invalidTitle: "الشهادة غير موجودة",
          invalidBody: "لم يتم العثور على شهادة مطابقة لهذا المعرّف ضمن البيانات المتوفرة محليًا.",
          resultWebsite: "الموقع / المشروع",
          resultScore: "النتيجة",
          resultDate: "تاريخ التقييم",
          resultStatus: "الحالة"
        },
        toast: {
          copied: "تم نسخ المعرّف"
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
