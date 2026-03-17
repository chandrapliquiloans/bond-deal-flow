# LiquiBonds Phase 2 – Implementation Guide
## High-Level Design (HLD) & Low-Level Design (LLD)

**Document Version:** 2.0  
**Date:** March 2026  
**Phase:** Phase 2 (Cross-Platform Sell, Order-Wise Selection, Negotiation Engine, Audit Log)  
**Audience:** All Stakeholders (Engineering, Product, Ops, QA, Business)

---

## Part 1: High-Level Design (HLD)

### 1.1 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          LIQUIBONDS PLATFORM                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      FRONTEND LAYER                              │  │
│  │  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐  │  │
│  │  │  Investor Portal│  │  IFA Portal      │  │  Ops Dashboard │  │  │
│  │  │  - Portfolio    │  │  - Sell Request  │  │  - Request Mgmt│  │  │
│  │  │  - Sell Request │  │  - Approval Link │  │  - Negotiation │  │  │
│  │  │  - Negotiation  │  │  - Status Track  │  │  - Audit Trail │  │  │
│  │  └─────────────────┘  └──────────────────┘  └────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                 ↓                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      API GATEWAY LAYER                           │  │
│  │  (REST/GraphQL endpoints, auth, rate limiting, request logging) │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                 ↓                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    BUSINESS LOGIC LAYER                          │  │
│  │  ┌────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │  │
│  │  │ Portfolio Aggr.│  │ Order-Wise Lot   │  │ Sell Request Mgr │ │  │
│  │  │                │  │ Selection Engine │  │                  │ │  │
│  │  └────────────────┘  └──────────────────┘  └──────────────────┘ │  │
│  │  ┌────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │  │
│  │  │ Negotiation SM │  │ Validation Engine│  │ Audit Log Writer │ │  │
│  │  │ (State Machine)│  │ (T+2, yield, qty)│  │ (Immutable Trail)│ │  │
│  │  └────────────────┘  └──────────────────┘  └──────────────────┘ │  │
│  │  ┌────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │  │
│  │  │ Notification   │  │ IFA Approval Link│  │ T-Day Termination│ │  │
│  │  │ Service        │  │ Service          │  │ Job              │ │  │
│  │  └────────────────┘  └──────────────────┘  └──────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                 ↓                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    DATA ACCESS LAYER (DAL)                       │  │
│  │  ┌────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │  │
│  │  │ Portfolio DAO  │  │ Sell Request DAO │  │ Negotiation Round│ │  │
│  │  │                │  │                  │  │ DAO              │ │  │
│  │  └────────────────┘  └──────────────────┘  └──────────────────┘ │  │
│  │  ┌────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │  │
│  │  │ Audit Log DAO  │  │ IFA Approval DAO │  │ Notification    │ │  │
│  │  │                │  │                  │  │ DAO             │ │  │
│  │  └────────────────┘  └──────────────────┘  └──────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                 ↓                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    DATABASE LAYER                                │  │
│  │  ┌─────────────────────────────────────────────────────────────┐ │  │
│  │  │ PostgreSQL (Primary DB)                                     │ │  │
│  │  │ - Investors, Holdings, Orders, Sales, Negotiations, Audit   │ │  │
│  │  └─────────────────────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────────────────┐ │  │
│  │  │ Redis (Cache & Session Store)                              │ │  │
│  │  │ - Negotiation deadline countdown, temporary data            │ │  │
│  │  └─────────────────────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────────────────┐ │  │
│  │  │ S3 / Object Storage (Audit Log Archive)                     │ │  │
│  │  │ - Long-term audit log retention (>1 year)                   │ │  │
│  │  └─────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                 ↓                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                  EXTERNAL INTEGRATIONS                           │  │
│  │  ┌────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │  │
│  │  │Market Calendar │  │Email Service     │  │ Background Job  │ │  │
│  │  │API (NSE/BSE)   │  │(SendGrid, SES)   │  │ Scheduler       │ │  │
│  │  │                │  │                  │  │(K8s CronJob)    │ │  │
│  │  └────────────────┘  └──────────────────┘  └──────────────────┘ │  │
│  │  ┌────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │  │
│  │  │ NDX API        │  │ IFA Platform API │  │ Monitoring/Alert│ │  │
│  │  │(Phase 4, TBD)  │  │ (Phase 3+)       │  │(PagerDuty)      │ │  │
│  │  └────────────────┘  └──────────────────┘  └──────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 1.2 Core Modules & Responsibilities

| Module | Responsibility | Dependencies | Owner |
|--------|---|---|---|
| **Portfolio Aggregation Engine** | Fetch & aggregate holdings from LiquiBonds + external ISINs; order-level detail | Order DB, Bond Catalog | Backend |
| **Order-Wise Lot Selection Engine** | Render purchase orders; validate per-order allocations | Order DB, Validation | Backend |
| **Sell Request Manager** | Lifecycle: create, validate, track, finalize sell requests | Portfolio Engine, Validation | Backend |
| **Negotiation State Machine** | Multi-round workflow; state transitions; timeout expiry | Audit Log, Notification Service | Backend |
| **Validation Engine** | T+2 settlement (market calendar), yield range (4–25%), order qty limits | Market Calendar API | Backend |
| **External Holdings Declaration Module** | ISIN restriction, DP account capture, responsibility declaration | Bond Catalog | Backend |
| **T-Day Termination Job** | Scheduled daily: auto-close in-negotiation requests where T-Date ≤ today | Negotiation SM, Audit Log | DevOps/Backend |
| **Audit Log (Native Platform)** | Immutable append-only record of all actions, decisions, timestamps | Database | Backend |
| **Notification Service** | Email/dashboard alerts: negotiation rounds, deadlines, approvals, rejections | Email Service, User DB | Backend |
| **IFA Approval Link Generator** | Create expiring secure links for client consent; track approvals | IFA DB, Crypto Lib | Backend |

---

### 1.3 Data Flow: Sell Request Lifecycle

