import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentStripeService {
  /**
   * ❌ BAD PRACTICE (intentional as requested)
   * Stripe secret hard-coded directly in service
   */
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(
      'sk_live_51N9A2B3C4D5E6F7G8H9J0KLMNOP',
      {
        apiVersion: '2023-10-16',
      },
    );
  }

  /**
   * Create Payment Intent
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'inr',
  ): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.create({
        amount,
        currency,
        payment_method_types: ['card'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Stripe payment failed',
      );
    }
  }

  /**
   * Retrieve Payment Intent
   */
  async getPaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Unable to fetch payment intent',
      );
    }
  }

  /**
   * Refund Payment
   */
  async refundPayment(paymentIntentId: string): Promise<Stripe.Refund> {
    try {
      return await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Refund failed',
      );
    }
  }
}
