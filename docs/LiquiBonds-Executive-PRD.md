# LiquiBonds – Bond Sale & Investor Dashboard
## Executive PRD (Business & CTO Review)

**Document Version:** 1.0  
**Date:** March 2026  
**Audience:** Executive Stakeholders, Business Leads, CTO, Engineering Leadership

---

## Executive Summary

LiquiBonds is introducing a **complete buy-and-sell lifecycle** with cross-platform bond support, order-wise lot selection, multi-round structured negotiation, and a **platform-native audit log**—eliminating all Excel-based tracking and establishing LiquiBonds as the single source of truth for bond trading.

### Core Value Proposition
- **Investors**: Unified portfolio management across platforms; transparent, negotiated pricing; real-time visibility.
- **IFAs**: Direct sell request creation for clients with audit trails and client approval workflows.
- **Operations**: Transparent, auditable negotiation engine; reduced manual overhead; compliance-ready.
- **Business**: Higher transaction volume, increased user retention, competitive differentiation.

---

## Phase Overview

| Phase | Focus | Timeline | Impact |
|-------|-------|----------|--------|
| **Phase 1** | Basic sell (own-platform bonds), portfolio dashboard | Q2 2026 | MVP—foundation for user engagement |
| **Phase 2** | Cross-platform sell, order-wise selection, negotiation engine, audit log | Q3 2026 | Enable 40%+ cross-platform adoption |
| **Phase 3** | IFA-initiated sell + client approval flow | Q4 2026 | Drive IFA volume & engagement |
| **Phase 4** | NDX integration, enhanced DP verification | TBD | Seamless settlement & future-proof ops |

---

## Key Features & User Journeys

### 1. **Investor Portfolio & Sell Options**
- **Unified Dashboard**: Holdings from LiquiBonds + externally purchased bonds (ISINs registered in system).
- **Sell for LiquiBonds Bonds**: Order-by-order quantity selection + yield + settlement date (T+2 working days).
- **Sell External Bonds**: ISIN dropdown (system-registered only), self-declare quantity, DP account, responsibility declaration.
- **Status Tracking**: Real-time visibility of sell request lifecycle, negotiation rounds, deadlines.

### 2. **Order-Wise Lot Selection**
- Investors see all purchase orders for a given ISIN with (Order Date, Units, Price, Current Yield).
- Can allocate sale quantities **per order** (partial or full).
- Validation enforced: total ≤ available units, interactive feedback.
- Applied to both platform and external origin bonds.

### 3. **Multi-Round Negotiation Workflow**

#### Stages & Deadlines
1. **Ops Review** (Submitted) → Accept | Reject | Counter-Propose
2. **Investor Response** (Counter Proposed, 48 working-hour window) → Accept | Reject | Counter-Propose back
3. **Ops Final Review** (Investor Counter, 48 working-hour window) → Accept | Reject (no further rounds)
4. **Auto-Expiry**: No response within 48 working hours → Status: "Negotiation Expired"
5. **T-Day Auto-Termination**: If Transaction Date reaches = today & request still in negotiation → Auto-close with "Terminated – T-Day Expired"

#### Status Diagram
```
Submitted → Under Negotiation (Awaiting Investor)
  ├─ Investor Accepts → Accepted → Executed → Settled
  ├─ Investor Rejects → Negotiation Closed – Investor Declined
  ├─ Investor Counters → Counter Submitted (Awaiting Ops, 48h)
  │  ├─ Ops Accepts → Accepted
  │  ├─ Ops Rejects → Negotiation Closed – No Agreement
  │  └─ (Ops cannot counter again)
  └─ 48h Expiry → Negotiation Expired

Ops Rejects (Submitted) → Negotiation Closed – No Agreement

T-Day Expiry (any active stage) → Terminated – T-Day Expired
```

#### Key Rules
- **48 Working-Hour Windows**: Only Monday–Friday (market working days); clock pauses weekends/holidays.
- **T+2 Working-Day Settlement**: Auto-calculated; only valid future working days offered to users.
- **T-Day Termination Job**: Runs daily at market open (00:00 IST). Auto-closes any sell request where Transaction Date ≤ today and request is still in negotiation. Triggers notifications to all parties; logged in audit trail.
- **Audit Log**: Every action, proposal, rejection, counter, expiry, and termination is immutably logged with timestamps.

