/**
 * RA9MANA — Verify page: demo dataset
 * ------------------------------------------------------------
 * This is a local, illustrative dataset only — it exists so the
 * static /compliance/verify.html page has something real to check
 * against before a centralized verification backend exists. It is
 * combined at runtime with whatever certificates were issued locally
 * in the visitor's own browser (see services/certificate-service.js).
 * None of this represents a real, centrally-verified registry yet.
 */

const RA9MANA_COMPLIANCE_DEMO_CERTIFICATES = [
  {
    id: "RA9-COMP-2026-DEM0A1",
    websiteName: "RA9MANA DZ (démo)",
    score: 92,
    level: "excellent",
    issuedAtDisplay: "01/07/2026"
  },
  {
    id: "RA9-COMP-2026-DEM0B2",
    websiteName: "Boutique Exemple (démo)",
    score: 81,
    level: "good",
    issuedAtDisplay: "15/07/2026"
  }
];
