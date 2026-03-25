# MediAssist — Clinical Decision Support Knowledge Base

## Platform Overview
AI-powered clinical decision support for primary care physicians. Assists with differential diagnosis, medication interactions, lab result interpretation, and referral recommendations. NOT a replacement for clinical judgment — always presents options, never prescribes.

## Supported Specialties
- Internal Medicine (primary)
- Cardiology (consultation support)
- Endocrinology (diabetes management focus)
- Pulmonology (basic respiratory)

## Medication Database
- Covers 4,200+ medications (US FDA-approved as of Q1 2026)
- Interaction checking: DDI (drug-drug), DFI (drug-food), DCI (drug-condition)
- Black box warnings flagged automatically
- Dosage adjustments for renal impairment (eGFR-based) and hepatic impairment (Child-Pugh)

## Lab Reference Ranges
| Test | Normal Range | Critical Low | Critical High |
|------|-------------|-------------|---------------|
| HbA1c | 4.0-5.6% | — | >10% |
| TSH | 0.4-4.0 mIU/L | <0.1 | >10 |
| Potassium | 3.5-5.0 mEq/L | <3.0 | >6.0 |
| Creatinine | 0.7-1.3 mg/dL | — | >4.0 |
| WBC | 4,500-11,000/μL | <2,000 | >30,000 |
| Troponin I | <0.04 ng/mL | — | >0.4 |

## Clinical Guidelines Implemented
- ADA Standards of Medical Care (diabetes, updated annually)
- ACC/AHA Hypertension Guidelines (2017, with 2023 focused update)
- USPSTF Cancer Screening Recommendations (2025)
- CDC Immunization Schedule (2026)

## Known Limitations
- Does NOT cover pediatric dosing (patients must be ≥18)
- Drug interaction database updated quarterly — newly approved drugs may have a 90-day gap
- Genetic pharmacogenomics (CYP2D6, CYP2C19 variants) not yet integrated — planned Q3 2026
- Rare disease support is limited — differential diagnosis covers only conditions with prevalence >1:100,000
- Mental health screening tools (PHQ-9, GAD-7) are available but the agent cannot interpret scores in context of comorbidities

## Compliance
- HIPAA compliant (BAA signed with cloud provider)
- SOC 2 Type II certified
- Patient data never leaves the tenant's region (US-East, US-West, EU-Frankfurt)
- All AI suggestions logged with full audit trail for malpractice liability protection
