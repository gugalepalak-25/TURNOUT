# TURNOUT — The Accountability Layer for Decentralized Governance

> **"The Accountability Layer for Decentralized Governance."**  
> *Turnout complements NEAR governance, not replaces it. Turnout is an independent accountability protocol and is not an official NEAR Foundation product.*

---

## 1. Executive Summary & Problem Statement

Decentralized governance in Proof-of-Stake protocols faces severe transparency and accountability deficits:
- **Opaque Voting Positions:** Delegates vote on multi-million dollar protocol upgrades without publishing technical rationales.
- **Participation Erosion:** Without persistent accountability, delegates frequently miss voting quorums while retaining delegated voting power.
- **Subjective Reputation:** Token holders lack reproducible, tamper-evident performance records when deciding where to stake their tokens.
- **Unearned Rewards:** Protocol governance grants and validator rewards often fail to account for active governance diligence.

**TURNOUT** solves this by establishing a decentralized accountability layer for NEAR Protocol—starting with the **House of Stake (HoS)** and expanding to **Sputnik DAOs**.

### The Central Workflow:
```
MONITOR  ──►  EVALUATE  ──►  VERIFY  ──►  REWARD  ──►  PROTECT
 (NEAR RPC)   (100-Pt Score) (SHA-256 On-Chain) (DAO Pool) (Guardian Watch)
```

1. **MONITOR:** Ingests live veNEAR voting power, proposal lifecycles, and on-chain vote casts from NEAR House of Stake contracts.
2. **EVALUATE:** Executes a deterministic 100-point scoring algorithm combining voting participation, public forum explanations, timeliness, and consistency.
3. **VERIFY:** Hashes reproducible canonical evidence into a 64-character SHA-256 digest and publishes immutable scorecards to the `turnout-scorecard-registry` NEAR smart contract.
4. **REWARD:** Calculates performance-proportional incentive distributions and generates formal DAO payout proposals.
5. **PROTECT:** The Delegation Guardian alerts stakers when delegate participation drops below guarded thresholds and facilitates 1-click re-delegation.

---

## 2. System Architecture

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

## 3. Implemented Modules

### Module A: Governance Intelligence
- Live telemetry overview tracking total delegates, active proposals, average voting participation, and stake-weighted veNEAR distribution.
- Clear indicators distinguishing **LIVE RPC** connection from **INDEXED SNAPSHOT** modes.

### Module B: House of Stake Integration
- Direct view-call adapter for House of Stake contracts:
  - **Voting Contract:** `get_proposals`, `get_vote`, `get_num_proposals`
  - **veNEAR Contract:** `get_account_info`, `ft_balance_of`, `ft_total_supply`, `get_accounts`
- Supports both **Classic** (approve → vote → timelock → execute) and **FastTrack** flows.
- Built-in caching (15-second TTL), RPC rate-limit mitigation, and automatic failover.

### Module C: Delegate Reputation Engine
A transparent, non-custodial 100-point scoring algorithm:
$$\text{Total Score} = \text{Voting (40)} + \text{Rationale (25)} + \text{Timeliness (20)} + \text{Consistency (15)}$$

- **Voting Score (40 pts):** $(\text{Votes Cast} / \text{Eligible Closed Proposals}) \times 40$
- **Rationale Score (25 pts):** $(\text{Verified Explanations} / \text{Applicable Votes}) \times 25$
- **Timeliness Score (20 pts):** $(\text{Timely Explanations} / \text{Applicable Votes}) \times 20$
- **Consistency Score (15 pts):** $(\text{Rolling Consistency \%} / 100) \times 15$
- **Performance Grades:** 90–100: **A** | 80–89: **B** | 70–79: **C** | 50–69: **D** | Below 50: **F**
- **House of Stake 80% Charter Check:** Evaluated and flagged separately from overall reputation score.

### Module D: Governance Passport
- Deep-dive delegate profiles (`/delegate/:account`):
  - Delegate bio, NEAR account ID, and verified identity badge.
  - veNEAR voting power and staker delegator counts.
  - Complete 100-point scoring formula breakdown.
  - Discourse explanations with source links.
  - Historical voting ledger with transaction hashes.

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

### Module G: AI Governance Analyst
- Server-side grounded research assistant (`POST /api/analysis`).
- Grounded strictly in application database and blockchain records prior to formulation.
- Outputs structured responses: short answer, supporting evidence bullets, source URLs, relevant dates, confidence rating, and explicit limitations.

### Module H: Reward Manager
- Performance-weighted epoch reward pool configuration (`/rewards`).
- Mathematical allocation: $\text{Share} = (\text{Score} / \sum \text{Eligible Scores}) \times \text{Reward Pool}$.
- Non-custodial security: generates formal on-chain payout proposals for DAO execution; the Turnout backend never has unilateral access to treasury funds.

### Module I: Delegation Guardian
- Personal stake protection watchlist (`/guardian`).
- Connect NEAR wallet, set custom participation thresholds (e.g. 80%), and designate backup delegates.
- Instant alerts on participation breach with one-click re-delegation transaction signing.

