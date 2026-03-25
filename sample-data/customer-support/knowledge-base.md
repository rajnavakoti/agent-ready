# FinPay Customer Support Knowledge Base

## Products
- **FinPay Checking** — zero-fee digital checking account, instant transfers, virtual + physical Visa debit card
- **FinPay Savings** — 4.2% APY high-yield savings, no minimum balance, 6 withdrawals/month limit (Reg D)
- **FinPay Crypto** — buy/sell/hold BTC, ETH, SOL, USDC. No staking. Transfers to external wallets enabled for verified users only.
- **FinPay Credit** — secured credit card, $200-$5000 limit based on deposit, 23.99% APR

## Account Tiers
| Tier | Monthly Fee | Limits | Perks |
|------|------------|--------|-------|
| Basic | $0 | $5K daily transfer, $1K ATM | Basic support |
| Plus | $9.99 | $25K daily transfer, $2K ATM | Priority support, fee-free wire |
| Premium | $24.99 | $100K daily transfer, $5K ATM | Dedicated agent, 0.5% cashback |

## Common Issues & Resolution
- **Card frozen**: Usually triggered by 3+ declined transactions or international use without travel notice. Agent can unfreeze after identity verification (last 4 SSN + DOB + last transaction amount).
- **Pending transactions**: Merchants have 7 business days to settle. Cannot be cancelled by us. Tell customer to contact merchant.
- **Crypto transfer stuck**: External transfers require 2FA + email confirmation within 15 minutes. If expired, customer must re-initiate. Minimum transfer: $10 equivalent.
- **Dispute filing**: Customer has 60 days from statement date. Provisional credit issued within 10 business days. Investigation takes up to 90 days.
- **Account closure**: Requires $0 balance, no pending transactions, no active disputes. 30-day cooling period before data deletion.

## Escalation Rules
- Fraud reports → immediate escalation to fraud team (no agent resolution)
- Account closure requests from Premium tier → retention team first
- Legal/subpoena requests → compliance team, never discuss with customer
- Customer threatens self-harm → crisis protocol: provide 988 Lifeline number, document, escalate to supervisor

## Fee Schedule (Updated March 2026)
- ATM withdrawal (in-network): free
- ATM withdrawal (out-of-network): $2.50
- Wire transfer (domestic): $15 (free for Plus/Premium)
- Wire transfer (international): $35
- Replacement card: $5 (free for Premium)
- Crypto trading fee: 1.5% per transaction
- Returned payment: $25

## Known Bugs (Internal Only)
- iOS app v4.2.1: balance sometimes shows yesterday's amount until pull-to-refresh
- Crypto price feed: 15-second delay from Coinbase API, customers may see different price than execution
- Push notifications for transfers >$10K sometimes delayed up to 2 hours
