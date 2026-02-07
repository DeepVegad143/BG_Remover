import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { assets } from '../assets/assets/assets';
import { AppContext } from '../context/appContext';

const Success = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { fetchCredits } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        setMessage('Invalid payment session');
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(
          `http://localhost:4000/api/payment/verify-session?session_id=${sessionId}`
        );
        
        if (data.success) {
          setSuccess(true);
          setMessage('Payment successful! Credits have been added to your account.');
          // Refresh credits after successful payment
          await fetchCredits();
        } else {
          setMessage('Payment verification failed. Please contact support.');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setMessage('Payment verification failed. Please contact support.');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleContinue = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {success ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="flex items-center justify-center mb-6">
                <img src={assets.credit_icon} alt="Credits" className="w-6 h-6 mr-2" />
                <span className="text-lg font-semibold text-violet-600">Credits Added Successfully</span>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Issue</h1>
              <p className="text-gray-600 mb-6">{message}</p>
            </>
          )}
          
          <button
            onClick={handleContinue}
            className="w-full py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition font-medium"
          >
            Continue to App
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;