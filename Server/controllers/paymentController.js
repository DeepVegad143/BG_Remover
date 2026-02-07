import Stripe from "stripe";
import userModel from "../models/userModel.js";
import paymentModel from "../models/paymentModel.js";

// Validate required environment variables
const requiredEnvVars = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'CLIENT_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    console.error('Please check your .env file and ensure all payment-related environment variables are set.');
  }
}

// Initialize Stripe with error handling
let stripe;
try {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  console.log('✅ Stripe initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Stripe:', error.message);
}

// Webhook endpoint secret for security
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Function to check if payment session is already processed
async function isSessionProcessed(sessionId) {
  try {
    const payment = await paymentModel.findOne({ 
      sessionId, 
      status: "completed" 
    });
    return !!payment;
  } catch (error) {
    console.error(`❌ Error checking session status:`, error.message);
    return false;
  }
}

// Function to record payment processing
async function recordPaymentProcessed(sessionId, clerkId, plan, credits, amount) {
  try {
    await paymentModel.findOneAndUpdate(
      { sessionId },
      {
        clerkId,
        plan,
        credits,
        amount,
        status: "completed",
        processedAt: new Date()
      },
      { upsert: true, new: true }
    );
    console.log(`✅ Payment recorded as processed: ${sessionId}`);
  } catch (error) {
    console.error(`❌ Error recording payment:`, error.message);
  }
}

// Function to create pending payment record
async function createPendingPayment(sessionId, clerkId, plan, credits, amount) {
  try {
    await paymentModel.create({
      sessionId,
      clerkId,
      plan,
      credits,
      amount,
      status: "pending"
    });
    console.log(`✅ Pending payment created: ${sessionId}`);
  } catch (error) {
    // If duplicate key error, it's okay (session already exists)
    if (error.code !== 11000) {
      console.error(`❌ Error creating pending payment:`, error.message);
    }
  }
}

// Function to safely update user credits
async function updateUserCredits(clerkId, credits, plan) {
  try {
    console.log(`💳 Attempting to update credits for user: ${clerkId}, Credits: ${credits}`);
    
    // First try to find and update existing user
    let user = await userModel.findOneAndUpdate(
      { clerkId },
      { $inc: { creditBalance: Number(credits) } },
      { new: true }
    );
    
    // If user doesn't exist, create them with the credits
    if (!user) {
      console.log(`⚠️ User not found, creating new user with clerkId: ${clerkId}`);
      user = await userModel.create({
        clerkId,
        email: `temp_${clerkId}@example.com`,
        photo: "https://via.placeholder.com/150",
        firstName: "User",
        lastName: "Account",
        creditBalance: Number(credits)
      });
      console.log(`✅ New user created with credits: ${user.creditBalance}`);
    } else {
      console.log(`✅ User credits updated: ${user.creditBalance}`);
    }
    
    return user;
  } catch (error) {
    console.error(`❌ Failed to update user credits:`, error.message);
    throw error;
  }
}

// Create checkout session
export const createCheckoutSession = async (req, res) => {
  try {
    // Check if Stripe is properly initialized
    if (!stripe) {
      console.error('❌ Stripe not initialized - check environment variables');
      return res.status(500).json({
        success: false,
        error: 'Payment system not properly configured. Please contact support.'
      });
    }
    
    const { plan, clerkId } = req.body;
    
    // Validate input
    if (!plan || !clerkId) {
      return res.status(400).json({ 
        success: false,
        error: "Missing required fields: plan and clerkId are required" 
      });
    }

    // Define plan configurations
    const planConfigs = {
      "Basic": { amount: 29900, credits: 100 },    // Rs 299 in paise
      "Advanced": { amount: 79900, credits: 500 }, // Rs 799 in paise
      "Business": { amount: 799900, credits: 5000 } // Rs 7999 in paise
    };

    const config = planConfigs[plan];
    if (!config) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid plan selected. Available plans: Basic, Advanced, Business" 
      });
    }
    
    console.log(`🔄 Creating checkout session for ${plan} plan for user: ${clerkId}`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { 
              name: `${plan} Plan - ${config.credits} Credits`,
              description: `Get ${config.credits} credits for background removal`
            },
            unit_amount: config.amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: { 
        clerkId, 
        credits: config.credits.toString(), 
        plan,
        timestamp: new Date().toISOString()
      },
      // Add customer email if available
      ...(req.body.email && { customer_email: req.body.email }),
      // Expire session after 30 minutes
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60)
    });
    
    console.log(`✅ Checkout session created: ${session.id}`);
    
    // Create pending payment record
    await createPendingPayment(
      session.id,
      clerkId,
      plan,
      config.credits,
      config.amount
    );

    res.json({ 
      success: true,
      id: session.id, 
      url: session.url 
    });
  } catch (error) {
    console.error("❌ Stripe checkout session creation error:", error.message);
    
    // Handle different types of Stripe errors
    if (error.type === 'StripeCardError') {
      res.status(400).json({ success: false, error: "Your card was declined." });
    } else if (error.type === 'StripeRateLimitError') {
      res.status(429).json({ success: false, error: "Too many requests made to the API too quickly" });
    } else if (error.type === 'StripeInvalidRequestError') {
      res.status(400).json({ success: false, error: "Invalid parameters were supplied to Stripe's API" });
    } else if (error.type === 'StripeAPIError') {
      res.status(500).json({ success: false, error: "An error occurred internally with Stripe's API" });
    } else if (error.type === 'StripeConnectionError') {
      res.status(500).json({ success: false, error: "Network communication with Stripe failed" });
    } else if (error.type === 'StripeAuthenticationError') {
      res.status(500).json({ success: false, error: "Authentication with Stripe's API failed" });
    } else {
      res.status(500).json({ success: false, error: "An unexpected error occurred. Please try again." });
    }
  }
};

