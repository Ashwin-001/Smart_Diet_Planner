import { neo4jDriver } from "./config.js";

export const storeFoodPreferences = async (userId, foodPreferences) => {
    const session = neo4jDriver.session();
    try {
        await session.run(
            `MERGE (u:User {userId: $userId}) 
             SET u.foodPreferences = $foodPreferences`,
            { userId, foodPreferences }
        );
    } finally {
        await session.close();
    }
};