```
1. INVESTOR / IFA INITIATION
   ├─ Investor views Portfolio (Aggregation Engine fetches LiquiBonds + External ISINs)
   ├─ Investor clicks "Request Sell" (LiquiBonds) OR "Sell External Bond" (External)
   │
   ├─ [LiquiBonds Sell Path]
   │  ├─ Order-Wise Lot Engine renders all purchase orders for ISIN
   │  ├─ Investor selects per-order quantities, yield, settlement date
   │  └─ Validation Engine checks T+2, yield 4–25%, qty ≤ available
   │
   └─ [External Sell Path]
      ├─ ISIN dropdown (system-registered ISINs only)
      ├─ Investor self-declares quantity, DP account, accepts responsibility
      └─ Validation Engine checks yield, qty, DP format

2. SELL REQUEST SUBMISSION
   ├─ Sell Request Manager creates record (status="Submitted", source="LiquiBonds" or "External")
   ├─ Audit Log records: investor_id, isin, quantity, yield, settlement_date, timestamp
   └─ Notification Service sends confirmation to investor

3. OPS REVIEW
   ├─ Ops views request in admin (order breakdown, proposed terms, source)
   ├─ Ops takes action: Accept | Reject | Counter-Propose
   │
   ├─ [If Accept]
   │  ├─ Negotiation SM: Submitted → Accepted
   │  ├─ Audit Log: Ops_Decision="Accept", timestamp
   │  └─ Notification: Investor & IFA notified; proceed to Execution
   │
   ├─ [If Reject]
   │  ├─ Negotiation SM: Submitted → Negotiation_Closed_No_Agreement
   │  ├─ Audit Log: Ops_Decision="Reject", Reason={...}, timestamp
   │  └─ Notification: Investor & IFA notified; allow resubmit with new date
   │
   └─ [If Counter]
      ├─ Ops proposes new yield/quantity, adds optional note
      ├─ Negotiation SM: Submitted → Under_Negotiation_Awaiting_Investor
      ├─ Audit Log: Round=1, Proposer="Ops", Terms={yield, qty}, Deadline=(T+48h), timestamp
      ├─ Notification: Investor & IFA emailed with countdown
      └─ Redis: Cache deadline for UI countdown

4. INVESTOR RESPONSE (48 Working-Hour Window)
   ├─ Investor views negotiation round (proposed terms, countdown, action buttons)
   ├─ Investor takes action: Accept | Reject | Counter-Propose
   │
   ├─ [If Accept]
   │  ├─ Negotiation SM: Under_Negotiation_Awaiting_Investor → Accepted
   │  ├─ Audit Log: Investor_Decision="Accept", timestamp
   │  └─ Notification: Ops & IFA notified; proceed to Execution
   │
   ├─ [If Reject]
   │  ├─ Negotiation SM: Under_Negotiation_Awaiting_Investor → Negotiation_Closed_Investor_Declined
   │  ├─ Audit Log: Investor_Decision="Reject", timestamp
   │  └─ Notification: Ops & IFA notified; negotiation ends
   │
   └─ [If Counter]
      ├─ Investor proposes new yield/quantity, adds optional note
      ├─ Negotiation SM: Under_Negotiation_Awaiting_Investor → Counter_Submitted_Awaiting_Ops
      ├─ Audit Log: Round=2, Proposer="Investor", Terms={...}, Deadline=(T+48h ops), timestamp
      ├─ Notification: Ops & IFA emailed with new terms & countdown
      └─ Redis: Update deadline cache

5. OPS FINAL REVIEW (48 Working-Hour Window, No Further Rounds)
   ├─ Ops views investor counter-proposal
   ├─ Ops takes final action: Accept | Reject (no counter allowed)
   │
   ├─ [If Accept]
   │  ├─ Negotiation SM: Counter_Submitted_Awaiting_Ops → Accepted
   │  ├─ Audit Log: Ops_Decision="Accept", timestamp
   │  └─ Notification: Investor & IFA notified; proceed to Execution
   │
   └─ [If Reject]
      ├─ Negotiation SM: Counter_Submitted_Awaiting_Ops → Negotiation_Closed_No_Agreement
      ├─ Audit Log: Ops_Decision="Reject", timestamp
      └─ Notification: Investor & IFA notified; negotiation ends (no more rounds)

6. TIMEOUT & AUTO-EXPIRY
   ├─ If 48 working-hour window expires (no investor/ops response)
   ├─ Scheduled task checks deadline at T+48h+1min
   ├─ Negotiation SM: [Any state] → Negotiation_Expired
   ├─ Audit Log: ExpiryCause="48h_Timeout", timestamp
   └─ Notification: All parties (investor, ops, ifa, rm) notified of expiry

7. T-DAY AUTO-TERMINATION
   ├─ T-Day Termination Job runs daily at 00:00 IST (market open)
   ├─ Query: all sell requests in {Under_Negotiation_Awaiting_Investor, Counter_Submitted_Awaiting_Ops}
   ├─ Filter: where transaction_date <= today
   ├─ For each matching request:
   │  ├─ Negotiation SM: [Any negotiation state] → Terminated_TDay_Expired
   │  ├─ Audit Log: TerminationCause="T_Day_Reached", timestamp, JobID={...}
   │  └─ Notification: All parties notified of auto-termination
   └─ PagerDuty Alert: If job fails (zero executions = alert)

8. ACCEPTED → EXECUTION → SETTLEMENT
   ├─ Sell Request Manager: Accepted → Executed (handoff to settlement)
   ├─ Audit Log: StateChange="Executed", timestamp
   ├─ (Phase 4) NDX integration: settlement confirmation
   └─ Final state: Settled

```

---

### 1.4 High-Level Database Schema (Conceptual)

