#!/usr/bin/env node

// This script should be run from the Server directory
// Usage: cd Server && node ../setup_payments.js

import 'dotenv/config';
import Stripe from 'stripe';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🚀 BG Remover Payment System Setup');
console.log('=====================================\n');

// Initialize Stripe
let stripe;
try {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not found in environment variables');
  }
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  console.log('✅ Stripe initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Stripe:', error.message);
  console.log('\n💡 Make sure your .env file has a valid STRIPE_SECRET_KEY');
  process.exit(1);
}

// Function to check if ngrok is available for webhook testing
async function checkNgrok() {
  try {
    await execAsync('which ngrok');
    return true;
  } catch {
    return false;
  }
}

// Function to setup webhook endpoint
async function setupWebhook() {
  console.log('\n🔗 Setting up Stripe Webhook...');
  
  const hasNgrok = await checkNgrok();
  
  if (hasNgrok) {
    console.log('✅ ngrok found - setting up local webhook for testing');
    
    // Start ngrok tunnel
    console.log('🔄 Starting ngrok tunnel...');
    exec('ngrok http 4000 --log=stdout', (error, stdout, stderr) => {
      if (error) {
        console.log('⚠️ ngrok error (this is normal if ngrok is already running)');
      }
    });
    
    // Wait a bit for ngrok to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    try {
      // Get ngrok tunnels
      const { stdout } = await execAsync('curl -s http://localhost:4040/api/tunnels');
      const tunnels = JSON.parse(stdout);
      
      if (tunnels.tunnels && tunnels.tunnels.length > 0) {
        const httpsUrl = tunnels.tunnels.find(t => t.proto === 'https')?.public_url;
        if (httpsUrl) {
          const webhookUrl = `${httpsUrl}/api/payment/webhook`;
          console.log(`✅ Ngrok tunnel active: ${httpsUrl}`);
          console.log(`📍 Webhook URL: ${webhookUrl}`);
          
          // Create webhook endpoint
          try {
            const webhook = await stripe.webhookEndpoints.create({
              url: webhookUrl,
              enabled_events: [
                'checkout.session.completed',
                'checkout.session.expired',
                'payment_intent.payment_failed'
              ]
            });
            
            console.log(`\n✅ Webhook endpoint created successfully!`);
            console.log(`🔑 Webhook Secret: ${webhook.secret}`);
            console.log(`\n🔧 UPDATE YOUR .env FILE:`);
            console.log(`STRIPE_WEBHOOK_SECRET=${webhook.secret}`);
            
            return webhook.secret;
          } catch (webhookError) {
            console.log('⚠️ Webhook creation failed (endpoint may already exist):', webhookError.message);
          }
        }
      }
    } catch (tunnelError) {
      console.log('⚠️ Could not get ngrok tunnel info:', tunnelError.message);
    }
  }
  
  console.log('\n📝 Manual Webhook Setup Instructions:');
  console.log('=====================================');
  console.log('1. Go to: https://dashboard.stripe.com/webhooks');
  console.log('2. Click "Add endpoint"');
  console.log('3. For local development, use ngrok:');
  console.log('   - Install ngrok: https://ngrok.com/download');
  console.log('   - Run: ngrok http 4000');
  console.log('   - Use the HTTPS URL: https://xxxxx.ngrok.io/api/payment/webhook');
  console.log('4. Select these events:');
  console.log('   - checkout.session.completed');
  console.log('   - checkout.session.expired');
  console.log('   - payment_intent.payment_failed');
  console.log('5. Copy the "Signing secret" (starts with whsec_)');
  console.log('6. Update STRIPE_WEBHOOK_SECRET in your .env file');
  
  return null;
}

