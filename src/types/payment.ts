export const PaymentStatus = {
  Pending: 'pending',
  Processing: 'processing',
  Paid: 'paid',
  Failed: 'failed',
  Refunded: 'refunded',
  Cancelled: 'cancelled',
} as const

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]

export const PaymentMethod = {
  Pix: 'pix',
  CreditCard: 'credit_card',
  Boleto: 'boleto',
} as const

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod]

export interface Payment {
  id: number;
  quote_id: number;
  amount: number;
  platform_fee: number;
  net_amount: number;
  formatted_amount: string;
  formatted_fee: string;
  formatted_net_amount: string;
  payment_method: PaymentMethod | null;
  payment_method_label: string | null;
  status: PaymentStatus;
  status_label: string;
  status_color: string;
  gateway: string | null;
  gateway_transaction_id: string | null;
  payment_url: string | null;
  payment_code: string | null;
  is_expired: boolean;
  paid_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  quote: {
    id: number;
    price: number;
    status: string;
  };
  payer: {
    id: number;
    trade_name: string;
  };
  space_owner: {
    id: number;
    trade_name: string;
  };
}

export interface PaymentStats {
  overview: {
    total_payments: number;
    paid: number;
    pending: number;
    processing: number;
    failed: number;
  };
  financial: {
    total_amount: number;
    total_fees: number;
    total_net_amount: number;
  };
  by_method: Array<{
    payment_method: string;
    count: number;
    total: number;
  }>;
  by_status: Array<{
    status: string;
    count: number;
  }>;
}

