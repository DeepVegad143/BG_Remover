import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  clerkId: {
    type: String,
    required: true,
    index: true
  },
  plan: {
    type: String,
    required: true,
    enum: ["Basic", "Advanced", "Business"]
  },
  credits: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "completed", "failed", "expired"],
    default: "pending"
  },
  processedAt: {
    type: Date,
    default: null
  },
  stripeMetadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient querying
paymentSchema.index({ clerkId: 1, createdAt: -1 });
paymentSchema.index({ sessionId: 1, status: 1 });

const paymentModel = mongoose.model("Payment", paymentSchema);

export default paymentModel;