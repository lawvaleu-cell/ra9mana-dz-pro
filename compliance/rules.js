/**
 * RA9MANA — Website Compliance Assessment: scoring rules
 * ------------------------------------------------------------
 * All the tunable numbers for scoring live here, separate from the
 * engine (app.js) and the question bank (questions.js). Change a
 * weight or a threshold here — nothing else needs to change.
 */

const RA9MANA_COMPLIANCE_RULES = {
  // Relative weight of each category in the overall score. Categories
  // not listed default to weight 1. Only categories with at least one
  // *applicable* scored question count toward the overall average.
  categoryWeights: {
    "personal-data": 1.3,
    "security": 1.4,
    "payments": 1.3,
    "user-rights": 1.1
  },

  // Score bands for the overall result. `min` is inclusive.
  levels: [
    { min: 90, id: "excellent",
      label: { fr: "Conformité excellente", en: "Excellent Compliance", ar: "امتثال ممتاز" } },
    { min: 75, id: "good",
      label: { fr: "Bonne conformité", en: "Good Compliance", ar: "امتثال جيد" } },
    { min: 50, id: "needs-improvement",
      label: { fr: "Des améliorations sont nécessaires", en: "Needs Improvement", ar: "يحتاج إلى تحسين" } },
    { min: 0, id: "significant-gaps",
      label: { fr: "Des améliorations importantes sont requises", en: "Significant Improvements Required", ar: "مطلوب تحسينات جوهرية" } }
  ],

  // Minimum overall score (0-100) required to be offered a certificate.
  certificateThreshold: 80,

  // A scored answer at or above this many points is treated as "doing
  // well"; below it, its recommendation is surfaced as an improvement area.
  recommendationThreshold: 70
};