// Function to test payment endpoints
async function testPaymentEndpoints() {
  console.log('\n🧪 Testing Payment Endpoints...');
  console.log('================================');
  
  try {
    // Test server health
    console.log('🔄 Testing server health...');
    const healthResponse = await axios.get('http://localhost:4000/', {
      timeout: 5000,
      validateStatus: () => true
    });
    
    if (healthResponse.status === 200) {
      console.log('✅ Server is running');
    } else {
      console.log('❌ Server not responding - make sure to run: npm start');
      return false;
    }
    
    // Test payment session creation
    console.log('🔄 Testing payment session creation...');
    const sessionResponse = await axios.post('http://localhost:4000/api/payment/create-checkout-session', {
      plan: 'Basic',
      clerkId: 'test_user_setup'
    }, {
      timeout: 10000,
      validateStatus: () => true
    });
    
    if (sessionResponse.status === 200 && sessionResponse.data.success) {
      console.log('✅ Payment session creation working');
      console.log(`   Session ID: ${sessionResponse.data.id}`);
    } else {
      console.log('❌ Payment session creation failed');
      console.log('   Response:', sessionResponse.data);
      return false;
    }
    
    // Test webhook endpoint (without signature for now)
    console.log('🔄 Testing webhook endpoint...');
    const webhookResponse = await axios.post('http://localhost:4000/api/payment/webhook', {}, {
      headers: { 'stripe-signature': 'test_signature' },
      timeout: 5000,
      validateStatus: () => true
    });
    
    if (webhookResponse.status === 500 && webhookResponse.data.error === 'Webhook secret not configured') {
      console.log('⚠️ Webhook endpoint responding (secret needs configuration)');
    } else if (webhookResponse.status === 400) {
      console.log('✅ Webhook endpoint working (signature validation active)');
    } else {
      console.log('❓ Webhook endpoint response:', webhookResponse.status, webhookResponse.data);
    }
    
    return true;
  } catch (error) {
    console.log('❌ Endpoint testing failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure your server is running: cd Server && npm start');
    }
    return false;
  }
}

// Function to display current configuration status
function displayConfig() {
  console.log('\n📋 Current Configuration Status:');
  console.log('=================================');
  
  const configs = [
    { name: 'STRIPE_SECRET_KEY', value: process.env.STRIPE_SECRET_KEY, required: true },
    { name: 'STRIPE_PUBLISHABLE_KEY', value: process.env.STRIPE_PUBLISHABLE_KEY, required: true },
    { name: 'STRIPE_WEBHOOK_SECRET', value: process.env.STRIPE_WEBHOOK_SECRET, required: true },
    { name: 'MONGO_URI', value: process.env.MONGO_URI, required: true },
    { name: 'CLIENT_URL', value: process.env.CLIENT_URL, required: true }
  ];
  
  configs.forEach(config => {
    const status = config.value ? 
      (config.value === 'whsec_your_webhook_secret_here' ? '⚠️ PLACEHOLDER' : '✅ SET') : 
      '❌ MISSING';
    
    console.log(`${config.name}: ${status}`);
    if (config.required && (!config.value || config.value === 'whsec_your_webhook_secret_here')) {
      console.log(`  ⚠️ This is required for payment processing`);
    }
  });
}

// Main setup function
async function main() {
  displayConfig();
  
  const webhookSecret = await setupWebhook();
  
  if (webhookSecret) {
    console.log('\n🎉 Webhook setup completed automatically!');
    console.log(`Update your .env file with: STRIPE_WEBHOOK_SECRET=${webhookSecret}`);
  }
  
  const endpointTest = await testPaymentEndpoints();
  
  console.log('\n📋 Setup Summary:');
  console.log('=================');
  console.log(`✅ Stripe initialization: Working`);
  console.log(`${endpointTest ? '✅' : '❌'} Payment endpoints: ${endpointTest ? 'Working' : 'Need fixing'}`);
  console.log(`${process.env.STRIPE_WEBHOOK_SECRET !== 'whsec_your_webhook_secret_here' ? '✅' : '⚠️'} Webhook secret: ${process.env.STRIPE_WEBHOOK_SECRET !== 'whsec_your_webhook_secret_here' ? 'Configured' : 'Needs setup'}`);
  
  console.log('\n🚀 Next Steps:');
  console.log('==============');
  if (process.env.STRIPE_WEBHOOK_SECRET === 'whsec_your_webhook_secret_here') {
    console.log('1. Configure webhook secret in .env file');
  }
  if (!endpointTest) {
    console.log('1. Start your server: cd Server && npm start');
  }
  console.log('2. Test complete payment flow with frontend');
  console.log('3. Make a test purchase to verify everything works');
  
  console.log('\n💡 For production deployment:');
  console.log('=============================');
  console.log('1. Replace ngrok URL with your production domain');
  console.log('2. Update webhook endpoint in Stripe Dashboard');
  console.log('3. Update CLIENT_URL in .env to production URL');
}

// Run setup
main().catch(console.error);