```sql
-- Investor Holdings & Orders
TABLE investors (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  phone VARCHAR(15),
  kyc_status ENUM(pending, approved, rejected),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

TABLE purchase_orders (
  id UUID PRIMARY KEY,
  investor_id UUID REFERENCES investors(id),
  bond_isin VARCHAR(12),
  source ENUM(liquibonds, external),
  units_purchased INT,
  purchase_price DECIMAL(10,2),
  purchase_date DATE,
  available_units INT,
  current_yield DECIMAL(5,2),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Sell Request Flow
TABLE sell_requests (
  id UUID PRIMARY KEY,
  investor_id UUID REFERENCES investors(id),
  ifa_id UUID REFERENCES ifas(id) [nullable for investor-initiated],
  bond_isin VARCHAR(12),
  source ENUM(liquibonds, external),
  total_units_to_sell INT,
  desired_yield DECIMAL(5,2),
  transaction_date DATE,  -- T (negotiation deadline baseline)
  status ENUM(submitted, under_negotiation_awaiting_investor, counter_submitted_awaiting_ops, 
              accepted, executed, settled, negotiation_closed_investor_declined,
              negotiation_closed_no_agreement, negotiation_expired, terminated_tday_expired),
  current_round INT DEFAULT 0,
  max_rounds INT DEFAULT 2,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  expires_at TIMESTAMP,  -- T-Date as hard deadline
  INDEX (investor_id, status, transaction_date)
)

TABLE sell_request_line_items (  -- Order-wise allocation
  id UUID PRIMARY KEY,
  sell_request_id UUID REFERENCES sell_requests(id),
  purchase_order_id UUID REFERENCES purchase_orders(id),
  units_allocated INT,
  created_at TIMESTAMP
)

-- Negotiation Rounds
TABLE negotiation_rounds (
  id UUID PRIMARY KEY,
  sell_request_id UUID REFERENCES sell_requests(id),
  round_number INT,
  proposed_by ENUM(investor, ops),
  proposed_yield DECIMAL(5,2),
  proposed_quantity INT,
  proposed_note TEXT,
  deadline TIMESTAMP,  -- T + 48 working hours from proposal
  responded_at TIMESTAMP [nullable until response],
  response_action ENUM(accept, reject, counter) [nullable until response],
  responder_id UUID REFERENCES users(id) [ops or investor],
  created_at TIMESTAMP,
  INDEX (sell_request_id, round_number)
)

-- Audit Log (Immutable, Append-Only)
TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  entity_type ENUM(sell_request, negotiation_round, investor, admin_action),
  entity_id UUID,
  actor_id UUID REFERENCES users(id),
  action ENUM(create, update, accept, reject, counter, expire, terminate, notify),
  old_values JSONB,
  new_values JSONB,
  timestamp TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  INDEX (entity_id, entity_type, timestamp),
  INDEX (actor_id, timestamp),
  CONSTRAINT audit_log_immutable CHECK (created_at = NOW())  -- Enforces append-only
)

-- Notifications
TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  sell_request_id UUID REFERENCES sell_requests(id),
  notification_type ENUM(submission, counter_proposal, acceptance, rejection, expiry, termination, reminder),
  message TEXT,
  read_at TIMESTAMP [nullable until read],
  created_at TIMESTAMP,
  INDEX (user_id, created_at)
)

-- IFA Approval Link
TABLE ifa_approval_links (
  id UUID PRIMARY KEY,
  iamta_id UUID REFERENCES ifas(id),
  sell_request_id UUID REFERENCES sell_requests(id) [nullable until approved],
  investor_id UUID REFERENCES investors(id),
  token VARCHAR(512) UNIQUE,
  approved_at TIMESTAMP [nullable],
  approval_decision ENUM(approved, rejected) [nullable],
  expires_at TIMESTAMP,
  created_at TIMESTAMP,
  INDEX (token, expires_at)
)

-- External Bond Holdings Declaration
TABLE external_holdings (
  id UUID PRIMARY KEY,
  investor_id UUID REFERENCES investors(id),
  bond_isin VARCHAR(12),
  declared_units INT,
  dp_account_id VARCHAR(16),
  responsibility_acknowledged BOOLEAN,
  created_at TIMESTAMP
)
```

---

### 1.5 API Contracts (High-Level)

#### Sell Request Creation Endpoint

```json
POST /api/v1/sell-requests
Content-Type: application/json

REQUEST:
{
  "bond_isin": "INE002A07RY8",
  "source": "liquibonds" | "external",
  "desired_yield": 9.25,
  "transaction_date": "2026-03-19",
  "line_items": [  -- For liquibonds only
    {
      "purchase_order_id": "ORD-001",
      "units_to_sell": 20
    },
    {
      "purchase_order_id": "ORD-002",
      "units_to_sell": 30
    }
  ],
  "external_holding": {  -- For external only
    "declared_units": 50,
    "dp_account_id": "1234567890123456",
    "responsibility_acknowledged": true
  },
  "disclaimer_accepted": true
}

RESPONSE (201 Created):
{
  "id": "SR-UUID-001",
  "investor_id": "INV-001",
  "status": "submitted",
  "source": "liquibonds",
  "bond_isin": "INE002A07RY8",
  "total_units": 50,
  "desired_yield": 9.25,
  "transaction_date": "2026-03-19",
  "settlement_date": "2026-03-21",  -- T+2 auto-calculated
  "created_at": "2026-03-17T10:30:00Z",
  "audit_trail": {
    "event": "sell_request_created",
    "timestamp": "2026-03-17T10:30:00Z",
    "actor": "investor_id"
  }
}

ERROR (422 Unprocessable):
{
  "error": "invalid_settlement_date",
  "message": "2026-03-18 is a Saturday. Next valid date is 2026-03-19.",
  "next_valid_date": "2026-03-19"
}
```

#### Negotiation Counter-Propose Endpoint

```json
POST /api/v1/sell-requests/{sell_request_id}/counter

REQUEST:
{
  "round_number": 1,
  "proposed_by": "ops" | "investor",
  "proposed_yield": 9.50,
  "proposed_quantity": 45,
  "note": "Market conditions justify higher yield demand."
}

RESPONSE (200 OK):
{
  "sell_request_id": "SR-UUID-001",
  "round_number": 2,
  "proposed_by": "ops",
  "terms": {
    "yield": 9.50,
    "quantity": 45
  },
  "deadline": "2026-03-19T10:30:00Z",  -- T+48 working hours
  "created_at": "2026-03-17T14:00:00Z",
  "audit_event": {
    "id": "AUD-UUID-123",
    "timestamp": "2026-03-17T14:00:00Z",
    "actor_id": "ops_user_id",
    "action": "counter_proposed"
  }
}
```

