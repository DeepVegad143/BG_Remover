// routes/userRouter.js
import express from "express";
import { clerkWebhooks, userCredits } from "../controllers/userController.js";
import authUser from "../Middlewares/auth.js";

const userRouter = express.Router();

// Clerk webhook route
userRouter.post("/webhooks", clerkWebhooks);

// Get user credits route (protected with auth middleware)
userRouter.get("/credits", authUser, userCredits);

export default userRouter;