### 4. **Cross-Platform Sell (External Bonds)**
- **ISIN Restriction**: Investors can only sell bonds for ISINs **already registered in LiquiBonds** (no free-text ISIN entry).
- **Self-Declaration**: Investor declares quantity held on external platform (LiquiBonds cannot verify external broker holdings).
- **DP Account Collection**: Mandatory for external bonds; stored securely per regulatory standards.
- **Source Tagging**: Request flagged as "External Platform" for Ops scrutiny.
- **Eligible Check**: If requested ISIN not in system → message: *"This bond is not available for sale through LiquiBonds. Contact your advisor."*

### 5. **IFA-Initiated Sell**
- IFA specifies client, ISIN, order-wise allocations, yield, settlement date.
- System generates secure, expiring approval link sent to investor.
- Investor reviews & approves on their own login; standard sell workflow proceeds.
- All actions BCC-ed to IFA/RM; immutable audit trail maintained.

---

## Technical Architecture

### Core Modules

| Module | Responsibility | Criticality |
|--------|---|---|
| **Portfolio Aggregation** | Real-time calculation of holdings (LiquiBonds + external), order history, cashflows | HIGH |
| **Order-Wise Lot Engine** | Render purchase orders, validate per-order allocations, support partial/full splits | HIGH |
| **Sell Request Manager** | End-to-end lifecycle: creation, validation, status tracking, termination | HIGH |
| **Negotiation State Machine** | Multi-round workflow, deadline management, timeout expiry, transition rules | CRITICAL |
| **T-Day Termination Job** | Scheduled daily job: auto-terminate requests where T-Date ≤ today & in-negotiation | CRITICAL |
| **Validation Engine** | T+2 logic, market calendar integration, yield range (4–25%), order quantity limits | HIGH |
| **Audit Log (Native)** | Immutable platform-based history; replaces all Excel records | CRITICAL |
| **Notification Service** | Dashboard alerts, email notifications, BCC to IFA/RM, deadline reminders | HIGH |
| **IFA Approval Link Service** | Secure, expiring links; tracking of investor approval/rejection | MEDIUM |

### Data Flows

```
Investor Login → Portfolio Aggregation (LiquiBonds + External ISINs)
  → [Sell Request] → Order-Wise Lot Selection → Sell Request Manager
  → Validation Engine (T+2, yield, quantities)
  → Negotiation State Machine (Enter "Submitted" state)
  → [Ops Reviews] → Counter/Accept/Reject
  → [Multi-Round] → Investor Responds (48h deadline)
  → [Until Accepted/Expired/Declined]
  → Audit Log (every action, timestamp, actor)
  → Notifications (investor, ops, IFA, RM)
```

### Integration & External Dependencies

| Integration | Purpose | Risk |
|---|---|---|
| **Market Calendar API** | T+2 settlement date validation, negotiation window pauses | MEDIUM – Must be reliable; impacts deadline calculations |
| **NDX** | Post-settlement trade confirmations & reporting | MEDIUM – Only final phase; MVP does not require |
| **DP Account Verification API** | (Future) Soft-verify external holdings | LOW – Deferred to Phase 4 |
| **IFA Platform API** | Order-wise entry, sell status sync | MEDIUM – Depends on IFA platform roadmap |

---

## Edge Cases & Solutions

### Case 1: Investor Selects Orders That Exceed Available Units
- **Problem**: User allocates 150 units across orders but only 120 units held.
- **Solution**: Real-time validation UI + server-side enforcement. Display available units per order; disable over-allocation. Clear error message on submit.
- **Status**: ✅ **Resolvable**

---

### Case 2: Settlement Date Falls on Weekend or Public Holiday
- **Problem**: Investor selects T+2 date that is a market holiday.
- **Solution**: Integration with market calendar API. UI auto-skips weekends/holidays; only shows valid working days in date picker. Server-side validation rejects invalid dates.
- **Status**: ✅ **Resolvable** (requires market calendar data accuracy)

---

### Case 3: Negotiation 48-Hour Window Spans a Weekend
- **Problem**: Investor counters on Friday at 5 PM; 48-hour window includes Saturday–Sunday.
- **Solution**: Clock only counts working hours (Mon–Fri, market open). Deadline pauses Friday 5 PM → Monday 9 AM = 1 business day passed (not 2 calendar days). Negotiation engine tracks "working hours elapsed" internally.
- **Status**: ✅ **Resolvable** (requires precise working-day calculation)