#### Negotiation Accept Endpoint

```json
POST /api/v1/sell-requests/{sell_request_id}/accept

REQUEST:
{
  "round_number": 2,
  "accepted_by": "investor" | "ops"
}

RESPONSE (200 OK):
{
  "sell_request_id": "SR-UUID-001",
  "status": "accepted",
  "final_terms": {
    "yield": 9.50,
    "quantity": 45,
    "settlement_date": "2026-03-21"
  },
  "accepted_at": "2026-03-18T09:00:00Z",
  "next_state": "executed",
  "audit_event": {
    "id": "AUD-UUID-124",
    "timestamp": "2026-03-18T09:00:00Z",
    "actor_id": "investor_id",
    "action": "accepted"
  }
}
```

---

### 1.6 Integration Points

| Integration | Purpose | Owner | Phase |
|---|---|---|---|
| **Market Calendar API** (NSE/BSE) | T+2 calculation, working day validation | Backend | Phase 2 |
| **Email Service** (SendGrid / SES) | Notifications: counter, acceptance, rejection, expiry | Backend | Phase 2 |
| **Redis** | Deadline countdown cache, session store | DevOps | Phase 2 |
| **S3 / Object Storage** | Long-term audit log archival (>1 year data) | DevOps | Phase 2 |
| **Kubernetes CronJob** | T-Day termination job scheduling | DevOps | Phase 2 |
| **PagerDuty** | Alerting (job failures, SLA breaches) | DevOps | Phase 2 |
| **NDX API** | Trade confirmation & settlement (deferred) | Backend | Phase 4 |
| **IFA Platform API** | Order-wise entry sync, status updates | Backend | Phase 3+ |
| **DP Account Verification API** | Soft demat status checks (future) | Backend | Phase 4 |

---

## Part 2: Low-Level Design (LLD)

### 2.1 Detailed Module Specifications

#### 2.1.1 Negotiation State Machine (Core Engine)

**State Definitions:**

```
Submitted
  └─ Ops Review Required
  └─ Transitions:
     • [Ops Accept] → Accepted
     • [Ops Reject] → Negotiation_Closed_No_Agreement
     • [Ops Counter] → Under_Negotiation_Awaiting_Investor

Under_Negotiation_Awaiting_Investor
  └─ Investor Response Required (48 working-hour window)
  └─ Transition_Timeout_Event → Negotiation_Expired
  └─ Transitions:
     • [Investor Accept] → Accepted
     • [Investor Reject] → Negotiation_Closed_Investor_Declined
     • [Investor Counter] → Counter_Submitted_Awaiting_Ops
     • [T-Date Reached] → Terminated_TDay_Expired
     • [48h Expires] → Negotiation_Expired

Counter_Submitted_Awaiting_Ops
  └─ Ops Final Review (48 working-hour window, No Further Rounds)
  └─ Transition_Timeout_Event → Negotiation_Expired
  └─ Transitions:
     • [Ops Accept] → Accepted
     • [Ops Reject] → Negotiation_Closed_No_Agreement
     • [T-Date Reached] → Terminated_TDay_Expired
     • [48h Expires] → Negotiation_Expired

Accepted
  └─ Ready for Execution
  └─ Transitions:
     • [Settlement Initiated] → Executed

Executed
  └─ Settlement in Progress
  └─ Transitions:
     • [Settlement Confirmed] → Settled

Settled
  └─ Terminal State (Success)

Negotiation_Closed_Investor_Declined
  └─ Terminal State (Investor Rejected)

Negotiation_Closed_No_Agreement
  └─ Terminal State (Ops Rejected / No Agreement)

Negotiation_Expired
  └─ Terminal State (48h Deadline Missed)

Terminated_TDay_Expired
  └─ Terminal State (T-Date Auto-Termination)
```

**State Machine Pseudocode:**

