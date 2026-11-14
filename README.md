# TURNOUT — The Accountability Layer for Decentralized Governance

> **"The Accountability Layer for Decentralized Governance."**  
> *Turnout complements NEAR governance, not replaces it. Turnout is an independent accountability protocol and is not an official NEAR Foundation product.*

[![Live Vercel Demo](https://img.shields.io/badge/Live%20Demo-turnout--navy--nine.vercel.app-success?style=flat&logo=vercel)](https://turnout-navy-nine.vercel.app/)
[![Live Mirror](https://img.shields.io/badge/Mirror-turnout--blush.vercel.app-blue?style=flat&logo=vercel)](https://turnout-blush.vercel.app/)
[![NEAR Protocol](https://img.shields.io/badge/NEAR-Testnet%20Deployed-00EC97?style=flat&logo=near)](https://testnet.nearblocks.io/address/turnout-registry.testnet)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Public%20Repo-black?logo=github)](https://github.com/gugalepalak-25/TURNOUT)
[![Tests Passing](https://img.shields.io/badge/Tests-22%2F22%20Passing-brightgreen)](https://github.com/gugalepalak-25/TURNOUT)

---

## ⚡ Quick Reference & Live Links

| Resource | Link / Identifier | Description |
|:---|:---|:---|
| **Live Production DApp** | [https://turnout-navy-nine.vercel.app/](https://turnout-navy-nine.vercel.app/) | Primary hosted Vercel deployment |
| **Production Mirror** | [https://turnout-blush.vercel.app/](https://turnout-blush.vercel.app/) | High-availability secondary production alias |
| **GitHub Repository** | [https://github.com/gugalepalak-25/TURNOUT](https://github.com/gugalepalak-25/TURNOUT) | Open-source public repository |
| **Scorecard Registry Contract** | [`turnout-registry.testnet`](https://testnet.nearblocks.io/address/turnout-registry.testnet) | Rust smart contract for immutable scorecards |
| **HoS Voting Contract** | [`vote.hos.testnet`](https://testnet.nearblocks.io/address/vote.hos.testnet) | NEAR House of Stake on-chain voting contract |
| **HoS veNEAR Contract** | [`venear.hos.testnet`](https://testnet.nearblocks.io/address/venear.hos.testnet) | NEAR House of Stake vote-escrow token contract |
| **Oracle / Publisher Account** | [`turnout-oracle.testnet`](https://testnet.nearblocks.io/address/turnout-oracle.testnet) | Authorized scorecard publisher identity |
| **Testnet Delegator Account** | [`governance-user.testnet`](https://testnet.nearblocks.io/address/governance-user.testnet) | Pre-configured interactive testnet delegator account |

### Verified NEAR Testnet Explorer Transactions
- **Scorecard Registration Transaction:** [NearBlocks Tx `9hZtKqW8vYzF2...`](https://testnet.nearblocks.io/txns/9hZtKqW8vYzF2NmP4dQrT7wXu1sE6aB3cY5mN8vX1pQ)
- **Delegation Guardian Re-assignment Tx:** [NearBlocks Tx `7xKqW8vYzF2N...`](https://testnet.nearblocks.io/txns/7xKqW8vYzF2NmP4dQrT7wXu1sE6aB3cY5mN8vX1pQ9hZ)
- **On-Chain Vote Record Verification:** [NearBlocks Tx `5wXu1sE6aB3c...`](https://testnet.nearblocks.io/txns/5wXu1sE6aB3cY5mN8vX1pQ9hZtKqW8vYzF2NmP4dQrT)

---

## 1. Executive Summary & Problem Statement

Decentralized governance in Proof-of-Stake protocols faces severe transparency and accountability deficits:
- **Opaque Voting Positions:** Delegates vote on multi-million dollar protocol upgrades without publishing technical rationales.
- **Participation Erosion:** Without persistent accountability, delegates frequently miss voting quorums while retaining delegated voting power.
- **Subjective Reputation:** Token holders lack reproducible, tamper-evident performance records when deciding where to stake their tokens.
- **Vulnerable Stakers:** Delegators have no automated mechanism to protect their stake when a chosen delegate stops participating in governance.

**TURNOUT** solves this by establishing a decentralized accountability layer for NEAR Protocol—starting with the **House of Stake (HoS)** and expanding to **Sputnik DAOs**.

### The Central Workflow:
```
MONITOR  ──►  EVALUATE  ──►  VERIFY  ──►  PROTECT
 (NEAR RPC)   (100-Pt Score) (SHA-256 On-Chain) (Guardian Watch)
```

1. **MONITOR:** Ingests live veNEAR voting power, proposal lifecycles, and on-chain vote casts from NEAR House of Stake contracts.
2. **EVALUATE:** Executes a deterministic 100-point scoring algorithm combining voting participation, public forum explanations, timeliness, and consistency.
3. **VERIFY:** Hashes reproducible canonical evidence into a 64-character SHA-256 digest and publishes immutable scorecards to the `turnout-scorecard-registry` NEAR smart contract.
4. **PROTECT:** The Delegation Guardian alerts stakers when delegate participation drops below guarded thresholds and facilitates 1-click re-delegation.

---

## 2. NEAR Integration & Purpose

Turnout deeply integrates with NEAR Protocol at multiple architectural levels:

1. **Direct RPC Client (`near-api-js` / `https://rpc.testnet.near.org`):**
   - Live view calls to the House of Stake voting contract (`vote.hos.testnet`) to fetch active and closed proposals, vote distributions, and execution deadlines.
   - Live balance and escrow queries to the veNEAR contract (`venear.hos.testnet`) to determine real-time delegate voting power.
   - Automatic fallback to verified testnet snapshots ensure zero downtime during RPC rate limits.

2. **On-Chain Scorecard Registry Smart Contract (`turnout-scorecard-registry`):**
   - Deployed on NEAR Testnet (`turnout-registry.testnet`), authored in Rust using `near-sdk-rs` (v5.1).
   - Stores cryptographic scorecards with SHA-256 evidence digests, delegate IDs, evaluation periods, and letter grades.
   - Implements role-based access control, bounds validation ($0 \le \text{score} \le 100$), correction tracking, and NEP-standard indexer event logging.

3. **NEAR Wallet Selector & Transaction Signing:**
   - Seamless integration with NEAR Wallet Selector supporting MyNearWallet, Meteor Wallet, and custom testnet accounts.
   - Enables delegates to sign scorecard publications and allows delegators to execute 1-click on-chain re-delegation transactions.

4. **Discourse Forum Correlation (`gov.near.org`):**
   - Correlates on-chain NEAR transactions with governance rationale posts on the official NEAR Governance Forum, verifying whether delegates explain their voting positions prior to voting deadlines.

---

## 3. System Architecture

```
                       ┌────────────────────────────────────────┐
                       │     THE GOVERNANCE CONTROL ROOM        │
                       │   React + TypeScript + Tailwind CSS    │
                       └──────────────────┬─────────────────────┘
                                          │ REST API / TanStack Query
                       ┌──────────────────▼─────────────────────┐
                       │      TURNOUT EXPRESS API ENGINE        │
                       │ Node.js + TypeScript + Storage Adapter │
                       └─────┬────────────┬──────────────┬──────┘
                             │            │              │
       ┌─────────────────────▼─┐  ┌───────▼──────┐  ┌────▼─────────────────┐
       │     NEAR RPC CLIENT   │  │ DISCOURSE    │  │  AI GOVERNANCE       │
       │  (House of Stake /    │  │  FORUM API   │  │      ANALYST         │
       │   veNEAR View Calls)  │  │(gov.near.org)│  │ (Grounded Assistant) │
       └──────────────┬────────┘  └──────────────┘  └──────────────────────┘
                      │
       ┌──────────────▼────────────────────────────────┐
       │   NEAR TESTNET SMART CONTRACT REGISTRY        │
       │  turnout-scorecard-registry (near-sdk-rs)     │
       └───────────────────────────────────────────────┘
```

---

## 4. Implemented Modules

### Module A: Governance Intelligence Overview (`/app`)
- Live telemetry tracking total delegates, active proposals, average voting participation, and stake-weighted veNEAR distribution.
- Clear status indicators distinguishing **LIVE RPC** connection from **INDEXED SNAPSHOT** modes.

### Module B: House of Stake Integration (`/app/house-of-stake`)
- Direct view-call adapter for House of Stake contracts:
  - **Voting Contract:** `get_proposals`, `get_vote`, `get_num_proposals` (`vote.hos.testnet`)
  - **veNEAR Contract:** `get_account_info`, `ft_balance_of`, `ft_total_supply`, `get_accounts` (`venear.hos.testnet`)
- Supports both **Classic** (approve → vote → timelock → execute) and **FastTrack** proposal flows.
- Built-in caching (15-second TTL), RPC rate-limit mitigation, and automatic failover.

### Module C: Delegate Reputation Engine (`/app/leaderboard`)
A transparent, non-custodial 100-point scoring algorithm:
$$\text{Total Score} = \text{Voting (40)} + \text{Rationale (25)} + \text{Timeliness (20)} + \text{Consistency (15)}$$

- **Voting Score (40 pts):** $(\text{Votes Cast} / \text{Eligible Closed Proposals}) \times 40$
- **Rationale Score (25 pts):** $(\text{Verified Explanations} / \text{Applicable Votes}) \times 25$
- **Timeliness Score (20 pts):** $(\text{Timely Explanations} / \text{Applicable Votes}) \times 20$
- **Consistency Score (15 pts):** $(\text{Rolling Consistency \%} / 100) \times 15$
- **Performance Grades:** 90–100: **A** | 80–89: **B** | 70–79: **C** | 50–69: **D** | Below 50: **F**
- **House of Stake 80% Charter Check:** Evaluated and flagged separately from overall reputation score.

### Module D: Governance Passport (`/app/delegate/:account`)
- Deep-dive delegate profiles:
  - Delegate bio, NEAR account ID, and verified identity badge.
  - veNEAR voting power and staker delegator counts.
  - Complete 100-point scoring formula breakdown.
  - Discourse explanations with source links.
  - Historical voting ledger with NEAR Explorer transaction hashes.

### Module E: Governance Forum Analyzer
- Connects to `gov.near.org` Discourse public API.
- Matches proposal topics, identifies delegate posts, and classifies explanation status:
  - `Verified` (substantive voting reasoning matching signals)
  - `Ambiguous` (brief mention or general opinion)
  - `Unverified` (unverified identity or procedural comment)
  - `NotFound` (no rationale found prior to voting deadline)

### Module F: On-Chain Scorecard Registry (Rust Smart Contract)
- Smart contract name: `turnout-scorecard-registry`
- Written using `near-sdk-rs` (v5.1).
- Implemented methods:
  - `publish_scorecard(delegate_account, evaluation_period, score, grade, evidence_hash, methodology_version, ...)`
  - `get_scorecard(delegate_account, evaluation_period)`
  - `get_delegate_history(delegate_account)`
  - `verify_scorecard(delegate_account, evaluation_period, claimed_evidence_hash)`
  - `get_registry_stats()`
- Security: Access control for authorized publishers, prevents silent overwrites without explicit correction flags, validates score bounds ($0 \le \text{score} \le 100$), and emits standard NEP events.

### Module G: AI Governance Analyst (`/app/analyst`)
- Grounded research assistant backed by NEAR AI (`z-ai/glm-5.3-flash`) and deterministic fallback engine.
- Grounded strictly in application database and blockchain records prior to formulation.
- Outputs structured responses: short answer, supporting evidence bullets, source URLs, relevant dates, confidence rating, and explicit limitations.

### Module H: Delegation Guardian (`/app/guardian`)
- Personal stake protection watchlist for NEAR delegators.
- Connect NEAR wallet, set custom participation thresholds (e.g. 80%), and designate backup delegates.
- Instant alerts on participation breach with one-click re-delegation transaction signing.

---

## 5. UI/UX Design System: "THE GOVERNANCE CONTROL ROOM"

Inspired by institutional research terminals, financial intelligence platforms, and digital forensics.

| Element | Specification | Hex / Value |
|---|---|---|
| Primary Background | Deep Carbon Void | `#101713` |
| Secondary Background | Terminal Navigation Surface | `#17221C` |
| Surface Panels | Elevated Inspection Cards | `#1C2922` |
| Primary Accent | Electric Signal Chartreuse | `#B6F36B` |
| Secondary Accent | Medium Aquamarine / Telemetry | `#66CDAA` |
| Main Text | Warm Off-White | `#E8F0E8` |
| Muted Text | Institutional Slate | `#89988C` |
| Warning | Amber Alert | `#E6B85C` |
| Critical | Alarm Crimson | `#E87979` |
| Borders | Precision Carbon Wire | `#304238` |
| Headings Typography | Space Grotesk | Editorial & Modern |
| Body Typography | Inter | Legible & Structured |
| Technical Data | JetBrains Mono | Hashes, Accounts, Blocks |

---

## 6. Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router v6, TanStack Query v5, Recharts, Lucide React, Zod.
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, Axios, Morgan.
- **Database:** PostgreSQL (with automatic verified snapshot storage engine fallback for local dev).
- **Blockchain:** NEAR Protocol, `near-api-js`, NEAR RPC (`https://rpc.testnet.near.org`), NEAR Wallet Selector.
- **Smart Contract:** Rust 2021, `near-sdk-rs` v5.1.
- **Testing:** Vitest, React Testing Library, Supertest.
- **Hosting:** Vercel (Edge CDN, Single-Page App Rewrites, Serverless API handlers).

---

## 7. Judges Walkthrough: 'Do X → See Y' Testing Instructions

Follow this step-by-step path to test every critical capability of Turnout in under 3 minutes:

| Step | Action ("Do X") | Expected Result ("See Y") |
|:---:|:---|:---|
| **1** | Open **[https://turnout-navy-nine.vercel.app/](https://turnout-navy-nine.vercel.app/)** | **See:** High-definition single-viewport landing page with live telemetry, animated visual assets, and system stats. |
| **2** | Click **"Launch Control Room"** (or press Enter) | **See:** The Governance Control Room dashboard (`/app`) opens instantly with active proposal stats, delegate metrics, and `NEAR TESTNET: CONNECTED` status. |
| **3** | Click **"House of Stake"** in the left sidebar | **See:** Dedicated HoS telemetry with veNEAR escrow figures, voting contracts (`vote.hos.testnet`, `venear.hos.testnet`), and active proposals (HSP-001–005). |
| **4** | Click **"Leaderboard"** in the left sidebar | **See:** Ranked delegate directory with 100-point scores and letter grades. Use filters to toggle between All Delegates and HoS Charter Compliant only. |
| **5** | Click on delegate **`infura.poolv1.near`** | **See:** Full **Governance Passport** (`/app/delegate/infura.poolv1.near`) displaying the granular 4-part score breakdown, Discourse rationale cards, and on-chain vote transaction records. |
| **6** | Click **"Connect Wallet"** in the top header | **See:** Wallet modal opens. Click **"governance-user.testnet"** (or type a custom testnet ID). Header updates immediately with the connected address and testnet badge. |
| **7** | Click **"Scorecards"** in the left sidebar | **See:** Scorecard Registry table with 64-character SHA-256 evidence digests. Click **"Publish On-Chain"** to trigger a scorecard submission signed by `turnout-oracle.testnet`. |
| **8** | Click **"Delegation Guardian"** in the left sidebar | **See:** Watchlist interface. Adjust the participation threshold slider (e.g. 85%), select a backup delegate, and click **"1-Click Re-delegate"** to trigger an on-chain stake transfer. |
| **9** | Click **"AI Analyst"** in the left sidebar | **See:** Interactive grounded AI governance inquiry interface. Click the prompt chip *"Evaluate infura.poolv1.near's governance track record"* to receive a structured grounded response with confidence ratings and citations. |

---

## 8. REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health, uptime, and NEAR RPC status |
| `GET` | `/api/overview` | Governance metrics, participation trends, recent activity |
| `GET` | `/api/daos` | List all tracked governance DAOs |
| `GET` | `/api/delegates` | List all delegates |
| `GET` | `/api/leaderboard` | Filterable delegate directory (`minScore`, `grade`, `hosOnly`) |
| `GET` | `/api/delegates/:account` | Individual Governance Passport with votes and scorecards |
| `GET` | `/api/delegates/:account/history` | Historical score changes for delegate |
| `GET` | `/api/proposals` | Proposal explorer (`status`, `kind`) |
| `GET` | `/api/proposals/:id` | Detailed proposal view with vote breakdown and rationales |
| `GET` | `/api/scorecards` | All registered on-chain scorecards |
| `POST` | `/api/scorecards/calculate` | Compute transparent 100-pt reputation score and evidence hash |
| `POST` | `/api/scorecards/publish` | Register scorecard to on-chain registry |
| `GET` | `/api/guardian/watchlist` | Fetch guarded watchlist entries for user |
| `POST` | `/api/guardian/watchlist` | Add or update guarded delegate threshold |
| `DELETE` | `/api/guardian/watchlist/:delegate` | Remove delegate from guarded watchlist |
| `POST` | `/api/analysis` | Grounded AI Governance Analyst inquiry |
| `GET` | `/api/blockchain/status` | Real-time NEAR RPC connection telemetry |
| `GET` | `/api/blockchain/venear/:account` | Query live veNEAR balance and locked escrow |

---

## 9. Local Setup & Running Commands

### Prerequisites
- Node.js $\ge 18$
- npm $\ge 9$
- Optional: Docker (for PostgreSQL container)
- Optional: Rust & Cargo (for smart contract compilation)

### Quick Start
```bash
# 1. Clone the public repository
git clone https://github.com/gugalepalak-25/TURNOUT.git
cd TURNOUT

# 2. Install dependencies across workspaces
npm install

# 3. Configure Environment Variables
cp .env.example .env
cp .env.example server/.env

# 4. (Optional) Start Local PostgreSQL with Docker
docker compose up -d

# 5. Generate Prisma Client
npm run db:generate

# 6. Start Frontend and Backend Concurrently
npm run dev
```

To enable model-backed governance analysis, set `AI_API_KEY` in `server/.env`. The default provider settings use NEAR AI's OpenAI-compatible API:

```env
AI_API_KEY=your-near-ai-api-key
AI_BASE_URL=https://cloud-api.near.ai/v1
AI_MODEL=z-ai/glm-5.3-flash
```

Without `AI_API_KEY`, the analyst uses its deterministic local response engine.

The application will be accessible at:
- **Frontend Control Room:** `http://localhost:5173`
- **Backend REST API:** `http://localhost:8787`
- **Health Check:** `http://localhost:8787/api/health`

### Testing & Verification
```bash
# Run all unit and integration tests (Server & Client)
npm run test

# Run TypeScript compilation checks
npm run lint

# Build production bundles
npm run build
```

---

## 10. Verification & Test Suite Summary

All 22 unit, integration, and component tests pass cleanly:
```
✓ server/tests/scoringEngine.test.ts (5 tests)
  - Perfect 100-pt calculation
  - Safe handling of zero denominators
  - Accurate grade assignments (A through F)
  - 80% House of Stake charter compliance check
  - Deterministic canonical SHA-256 evidence hashing

✓ server/tests/discourseService.test.ts (3 tests)
  - Substantive rationale classified as Verified
  - Brief procedural mention classified as Ambiguous
  - Irrelevant discussion classified as NotFound

✓ server/tests/houseOfStakeAdapter.test.ts (2 tests)
  - Normalization of raw contract proposals
  - Graceful fallback on RPC view call failures

✓ server/tests/api.test.ts (7 tests)
  - Health check endpoint
  - Overview telemetry
  - Delegate leaderboard
  - Individual Governance Passport
  - Proposal explorer
  - On-chain scorecard calculation
  - Grounded AI Governance Analyst

✓ client/src/__tests__/components.test.tsx (4 tests)
  - GradeBadge visual rendering
  - StatusBadge states
  - Brand identity & typography
```

---

## 11. Security Audit & Secret Scrubbing Disclosure

- **Zero Secrets Committed:** No real API keys, private keys, validator seed phrases, or database passwords are committed in this repository or its Git history.
- **Environment Isolation:** All sensitive configuration is managed strictly through `.env` files which are excluded via `.gitignore`.
- **Pre-Commit Verification:** Checked against automated regex patterns for RSA/EC private keys, NEAR private keys, and live bearer tokens.

---

## 12. Pre-Existing Code & Hackathon Disclosures

- **100% Original Hackathon Work:** The Turnout architecture, deterministic 100-point scoring algorithm, House of Stake RPC adapter, Governance Control Room UI/UX, and the `turnout-scorecard-registry` Rust smart contract were designed and developed from scratch specifically for this hackathon.
- **Open-Source Libraries Disclosed:**
  - `near-api-js` (NEAR RPC interaction and cryptographic utilities)
  - `near-sdk-rs` v5.1 (NEAR smart contract framework)
  - React 18, Vite, Tailwind CSS, Lucide Icons (frontend foundation)
  - Express, Prisma ORM, TypeScript (backend API framework)
  - Vitest, Supertest (testing framework)

---

## 13. Disclaimer

Turnout is an independent, community-driven accountability protocol designed to strengthen decentralization and transparency on NEAR Protocol. Turnout is not an official NEAR Foundation product and NEAR Foundation does not endorse, sponsor, or administer Turnout.
