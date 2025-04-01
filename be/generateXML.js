import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { User } from "./models/UserModel.js";
import driver from "./config/neo4j.js";
import { Builder } from "xml2js"; // Convert JSON to XML

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const generateXMLMapper = async () => {
    console.log("⚙️ Running generateXMLMapper...");

    const session = driver.session();
    const mapperDir = path.join(__dirname, "mapper");
    const filePath = path.join(mapperDir, "mapperSchema.xml");

    try {
        // ✅ Ensure 'mapper' folder exists
        if (!fs.existsSync(mapperDir)) {
            console.log("📂 'mapper' folder not found. Creating...");
            fs.mkdirSync(mapperDir, { recursive: true });
        }

        console.log("📂 Directory verified:", mapperDir);

        // Fetch all users from MongoDB
        const users = await User.find();
        
        // Initialize XML structure
        let xmlData = {
            globalSchema: {
                users: [],
                foodPreferences: []
            }
        };

        for (let user of users) {
            // Fetch food preferences from Neo4j
            const result = await session.run(
                `MATCH (u:User {userId: $userId})-[r:LIKES]->(f:Food) RETURN collect(f.name) AS foodPreferences`,
                { userId: user.userId }
            );

            // Extract food preferences or set empty array if not found
            const foodPreferences = result.records.length > 0 && result.records[0].get("foodPreferences")
                ? result.records[0].get("foodPreferences")
                : [];

            console.log(`👤 Processing user: ${user.userId}, Food Preferences:`, foodPreferences);

            // Add user data
            xmlData.globalSchema.users.push({
                userId: user.userId,
                name: user.name,
                age: user.age,
                dietType: user.dietType || "Not specified",
                calorieTarget: user.calorieTarget || "Not specified"
            });

            // Add food preferences data
            xmlData.globalSchema.foodPreferences.push({
                userId: user.userId,
                liked: foodPreferences.length > 0 ? foodPreferences.join(", ") : "None",
            });
        }

        // Convert JSON to XML
        const builder = new Builder();
        const xmlContent = builder.buildObject(xmlData);

        // ✅ Debugging step
        console.log("📁 Writing XML to:", filePath);

        // Write XML file and check for errors
        try {
            fs.writeFileSync(filePath, xmlContent);
            console.log(`✅ XML file generated successfully at: ${filePath}`);
        } catch (err) {
            console.error("❌ File Write Error:", err);
        }

    } catch (error) {
        console.error("❌ Error generating XML:", error);
    } finally {
        await session.close();
    }
};
