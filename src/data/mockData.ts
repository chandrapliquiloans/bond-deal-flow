import { Bond, PurchaseOrder, SellRequest, IFAClient, TradeRecord, BankAccount } from "@/types";

export const MOCK_BANK_ACCOUNTS: BankAccount[] = [
  { id: "BANK-001", bankName: "HDFC Bank", accountNumber: "XXXX XXXX 4521", ifscCode: "HDFC0001234", accountHolderName: "Nisha Sharma", isDefault: true },
  { id: "BANK-002", bankName: "ICICI Bank", accountNumber: "XXXX XXXX 8832", ifscCode: "ICIC0005678", accountHolderName: "Nisha Sharma", isDefault: false },
  { id: "BANK-003", bankName: "Axis Bank", accountNumber: "XXXX XXXX 2201", ifscCode: "UTIB0003456", accountHolderName: "Nisha Sharma", isDefault: false },
];

const DEFAULT_BANK = MOCK_BANK_ACCOUNTS.find((b) => b.isDefault)!;

export const BONDS_CATALOG: Bond[] = [
  { isin: "INE002A07RY8", name: "Reliance Industries Ltd 8.95% 2027", couponRate: 8.95, maturityDate: "2027-06-15", faceValue: 1000, creditRating: "AAA", issuer: "Reliance Industries" },
  { isin: "INE040A08120", name: "HDFC Bank Ltd 7.95% 2028", couponRate: 7.95, maturityDate: "2028-03-20", faceValue: 1000, creditRating: "AAA", issuer: "HDFC Bank" },
  { isin: "INE090A08UJ3", name: "ICICI Bank 8.40% 2026", couponRate: 8.40, maturityDate: "2026-09-10", faceValue: 1000, creditRating: "AA+", issuer: "ICICI Bank" },
  { isin: "INE152A08101", name: "Bajaj Finance 9.10% 2029", couponRate: 9.10, maturityDate: "2029-01-25", faceValue: 1000, creditRating: "AAA", issuer: "Bajaj Finance" },
  { isin: "INE261F08181", name: "Tata Capital 8.75% 2027", couponRate: 8.75, maturityDate: "2027-11-30", faceValue: 1000, creditRating: "AA+", issuer: "Tata Capital" },
];

export const MOCK_PORTFOLIO: PurchaseOrder[] = [
  { orderId: "ORD-001", bond: BONDS_CATALOG[0], units: 50, purchaseDate: "2024-03-15", purchasePrice: 1020, availableUnits: 50 },
  { orderId: "ORD-002", bond: BONDS_CATALOG[0], units: 30, purchaseDate: "2024-06-20", purchasePrice: 1015, availableUnits: 30 },
  { orderId: "ORD-003", bond: BONDS_CATALOG[1], units: 100, purchaseDate: "2024-01-10", purchasePrice: 995, availableUnits: 100 },
  { orderId: "ORD-004", bond: BONDS_CATALOG[2], units: 30, purchaseDate: "2025-01-05", purchasePrice: 1010, availableUnits: 25 },
  { orderId: "ORD-005", bond: BONDS_CATALOG[3], units: 75, purchaseDate: "2024-11-18", purchasePrice: 1005, availableUnits: 75 },
];

export const MOCK_SELL_REQUESTS: SellRequest[] = [
  {
    id: "SR-001", investorName: "Nisha Sharma", investorId: "INV-001", bond: BONDS_CATALOG[0],
    source: "liquibonds", units: 20, desiredYield: 9.25, buyYield: 8.75, transactionDate: "2026-03-23",
    status: "negotiation", createdAt: "2026-03-10T10:30:00", updatedAt: "2026-03-12T14:00:00",
    orderId: "ORD-001", bankAccount: DEFAULT_BANK,
    negotiationRounds: [
      { round: 1, proposedBy: "investor", yield: 9.25, price: 1015, timestamp: "2026-03-10T10:30:00", deadline: "2026-03-12T10:30:00", note: "Initiating sell at desired yield." },
      { round: 2, proposedBy: "ops", yield: 9.50, price: 1008, timestamp: "2026-03-11T09:00:00", deadline: "2026-03-13T09:00:00", note: "Counter with higher yield based on current market rates." },
    ],
  },
  {
    id: "SR-002", investorName: "Rajesh Kumar", investorId: "INV-002", bond: BONDS_CATALOG[1],
    source: "liquibonds", units: 50, desiredYield: 8.10, buyYield: 7.85, transactionDate: "2026-03-24",
    status: "sell_initiated", createdAt: "2026-03-12T08:00:00", updatedAt: "2026-03-12T08:00:00",
    orderId: "ORD-002", bankAccount: DEFAULT_BANK,
    negotiationRounds: [],
  },
  {
    id: "SR-003", investorName: "Priya Patel", investorId: "INV-003", bond: BONDS_CATALOG[2],
    source: "external", units: 15, desiredYield: 8.60, buyYield: 8.25, transactionDate: "2026-03-25",
    status: "buyer_approved", createdAt: "2026-03-08T14:00:00", updatedAt: "2026-03-11T16:00:00",
    orderId: "ORD-003",
    dpAccountId: "1234567890123456", settlementDate: "2026-03-25", bankAccount: DEFAULT_BANK,
    negotiationRounds: [
      { round: 1, proposedBy: "investor", yield: 8.60, price: 1005, timestamp: "2026-03-08T14:00:00", deadline: "2026-03-10T14:00:00" },
    ],
  },
  {
    id: "SR-004", investorName: "Amit Verma", investorId: "INV-004", bond: BONDS_CATALOG[3],
    source: "liquibonds", units: 30, desiredYield: 9.30, buyYield: 8.95, transactionDate: "2026-03-15",
    status: "settled", createdAt: "2026-03-05T11:00:00", updatedAt: "2026-03-13T09:00:00",
    orderId: "ORD-004",
    settlementDate: "2026-03-15", utrNumber: "UTR202603150001", rfqNumber: "RFQ-2026-0412", bankAccount: DEFAULT_BANK,
    negotiationRounds: [
      { round: 1, proposedBy: "investor", yield: 9.30, price: 1002, timestamp: "2026-03-05T11:00:00", deadline: "2026-03-07T11:00:00" },
    ],
  },
  {
    id: "SR-005", investorName: "Sunita Reddy", investorId: "INV-005", bond: BONDS_CATALOG[4],
    source: "liquibonds", units: 40, desiredYield: 8.90, buyYield: 8.65, transactionDate: "2026-03-16",
    status: "rejected", createdAt: "2026-03-03T09:00:00", updatedAt: "2026-03-13T00:00:00",
    orderId: "ORD-005", bankAccount: DEFAULT_BANK,
    negotiationRounds: [
      { round: 1, proposedBy: "investor", yield: 8.90, price: 1010, timestamp: "2026-03-03T09:00:00", deadline: "2026-03-05T09:00:00", note: "Initial sell request at market rate." },
      { round: 2, proposedBy: "ops", yield: 9.20, price: 998, timestamp: "2026-03-04T15:00:00", deadline: "2026-03-06T15:00:00", note: "Adjusted yield to reflect liquidity constraints." },
      { round: 3, proposedBy: "investor", yield: 9.05, price: 1004, timestamp: "2026-03-06T10:00:00", deadline: "2026-03-08T10:00:00", note: "Compromise offer — final counter." },
    ],
  },
];