---

### Case 4: T-Day Auto-Termination Job Fails at Market Open
- **Problem**: System outage at 00:00 IST; T-Day termination does not run. Request remains in negotiation past T-Date, creating settlement risk.
- **Solution**: 
  - Implement **redundant job scheduler** (e.g., Kubernetes CronJob + fallback cron).
  - Email alerting to engineering team if job fails.
  - Manual override endpoint for Ops to force termination if needed.
  - Audit log records all terminations (auto or manual).
- **Status**: ✅ **Resolvable** (requires ops discipline + monitoring)

---

### Case 5: Investor Submits Sell Request with External ISIN Not in LiquiBonds System
- **Problem**: Investor tries to sell a bond they hold externally, but ISIN is not registered in LiquiBonds.
- **Solution**: ISIN dropdown **only shows system-registered ISINs**. No free-text entry allowed. Clear message: *"This bond is not currently available for sale through LiquiBonds. Please contact your advisor."* Investor cannot proceed without system-registered ISIN.
- **Status**: ✅ **Resolvable** (UI/validation design)

---

### Case 6: IFA Initiates Sell for Client; Client Declines on Approval Link
- **Problem**: IFA creates sell request with client approval link; investor clicks link but rejects.
- **Solution**: Approval link tracks investor decision (approve/decline). If declined, sell request is **not created** and IFA is notified immediately. IFA can retry with modified terms or follow up with client.
- **Status**: ✅ **Resolvable**

---

### Case 7: Simultaneous Sell Requests for Same Bond (Race Condition)
- **Problem**: Investor submits two sell requests for the same ISIN order within seconds; total exceeds available units.
- **Solution**: 
  - Database-level locks on order quantity reservation during sell request submission.
  - Check available units **before** creating sell request; reserve units atomically.
  - If insufficient units, reject second request with message: *"Insufficient available units. X units already reserved in pending sale requests."*
- **Status**: ✅ **Resolvable** (database transaction design required)

---

### Case 8: Ops Proposes Counter with Yield Outside 4–25% Range
- **Problem**: Ops accidentally proposes 26% yield (outside acceptable range).
- **Solution**: Validation enforced on Ops side. Counter-propose form enforces min=4, max=25 on yield input. Server-side validation rejects out-of-range values with clear error message.
- **Status**: ✅ **Resolvable**

---

### Case 9: Investor Accepts Sell Request; Ops Simultaneously Rejects
- **Problem**: Race condition—investor clicks Accept at same moment Ops clicks Reject.
- **Solution**: 
  - State machine enforces **idempotency** and **atomic transitions**.
  - Only allow state transitions from current state; reject conflicting actions.
  - Audit log records both attempts; system accepts (sequentially) whichever action arrives first.
  - Loser notified: *"Action could not be completed; state changed by another user. Please refresh."*
- **Status**: ✅ **Resolvable** (requires strict state machine + audit logging)

---

### Case 10: External Bond Holder Self-Declares Inflated Quantity; No Verification
- **Problem**: Investor claims to hold 1000 units of external bond but actually holds 100. No LiquiBonds verification mechanism exists.
- **Solution**: 
  - **Accepted Limitation**: LiquiBonds restricts external bond sells to ISINs already in the system (known bonds). This filters out unknown/fraudulent bonds.
  - Investor must sign **responsibility declaration** acknowledging they hold the declared quantity and DP account is correct.
  - Ops can request DP account confirmation (soft check) before accepting.
  - Regulatory/compliance team monitors for patterns (e.g., repeated over-declaration from same investor).
  - **Cannot fully resolve programmatically**; relies on investor honesty + compliance monitoring.
- **Status**: ⚠️ **Partially Resolvable** — mitigated by responsibility declaration + Ops due diligence.

---

### Case 11: Market Calendar Data Is Outdated; New Holiday Not Reflected
- **Problem**: New market holiday announced (e.g., unexpected market closure); platform's calendar not updated. User selects "valid" T+2 date that is actually a holiday.
- **Solution**: 
  - **Automated calendar sync** from official market calendar provider (NSE/BSE API).
  - Manual override flag: Ops can force-close calendar for a specific date if needed.
  - Notification alert to engineering team if calendar update fails.
  - **Residual Risk**: Short delay (hours) between announcement and platform update; user might select invalid date.
