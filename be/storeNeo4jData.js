import { neo4jDriver } from "./config/neo4j.js";

export const storeFoodPreferences = async (userId, foodPreferences) => {
    const session = neo4jDriver.session();
    try {
        // Ensure the User node exists
        await session.run(
            `MERGE (u:User {userId: $userId}) 
             SET u.userId = $userId`,
            { userId }
        );

        // Loop through food preferences and create relationships
        for (const food of foodPreferences) {
            await session.run(
                `MERGE (f:Food {name: $food}) 
                 MERGE (u:User {userId: $userId})-[:LIKES]->(f)`,
                { userId, food }
            );
        }

        console.log(`✅ Food preferences added for user ${userId}`);
    } catch (error) {
        console.error("❌ Error storing food preferences in Neo4j:", error);
    } finally {
        await session.close();
    }
};
