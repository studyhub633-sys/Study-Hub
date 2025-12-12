/**
 * PayPal Subscription Plans Creator
 * 
 * This script creates subscription plans in PayPal using the Developer API.
 * Run this script to create Monthly and Yearly plans for Study Spark Hub.
 * 
 * Usage:
 *   node scripts/create-paypal-plans.js
 * 
 * Make sure you have PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in your .env file
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import paypal from "@paypal/checkout-server-sdk";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "..", ".env") });
dotenv.config({ path: resolve(__dirname, ".env") });

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || "sandbox";

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  console.error("❌ Error: PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set in .env file");
  process.exit(1);
}

// PayPal Environment Setup
function paypalEnvironment() {
  if (PAYPAL_MODE === "live") {
    return new paypal.core.LiveEnvironment(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET);
  }
  return new paypal.core.SandboxEnvironment(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET);
}

const client = new paypal.core.PayPalHttpClient(paypalEnvironment());

// Plan configurations
const PLANS = [
  {
    name: "Study Hub Premium - Monthly",
    description: "Monthly subscription for Study Spark Hub Premium features",
    billingCycle: "MONTH",
    price: "5.99",
    currency: "GBP",
    envVar: "PAYPAL_PLAN_ID_MONTHLY",
  },
  {
    name: "Study Hub Premium - Yearly",
    description: "Yearly subscription for Study Spark Hub Premium features (Save £6!)",
    billingCycle: "YEAR",
    price: "65.99",
    currency: "GBP",
    envVar: "PAYPAL_PLAN_ID_YEARLY",
  },
];

/**
 * Create a Product in PayPal (required before creating plans)
 */
async function createProduct() {
  console.log("\n📦 Creating Product...");

  try {
    const request = new paypal.catalog.ProductsCreateRequest();
    request.requestBody({
      name: "Study Spark Hub Premium",
      description: "Premium subscription for Study Spark Hub - AI-powered study tools and features",
      type: "SERVICE",
      category: "SOFTWARE",
    });

    const response = await client.execute(request);
    
    if (response.statusCode === 201) {
      console.log("✅ Product created successfully!");
      console.log(`   Product ID: ${response.result.id}`);
      return response.result.id;
    } else {
      console.error("❌ Failed to create product:", response.result);
      return null;
    }
  } catch (error) {
    // Product might already exist, try to find it
    console.log("⚠️  Product creation failed (might already exist), continuing...");
    if (error.message) {
      console.log(`   Error: ${error.message}`);
    }
    return null;
  }
}

/**
 * Create a subscription plan
 */
async function createPlan(productId, planConfig) {
  console.log(`\n📋 Creating ${planConfig.name}...`);

  try {
    const request = new paypal.billing.PlansCreateRequest();
    request.requestBody({
      product_id: productId,
      name: planConfig.name,
      description: planConfig.description,
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: {
            interval_unit: planConfig.billingCycle,
            interval_count: 1,
          },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0, // 0 = infinite (ongoing subscription)
          pricing_scheme: {
            fixed_price: {
              value: planConfig.price,
              currency_code: planConfig.currency,
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
          value: "0",
          currency_code: planConfig.currency,
        },
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3,
      },
      taxes: {
        percentage: "0",
        inclusive: false,
      },
    });

    const response = await client.execute(request);

    if (response.statusCode === 201) {
      console.log(`✅ ${planConfig.name} created successfully!`);
      console.log(`   Plan ID: ${response.result.id}`);
      return response.result.id;
    } else {
      console.error(`❌ Failed to create ${planConfig.name}:`, response.result);
      if (response.result.details) {
        response.result.details.forEach(detail => {
          console.error(`   - ${detail.issue}: ${detail.description}`);
        });
      }
      return null;
    }
  } catch (error) {
    console.error(`❌ Error creating ${planConfig.name}:`, error.message);
    if (error.statusCode) {
      console.error(`   Status Code: ${error.statusCode}`);
    }
    if (error.result) {
      console.error(`   Error Details:`, JSON.stringify(error.result, null, 2));
    }
    return null;
  }
}

/**
 * List existing plans to check if they already exist
 */
async function listPlans() {
  console.log("\n🔍 Checking for existing plans...");

  const request = new paypal.billing.PlansListRequest();
  request.page_size(10);
  request.total_required(true);

  try {
    const response = await client.execute(request);
    
    if (response.statusCode === 200 && response.result.plans) {
      return response.result.plans;
    }
    return [];
  } catch (error) {
    console.log("   No existing plans found or error listing plans");
    return [];
  }
}

/**
 * Main function
 */
async function main() {
  console.log("🚀 PayPal Subscription Plans Creator");
  console.log("=====================================");
  console.log(`Mode: ${PAYPAL_MODE.toUpperCase()}`);
  console.log(`Client ID: ${PAYPAL_CLIENT_ID.substring(0, 10)}...`);

  // Check for existing plans
  const existingPlans = await listPlans();
  if (existingPlans.length > 0) {
    console.log(`\n📋 Found ${existingPlans.length} existing plan(s):`);
    existingPlans.forEach(plan => {
      console.log(`   - ${plan.name} (${plan.id})`);
    });
    console.log("\n💡 If you want to create new plans, you can continue.");
    console.log("   Or use the existing Plan IDs above in your .env file.\n");
  }

  // Create product first
  let productId = await createProduct();

  // If product creation failed, try to use an existing product or create a simple one
  if (!productId) {
    console.log("\n⚠️  No product ID available. Attempting to create plans without product...");
    console.log("   (PayPal might auto-create a product)");
  }

  const createdPlans = {};

  // Create each plan
  for (const planConfig of PLANS) {
    // Check if plan already exists
    const existingPlan = existingPlans.find(
      p => p.name === planConfig.name
    );

    if (existingPlan) {
      console.log(`\n✅ ${planConfig.name} already exists!`);
      console.log(`   Plan ID: ${existingPlan.id}`);
      createdPlans[planConfig.envVar] = existingPlan.id;
    } else {
      // If no product ID, try to create one
      if (!productId) {
        console.log("\n📦 Attempting to create product for plan...");
        productId = await createProduct();
        
        if (!productId) {
          console.log("\n⚠️  Warning: No product ID available.");
          console.log("   PayPal might require a product to be created first.");
          console.log("   You may need to create a product manually in the PayPal dashboard.");
          console.log("   Or the plan creation might fail - we'll try anyway...\n");
        }
      }

      const planId = await createPlan(productId, planConfig);
      if (planId) {
        createdPlans[planConfig.envVar] = planId;
      }
    }
  }

  // Output results
  console.log("\n" + "=".repeat(50));
  console.log("📝 Add these to your .env file:");
  console.log("=".repeat(50));

  if (createdPlans.PAYPAL_PLAN_ID_MONTHLY) {
    console.log(`PAYPAL_PLAN_ID_MONTHLY=${createdPlans.PAYPAL_PLAN_ID_MONTHLY}`);
  }
  if (createdPlans.PAYPAL_PLAN_ID_YEARLY) {
    console.log(`PAYPAL_PLAN_ID_YEARLY=${createdPlans.PAYPAL_PLAN_ID_YEARLY}`);
  }

  if (Object.keys(createdPlans).length === 0) {
    console.log("\n⚠️  No new plans were created.");
    console.log("   Check the errors above or use existing Plan IDs from your PayPal dashboard.");
  } else {
    console.log("\n✅ Done! Copy the Plan IDs above to your .env file.");
  }

  console.log("\n" + "=".repeat(50));
}

// Run the script
main().catch(error => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});

