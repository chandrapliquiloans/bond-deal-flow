export type UserRole = "investor" | "ifa" | "ops";

export type SellRequestStatus =
  | "submitted"
  | "under_review"
  | "under_negotiation"
  | "accepted"
  | "rejected"
  | "executed"
  | "settled"
  | "terminated";

export type BondSource = "liquibonds" | "external";

export interface Bond {
  isin: string;
  name: string;
  couponRate: number;
  maturityDate: string;
  faceValue: number;
  creditRating: string;
  issuer: string;
}

export interface PurchaseOrder {
  orderId: string;
  bond: Bond;
  units: number;
  purchaseDate: string;
  purchasePrice: number;
  availableUnits: number;
}

export interface SellRequest {
  id: string;
  investorName: string;
  investorId: string;
  bond: Bond;
  source: BondSource;
  units: number;
  desiredYield: number;
  buyYield?: number;
  transactionDate: string;
  status: SellRequestStatus;
  createdAt: string;
  updatedAt: string;
  orderId?: string;
  dpAccountId?: string;
  negotiationRounds: NegotiationRound[];
  settlementDate?: string;
  utrNumber?: string;
  rfqNumber?: string;
}

export interface NegotiationRound {
  round: number;
  proposedBy: "investor" | "ops";
  yield: number;
  price: number;
  timestamp: string;
  deadline: string;
  note?: string;
}

export interface IFAClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  panNumber: string;
  holdings: PurchaseOrder[];
}

export interface TradeRecord {
  id: string;
  sellRequestId: string;
  investorName: string;
  bond: Bond;
  units: number;
  settledYield: number;
  settlementDate: string;
  utrNumber?: string;
  rfqNumber?: string;
  status: "pending_payment" | "payment_uploaded" | "rfq_placed" | "settled";
}
