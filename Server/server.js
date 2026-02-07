import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/mongodb.js';
import userRouter from './routes/userRouter.js';
import paymentRouter from './routes/paymentRouter.js';
import bgRemovalRouter from './routes/bgRemovalRouter.js';

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173"
}));

// Handle Stripe webhook BEFORE express.json() middleware
// This is required because Stripe webhooks need raw body for signature verification
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

// Apply JSON middleware to all other routes
app.use(express.json());

// DB Connection
try {
  await connectDB();
} catch (err) {
  console.error("❌ MongoDB Connection Error:", err.message);
  process.exit(1);
}

// Routes
app.get('/', (req, res) => {
  res.send("API is working ✅");
});

// Mount routers
app.use("/api/payment", paymentRouter);
app.use('/api/user', userRouter);
app.use('/api/bg-removal', bgRemovalRouter);

// Start server (only for local development)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// Export app for Vercel or other serverless deployment
export default app;
