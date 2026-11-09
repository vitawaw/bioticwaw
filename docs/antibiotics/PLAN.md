# Plan: 100 antibiotics

## Goal
Build a source-based database of 100 systemic antibiotics for pharmacists, with doses by infection, kidney adjustment, timing, interactions and sources.

## Scope
- The 100 drugs are listed in `antibiotics_100.csv`, grouped by class.
- Only systemic antibiotics used in medicine. Topical-only products (for example mupirocin, bacitracin) are excluded.
- The AWaRe group of each drug comes from the 2023 WHO classification (S2). The column "aware_proposed" is left blank until checked.

## Phases and output
| Phase | Work | Output | Target |
|---|---|---|---|
| 1 | Verify the classification of each drug (S2) | AWaRe group in the CSV | 100 drugs |
| 2 | Collect the label (S4 or S5) for each drug: doses, renal, timing, interactions | One row per drug in the CSV | 10 drugs per batch |
| 3 | Add the guideline reference (S1, S7, S9) for the main infections | Indication list per drug | same batches |
| 4 | Top interactions per drug (3–5), with source | Interactions table (draft) | same batches |
| 5 | Pharmacist review (you) of each batch | Status "approved" or "needs change" | after each batch |
| 6 | Load approved drugs into the test database | Records with reviewed=false until you approve | after review |
| 7 | Publish to the main site | After your approval only | last |

## Batches (suggested order: most used first)
1. Batch 1 (10): amoxicillin, amoxicillin-clavulanate, cefalexin, doxycycline, ciprofloxacin, azithromycin, nitrofurantoin, metronidazole, ceftriaxone, sulfamethoxazole-trimethoprim
2. Batch 2 (10): clarithromycin, levofloxacin, cefuroxime, cefixime, clindamycin, flucloxacillin, cefazolin, gentamicin, vancomycin, linezolid
3. Batches 3–10: the rest of the CSV, in the order of the class groups.

## Acceptance rules for each drug (before it goes to review)
- Two official sources at least (S4 or S5 and S1/S2/S7/S9).
- Dose copied from the label with the section number, never from a secondary site.
- Kidney adjustment stated, or "no adjustment in the label" with the label section.
- AWaRe group checked against S2.
- Interactions: at least the 3 most important, each with its source.
- Arabic and English text for every field.

## Team and time
- Data collection: I collect and record sources, batch by batch.
- Review: you (the pharmacist) approve each batch in writing before it is loaded.
- A batch of 10 needs about one working session for collection and one for review.

## Risks
- Labels differ by country and manufacturer. The record shows which label it comes from.
- Kidney dosing is the most error-prone part. The calculator will only use the drugs you approve.
- Guidelines change. Every source has a check date.

## Decisions needed from you
1. Confirm the 100-drug list (add or remove drugs).
2. Confirm which label is primary: FDA (S4) or EMA (S5).
3. Confirm the batch order above.
