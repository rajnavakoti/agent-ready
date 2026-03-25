# Escalation Matrix

| Condition | Action |
|-----------|--------|
| P0 service down > 5min | Page VP Engineering |
| Payment failures > 1% | Page payment-engine team lead + finance |
| Data loss suspected | Page security team + DPO |
| All regions affected | Page CTO |
| Customer data exposed | Page CISO + legal + PR immediately |

## On-Call Rotation
- Primary: rotates weekly (see PagerDuty schedule)
- Secondary: team lead of affected service
- Escalation timeout: 15 minutes

## Tribal Knowledge Holders
- Split-brain reconciliation: Sarah M., José L. (José on vacation Aug 1-15)
- Fraud scorer model: ML team (Priya K.)
- Legacy settlement batch: Alex T. (single point of failure)
