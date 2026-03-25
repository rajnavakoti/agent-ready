# HomeScope — Real Estate Evaluation Knowledge Base

## Platform Overview
AI-powered property evaluation and investment analysis platform for real estate agents and investors. Covers residential properties in the Netherlands (Randstad focus: Amsterdam, Rotterdam, The Hague, Utrecht).

## Data Sources
- **Kadaster**: Official Dutch land registry. Property boundaries, ownership history, WOZ values (government tax valuations, updated annually).
- **Funda API**: Active listings, historical sale prices (sold properties, 2-year window), listing days on market.
- **CBS (Statistics Netherlands)**: Neighborhood demographics, income levels, population density, crime statistics.
- **BAG (Basisregistratie Adressen en Gebouwen)**: Building year, surface area, usage type, energy label.
- **NVM (Nederlandse Vereniging van Makelaars)**: Quarterly market reports, price indices per municipality and property type.

## Valuation Model
- Comparable Sales Approach: minimum 3 comps within 1km, sold within 6 months, same property type
- Hedonic Pricing Model: regression on square meters, build year, energy label, garden, parking, floor level
- WOZ Adjustment: WOZ values typically lag market by 6-12 months. Model applies municipality-specific correction factor (Amsterdam: +8.2%, Rotterdam: +5.1% as of Q1 2026)

## Property Types
| Type (NL) | Type (EN) | Avg m² Price (Amsterdam, Q1 2026) |
|-----------|-----------|-----------------------------------|
| Appartement | Apartment | €6,850/m² |
| Tussenwoning | Terraced house | €5,920/m² |
| Hoekwoning | Corner house | €6,100/m² |
| Vrijstaand | Detached | €7,200/m² |
| Penthouse | Penthouse | €8,500/m² |

## Known Gaps
- **Renovation estimates**: Based on national averages from Bouwkosten.nl, not local contractor quotes. Can be off by 20-40% in Amsterdam centrum.
- **VvE (Owners Association) financials**: Not integrated. Monthly VvE fees and reserve fund status significantly affect apartment valuations but must be manually checked.
- **Erfpacht (Ground lease)**: Amsterdam has complex erfpacht conditions (eternal vs. fixed term, reformed vs. unreformed). The model doesn't distinguish between these — can lead to €50K+ valuation errors.
- **Asbestos risk**: Properties built 1945-1993 may contain asbestos. No automated flagging — energy label survey sometimes mentions it but not reliably.
- **Upcoming zoning changes**: Municipal zoning plans (bestemmingsplannen) not yet integrated. A residential area being rezoned for commercial use dramatically changes value.
