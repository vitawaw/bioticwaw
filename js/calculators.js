/* BIOTICWAW · js/calculators.js
   Dose logic for the built-in calculators: fD (vitamin D), fB12, fFol, fFe, fCa, fMg, fC, fZn,
   and the groups fPreg (pregnancy/breastfeeding), fInf (infant 0–24 months), fVA (WHO vitamin A for children).
   Each function reads the form, applies the cited guideline and calls render(). Medical changes go here.
   Files are plain scripts loaded in order by index.html (shared global scope, no build step). */
/** «قصور كلوي متقدم» — one option for every calculator (each adds its own caution) */
const CKD=()=>!!($('ckd')&&$('ckd').checked);
/** under 1 year the reference value is an Adequate Intake (AI), not an RDA (NIH / Food and Nutrition Board) */
const RDAL=age=>age<1?L('المدخول الكافي (AI)','Adequate Intake (AI)'):L('المقدار اليومي الموصى به (RDA)','Recommended Dietary Allowance (RDA)');
/* ===================== Vitamin D ===================== */
// 1.19 (test): the built-in vitamin and mineral calculators were removed; only the shared helpers remain