- **Status**: ✅ **Resolvable** (requires operations discipline + alerting)

---

### Case 12: Investor No-Shows; 48-Hour Negotiation Window Expires
- **Problem**: Ops proposes counter on Monday; investor does not respond by Wednesday. Request auto-expires.
- **Solution**: 
  - Email reminder sent at T-12 hours before deadline.
  - Dashboard banner with countdown: *"Respond by \[Deadline\]. X hours remaining."*
  - Auto-expiry transitions request to "Negotiation Expired" with timestamp in audit log.
  - Investor can immediately re-submit with new T+2 date if desired.
  - **Expected behavior** per spec; no override needed.
- **Status**: ✅ **Resolvable**

---

### Case 13: Ops Approves Sell; Settlement Fails at NDX Stage
- **Problem**: Sell request reaches "Accepted" → "Executed" state. NDX integration fails during settlement; trade not confirmed.
- **Solution**: 
  - NDX integration includes **robust error handling** and **retry logic**.
  - If settlement fails, status reverts to "Execution Failed" (new state).
  - Ops is notified; can retry or manually intervene.
  - Audit log records all settlement attempts.
  - **Phase 1/2 MVP does not require NDX integration**; this is deferred to Phase 4.
- **Status**: ✅ **Resolvable** (Phase 4 responsibility)

---

### Case 14: Investor Modifies DP Account Info After External Sell Submission
- **Problem**: Investor submits sell request with DP account ending in ...123; later claims it should be ...456.
- **Solution**: 
  - DP account is **locked after submission**; investor cannot self-modify.
  - Investor must contact support or Ops to request change before settlement.
  - Audit log records all modifications; immutable trail for compliance.
  - Ops has override capability; all changes logged.
- **Status**: ✅ **Resolvable**

---

### Case 15: IFA Initiates Sell for Client; IFA Is Fired Before Approval
- **Problem**: IFA creates sell request + approval link for client. IFA account disabled/deleted before client approves.
- **Solution**: 
  - Approval link is **client-centric**, not IFA-centric. Remains valid even if IFA is deleted.
  - Once client approves on link, sell request is created (not dependent on IFA status).
  - Audit log records IFA as initiator; compliance can review if needed.
  - New IFA/RM can manage ongoing negotiation.
- **Status**: ✅ **Resolvable**

---

### Case 16: System Clock Skew; Negotiation Deadline Calculations Wrong
- **Problem**: Server clock is behind by 2 hours. 48-hour window expires early or extends unexpectedly.
- **Solution**: 
  - All timestamp logic uses **UTC time server** (NTP-synced).
  - Client-side countdown is **indicative only**; server is source of truth.
  - Validation enforces server-side deadline check on accept/reject actions.
  - Ops admin can see exact server timestamp for every action in audit log.
- **Status**: ✅ **Resolvable**

---

### Case 17: External Bond Sell Request Rejected by Ops; Investor Immediately Resubmits with Same ISIN & Units
- **Problem**: No "cooling-off period" between rejection and resubmission; investor floods with repetitive requests.
- **Solution**: 
  - No programmatic restriction; investor can resubmit immediately.
  - **Ops discipline**: If pattern detected, Ops can flag account & require manager review.
  - Audit log shows all resubmissions; transparency for compliance.
  - **Expected behavior**: Allowed, but monitored.
- **Status**: ✅ **Resolvable** (monitoring/compliance responsibility)

---

### Case 18: Audit Log Grows Unbounded; Query Performance Degrades
- **Problem**: After 2+ years, audit log has millions of records. Dashboard queries become slow.
- **Solution**: 
  - Implement **time-windowed queries** (default: last 90 days).
  - Archive old audit logs to separate storage (e.g., S3) for compliance audit.
  - Index on (investor_id, created_at) for fast pagination.
  - Ops reporting dashboard uses pre-aggregated summaries (daily/weekly batches) for long-term trends.
- **Status**: ✅ **Resolvable** (data architecture)

---

