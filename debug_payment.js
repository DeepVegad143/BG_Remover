#!/usr/bin/env node

import axios from 'axios';

// Test the payment verification endpoint
async function testPaymentVerification() {
    try {
        console.log('🧪 Testing payment verification endpoint...');
        
        // Test with a fake session_id to see what happens
        const response = await axios.get('http://localhost:4000/api/payment/verify-session?session_id=fake_session_123', {
            validateStatus: () => true // Don't throw on 4xx/5xx
        });
        
        console.log('📊 Response status:', response.status);
        console.log('📄 Response data:', response.data);
        
        // Test the credits endpoint
        console.log('\n🧪 Testing credits endpoint...');
        
        const creditsResponse = await axios.get('http://localhost:4000/api/bg-removal/credits', {
            headers: {
                'Authorization': 'Bearer fake_token'
            },
            validateStatus: () => true
        });
        
        console.log('📊 Credits response status:', creditsResponse.status);
        console.log('📄 Credits response data:', creditsResponse.data);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testPaymentVerification();