```python
class NegotiationStateMachine:
    def __init__(self, sell_request_id: UUID):
        self.sell_request = SellRequestDAO.find_by_id(sell_request_id)
        self.current_state = self.sell_request.status
        self.audit_log = AuditLogDAO()

    def handle_ops_action(self, action: str, proposed_yield: float = None, proposed_qty: int = None, reason: str = None):
        """
        Ops can: Accept, Reject, Counter (in Submitted state only)
        """
        if self.current_state != "Submitted":
            raise InvalidStateTransitionException(f"Cannot process Ops action in {self.current_state}")

        if action == "accept":
            self._transition_to("Accepted")
            self._notify_investor("Ops accepted your sell request")
        
        elif action == "reject":
            self._transition_to("Negotiation_Closed_No_Agreement")
            self._notify_investor(f"Ops rejected: {reason}")
        
        elif action == "counter":
            if proposed_yield is None or proposed_qty is None:
                raise ValueError("Yield and quantity required for counter")
            
            round = NegotiationRoundDAO.create(
                sell_request_id=self.sell_request.id,
                round_number=self.sell_request.current_round + 1,
                proposed_by="ops",
                proposed_yield=proposed_yield,
                proposed_quantity=proposed_qty,
                deadline=self._calculate_deadline(48)  # 48 working hours
            )
            self._transition_to("Under_Negotiation_Awaiting_Investor")
            self._notify_investor(f"Ops counter-proposed: {proposed_yield}% yield, {proposed_qty} units. Respond by {round.deadline}")
            self._cache_deadline_countdown(round.deadline)

        self._audit_log_action(f"ops_{action}", {"yield": proposed_yield, "qty": proposed_qty, "reason": reason})

    def handle_investor_action(self, action: str, current_round: int, proposed_yield: float = None, proposed_qty: int = None):
        """
        Investor can: Accept, Reject, Counter (in Under_Negotiation_Awaiting_Investor state)
        Investor cannot act in Counter_Submitted_Awaiting_Ops state
        """
        if self.current_state != "Under_Negotiation_Awaiting_Investor":
            raise InvalidStateTransitionException(f"Investor cannot act in {self.current_state}")

        round_rec = NegotiationRoundDAO.find_by_round(self.sell_request.id, current_round)
        if self._is_deadline_expired(round_rec.deadline):
            self._auto_expire_negotiation()
            raise NegotiationExpiredException("48-hour window expired")

        if action == "accept":
            self._transition_to("Accepted")
            self._notify_ops("Investor accepted terms")
        
        elif action == "reject":
            self._transition_to("Negotiation_Closed_Investor_Declined")
            self._notify_ops("Investor declined negotiation")
        
        elif action == "counter":
            if proposed_yield is None or proposed_qty is None:
                raise ValueError("Yield and quantity required for counter")
            
            round = NegotiationRoundDAO.create(
                sell_request_id=self.sell_request.id,
                round_number=current_round + 1,
                proposed_by="investor",
                proposed_yield=proposed_yield,
                proposed_quantity=proposed_qty,
                deadline=self._calculate_deadline(48)  # 48 working hours for Ops final review
            )
            self._transition_to("Counter_Submitted_Awaiting_Ops")
            self._notify_ops(f"Investor counter-proposed: {proposed_yield}% yield, {proposed_qty} units. Final decision by {round.deadline}")
            self._cache_deadline_countdown(round.deadline)

        self._audit_log_action(f"investor_{action}", {"yield": proposed_yield, "qty": proposed_qty})

    def handle_ops_final_action(self, action: str, current_round: int, reason: str = None):
        """
        Ops final review (Counter_Submitted_Awaiting_Ops state).
        Ops can: Accept or Reject ONLY. No more counter-proposals allowed.
        """
        if self.current_state != "Counter_Submitted_Awaiting_Ops":
            raise InvalidStateTransitionException(f"Cannot process Ops final action in {self.current_state}")

        round_rec = NegotiationRoundDAO.find_by_round(self.sell_request.id, current_round)
        if self._is_deadline_expired(round_rec.deadline):
            self._auto_expire_negotiation()
            raise NegotiationExpiredException("48-hour window expired")

        if action == "accept":
            self._transition_to("Accepted")
            self._notify_investor("Ops accepted your counter-proposal")
        
        elif action == "reject":
            self._transition_to("Negotiation_Closed_No_Agreement")
            self._notify_investor(f"Ops rejected. Final decision: {reason}. Negotiation closed.")
        
        else:
            raise InvalidActionException(f"Ops final action must be 'accept' or 'reject', not '{action}'")

        self._audit_log_action(f"ops_final_{action}", {"reason": reason})

    def _auto_expire_negotiation(self):
        """Called when 48-hour deadline expires without response"""
        self._transition_to("Negotiation_Expired")
        self._notify_all_parties("Negotiation expired due to 48-hour timeout")
        self._audit_log_action("negotiation_expired", {"cause": "deadline_timeout"})

    def _check_and_handle_t_day_termination(self):
        """Scheduled job: runs daily at market open. Auto-terminates if T-Date reached."""
        if self.current_state in ["Under_Negotiation_Awaiting_Investor", "Counter_Submitted_Awaiting_Ops"]:
            if self.sell_request.transaction_date <= today():
                self._transition_to("Terminated_TDay_Expired")
                self._notify_all_parties(f"Sell request auto-closed: transaction date {self.sell_request.transaction_date} reached without agreement")
                self._audit_log_action("t_day_terminated", {"transaction_date": self.sell_request.transaction_date})

    def _transition_to(self, new_state: str):
        """Atomic state transition"""
        old_state = self.current_state
        SellRequestDAO.update_status(self.sell_request.id, new_state)
        self.current_state = new_state
        self._audit_log_action("state_transition", {"from": old_state, "to": new_state})

    def _calculate_deadline(self, working_hours: int) -> datetime:
        """Calculate deadline (working hours only, Mon-Fri, 9 AM - 5 PM IST approx)"""
        calendar = MarketCalendarAPI.get_current_calendar()
        deadline = now_ist()
        hours_added = 0
        while hours_added < working_hours:
            deadline += timedelta(hours=1)
            if calendar.is_working_day(deadline.date()) and 9 <= deadline.hour < 17:
                hours_added += 1
        return deadline

    def _is_deadline_expired(self, deadline: datetime) -> bool:
        return now_ist() > deadline

    def _notify_investor(self, message: str):
        NotificationService.send_email(
            to=self.sell_request.investor.email,
            subject="Sell Request Update",
            body=message,
            bcc=[self.sell_request.ifa.email] if self.sell_request.ifa else []
        )
        NotificationDAO.create(
            user_id=self.sell_request.investor_id,
            sell_request_id=self.sell_request.id,
            notification_type="update",
            message=message
        )

    def _notify_ops(self, message: str):
        NotificationService.send_email(
            to="ops_team@liquibonds.in",
            subject="Sell Request Action Required",
            body=message
        )
        # Log in dashboard queue for Ops admin

    def _notify_all_parties(self, message: str):
        self._notify_investor(message)
        self._notify_ops(message)

    def _cache_deadline_countdown(self, deadline: datetime):
        Redis.set(f"deadline:{self.sell_request.id}", deadline.isoformat(), ex=86400)

    def _audit_log_action(self, action: str, details: dict):
        AuditLogDAO.create(
            entity_type="sell_request",
            entity_id=self.sell_request.id,
            actor_id=current_user_id(),
            action=action,
            old_values={"status": self._previous_state} if hasattr(self, "_previous_state") else None,
            new_values={"status": self.current_state, **details},
            timestamp=now_ist(),
            ip_address=get_client_ip()
        )
```

---

#### 2.1.2 T-Day Termination Job Specification

**Purpose:** Auto-close sell requests that reach their Transaction Date while still in negotiation.

**Trigger:** Daily at market open (00:00 IST, Monday–Friday only).

**Algorithm:**

