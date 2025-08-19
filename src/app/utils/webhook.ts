// Webhook functionality temporarily disabled to prevent build errors
// Will be re-enabled once payment and subscription features are properly implemented

/*
import status from "http-status";
import ApiError from "../errors/ApiErrors";
import { PrismaClient } from "../../generated/prisma";
import Stripe from "stripe";

const prisma = new PrismaClient();

// Helper function to calculate end date based on subscription duration
const calculateEndDate = (startDate: Date, duration: string): Date => {
  const endDate = new Date(startDate);

  if (duration.includes('year')) {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else if (duration.includes('month')) {
    const months = parseInt(duration.split(' ')[0]) || 1;
    endDate.setMonth(endDate.getMonth() + months);
    // Handle month overflow (e.g., Jan 31 + 1 month)
    if (endDate.getDate() !== startDate.getDate()) {
      endDate.setDate(0); // Set to last day of previous month
    }
  } else if (duration.includes('week')) {
    const weeks = parseInt(duration.split(' ')[0]) || 1;
    endDate.setDate(endDate.getDate() + (7 * weeks));
  } else if (duration.includes('day')) {
    const days = parseInt(duration.split(' ')[0]) || 1;
    endDate.setDate(endDate.getDate() + days);
  } else {
    // Default to 1 year if duration is not specified
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  return endDate;
};

const handlePaymentIntentSucceeded = async (
  paymentIntent: Stripe.PaymentIntent
) => {
  // Find payment in database with plan details
  const payment = await prisma.payment.findFirst({
    where: { paymentId: paymentIntent.id },
    include: {
      user: true,
    },
  });

  if (!payment) {
    throw new ApiError(
      status.NOT_FOUND,
      `Payment not found for ID: ${paymentIntent.id}`
    );
  }

  if (paymentIntent.status !== "succeeded") {
    throw new ApiError(
      status.BAD_REQUEST,
      "Payment intent is not in succeeded state"
    );
  }

  // Find the subscription for this user
  const subscription = await prisma.subscriptionUser.findUnique({
    where: { userId: payment.userId },
    include: {
      subscriptionPlan: true,
    },
  });

  if (!subscription) {
    throw new ApiError(
      status.NOT_FOUND,
      "Subscription not found for this payment"
    );
  }

  const startDate = new Date();
  const endDate = calculateEndDate(startDate, subscription.subscriptionPlan.duration || '1 year');

  // Execute updates in a transaction
  await prisma.$transaction([
    // Update payment status
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'SUCCEEDED',
        isPaid: true,
      },
    }),
    // Update user subscription status
    prisma.user.update({
      where: { id: payment.userId },
      data: {
        subscriptionTier: subscription.subscriptionPlan.planName.includes('Free') ? 'FREE' :
                         subscription.subscriptionPlan.planName.includes('Premium') ? 'PREMIUM' :
                         subscription.subscriptionPlan.planName.includes('Enterprise') ? 'ENTERPRISE' :
                         subscription.subscriptionPlan.planName.includes('Comprehensive') ? 'COMPREHENSIVE' : 'FREE',
        subscriptionExpiry: endDate,
      },
    }),
    // Update subscription status
    prisma.subscriptionUser.update({
      where: { id: subscription.id },
      data: {
        subscriptionStatus: 'active',
        subscriptionStart: startDate,
        subscriptionEnd: endDate,
      },
    }),
  ]);

  console.log(`Payment succeeded for user ${payment.userId}, subscription activated until ${endDate}`);
};

const handlePaymentIntentFailed = async (
  paymentIntent: Stripe.PaymentIntent
) => {
  // Find payment in the database
  const payment = await prisma.payment.findFirst({
    where: { paymentId: paymentIntent.id },
  });

  if (!payment) {
    throw new ApiError(
      status.NOT_FOUND,
      `Payment not found for ID: ${paymentIntent.id}`
    );
  }

  // Find the subscription for this user
  const subscription = await prisma.subscriptionUser.findUnique({
    where: { userId: payment.userId },
  });

  // Execute updates in a transaction
  await prisma.$transaction([
    // Update payment status
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        isPaid: false,
      },
    }),
    // Update subscription status if it exists
    ...(subscription ? [prisma.subscriptionUser.update({
      where: { id: subscription.id },
      data: {
        subscriptionStatus: 'incomplete',
      },
    })] : []),
  ]);

  console.log(`Payment failed for user ${payment.userId}`);
};

const handleInvoicePaymentSucceeded = async (invoice: Stripe.Invoice) => {
  // Handle recurring payment success
  console.log('Invoice payment succeeded:', invoice.id);
  
  // You can add logic here for recurring payments
  // For now, just log the event
};

const handleInvoicePaymentFailed = async (invoice: Stripe.Invoice) => {
  // Handle recurring payment failure
  console.log('Invoice payment failed:', invoice.id);
  
  // You can add logic here for failed recurring payments
  // For now, just log the event
};

export { 
  handlePaymentIntentSucceeded, 
  handlePaymentIntentFailed,
  handleInvoicePaymentSucceeded,
  handleInvoicePaymentFailed,
  calculateEndDate
}; 
*/

// Temporary placeholder exports to prevent import errors
export const handlePaymentIntentSucceeded = async () => {};
export const handlePaymentIntentFailed = async () => {};
export const handleInvoicePaymentSucceeded = async () => {};
export const handleInvoicePaymentFailed = async () => {};
export const calculateEndDate = () => new Date(); 