### Case 19: Investor's DP Account Has Insufficient Demat Capacity
- **Problem**: Investor declares external bond holding, but has no demat account or insufficient settlement capacity.
- **Solution**: 
  - **Phase 1/2**: Accept at face value (investor self-declares). Ops due diligence required.
  - **Phase 4**: (Optional) Soft DP account verification API can check demat status pre-settlement.
  - If no demat or insufficient capacity discovered at settlement, trade fails; Ops contacts investor for remedy.
  - Audit log records the issue.
- **Status**: ✅ **Resolvable** (Phase 4 enhancement; Phase 2 relies on compliance review)

---

### Case 20: Market Calendar API Goes Down; Platform Cannot Validate Dates
- **Problem**: System cannot reach market calendar API; T+2 validation and negotiation deadline calculations fail.
- **Solution**: 
  - **Fallback**: Hard-coded holiday list (updated quarterly) for unplanned API outages.
  - User sees warning: *"Date validation using cached calendar; confirm with Ops if uncertain."*
  - Engineering team alerted; prioritized restoration of calendar API.
  - **Residual Risk**: Stale calendar for a few hours. Acceptable if infrequent.
- **Status**: ✅ **Resolvable** (fallback design required)

---

## Known Unresolvable Issues & Accepted Limitations

### ❌ Issue 1: External Holdings Cannot Be Verified Programmatically
- **Problem**: No way to confirm investor actually holds X units on external platform.
- **Why Unresolvable**: External brokers do not expose holdings APIs for real-time verification. DP account verification (demat) is only available at settlement, not at request submission.
- **Mitigation**: 
  - Investor signs **responsibility declaration** (legal commitment).
  - ISIN restriction (only system-registered bonds) reduces fraud risk.
  - Ops spot-checks high-value or repeat external requests.
  - Compliance monitoring for patterns.
- **Impact**: **Medium** — Acceptable for MVP; enhanced DP verification deferred to Phase 4.

---

### ❌ Issue 2: 48-Hour Negotiation Deadline Cannot Account for Market Holidays Unknown in Advance
- **Problem**: A new market holiday announced mid-negotiation. Working-day clock calculation suddenly invalid.
- **Why Unresolvable**: Market holidays are not always announced far in advance (e.g., emergency closures).
- **Mitigation**: 
  - Use most current holiday calendar; periodically sync with NSE/BSE.
  - Ops has override capability; can manually extend deadline if holiday changes.
  - Document assumption: calendar data is accurate as of system update date.
- **Impact**: **Low** — Rare occurrence; Ops has manual override.

---

### ❌ Issue 3: T-Day Auto-Termination Job Reliability is Operationally Dependent
- **Problem**: Job must run **every business day** at exactly market open (00:00 IST). A single missed execution allows a sell request to stay in negotiation past T-Date, creating settlement risk.
- **Why Unresolvable**: Depends on infrastructure reliability, not software alone. System outages, database locks, clock issues can cause failures.
- **Mitigation**: 
  - Implement **redundant job scheduler** (Kubernetes + cron backup).
  - Alert engineering team via PagerDuty if job fails.
  - Manual override endpoint for Ops to force termination.
  - SLA Target: 100% job execution success rate.
- **Impact**: **High** — Critical operational responsibility. Requires disciplined ops monitoring & alerting.

---

### ❌ Issue 4: IFA-Initiated Sell Approval Link Expiry Not Granularly Configurable Per Request
- **Problem**: All approval links expire at a fixed duration (e.g., 7 days). CTO wants per-request configurable expiry.
- **Why Unresolvable**: Requires significant schema/workflow changes; adds complexity to Phase 3.
- **Mitigation**: 
  - Phase 2: Single expiry duration for all IFA approval links (e.g., 7 days).
  - Phase 3+: Consider per-request configurable expiry if business demand justifies.
- **Impact**: **Low** — Deferred enhancement. Fixed 7-day expiry acceptable for MVP.

---

### ❌ Issue 5: External Bond Sell Impacted by DP Account Typo or Fraud
- **Problem**: Investor provides incorrect or fraudulent DP account (e.g., \*\*\*456 instead of actual \*\*\*789). Settlement fails or funds go to wrong account.
- **Why Unresolvable**: Cannot programmatically validate DP account without external DP API (not available in Phase 2).
- **Mitigation**: 
  - Investor signs **responsibility declaration**.
  - Ops performs manual review before settlement (soft due diligence).
  - DP account verification API deferred to Phase 4.
  - Audit log records submitted DP account; compliance can investigate disputes.