export const MOCK_IFA_CLIENTS: IFAClient[] = [
  { id: "CLI-001", name: "Nisha Sharma", email: "nisha@example.com", phone: "9876543210", panNumber: "ABCDE1234F", holdings: [MOCK_PORTFOLIO[0], MOCK_PORTFOLIO[1]] },
  { id: "CLI-002", name: "Rajesh Kumar", email: "rajesh@example.com", phone: "9876543211", panNumber: "FGHIJ5678K", holdings: [MOCK_PORTFOLIO[2]] },
  { id: "CLI-003", name: "Priya Patel", email: "priya@example.com", phone: "9876543212", panNumber: "KLMNO9012P", holdings: [MOCK_PORTFOLIO[3], MOCK_PORTFOLIO[4]] },
];

export const MOCK_TRADES: TradeRecord[] = [
  { id: "TR-001", sellRequestId: "SR-004", investorName: "Amit Verma", bond: BONDS_CATALOG[3], units: 30, settledYield: 9.30, settlementDate: "2024-12-01", utrNumber: "UTR202412010001", rfqNumber: "RFQ-2024-1201", status: "settled" },
  { id: "TR-002", sellRequestId: "SR-003", investorName: "Priya Patel", bond: BONDS_CATALOG[2], units: 15, settledYield: 8.60, settlementDate: "2024-12-01", status: "rfq_placed" },
  { id: "TR-003", sellRequestId: "SR-002", investorName: "Rajesh Kumar", bond: BONDS_CATALOG[1], units: 50, settledYield: 8.10, settlementDate: "2024-12-01", status: "rfq_placed" },
  { id: "TR-004", sellRequestId: "SR-001", investorName: "Nisha Sharma", bond: BONDS_CATALOG[0], units: 20, settledYield: 9.25, settlementDate: "2024-12-01", status: "rfq_placed" },
  { id: "TR-005", sellRequestId: "SR-005", investorName: "Sunita Reddy", bond: BONDS_CATALOG[4], units: 40, settledYield: 8.90, settlementDate: "2024-12-01", status: "rfq_placed" },
  { id: "TR-006", sellRequestId: "SR-006", investorName: "Amit Verma", bond: BONDS_CATALOG[3], units: 10, settledYield: 9.30, settlementDate: "2024-12-01", status: "rfq_placed" },
  { id: "TR-007", sellRequestId: "SR-003", investorName: "Priya Patel", bond: BONDS_CATALOG[2], units: 15, settledYield: 8.60, settlementDate: "2026-03-17", status: "rfq_placed" },
  { id: "TR-008", sellRequestId: "SR-007", investorName: "Nisha Sharma", bond: BONDS_CATALOG[0], units: 25, settledYield: 9.25, settlementDate: "2025-01-15", status: "settled" },
  { id: "TR-009", sellRequestId: "SR-008", investorName: "Rajesh Kumar", bond: BONDS_CATALOG[1], units: 30, settledYield: 8.10, settlementDate: "2025-02-20", status: "pending_payment" },
  { id: "TR-010", sellRequestId: "SR-009", investorName: "Priya Patel", bond: BONDS_CATALOG[3], units: 20, settledYield: 9.30, settlementDate: "2025-03-10", status: "settled" },
  { id: "TR-011", sellRequestId: "SR-001", investorName: "Nisha Sharma", bond: BONDS_CATALOG[0], units: 20, settledYield: 9.25, settlementDate: "2026-03-18", rfqNumber: "RFQ-2026-0501", status: "rfq_placed" },
  { id: "TR-012", sellRequestId: "SR-002", investorName: "Rajesh Kumar", bond: BONDS_CATALOG[1], units: 50, settledYield: 8.10, settlementDate: "2026-03-18", status: "pending_payment" },
  { id: "TR-013", sellRequestId: "SR-003", investorName: "Priya Patel", bond: BONDS_CATALOG[2], units: 15, settledYield: 8.60, settlementDate: "2026-03-18", utrNumber: "UTR202603180001", rfqNumber: "RFQ-2026-0502", status: "settled" },
];
