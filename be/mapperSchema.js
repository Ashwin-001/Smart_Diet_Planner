import fs from "fs";
import { User } from "./models.js";
import { neo4jDriver } from "./config.js";
import xml2js from "xml2js";

export const generateXMLMapper = async (userId) => {
    const session = neo4jDriver.session();
    
    try {
        const user = await User.findOne({ userId });

        const neo4jData = await session.run(
            `MATCH (u:User {userId: $userId}) RETURN u.foodPreferences AS foodPreferences`,
            { userId }
        );

        const foodPreferences = neo4jData.records.length > 0 ? neo4jData.records[0].get("foodPreferences") : [];

        const data = {
            user: {
                userId: user.userId,
                name: user.name,
                age: user.age,
                dietType: user.dietType,
                calorieTarget: user.calorieTarget,
                foodPreferences: foodPreferences
            }
        };

        const builder = new xml2js.Builder();
        const xml = builder.buildObject(data);
        
        fs.writeFileSync(`./mapper/${userId}.xml`, xml);
        return xml;
    } catch (error) {
        console.error("Error generating XML:", error);
    } finally {
        await session.close();
    }
};