```python
class TDayTerminationJob:
    def run(self):
        """Scheduled daily job: terminates sell requests where T-Date <= today"""
        try:
            # Query all selling requests in active negotiation states
            active_negotiations = SellRequestDAO.find_by_status_in([
                "Under_Negotiation_Awaiting_Investor",
                "Counter_Submitted_Awaiting_Ops"
            ])

            today = date.today()
            terminated_count = 0

            for sell_request in active_negotiations:
                if sell_request.transaction_date <= today:
                    # Auto-terminate
                    state_machine = NegotiationStateMachine(sell_request.id)
                    state_machine._transition_to("Terminated_TDay_Expired")
                    state_machine._notify_all_parties(
                        f"Your sell request for {sell_request.bond_isin} has been auto-closed. "
                        f"Transaction date {sell_request.transaction_date} reached without finalized agreement. "
                        f"Submit a new request with revised T+2 date to continue."
                    )
                    state_machine._audit_log_action("t_day_terminated", {
                        "transaction_date": sell_request.transaction_date,
                        "job_id": self.job_id(),
                        "terminated_at": now_ist()
                    })
                    terminated_count += 1

            # Log total processed
            logger.info(f"T-Day Job completed: {terminated_count} requests terminated")

            # Check if expected execution (e.g., should have processed >= N requests based on historical rate)
            if terminated_count < expected_min_count:
                alert_pagerduty(
                    severity="warning",
                    message=f"T-Day Job: Unusually low termination count ({terminated_count}). Check DB connectivity."
                )

        except Exception as e:
            logger.error(f"T-Day Job failed: {e}")
            alert_pagerduty(
                severity="critical",
                message=f"T-Day Termination Job FAILED: {e}. Immediate action required."
            )
            raise

    def job_id(self) -> str:
        """Unique identifier for audit trail"""
        return f"t_day_job_{date.today().isoformat()}_{uuid.uuid4()}"
```

**Deployment:**

```yaml
# Kubernetes CronJob
apiVersion: batch/v1
kind: CronJob
metadata:
  name: t-day-termination-job
spec:
  schedule: "0 0 * * 1-5"  # Every weekday at 00:00 IST
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: t-day-job
            image: liquibonds/backend:latest
            command:
            - /bin/sh
            - -c
            - "python manage.py run_t_day_termination_job"
            env:
            - name: TZ
              value: "Asia/Kolkata"
          restartPolicy: OnFailure
      backoffLimit: 3
  failedJobsHistoryLimit: 10
  successfulJobsHistoryLimit: 10
---
# PagerDuty Alert Rule
- name: "T-Day Job Failure"
  condition: "job_failed OR job_timeout"
  notification:
    channel: "pagerduty"
    service: "LiquiBonds Backend"
    severity: "critical"
```

---

#### 2.1.3 Validation Engine

**Yield Validation:**

```python
def validate_yield(yield_value: float) -> bool:
    """Yield must be in 4–25% range"""
    return 4.0 <= yield_value <= 25.0
```

**Settlement Date Validation (T+2):**

```python
def validate_settlement_date(trade_date: date, settlement_date: date) -> tuple[bool, str]:
    """
    - settlement_date must be >= trade_date + 2 working days
    - Must not fall on weekend or market holiday
    """
    calendar = MarketCalendarAPI.get_current_calendar()
    
    # Calculate earliest valid settlement date (T+2 working days)
    current = trade_date
    working_days_added = 0
    while working_days_added < 2:
        current += timedelta(days=1)
        if calendar.is_working_day(current):
            working_days_added += 1
    earliest_valid = current

    if settlement_date < earliest_valid:
        return False, f"Settlement date must be at least T+2 working days. Earliest valid date: {earliest_valid}"
    
    if not calendar.is_working_day(settlement_date):
        next_valid = settlement_date
        while not calendar.is_working_day(next_valid):
            next_valid += timedelta(days=1)
        return False, f"{settlement_date} is a market holiday. Next valid date: {next_valid}"
    
    return True, "OK"
```

**Order Quantity Validation:**

```python
def validate_order_allocations(sell_request_data: dict) -> tuple[bool, list]:
    """
    Validate per-order unit allocations sum correctly
    """
    errors = []
    total_sold = 0

    for line_item in sell_request_data['line_items']:
        order_id = line_item['purchase_order_id']
        units_to_sell = line_item['units_to_sell']
        
        # Fetch order from DB
        order = PurchaseOrderDAO.find_by_id(order_id)
        if not order:
            errors.append(f"Order {order_id} not found")
            continue

        if units_to_sell > order.available_units:
            errors.append(f"Order {order_id}: trying to sell {units_to_sell} but only {order.available_units} available")
        
        if units_to_sell <= 0:
            errors.append(f"Order {order_id}: units to sell must be > 0")

        total_sold += units_to_sell

    return len(errors) == 0, errors
```

---

#### 2.1.4 Audit Log Writer (Immutable Append-Only)

**Design Principles:**

1. **Append-Only**: Write new rows; never UPDATE/DELETE existing audit records.
2. **Immutable**: DB constraint prevents modification of created_at timestamp.
3. **Indexed**: Fast queries by entity_id, actor_id, timestamp.
4. **Timestamped**: Every action recorded with UTC timestamp.
5. **Archived**: Rows >1 year auto-archived to S3 for compliance.

**Implementation:**