---

## 4. UI/UX Design System: "THE GOVERNANCE CONTROL ROOM"

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

## 5. Technical Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router v6, TanStack Query v5, Recharts, Lucide React, Zod.
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, Axios, Morgan.
- **Database:** PostgreSQL (with automatic verified snapshot storage engine fallback for local dev).
- **Blockchain:** NEAR Protocol, `near-api-js`, NEAR RPC, NEAR Wallet Selector.
- **Smart Contract:** Rust 2021, `near-sdk-rs` v5.1.
- **Testing:** Vitest, React Testing Library, Supertest.

---

## 6. Database Models (Prisma Schema)

Configured in `server/prisma/schema.prisma`:
1. `DAO`: Tracked governance DAOs and charter thresholds.
2. `Delegate`: Delegate identities, voting power, reputation scores, and grades.
3. `Proposal`: On-chain proposals, statuses, flows (Classic/FastTrack), and voting metrics.
4. `Vote`: Individual delegate voting records and block heights.
5. `Rationale`: Forum explanation snippets, status, timeliness, and confidence scores.
6. `Scorecard`: Period reputation scores, breakdown, grades, and evidence hashes.
7. `ScoreEvidence`: Raw JSON snapshots and metric counts.
8. `Delegation`: Guarded watchlist entries, thresholds, and backup delegates.
9. `RewardPool`: Reward pool budgets, minimum score requirements, and payout proposal payloads.
10. `RewardClaim`: Individual delegate reward allocations.
11. `WalletSession`: Active user session records.
12. `SyncState`: Ledger synchronization heights and health timestamps.

---

## 7. REST API Documentation

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
| `GET` | `/api/rewards` | Active reward pool and distribution breakdown |
| `POST` | `/api/rewards/calculate` | Simulate custom reward pool distribution and DAO proposal |
| `GET` | `/api/guardian/watchlist` | Fetch guarded watchlist entries for user |
| `POST` | `/api/guardian/watchlist` | Add or update guarded delegate threshold |
| `DELETE` | `/api/guardian/watchlist/:delegate` | Remove delegate from guarded watchlist |
| `POST` | `/api/analysis` | Grounded AI Governance Analyst inquiry |
| `GET` | `/api/blockchain/status` | Real-time NEAR RPC connection telemetry |
| `GET` | `/api/blockchain/venear/:account` | Query live veNEAR balance and locked escrow |

---

## 8. Local Setup & Running Commands

### Prerequisites
- Node.js $\ge 18$
- npm $\ge 9$
- Optional: Docker (for PostgreSQL container)
- Optional: Rust & Cargo (for smart contract compilation)

### Quick Start
```bash
# 1. Install dependencies across workspaces
npm install

# 2. Configure Environment Variables
cp .env.example .env
cp .env.example server/.env

# 3. (Optional) Start Local PostgreSQL with Docker
docker compose up -d

# 4. Generate Prisma Client
npm run db:generate

# 5. Start Frontend and Backend Concurrently
npm run dev
```

To enable model-backed governance analysis, set `AI_API_KEY` in `server/.env`. The default provider settings use NEAR AI's OpenAI-compatible API:

```env
AI_API_KEY=your-near-ai-api-key
AI_BASE_URL=https://cloud-api.near.ai/v1
AI_MODEL=z-ai/glm-5.3-flash
```

Without `AI_API_KEY`, the analyst uses its deterministic local response engine. If a configured provider call fails, the analysis endpoint returns an error instead of silently substituting a local response.

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

## 9. Verification & Test Suite Summary

All 22 unit, integration, and component tests pass cleanly:
```
✓ server/tests/scoringEngine.test.ts (5 tests)
  - Perfect 100-pt calculation
  - Safe handling of zero denominators
  - Accurate grade assignments (A through F)
  - 80% House of Stake charter compliance check
  - Deterministic canonical SHA-256 evidence hashing

✓ server/tests/rewardManager.test.ts (1 test)
  - Proportional performance-weighted pool distribution
  - Exclusion of ineligible delegates

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

## 10. Known Limitations & Roadmap

### Current Version (v1.0.0):
- **Discourse Heuristics:** Delegate identity mapping uses known username registries; manual verification requests are recorded for disputed identities.
- **Testnet RPC Isolation:** In environments without direct outbound network connectivity, Turnout gracefully transitions to its verified on-chain snapshot ledger without halting or fabricating data.

### Future Roadmap:
- **Phase 7:** Full Sputnik DAO multi-sig proposal ingestion and vote delegation.
- **Phase 8:** ZK-proofs for private voter explanation submissions via NEAR Shade Protocol.
- **Phase 9:** Automated smart contract slash-back integrations for persistent HoS charter absentees.

---

## 11. Disclaimer

Turnout is an independent, community-driven accountability protocol designed to strengthen decentralization and transparency on NEAR Protocol. Turnout is not an official NEAR Foundation product and NEAR Foundation does not endorse, sponsor, or administer Turnout.
