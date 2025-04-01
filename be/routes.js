import express from "express";
import { registerUser, loginUser } from "./mapperSchema.js"; 
// Import register and login functions

import User from "./models/UserModel.js";
import { neo4jDriver } from "./config/neo4j.js"; // ✅ Import Neo4j driver

const router = express.Router();

// Register User (MongoDB + Neo4j)
router.post("/register", registerUser);

// Login User
router.post("/login", loginUser);

// Fetch Integrated Data (MongoDB + Neo4j) & Return XML
router.get('/get-user/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    // ✅ Fetch user details from MongoDB
    const user = await User.findOne({ userId }).lean().exec();
    if (!user) {
      console.error("❌ User not found in MongoDB:", userId);
      return res.status(404).send('<error>User not found</error>');
    }
    console.log("✅ User fetched from MongoDB:", user);

    // ✅ Fetch food preferences from Neo4j
    const session = neo4jDriver.session(); // ✅ Fix: Use `neo4jDriver.session()`
    const result = await session.run(
      `
      MATCH (u:User {userId: $userId})-[:LIKES]->(f:Food)
      RETURN COLLECT(f.name) AS foodPreferences
      `,
      { userId }
    );
    await session.close();

    // Extract food preferences
    const foodPreferences = result.records.length > 0 ? result.records[0].get('foodPreferences') : [];

    // ✅ Construct XML response
    let xmlResponse = `
      <user>
        <userId>${user.userId}</userId>
        <name>${user.name}</name>
        <age>${user.age}</age>
        <dietType>${user.dietType}</dietType>
        <calorieTarget>${user.calorieTarget}</calorieTarget>
        <foodPreferences>
          ${foodPreferences.length 
            ? foodPreferences.map(food => `<preference>${food}</preference>`).join('')
            : '<preference>No preferences found</preference>'
          }
        </foodPreferences>
      </user>
    `;

    res.header('Content-Type', 'application/xml');
    res.send(xmlResponse);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).send('<error>Internal Server Error</error>');
  }
});

export default router;