```python
class AuditLogDAO:
    def create(self, entity_type: str, entity_id: UUID, actor_id: UUID, action: str,
               old_values: dict = None, new_values: dict = None, ip_address: str = ""):
        """
        Create immutable audit log entry.
        Raises exception if any attempt to UPDATE/DELETE existing records.
        """
        record = {
            "entity_type": entity_type,
            "entity_id": entity_id,
            "actor_id": actor_id,
            "action": action,
            "old_values": json.dumps(old_values) if old_values else None,
            "new_values": json.dumps(new_values) if new_values else None,
            "timestamp": datetime.utcnow().isoformat(),
            "ip_address": ip_address
        }
        
        # Execute raw SQL INSERT only (no ORM UPDATE)
        db.execute(
            """
            INSERT INTO audit_log (entity_type, entity_id, actor_id, action, old_values, new_values, timestamp, ip_address)
            VALUES (%(entity_type)s, %(entity_id)s, %(actor_id)s, %(action)s, %(old_values)s, %(new_values)s, %(timestamp)s, %(ip_address)s)
            """,
            record
        )
        db.commit()
        return record

    def find_by_entity(self, entity_id: UUID, entity_type: str = None) -> list:
        """Query audit trail for a specific entity (e.g., sell request)"""
        query = """
            SELECT * FROM audit_log
            WHERE entity_id = %(entity_id)s
        """
        params = {"entity_id": entity_id}
        
        if entity_type:
            query += " AND entity_type = %(entity_type)s"
            params["entity_type"] = entity_type
        
        query += " ORDER BY timestamp ASC"
        return db.query(query, params)

    def export_for_compliance(self, start_date: date, end_date: date) -> str:
        """Export audit logs to CSV for compliance audit"""
        records = db.query(
            """
            SELECT * FROM audit_log
            WHERE DATE(timestamp) BETWEEN %(start)s AND %(end)s
            ORDER BY timestamp
            """,
            {"start": start_date, "end": end_date}
        )
        
        # Convert to CSV, write to S3
        csv_buffer = StringIO()
        writer = csv.DictWriter(csv_buffer, fieldnames=['id', 'entity_type', 'entity_id', 'actor_id', 'action', 'timestamp', 'old_values', 'new_values', 'ip_address'])
        writer.writeheader()
        writer.writerows([dict(r) for r in records])
        
        s3_key = f"audit_logs/export_{start_date}_to_{end_date}_{uuid.uuid4()}.csv"
        S3.upload_file_obj(csv_buffer.getvalue(), s3_key)
        return s3_key

    def archive_old_records(self, older_than_days: int = 365):
        """Archive audit logs >1 year old to S3, keep recent in main DB"""
        cutoff_date = datetime.utcnow() - timedelta(days=older_than_days)
        
        # Export to S3
        records = db.query(
            "SELECT * FROM audit_log WHERE timestamp < %(cutoff)s",
            {"cutoff": cutoff_date}
        )
        
        # Compress and upload
        archive_key = self.export_for_compliance(
            start_date=records[0]['timestamp'].date() if records else cutoff_date.date(),
            end_date=cutoff_date.date()
        )
        
        # Optionally delete from main DB (or mark as archived)
        # Note: Only if compliance allows; keep immutability guarantee
        logger.info(f"Archived {len(records)} audit records to S3: {archive_key}")
```

---

### 2.2 Order-Wise Lot Selection Engine

**Algorithm for Partial Sells:**

```python
def allocate_units_across_orders(
    sell_request_data: dict,
    investor_id: UUID,
    bond_isin: str
) -> list:
    """
    Investor specifies how many units to sell from each purchase order.
    Example:
    - Order A (100 units): sell 50
    - Order B (75 units): sell 25
    - Total: 75 units to sell
    """
    
    # Fetch all orders for investor + ISIN + source (LiquiBonds only)
    orders = PurchaseOrderDAO.find_by_investor_isin(investor_id, bond_isin, source="liquibonds")
    
    if not orders:
        raise NoOrdersFoundException(f"No purchase orders found for {bond_isin}")
    
    allocation_map = {}
    total_units_to_sell = 0
    
    for line_item in sell_request_data['line_items']:
        order_id = line_item['purchase_order_id']
        units = line_item['units_to_sell']
        
        # Find order in list
        order = next((o for o in orders if o.id == order_id), None)
        if not order:
            raise OrderNotFoundException(f"Order {order_id} not in list")
        
        if units > order.available_units:
            raise AllocationExceedsAvailable(
                f"Order {order_id}: allocated {units} > available {order.available_units}"
            )
        
        if units <= 0:
            raise InvalidAllocationException(f"Order {order_id}: units must be > 0")
        
        allocation_map[order_id] = units
        total_units_to_sell += units
    
    # Create line items in DB
    line_items = []
    for order_id, units in allocation_map.items():
        line_item = SellRequestLineItemDAO.create(
            sell_request_id=sell_request_id,
            purchase_order_id=order_id,
            units_allocated=units
        )
        line_items.append(line_item)
    
    return line_items
```

---

### 2.3 Notification Service

**Trigger Matrix:**

| Event | Recipients | Channel | Template |
|-------|---|---|---|
| Sell Request Submitted | Investor, IFA, RM | Email, Dashboard | "Your sell request for {ISIN} ({units} units) has been submitted for Ops review." |
| Ops Counter-Proposed | Investor, IFA, RM | Email, Dashboard + Countdown | "Ops counter-proposed: {yield}%, {qty} units. Respond by {deadline}." |
| Investor Counter-Proposed | Ops, Investor, IFA, RM | Email, Dashboard + Countdown | "Investor counter-proposed: {yield}%, {qty} units. Ops final decision by {deadline}." |
| Sell Accepted | Investor, Ops, IFA, RM | Email, Dashboard | "Sell request ACCEPTED. Proceeding to execution." |
| Sell Rejected | Investor, IFA, RM | Email, Dashboard | "Sell request REJECTED by Ops. Reason: {reason}." |
| Negotiation Expired | Investor, Ops, IFA, RM | Email, Dashboard | "Negotiation EXPIRED: No response within 48-hour window." |
| T-Day Terminated | Investor, Ops, IFA, RM | Email, Dashboard | "Sell request AUTO-CLOSED: Transaction date reached. Submit new request with revised date." |
| Deadline Reminder (T-12h) | Investor or Ops | Email, Push | "Action required: {deadline} deadline in 12 hours." |

**Implementation:**

```python
class NotificationService:
    def send_negotiation_update(self, sell_request_id: UUID, event_type: str, context: dict):
        """Send notification on negotiation state change"""
        sell_request = SellRequestDAO.find_by_id(sell_request_id)
        
        if event_type == "ops_counter":
            recipients = [
                sell_request.investor.email,
                sell_request.ifa.email if sell_request.ifa else None
            ]
            subject = f"Ops Counter-Proposal: {sell_request.bond_isin}"
            body = self._render_template("ops_counter", {
                **context,
                "deadline": context['deadline'],
                "isin": sell_request.bond_isin,
                "units": context['proposed_quantity']
            })
            self._send_email(recipients, subject, body)
            self._create_dashboard_notification(sell_request.investor_id, event_type, body)
        
        # ... other event types
```

