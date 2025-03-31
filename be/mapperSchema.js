import xml2js from "xml2js";
import fs from "fs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "./models/UserModel.js"; // Ensure correct path
import { neo4jDriver } from "./config/neo4j.js"; // Ensure correct path

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // Add JWT secret

// Generate XML Mapper
export const generateXMLMapper = async (userId) => {
    const session = neo4jDriver.session();

    try {
        console.log("Fetching user from MongoDB...");
        const user = await User.findOne({ userId }).lean();

        if (!user) {
            console.error("User not found in MongoDB for ID:", userId);
            throw new Error("User not found");
        }

        console.log("Fetching food preferences from Neo4j...");
        const neo4jData = await session.run(
            `MATCH (u:User {userId: $userId}) RETURN u.foodPreferences AS foodPreferences`,
            { userId }
        );

        if (neo4jData.records.length === 0) {
            console.warn("No food preferences found in Neo4j for userId:", userId);
        }

        const foodPreferences = neo4jData.records.length > 0 ? neo4jData.records[0].get("foodPreferences") : [];

        const data = {
            user: {
                userId: user.userId,
                name: user.name,
                age: user.age,
                dietType: user.dietType,
                calorieTarget: user.calorieTarget,
                foodPreferences: foodPreferences,
            },
        };

        console.log("Generating XML...");
        const builder = new xml2js.Builder();
        const xml = builder.buildObject(data);

        fs.writeFileSync(`./mapper/${userId}.xml`, xml);
        console.log(`XML saved successfully for userId: ${userId}`);

        return xml;
    } catch (error) {
        console.error("Error generating XML:", error);
        throw error; // Rethrow for better debugging
    } finally {
        await session.close();
    }
};

// Register User (MongoDB + Neo4j)
export const registerUser = async (req, res) => {
    const { userId, name, age, dietType, calorieTarget, password, foodPreferences } = req.body;

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save to MongoDB
        const newUser = new User({ userId, name, age, dietType, calorieTarget, password: hashedPassword });
        await newUser.save();

        // Save Food Preferences to Neo4j
        const session = neo4jDriver.session();
        await session.run(
            `MERGE (u:User {userId: $userId}) SET u.foodPreferences = $foodPreferences`,
            { userId, foodPreferences }
        );

        res.json({ message: "User Registered in MongoDB & Neo4j" });
    } catch (error) {
        console.error("Error Registering User:", error);
        res.status(500).json({ error: "Error Registering User" });
    }
};

// Login User
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find User in MongoDB
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Verify Password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT Token
        const token = jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: "1h" });

        res.json({ token });
    } catch (error) {
        console.error("Error Logging In:", error);
        res.status(500).json({ message: "Failed to login" });
    }
};