- **Impact**: **Medium** — Handled by Ops due diligence + legal declaration. Enhanced in Phase 4.

---

### ❌ Issue 6: Negotiation Round Spam (No Limit on Counter Rounds)
- **Problem**: Spec limits Ops to **one** final counter (after investor counter), but doesn't prevent investor from countering endlessly.
- **Why Unresolvable**: Business may want flexible round limits; capping at 2 rounds total could frustrate negotiations.
- **Mitigation**: 
  - Phase 2 Spec: Investor can counter once; Ops can counter once more. No third round.
  - Phase 3: Review business metrics (avg rounds per accepted request) & adjust if needed.
  - Monitor for excessive back-and-forth; Ops can manually close negotiation.
- **Impact**: **Low** — Unlikely in practice. Monitored via audit log.

---

### ❌ Issue 7: No Built-In Rule to Prevent Yield Negotiation Spiral (Investor Always Increasing Demand)
- **Problem**: Investor keeps counter-proposing higher yields hoping Ops caves. No system logic to detect/block unreasonable patterns.
- **Why Unresolvable**: "Reasonable" yield range is subjective; business decides via market pricing.
- **Mitigation**: 
  - Validation enforces 4–25% yield range server-side (hard limit).
  - Ops can reject based on market conditions (judgment call).
  - Audit log shows yield trend; Ops/compliance can flag problematic patterns.
  - CRM/relationship team can intervene if needed.
- **Impact**: **Low** — Handled by Ops judgment. Audit trail provides visibility.

---

### ❌ Issue 8: No Cross-Platform Deduplication (Investor Sells Same Bond Twice from Two Platforms)
- **Problem**: Investor holds 100 units of ISIN X on Platform A and 100 units on Platform B. Both are submitted as external sells within seconds. Total sellable quantity requested = 200, but investor only wants 150.
- **Why Unresolvable**: LiquiBonds cannot see investor's holdings on Platform B to detect duplication.
- **Mitigation**: 
  - Investor responsibility to not double-sell (stated in responsibility declaration).
  - Ops spot-checks high-value requests for duplicates.
  - If investor tries to settle same units twice, settlement fails at DP/NDX; Ops investigates.
  - Audit log records both requests; compliance can correlate.
- **Impact**: **Medium** — Mitigated by investor declaration + Ops due diligence. DP settlement catches hard conflicts.

---

### ❌ Issue 9: Audit Log Cannot Be Tampered With (But Requires Infrastructure Commitment)
- **Problem**: If someone modifies the audit log database directly, the immutability claim is invalid.
- **Why Unresolvable**: 100% data integrity requires multi-layer access controls, encryption, and operational discipline beyond this PRD scope.
- **Mitigation**: 
  - Implement **database-level encryption** (at-rest + in-transit).
  - **Role-based access control**: Only Ops/Compliance via restricted accounts can query audit logs; no direct DB access for engineers.
  - **Immutable append-only writes**: Audit log table does not support UPDATE/DELETE, only INSERT.
  - **Regular cryptographic integrity checks** (hash verification).
  - **Compliance audits** of audit log access (quarterly).
- **Impact**: **High** — Requires infrastructure & ops discipline. Not just a code feature.

---

## Go-Live Checklist (High-Level)

### Phase 2 Pre-Launch Validation

- [ ] Market calendar API integrated & tested with real holidays.
- [ ] T-Day termination job runs successfully for 5+ consecutive business days.
- [ ] Negotiation state machine tested for all 8+ transitions (race conditions included).
- [ ] Audit log verified: 100% of user actions recorded with timestamps.
- [ ] Email notifications tested (investor, Ops, IFA, RM) for all trigger scenarios.
- [ ] Order-wise selection UI validates per-order limits in real-time.
- [ ] External ISIN dropdown restricted to system-registered bonds only.
- [ ] Business approval: negotiation round limits (Investor counters once; Ops final decision).
- [ ] Legal: responsibility declaration language approved.
- [ ] CTO approval: state machine design, database locks, audit architecture.
- [ ] SLA target confirmed: 98% negotiation deadline met (no expiry).
- [ ] PagerDuty alerts configured for T-Day job failures.

