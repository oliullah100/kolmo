// Plan initialization script temporarily disabled to prevent build errors
// Will be re-enabled once payment and subscription features are properly implemented

/*
import { PrismaClient } from '../generated/prisma';
import { stripe } from '../app/lib/stripe';

const prisma = new PrismaClient();

const PLAN_CONFIGS = {
  FREE: {
    planName: 'Free Tier',
    price: 0,
    duration: '1 year',
    color: '#4CAF50',
    description: 'Basic Project Definition & General Business Context',
    features: [
      'Project basics',
      'Business type',
      'Target customer',
      'Launch goal'
    ]
  },
  PREMIUM: {
    planName: 'Premium Tier',
    price: 299,
    duration: '1 year',
    color: '#FF9800',
    description: 'Enhanced Business Model, Target Market & Marketing Strategy',
    features: [
      'Revenue streams',
      'Cost structure breakdown',
      'Customer segments',
      'Competitor analysis',
      'Marketing strategy'
    ]
  },
  ENTERPRISE: {
    planName: 'Enterprise Tier',
    price: 799,
    duration: '1 year',
    color: '#2196F3',
    description: 'Stakeholder Mapping, Compliance & Document Integration',
    features: [
      'Stakeholder Mapping',
      'Team Org Chart',
      'Partnership Strategy',
      'Legal & Compliance',
      'Document Upload & Analysis'
    ]
  },
  COMPREHENSIVE: {
    planName: 'Comprehensive Tier',
    price: 1499,
    duration: '1 year',
    color: '#F44336',
    description: 'Strategic Analysis, Risk Assessment & Expert Consultation',
    features: [
      'Competitive Edge & Market Positioning',
      'Risk Matrix & Scenario Planning',
      'Expert Consultation & Matching',
      'Advanced Validation Tools'
    ]
  }
};

async function initializePlans() {
  try {
    console.log(' Starting plan initialization...');

    const existingPlans = await prisma.plan.findMany();
    
    if (existingPlans.length > 0) {
      console.log('✅ Plans already exist, skipping initialization');
      return;
    }

    console.log('📝 Creating default plans...');

    for (const [key, config] of Object.entries(PLAN_CONFIGS)) {
      try {
        // Create Stripe product
        const product = await stripe.products.create({
          name: config.planName,
          description: config.description,
          active: true,
        });

        // Create Stripe price
        const price = await stripe.prices.create({
          currency: 'usd',
          unit_amount: Math.round(config.price * 100),
          active: true,
          product: product.id,
        });

        // Create plan in database
        await prisma.plan.create({
          data: {
            planName: config.planName,
            price: config.price,
            currency: 'usd',
            duration: config.duration,
            color: config.color,
            description: config.description,
            productId: product.id,
            priceId: price.id,
            isActive: true,
          },
        });

        console.log(`✅ Created plan: ${config.planName} ($${config.price})`);
      } catch (error) {
        console.error(`❌ Error creating plan ${config.planName}:`, error);
      }
    }

    console.log('🎉 Plan initialization completed successfully!');
  } catch (error) {
    console.error('❌ Error during plan initialization:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the initialization
initializePlans(); 
*/

console.log('Plan initialization script is temporarily disabled'); 