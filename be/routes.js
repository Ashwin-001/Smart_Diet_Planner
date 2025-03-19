import express from "express";
import { User } from "./models.js";
import { storeFoodPreferences } from "./storeNeo4jData.js";
import { generateXMLMapper } from "./mapperSchema.js";

const router = express.Router();

// Store User Details (MongoDB) & Food Preferences (Neo4j)
router.post("/register", async (req, res) => {
    const { userId, name, age, dietType, calorieTarget, foodPreferences } = req.body;

    try {
        const newUser = new User({ userId, name, age, dietType, calorieTarget });
        await newUser.save();

        await storeFoodPreferences(userId, foodPreferences);
        
        res.json({ message: "User Registered in MongoDB & Neo4j" });
    } catch (error) {
        res.status(500).json({ error: "Error Registering User" });
    }
});

// Fetch Integrated Data (From XML)
router.get("/get-user/:userId", async (req, res) => {
    const userId = req.params.userId;
    
    try {
        const xmlData = await generateXMLMapper(userId);
        res.type("application/xml").send(xmlData);
    } catch (error) {
        res.status(500).json({ error: "Error Fetching User Data" });
    }
});

export default router;
