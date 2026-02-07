import express from "express";
import { createCheckoutSession, verifyCheckoutSession, handleWebhook } from "../controllers/paymentController.js";
import { validatePaymentRequest, rateLimitPayments } from "../Middlewares/paymentValidation.js";

const router = express.Router();

// POST /api/payment/webhook - Raw middleware handled in server.js
router.post("/webhook", handleWebhook);

// POST /api/payment/create-checkout-session
router.post("/create-checkout-session", rateLimitPayments, validatePaymentRequest, createCheckoutSession);

// GET /api/payment/verify-session  
router.get("/verify-session", verifyCheckoutSession);

export default router;
