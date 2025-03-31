import fs from "fs";
import path from "path";
import { User } from "./models/UserModel.js";
import driver from "./config/neo4j.js";
import { Builder } from "xml2js"; // Convert JSON to XML

export const generateXMLMapper = async () => {
    const session = driver.session();
    const mapperDir = path.join(__dirname, "mapper");

    try {
        // ✅ Ensure 'mapper' folder exists before writing XML
        if (!fs.existsSync(mapperDir)) {
            fs.mkdirSync(mapperDir, { recursive: true });
        }

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
                `MATCH (u:User {userId: $userId}) RETURN u.foodPreferences AS foodPreferences`,
                { userId: user.userId }
            );

            // Extract food preferences or set empty array if not found
            const foodPreferences = result.records.length > 0 && result.records[0].get("foodPreferences") 
                ? result.records[0].get("foodPreferences") 
                : [];

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

        // ✅ Save XML to a file inside the 'mapper' directory
        const filePath = path.join(mapperDir, "mapperSchema.xml");
        fs.writeFileSync(filePath, xmlContent);
        
        console.log(`✅ XML file generated successfully at: ${filePath}`);

    } catch (error) {
        console.error("❌ Error generating XML:", error);
    } finally {
        await session.close();
    }
};
