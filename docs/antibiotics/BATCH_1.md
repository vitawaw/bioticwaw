# Batch 1 (10 antibiotics) — data from the official labels

Status: **collected, waiting for the pharmacist's review** (plan phase 5). Nothing is loaded into the database yet; loading comes after the review.
Primary source: FDA / DailyMed labels (the owner's choice). Section numbers are the label's own numbering.
Items marked ⚠ need a check before approval.

## 1. Amoxicillin — DailyMed tablet label (setid bb7733f8-6aad-4273-84a0-ef472630203f)
- **Adult dose (2.2, Table 1):** skin, ENT and urinary: 500 mg every 12 h or 250 mg every 8 h (mild–moderate); 875 mg every 12 h or 500 mg every 8 h (severe). Lower respiratory tract: 875 mg every 12 h or 500 mg every 8 h.
- **Duration (2.2):** at least 48–72 h after symptoms stop; at least 10 days for *S. pyogenes*.
- **Kidney (2.5, Table 2):** GFR under 30: do not use 875 mg. GFR 10–30: 500 or 250 mg every 12 h. GFR under 10: 500 or 250 mg every 24 h. Haemodialysis: 500 or 250 mg every 24 h plus a dose during and at the end of dialysis.
- **Interactions (7):** probenecid (7.1, raises levels; avoid); oral anticoagulants (7.2, raises INR); allopurinol (7.3, more rash); oral contraceptives (7.4, may reduce effect); chloramphenicol, macrolides, sulfonamides, tetracyclines (7.5, in vitro antagonism). Lab: false glucose with copper-reduction tests.
- **Timing:** no timing rule in the label.

## 2. Amoxicillin–clavulanate — DailyMed tablet label (setid 26e1d503-ab8b-ca85-e063-6394a90aaae3)
- **Adult dose (2.2, Table 1):** 875/125 mg every 12 h or 500/125 mg every 8 h (severe and respiratory). 500/125 mg every 12 h or 250/125 mg every 8 h (less severe).
- **Duration:** ⚠ not in the fetched text; check the full label.
- **Kidney (2.4, Table 4):** no reduction unless severe. GFR under 30: do not use 875 mg. GFR 10–30: 500 or 250 mg every 12 h. GFR under 10: 500 or 250 mg every 24 h. Haemodialysis as for amoxicillin.
- **Interactions (7):** probenecid (7.1); oral anticoagulants (7.2, INR); allopurinol (7.3); oral contraceptives (7.4); lab tests (7.5).

## 3. Cefalexin — DailyMed capsule label (setid 11cfefee-d75e-430c-8817-02dc57de0e88)
- **Adult dose (2.1):** usual 250 mg every 6 h or 500 mg every 12 h. Duration 7–14 days. Severe infections up to 4 g/day in 2–4 divided doses.
- **Kidney (2.3, Table 1):** CrCl over 60: no change. 30–59: no change, maximum 1 g/day. 15–29: 250 mg every 8–12 h. 5–14 (not on dialysis): 250 mg every 24 h. 1–4 (not on dialysis): 250 mg every 48–60 h. Haemodialysis: insufficient information.
- **Interactions (7):** metformin (7.1, raises levels; monitor); probenecid (7.2; avoid); urine glucose tests with Benedict or Fehling (7.3).

## 4. Ceftriaxone — manufacturer label, Pfizer (labeling.pfizer.com, id 4387)
- **Adult dose (2.1, Table 1):** general infections 1–2 g IV once daily or divided twice daily, maximum 4 g/day. Skin: 50–75 mg/kg once or twice daily, maximum 2 g/day. Meningitis: 100 mg/kg once daily or divided, maximum 4 g/day. Gonorrhoea: 250 mg IM single dose. Surgical prophylaxis: 1 g.
- **Duration (2.1):** at least 2 days after symptoms stop; usual 4–14 days; at least 10 days for *S. pyogenes*.
- **Kidney and liver (2.1, 5.7):** no adjustment for kidney or liver impairment alone. Combined significant kidney and liver impairment: maximum 2 g/day. Not removed by dialysis; no dose after dialysis.
- **Interactions (7):** must not be given at the same time as calcium-containing IV solutions (7.2; sequential use with flushing is allowed except in neonates). Incompatible in the same line with vancomycin, amsacrine, aminoglycosides and fluconazole (7.1). Contraindicated in neonates needing IV calcium (4.2).

## 5. Ciprofloxacin — DailyMed tablet label (setid 178dc379-e2b8-4b47-9f0c-3fc7fb435c36)
- **Adult dose (Table 1 — ⚠ the table is an image; values from the text version):** skin 500–750 mg every 12 h, 7–14 days; bone 500–750 mg every 12 h, 4–8 weeks; intra-abdominal (with metronidazole) 500 mg every 12 h, 7–14 days; infectious diarrhoea 500 mg every 12 h, 5–7 days; typhoid 500 mg every 12 h, 10 days; cervical gonorrhoea 250 mg single dose; anthrax (post-exposure) 500 mg every 12 h, 60 days; plague 500–750 mg every 12 h, 14 days; chronic prostatitis 500 mg every 12 h, 28 days; lower respiratory 500–750 mg every 12 h, 7–14 days; urinary 250–500 mg every 12 h, 7–14 days; uncomplicated cystitis 250 mg every 12 h, 3 days; sinusitis 500 mg every 12 h, 10 days.
- **Kidney (2.x, Table 4):** CrCl over 50: usual dose. 30–50: 250–500 mg every 12 h. 5–29: 250–500 mg every 18 h. Dialysis (haemo or peritoneal): 250–500 mg every 24 h, after dialysis.
- **Interactions (7, Table 11):** antacids, sucralfate, calcium, iron, zinc, didanosine: take ciprofloxacin 2 h before or 6 h after (2.4 and 7). Tizanidine: contraindicated (4.2, 7). Theophylline: avoid; if unavoidable, monitor levels (5.10, 7). Warfarin: monitor INR (7). Glyburide and sulfonylureas: hypoglycaemia; monitor glucose (7).

## 6. Doxycycline — DailyMed tablet label (setid 9f00b2c9-e628-4265-8530-3258dd3cdcd5)
- **Adult dose (2.2):** general 200 mg day 1 (100 mg every 12 h), then 100 mg daily; or 100 mg every 12 h for more severe infections.
- **Indication-specific (2.2, 2.4, 2.5):** chlamydia, urethritis, cervicitis, rectal (100 mg every 12 h, 7 days); gonorrhoea (100 mg every 12 h, 7 days); early syphilis penicillin-allergic (100 mg every 12 h, 2 weeks); malaria prophylaxis (100 mg daily); inhalational anthrax post-exposure (100 mg every 12 h, 60 days).
- **Kidney (12.3):** no adjustment; half-life unchanged in severe kidney impairment. Excretion falls at CrCl under 10.
- **Interactions (7):** anticoagulants (7.1: prothrombin activity lowered; warfarin not named); penicillin (7.2: avoid together); antacids with Al, Ca or Mg, bismuth, iron (7.3; calcium-rich food also reduces absorption, section 17); oral contraceptives (7.4); barbiturates, carbamazepine, phenytoin (7.5, shorten half-life); lab: catecholamine tests (7.7).

## 7. Nitrofurantoin — DailyMed capsule (macrocrystals) label (setid 00ca617f-d939-a1c8-e063-6394a90a0e54)
- **Adult dose (Dosage):** 50–100 mg four times daily; the lower dose for uncomplicated UTI. Duration: one week, or at least 3 days after urine is sterile. Long-term suppression: 50–100 mg at bedtime.
- **Kidney (Contraindications, Warnings):** contraindicated in "significant renal impairment", defined as CrCl under 60 mL/min. ⚠ Another label (Alembic copy) calls the same threshold a caution. **This conflict needs a pharmacist's decision before publishing.** Neuropathy risk rises with kidney impairment.
- **Interactions (Precautions):** magnesium trisilicate antacids reduce absorption (avoid); probenecid and sulfinpyrazone block renal secretion; quinolones: in-vitro antagonism, clinical significance unknown (Microbiology).
- **Food:** capsules with food improve absorption and tolerance (label copy).

## 8. Metronidazole — DailyMed tablet label (setid d7455566-16aa-488a-af2a-93b55a04c02f)
- **Adult dose (Dosage):** trichomoniasis: 2 g single dose, or 1 g twice on one day, or 250 mg three times daily for 7 days (repeat courses 4–6 weeks apart). Amoebiasis: 750 mg three times daily for 5–10 days. Anaerobic infections: 7.5 mg/kg every 6 h (about 500 mg for 70 kg), maximum 4 g/24 h, 7–10 days.
- **Liver (Dosage adjustments):** Child-Pugh C: reduce dose by 50%. Child-Pugh A/B: no change, monitor.
- **Kidney:** no routine change. Metabolites accumulate in end-stage disease. Haemodialysis: consider a supplemental dose after dialysis. CAPD: no change.
- **Warnings:** encephalopathy, peripheral and optic neuropathy, seizures, aseptic meningitis; boxed warning: carcinogenicity in rodents, avoid unnecessary use.
- **Interactions (Precautions):** alcohol and propylene-glycol products: avoid during and for 3 days after (disulfiram-like reaction); disulfiram: not within 2 weeks; lithium: check serum lithium and creatinine; busulfan: avoid unless needed, monitor levels; warfarin: monitor PT and INR.

## 9. Azithromycin — DailyMed tablet label (setid 7e7c2f49-449c-4ba2-98ae-0ff0c040614c)
- **Adult dose (Dosage, adults):** community-acquired pneumonia (mild): 500 mg day 1, then 250 mg daily on days 2–5. Acute bacterial sinusitis: 500 mg once daily for 3 days. Chancroid and non-gonococcal urethritis/cervicitis: 1 g single dose. Gonococcal urethritis/cervicitis: 2 g single dose.
- **Kidney:** no adjustment for GFR ≤ 80; with GFR under 10 AUC rises about 35%, so caution.
- **Interactions:** aluminium and magnesium antacids: do not take at the same time (Patient information); warfarin: monitor prothrombin time; digoxin: monitor levels; QT-prolonging drugs (Warnings): caution, especially Class IA and III antiarrhythmics, hypokalaemia, hypomagnesaemia; also phenytoin and ergot alkaloids.
- ⚠ The "1 h before or 2 h after" timing is from a non-US label; not used here.

## 10. Sulfamethoxazole–trimethoprim — FDA SPL (set id a56a7056-c72a-4e25-9c41-327f429e7af0)
- **Adult dose (10.1):** urinary tract infections: 1 double-strength tablet or 2 regular tablets every 12 h for 10–14 days. Shigellosis: the same daily dose for 5 days.
- ⚠ **Kidney dose table (10.2) was cut off in the fetched text.** Must be read in full before use.
- ⚠ Other indications (bronchitis, Pneumocystis, traveller's diarrhoea) are not in the fetched text.
- **Interactions (6.4):** warfarin (prolongs prothrombin time; monitor INR); phenytoin (may raise levels); methotrexate (avoid; raises free methotrexate).

## Resolution of the five open points (latest official source first)

| # | Point | Latest source checked | Result adopted | Confidence |
|---|---|---|---|---|
| 1 | Nitrofurantoin kidney threshold | DailyMed setid 152e4fe2 (updated 30 Jan 2023) and DailyMed setid 00ca617f: both list "creatinine clearance under 60 mL/min" as a **contraindication** (significant renal impairment), and the neuropathy warning uses the same threshold | **Contraindicated under 60 mL/min.** The "caution" wording comes from another manufacturer's copy and is not used. The older UK/Irish guideline (HSE table, caution at 45–60 and long-term use contraindicated below 45) is recorded as a conflict for the pharmacist | High for the label; the guideline differs |
| 2 | Amoxicillin–clavulanate duration | DailyMed setid 26e1d503, "Updated June 18, 2026" (the latest revision) | The label gives **no duration** except acute otitis media: 10 days (Dosage, Table 3, footnote b). Other durations come from the WHO AWaRe book (S1) or NICE guidance (S7), recorded per indication | High |
| 3 | Ciprofloxacin dose table | DailyMed setid 178dc379 (text version) | The indication table and the kidney table (CrCl over 50 usual; 30–50: 250–500 mg every 12 h; 5–29: 250–500 mg every 18 h; dialysis: 250–500 mg every 24 h after dialysis) are in the label text; the image note no longer applies | High |
| 4 | SMX–TMP kidney table | FDA SPL a56a7056 (effective 7 June 2023): the table is cut off in the fetched text. Other sources agree: half the usual dose at CrCl 15–30 mL/min; not recommended below 15 mL/min (PrescriberPoint tablet summary; Mylan injection label, supporting only). WHO prequalification advises close monitoring for hyperkalaemia at 15–30 mL/min | **Half the usual dose at 15–30 mL/min; not recommended below 15 mL/min.** Official tablet label still to confirm on DailyMed | Medium: the consistent figure is from secondary sources |
| 5 | Azithromycin label version | DailyMed setid 7e7c2f49 (checked this session); FDA Zithromax label 2021 with the same dosing, kidney and antacid text | Content unchanged; the version is the current DailyMed copy | High |

**Consequence for the review:** items 1 and 4 remain for the pharmacist to confirm. Items 2, 3 and 5 are settled.

## Items still open for the pharmacist (after the resolution above)
1. Nitrofurantoin: the kidney threshold (contraindicated under 60 mL/min, or caution).
2. Amoxicillin–clavulanate: duration of treatment (not in the fetched text).
3. Ciprofloxacin: the dose table is an image; confirm each value on the page.
4. SMX-TMP: the kidney dose table is missing from the text; confirm on the full label.
5. Azithromycin: confirm that the label used is the current version.
