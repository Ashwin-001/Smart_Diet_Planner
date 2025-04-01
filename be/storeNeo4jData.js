import { neo4jDriver } from "./config/neo4j.js";

export const storeFoodPreferences = async (userId, foodPreferences) => {
    const session = neo4jDriver.session();
    try {
        await session.writeTransaction(async tx => {
            // Ensure the User node exists only once
            await tx.run(
                `MERGE (u:User {userId: $userId})`,
                { userId }
            );

            // Ensure relationships are unique
            for (const food of foodPreferences) {
                await tx.run(
                    `MERGE (f:Food {name: $food}) 
                     MERGE (u:User {userId: $userId})-[:LIKES]->(f)`,
                    { userId, food }
                );
            }
        });

        console.log(`✅ Food preferences added for user ${userId}`);
    } catch (error) {
        console.error("❌ Error storing food preferences in Neo4j:", error);
    } finally {
        await session.close();
    }
};

