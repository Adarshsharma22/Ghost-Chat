import User from "../models/user.model.js";
import { verifyWebhook } from "@clerk/backend/webhooks";

const webhookHandler = async (req, res) => {
  try {
    const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    if (!signingSecret) {
      console.error("CLERK_WEBHOOK_SIGNING_SECRET is not set");
      return res.status(503).json({ message: "Webhook secret not configured" });
    }

    const payload = Buffer.isBuffer(req.body) 
      ? req.body.toString("utf8") 
      : req.body.toString();

    const request = new Request("http://internal", {
      method: "POST",
      headers: new Headers(req.headers),
      body: payload,
    });

    const evt = await verifyWebhook(request, { signingSecret });

    console.log(`Webhook received: ${evt.type}`);

    if (evt.type === "user.created" || evt.type === "user.updated") {
      const u = evt.data;

      const email = u.email_addresses?.find(e => e.id === u.primary_email_address_id)?.email_address 
                 || u.email_addresses?.[0]?.email_address;

      const fullName = [u.first_name, u.last_name].filter(Boolean).join(" ") 
                    || u.username 
                    || email?.split("@")[0] 
                    || "Unknown";

      const userData = {
        clerkId: u.id,
        email,
        fullName,
        profilePic: u.image_url || "",
      };

      const savedUser = await User.findOneAndUpdate(
        { clerkId: u.id },
        userData,
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      console.log("User saved/updated:", savedUser);
    } 
    else if (evt.type === "user.deleted") {
      await User.findOneAndDelete({ clerkId: evt.data.id });
      console.log("User deleted:", evt.data.id);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(400).json({ 
      message: "Webhook verification failed", 
      error: error.message 
    });
  }
};

export default webhookHandler;