// Verify session after success page
export const verifyCheckoutSession = async (req, res) => {
  try {
    // Check if Stripe is properly initialized
    if (!stripe) {
      console.error('❌ Stripe not initialized - check environment variables');
      return res.status(500).json({
        success: false,
        error: 'Payment system not properly configured. Please contact support.'
      });
    }
    
    const { session_id } = req.query;
    
    if (!session_id) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing session_id parameter" 
      });
    }
    
    console.log("🔍 Verifying session:", session_id);
    
    // Check if session was already processed
    const alreadyProcessed = await isSessionProcessed(session_id);
    if (alreadyProcessed) {
      console.log("⏭️ Session already processed:", session_id);
      return res.json({ 
        success: true, 
        message: "Session already processed",
        alreadyProcessed: true 
      });
    }
    
    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log("📦 Session data:", {
      payment_status: session.payment_status,
      metadata: session.metadata
    });

    if (session.payment_status === "paid") {
      const { clerkId, credits, plan } = session.metadata;
      
      if (!clerkId || !credits) {
        console.error("❌ Missing metadata in session:", session.metadata);
        return res.status(400).json({ 
          success: false, 
          error: "Invalid session metadata" 
        });
      }
      
      console.log("💳 Payment confirmed, updating credits for user:", clerkId);
      
      try {
        const user = await updateUserCredits(clerkId, credits, plan);
        
        // Record payment as processed in database
        await recordPaymentProcessed(
          session_id, 
          clerkId, 
          plan, 
          Number(credits), 
          session.amount_total || 0
        );
        
        res.json({ 
          success: true, 
          message: "Credits added successfully",
          creditsAdded: Number(credits),
          newBalance: user.creditBalance,
          plan: plan
        });
      } catch (updateError) {
        console.error("❌ Failed to update user credits:", updateError.message);
        return res.status(500).json({ 
          success: false, 
          error: "Failed to update user credits. Please contact support." 
        });
      }
    } else {
      console.log("❌ Payment not completed:", session.payment_status);
      res.json({ 
        success: false, 
        message: `Payment not completed. Status: ${session.payment_status}`,
        paymentStatus: session.payment_status
      });
    }
  } catch (error) {
    console.error("❌ Session verification error:", error.message);
    
    // Handle Stripe-specific errors
    if (error.type === 'StripeInvalidRequestError') {
      if (error.message.includes('No such checkout session')) {
        return res.status(404).json({ 
          success: false, 
          error: "Checkout session not found" 
        });
      }
    }
    
    res.status(500).json({ 
      success: false, 
      error: "Failed to verify payment. Please try again or contact support." 
    });
  }
};

// Webhook endpoint for Stripe events (more secure than session verification)
export const handleWebhook = async (req, res) => {
  // Check if Stripe is properly initialized
  if (!stripe) {
    console.error('❌ Stripe not initialized - webhook cannot be processed');
    return res.status(500).json({
      error: 'Payment system not properly configured'
    });
  }
  
  // Check if webhook secret is configured
  if (!endpointSecret || endpointSecret === 'whsec_your_webhook_secret_here') {
    console.error('❌ Webhook secret not properly configured');
    return res.status(500).json({
      error: 'Webhook secret not configured'
    });
  }
  
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log('🌐 Webhook received:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('🎉 Payment completed for session:', session.id);
      
      // Only process if payment was successful
      if (session.payment_status === 'paid') {
        const { clerkId, credits, plan } = session.metadata;
        
        if (clerkId && credits) {
          try {
            // Check if already processed to avoid duplicates
            const alreadyProcessed = await isSessionProcessed(session.id);
            if (!alreadyProcessed) {
              const user = await updateUserCredits(clerkId, credits, plan);
              
              // Record payment as processed
              await recordPaymentProcessed(
                session.id,
                clerkId,
                plan,
                Number(credits),
                session.amount_total || 0
              );
              
              console.log(`✅ Webhook: Credits added to user ${clerkId}, New balance: ${user.creditBalance}`);
            } else {
              console.log('⏭️ Webhook: Session already processed:', session.id);
            }
          } catch (error) {
            console.error('❌ Webhook: Failed to update credits:', error.message);
          }
        } else {
          console.error('❌ Webhook: Missing required metadata in session');
        }
      }
      break;
      
    case 'checkout.session.expired':
      console.log('⏰ Checkout session expired:', event.data.object.id);
      break;
      
    case 'payment_intent.payment_failed':
      console.log('❌ Payment failed:', event.data.object.id);
      break;
      
    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
};
