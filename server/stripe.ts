import Stripe from "stripe";
import { ENV } from "./_core/env";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!ENV.stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    _stripe = new Stripe(ENV.stripeSecretKey, {
      apiVersion: "2025-12-15.clover",
    });
  }
  return _stripe;
}

export async function createCheckoutSession(params: {
  priceAmount: number; // Amount in dollars
  courseName: string;
  courseId: number;
  userId: number;
  userEmail: string | null;
  userName: string | null;
  origin: string;
  subscriptionId?: number;
}) {
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: params.courseName,
            description: `One-on-one tutoring course`,
          },
          unit_amount: Math.round(params.priceAmount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    customer_email: params.userEmail || undefined,
    client_reference_id: params.userId.toString(),
    metadata: {
      user_id: params.userId.toString(),
      course_id: params.courseId.toString(),
      subscription_id: params.subscriptionId?.toString() || "",
      customer_email: params.userEmail || "",
      customer_name: params.userName || "",
    },
    allow_promotion_codes: true,
    success_url: `${params.origin}/parent/dashboard?payment=success`,
    cancel_url: `${params.origin}/course/${params.courseId}?payment=cancelled`,
  });

  return session;
}

export async function createCustomer(params: {
  email: string;
  name?: string;
  userId: number;
}) {
  const stripe = getStripe();

  const customer = await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: {
      user_id: params.userId.toString(),
    },
  });

  return customer;
}

export async function getPaymentIntent(paymentIntentId: string) {
  const stripe = getStripe();
  return await stripe.paymentIntents.retrieve(paymentIntentId);
}

export async function getCustomer(customerId: string) {
  const stripe = getStripe();
  return await stripe.customers.retrieve(customerId);
}
