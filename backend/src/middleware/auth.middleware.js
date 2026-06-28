import { getAuth } from "@clerk/express";
import { User } from "../models/user.model.js";

export async function protectRoute(req, res, next) {
    try{
        const { userId } = await getAuth(req);

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await User.findOne({clerkId: userId});

        if (!user) {
            res.status(401).json({ message: "User profile is not Synced yet" });
            return;
        } 
        
        req.user = user;

        next()
    }catch (error) {
        console.log("Error in protectRoute middleware: ", error);   
        res.status(500).json({ message: "Internal Server Error" });
    }
}