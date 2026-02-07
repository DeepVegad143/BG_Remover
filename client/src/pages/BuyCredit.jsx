import React from 'react';
import { assets, plans } from '../assets/assets/assets';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';

const BuyCredit = () => {
  const { user } = useUser();

  const handlePurchase = async (plan) => {
    if (!user) {
      alert('Please sign in to purchase credits.');
      return;
    }

    try {
      // Call backend to create Stripe checkout session
      const { data } = await axios.post(
        'http://localhost:4000/api/payment/create-checkout-session',
        { 
          plan: plan,
          clerkId: user.id 
        }
      );
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] text-center pt-14 mb-10 bg-gray-50">
      {/* Section Header */}
      <button className="px-4 py-1 text-sm font-medium text-violet-600 bg-violet-100 rounded-full mb-4">
        Our Plans
      </button>
      <h1 className="text-2xl font-bold text-gray-800 mb-10">
        Choose the plan that's right for you
      </h1>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
        {plans.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center hover:shadow-xl transition"
          >
            {/* Logo */}
            <img src={assets.logo_icon} alt="" className="h-10 mb-4" />

            {/* Plan Title */}
            <p className="text-lg font-semibold text-gray-800">{item.id}</p>
            <p className="text-gray-500 text-sm mb-4">{item.desc}</p>

            {/* Price */}
            <p className="text-3xl font-bold text-gray-900 mb-2">
              Rs.{item.price}
            </p>
            <p className="text-gray-500 text-sm mb-6">
              / {item.credits} credits
            </p>

            {/* Button */}
            <button
              onClick={() => handlePurchase(item.id)}
              className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
            >
              Purchase
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyCredit;