---

## Success Metrics (Target)

| Metric | Target | Owner |
|--------|--------|-------|
| Sell Request Audit Trail Completeness | 100% of events logged | Engineering |
| Cross-Platform Sell Adoption (90-day) | >30% of new sells | Product |
| Negotiation Success Rate | >40% of counter-proposed requests → Accepted | Product |
| Average Negotiation Rounds (Accepted) | <2.2 | Product Analytics |
| Negotiation Deadline SLA (no expiry) | ≥98% | Engineering / Ops |
| T-Day Termination Job Success Rate | 100% (zero missed executions) | Engineering / DevOps |
| Investor Satisfaction (Sell Flow) | NPS ≥45 | Customer Success |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Market calendar API downtime | Medium | High | Fallback hard-coded calendar; alerting |
| T-Day termination job failure | Low | Critical | Redundant scheduler; PagerDuty alert; manual override |
| External bond holder fraud (inflated claims) | Low | Medium | Responsibility declaration; Ops due diligence; compliance monitoring |
| Negotiation deadline calculations wrong (clock skew) | Low | Medium | UTC time server; server-side validation |
| Order simultaneous sell race condition | Very Low | Medium | Database-level locking; atomic transaction |
| Audit log query performance degrade (2+ years) | Medium | Low | Time-windowed queries; archival strategy; indexing |

---

## Questions for CTO & Business

### For CTO
1. **State Machine Complexity**: Are you confident the 8-state negotiation state machine can handle all edge cases (race conditions, expiry, termination)? Should we use a dedicated state machine library?
2. **Database Locking Strategy**: How should we lock order quantities during simultaneous sell requests? Optimistic vs. pessimistic locking acceptable?
3. **Audit Log Scale**: What's the expected write/query volume for audit logs? Do we need a separate analytics DB?
4. **Infrastructure**: Do we have 100% uptime SLA for the T-Day termination job? If not, what's acceptable residual risk?

### For Business
1. **Cross-Platform Adoption**: What's the realistic adoption target for external bond sells in Year 1? Should we restrict to specific bond types (e.g., only AAA-rated)?
2. **Negotiation Dynamics**: Are there bond characteristics (illiquid bonds, small cap, high yield) where we expect different negotiation patterns? Should Ops have fast-track approval for certain categories?
3. **IFA Economics**: Can IFAs charge commissions on external bond sells initiated through LiquiBonds? How do we enforce that in settlements?
4. **Compliance & Regulatory**: Are there RBI/SEBI implications for external bond hosting & self-declaration? Should we involve Legal/Compliance earlier?

---

## Appendix: State Machine Definition

```
States: Submitted, Under_Negotiation_Awaiting_Investor, Counter_Submitted_Awaiting_Ops,
         Accepted, Executed, Settled,
         Negotiation_Closed_Investor_Declined, Negotiation_Closed_No_Agreement,
         Negotiation_Expired, Terminated_TDay_Expired

Transitions:
  Submitted → [Ops Accept] → Accepted
  Submitted → [Ops Reject] → Negotiation_Closed_No_Agreement
  Submitted → [Ops Counter] → Under_Negotiation_Awaiting_Investor
  Under_Negotiation_Awaiting_Investor → [Investor Accept] → Accepted
  Under_Negotiation_Awaiting_Investor → [Investor Reject] → Negotiation_Closed_Investor_Declined
  Under_Negotiation_Awaiting_Investor → [Investor Counter] → Counter_Submitted_Awaiting_Ops
  Under_Negotiation_Awaiting_Investor → [48h Expiry] → Negotiation_Expired
  Counter_Submitted_Awaiting_Ops → [Ops Accept] → Accepted
  Counter_Submitted_Awaiting_Ops → [Ops Reject] → Negotiation_Closed_No_Agreement
  Counter_Submitted_Awaiting_Ops → [48h Expiry] → Negotiation_Expired
  
  [Any state in {Under_Negotiation_Awaiting_Investor, Counter_Submitted_Awaiting_Ops}] → [T-Date Reached] → Terminated_TDay_Expired
  
  Accepted → Executed
  Executed → Settled
```

---

**Document Owner**: Product Management  
**Last Updated**: March 2026  
**Next Review**: Post-Phase 2 Launch
