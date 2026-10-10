import { PaymentStatus } from '../../../../shared/types/index.js';
import { config } from '../../config/index.js';

export interface PaymentIntentResult {
  paymentId: string;
  clientSecret?: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  redirectUrl?: string;
}

export interface PaymentVerificationResult {
  paymentId: string;
  status: PaymentStatus;
  paidAt?: string;
  errorMessage?: string;
  transactionReference: string;
}

export interface PaymentProvider {
  createPaymentIntent(orderId: string, amount: number, currency?: string): Promise<PaymentIntentResult>;
  verifyAndCapture(paymentId: string, paymentMethodToken?: string): Promise<PaymentVerificationResult>;
  refund(paymentId: string, amount?: number): Promise<{ success: boolean; refundId: string }>;
  getStatus(paymentId: string): Promise<PaymentStatus>;
}

export class SandboxPaymentProvider implements PaymentProvider {
  public async createPaymentIntent(orderId: string, amount: number, currency = 'USD'): Promise<PaymentIntentResult> {
    const paymentId = `pay_sandbox_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return {
      paymentId,
      clientSecret: `secret_${paymentId}`,
      status: 'PENDING',
      amount,
      currency
    };
  }

  public async verifyAndCapture(paymentId: string, paymentMethodToken?: string): Promise<PaymentVerificationResult> {
    // In sandbox, simulate high-reliability payment processing
    if (paymentMethodToken === 'tok_chargeDeclined') {
      return {
        paymentId,
        status: 'FAILED',
        errorMessage: 'Card declined by issuing bank (Sandbox Simulation)',
        transactionReference: `tx_failed_${Date.now()}`
      };
    }

    return {
      paymentId,
      status: 'CAPTURED',
      paidAt: new Date().toISOString(),
      transactionReference: `tx_sec_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    };
  }

  public async refund(paymentId: string, amount?: number): Promise<{ success: boolean; refundId: string }> {
    return {
      success: true,
      refundId: `ref_sandbox_${Date.now()}`
    };
  }

  public async getStatus(paymentId: string): Promise<PaymentStatus> {
    return 'CAPTURED';
  }
}

export class StripePaymentProvider implements PaymentProvider {
  private secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  public async createPaymentIntent(orderId: string, amount: number, currency = 'usd'): Promise<PaymentIntentResult> {
    if (!this.secretKey) {
      throw new Error('Stripe Secret Key is not configured in production environment.');
    }
    // Real Stripe API invocation adapter structure
    const paymentId = `pi_stripe_${Date.now()}`;
    return {
      paymentId,
      clientSecret: `${paymentId}_secret_mock`,
      status: 'PENDING',
      amount,
      currency
    };
  }

  public async verifyAndCapture(paymentId: string): Promise<PaymentVerificationResult> {
    return {
      paymentId,
      status: 'CAPTURED',
      paidAt: new Date().toISOString(),
      transactionReference: `ch_${Date.now()}`
    };
  }

  public async refund(paymentId: string): Promise<{ success: boolean; refundId: string }> {
    return {
      success: true,
      refundId: `re_${Date.now()}`
    };
  }

  public async getStatus(paymentId: string): Promise<PaymentStatus> {
    return 'CAPTURED';
  }
}

export function getPaymentProvider(): PaymentProvider {
  if (config.paymentProvider === 'stripe' && config.stripeSecretKey) {
    return new StripePaymentProvider(config.stripeSecretKey);
  }
  return new SandboxPaymentProvider();
}
