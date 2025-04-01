import xml2js from "xml2js";
import fs from "fs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "./models/UserModel.js"; // Ensure correct path
import { neo4jDriver } from "./config/neo4j.js"; // Ensure correct path
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const GLOBAL_XML_PATH = "./mapper/global_schema.xml";
const folderPath = path.join(process.cwd(), "mapper");

// Ensure the folder exists
if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath);
}
// Function to generate global XML schema
export const generateGlobalXMLSchema = async () => {
    const session = neo4jDriver.session();

    try {
        console.log("Fetching all users from MongoDB...");
        const users = await User.find().lean();

        if (!users.length) {
            console.warn("No users found in MongoDB.");
            return;
        }

        let userEntries = [];

        for (let user of users) {
            console.log(`Fetching food preferences for userId: ${user.userId} from Neo4j...`);
            const neo4jData = await session.run(
                `
                MATCH (u:User {userId: $userId})-[:LIKES]->(f:Food)
                RETURN COLLECT(f.name) AS foodPreferences
                `,
                { userId: user.userId }
            );

            const foodPreferences = neo4jData.records.length > 0 ? neo4jData.records[0].get("foodPreferences") : [];

            userEntries.push({
                user: {
                    userId: user.userId,
                    name: user.name,
                    age: user.age,
                    dietType: user.dietType,
                    calorieTarget: user.calorieTarget,
                    foodPreferences: foodPreferences.length > 0 ? foodPreferences : ["No preferences found"],
                },
            });
        }

        console.log("Generating Global XML Schema...");

        const data = { users: userEntries };

        const builder = new xml2js.Builder();
        const xml = builder.buildObject(data);

        // Ensure "mapper/" directory exists
        const dir = "./mapper";
        if (!fs.existsSync(dir)) {
            console.log("Creating mapper directory...");
            fs.mkdirSync(dir, { recursive: true }); // ✅ Ensure folder creation works
        }

        console.log(`Saving XML file to: ${GLOBAL_XML_PATH}`); // ✅ Add this
        fs.writeFileSync(GLOBAL_XML_PATH, xml);
        console.log(`✅ Global XML Schema saved successfully at ${GLOBAL_XML_PATH}`);
        

        return xml;
    } catch (error) {
        console.error("❌ Error generating Global XML Schema:", error);
        throw error;
    } finally {
        await session.close();
    }
};
export const loginUser = async (req, res) => {
    const { userId, password } = req.body;

    try {
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ message: "Login successful", token });
    } catch (error) {
        console.error("❌ Error logging in:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Function to update global XML when a user is registered
const updateGlobalXMLSchema = async () => {
    try {
        console.log("🔄 Updating Global XML Schema...");
        await generateGlobalXMLSchema();
    } catch (error) {
        console.error("❌ Error updating Global XML Schema:", error);
    }
};

// Register User (MongoDB + Neo4j) and update global XML
export const registerUser = async (req, res) => {
    const { userId, name, age, dietType, calorieTarget, password, foodPreferences } = req.body;

    try {
        console.log("Registering new user...");

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save to MongoDB
        const newUser = new User({ userId, name, age, dietType, calorieTarget, password: hashedPassword });
        await newUser.save();
        console.log(`✅ User saved to MongoDB: ${userId}`);

        // Save Food Preferences to Neo4j as Relationships
        const session = neo4jDriver.session();
        await session.run(
            `
            MERGE (u:User {userId: $userId})
            ON CREATE SET u.userId = $userId
            WITH u
            UNWIND $foodPreferences AS food
            MERGE (f:Food {name: food})
            MERGE (u)-[:LIKES]->(f)
            `,
            { userId, foodPreferences }
        );
        await session.close();
        console.log(`✅ Food preferences saved to Neo4j for user: ${userId}`);

        // Update the Global XML Schema
        console.log("Calling updateGlobalXMLSchema...");
        await updateGlobalXMLSchema();
        console.log("✅ Global XML Schema Updated");

        res.json({ message: "✅ User Registered & Global XML Schema Updated" });
    } catch (error) {
        console.error("❌ Error Registering User:", error);
        res.status(500).json({ error: "Error Registering User" });
    }
};