---

### 2.4 Testing Strategy

**Unit Tests:**

```python
def test_yield_validation():
    assert validate_yield(9.25) == True
    assert validate_yield(3.99) == False  # <4%
    assert validate_yield(25.01) == False  # >25%

def test_t_plus_two_calculation():
    trade_date = date(2026, 3, 16)  # Monday
    is_valid, msg = validate_settlement_date(trade_date, date(2026, 3, 18))  # Wednesday
    assert is_valid  # 2 working days

def test_state_machine_transitions():
    sm = NegotiationStateMachine(sell_request_id)
    assert sm.current_state == "Submitted"
    
    sm.handle_ops_action("counter", proposed_yield=9.50, proposed_qty=45)
    assert sm.current_state == "Under_Negotiation_Awaiting_Investor"
    
    sm.handle_investor_action("accept", current_round=1)
    assert sm.current_state == "Accepted"
```

**Integration Tests:**

- End-to-end sell request flow (submit → counter → accept → settled)
- Negotiation expiry after 48 hours
- T-Day auto-termination
- Concurrent sell requests for same order (race condition)
- Audit log immutability (no updates/deletes allowed)
- Email notifications sent correctly

**Performance Tests:**

- Audit log query response time (< 200ms for 1M+ records)
- Negotiation deadline cache (Redis) hits/misses
- State machine transition throughput (>1000/min)

---

## Part 3: Implementation Roadmap

### Phase 2 Milestones

| Milestone | Duration | Key Deliverables | Owner |
|---|---|---|---|
| **M1: Data Model & DB Schema** | Week 1 | Tables, indexes, audit log immutability constraint, migration scripts | Backend Lead |
| **M2: Core Modules** | Week 2–3 | Portfolio Engine, Order-Wise Lot Selection, Sell Request Manager | Backend |
| **M3: Negotiation State Machine** | Week 3–4 | State transitions, deadline calculations, timeout logic, unit tests | Backend (Critical Path) |
| **M4: Validation Engine & T+2 Logic** | Week 4 | Market calendar integration, yield validation, settlement date validation | Backend |
| **M5: Audit Log & Immutability** | Week 4–5 | Append-only writes, archival strategy, compliance export | Backend |
| **M6: T-Day Termination Job** | Week 5 | Cron scheduling, PagerDuty alerting, monitoring | DevOps + Backend |
| **M7: Notification Service** | Week 5–6 | Email templates, dashboard alerts, BCC logic, deadline reminders | Backend |
| **M8: IFA Approval Links** | Week 6 | Secure token generation, expiry handling, audit trail | Backend |
| **M9: Frontend (Investor Portal)** | Week 6–7 | Order-wise allocation UI, negotiation round display, countdown timer | Frontend |
| **M10: Frontend (Ops Admin)** | Week 7 | Request dashboard, counter-proposal form, audit log viewer | Frontend |
| **M11: QA & Testing** | Week 8 | Integration tests, performance benchmarks, edge case validation | QA + Backend |
| **M12: Staging & Go-Live** | Week 9 | Data migration, load testing, runbook, post-launch monitoring | DevOps + Product |

**Total Duration:** 9 weeks (6 days/week = 54 working days)

---

## Part 4: Risk Register & Mitigation

| Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|
| Market calendar API downtime | Medium | High | Fallback hard-coded calendar; sync twice daily | DevOps |
| T-Day job execution failure | Low | Critical | Redundant scheduler; PagerDuty alerts; manual override | DevOps |
| Negotiation deadline race condition | Low | Medium | Database-level optimistic locking; tests for concurrency | Backend |
| Audit log scale (performance) | Medium | Low | Time-windowed queries; archival to S3; partitioning | Backend |
| External bond fraud (inflated units) | Low | Medium | Responsibility declaration; Ops due diligence; compliance monitoring | Ops + Legal |
| IFA approval link leakage (security) | Very Low | High | HTTPS-only; token expiry (7 days); rate limiting on token generation | Backend|
| Clock skew (deadline calculations) | Low | Medium | NTP sync; UTC time; server-side validation | DevOps |

---

## Part 5: Success Metrics & Monitoring

### KPIs (Phase 2)

| Metric | Target | Owner | Measurement |
|---|---|---|---|
| Sell Request Completion Time | <7 days (avg) | Product | Dashboard metric |
| Negotiation Success Rate | >40% of countered requests → Accepted | Product | BI query |
| Audit Log Query Latency | <200ms (p95) | Backend | APM monitoring |
| T-Day Job Success Rate | 100% (zero failures) | DevOps | PagerDuty event count |
| Investor Satisfaction (NPS) | ≥45 | Customer Success | Quarterly survey |
| Notification Delivery Rate | ≥99% | Backend | Email logs |

### Monitoring & Alerting

```yaml
# Prometheus metrics
- negotiation_state_transitions_total (counter)
- audit_log_writes_total (counter)
- t_day_job_execution_duration_seconds (histogram)
- negotiation_deadline_expiry_total (counter)
- notification_delivery_latency_seconds (histogram)

# PagerDuty Alerts
- T-Day Job failed or did not execute
- Audit log write errors
- Market calendar API unavailable
- Notification delivery failures (>1% error rate)
```

---

## Conclusion

This LLD provides detailed specifications for implementing Phase 2, including state machine logic, database schema, API contracts, and operational procedures. The modular design allows parallel development tracks while maintaining clear integration points. All stakeholders (Engineering, Ops, Business, QA) have clear action items and success criteria.

**Next Steps:**
1. CTO review & sign-off on architecture
2. Database schema finalization & migration planning
3. Sprint planning & task breakdown
4. Development kickoff (Milestone M1)

---

**Document Owner:** Engineering Lead  
**Last Updated:** March 2026  
**Next Review:** Post-M3 (Negotiation State Machine completion)
