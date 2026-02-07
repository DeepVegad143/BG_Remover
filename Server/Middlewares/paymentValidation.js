// Payment validation middleware

export const validatePaymentRequest = (req, res, next) => {
  const { plan, clerkId } = req.body;
  
  // Check required fields
  if (!plan) {
    return res.status(400).json({
      success: false,
      error: "Plan is required"
    });
  }
  
  if (!clerkId) {
    return res.status(400).json({
      success: false,
      error: "ClerkId is required"
    });
  }
  
  // Validate plan
  const validPlans = ["Basic", "Advanced", "Business"];
  if (!validPlans.includes(plan)) {
    return res.status(400).json({
      success: false,
      error: `Invalid plan. Must be one of: ${validPlans.join(", ")}`
    });
  }
  
  // Validate clerkId format (basic check)
  if (typeof clerkId !== 'string' || clerkId.length < 5) {
    return res.status(400).json({
      success: false,
      error: "Invalid clerkId format"
    });
  }
  
  next();
};

// Rate limiting for payment requests (basic implementation)
const paymentAttempts = new Map();

export const rateLimitPayments = (req, res, next) => {
  const { clerkId } = req.body;
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxAttempts = 5;
  
  if (!paymentAttempts.has(clerkId)) {
    paymentAttempts.set(clerkId, []);
  }
  
  const attempts = paymentAttempts.get(clerkId);
  
  // Clean old attempts
  const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
  paymentAttempts.set(clerkId, recentAttempts);
  
  if (recentAttempts.length >= maxAttempts) {
    return res.status(429).json({
      success: false,
      error: "Too many payment requests. Please wait before trying again."
    });
  }
  
  // Record this attempt
  recentAttempts.push(now);
  paymentAttempts.set(clerkId, recentAttempts);
  
  next();
};