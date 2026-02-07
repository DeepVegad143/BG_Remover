// API controller function to manage Clerk user with database
// http://localhost:4000/api/user/webhooks

import Svix from "svix";
import userModel from "../models/userModel.js";

const { Webhook } = Svix;

const clerkWebhooks = async (req, res) => {
  try {
    console.log("📩 Incoming webhook request");
    console.log("➡️ Headers:", req.headers);
    console.log("➡️ Body:", JSON.stringify(req.body, null, 2));

    // Create a svix webhook instance with Clerk secret
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;
    console.log("✅ Verified webhook type:", type);

    switch (type) {
      case "user.created": {
        const userData = {
          clerkId: data.id,
          email: data.email_addresses?.[0]?.email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url,
        };

        console.log("📝 Creating user:", userData);
        await userModel.create(userData);
        res.json({ success: true });
        break;
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses?.[0]?.email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url,
        };

        console.log("🔄 Updating user:", userData);
        await userModel.findOneAndUpdate({ clerkId: data.id }, userData);
        res.json({ success: true });
        break;
      }

      case "user.deleted": {
        console.log("🗑️ Deleting user:", data.id);
        await userModel.findOneAndDelete({ clerkId: data.id });
        res.json({ success: true });
        break;
      }

      default:
        console.log("⚠️ Unhandled webhook type:", type);
        res.json({ success: true, message: "Unhandled event" });
    }
  } catch (error) {
    console.error("❌ Webhook error:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

//api controller function to get user available credits data
const userCredits = async (req,res) => {
    try {
        
        const {clerkId} = req.body
        const userData = await userModel.findOne({clerkId})
        res.json({success: true, credits: userData.creditBalance})

    } catch (error) {
        console.error("❌ Webhook error:", error.message);
        res.status(400).json({ success: false, message: error.message });
    }

}


export { clerkWebhooks , userCredits };

