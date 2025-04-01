import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectMongoDB } from "./config/mongodb.js";
import router from "./routes.js";
import { neo4jDriver } from "./config/neo4j.js";
import bcrypt from "bcrypt";
import session from "express-session";
import User from "./models/UserModel.js";
import { storeFoodPreferences } from "./storeNeo4jData.js";
import { generateGlobalXMLSchema } from "./mapperSchema.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Session setup
app.use(
  session({
    secret: "secretkey", // Change this to a secure secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

// Connect to MongoDB
connectMongoDB();

// Check Neo4j connection
(async () => {
  try {
    await neo4jDriver.verifyConnectivity();
    console.log("✅ Neo4j Connected!");
  } catch (error) {
    console.error("❌ Neo4j Connection Error:", error);
  }
})();


app.post("/register", async (req, res) => {
  const { userId, name, age, dietType, calorieTarget, password, foodPreferences } = req.body;

  if (!userId || !name || !age || !dietType || !calorieTarget || !password || !foodPreferences) {
    return res.status(400).json({ message: "All fields are required, including food preferences" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Store user in MongoDB
    const user = new User({ userId, name, age, dietType, calorieTarget, password: hashedPassword });
    await user.save();

    // Store food preferences in Neo4j
    await storeFoodPreferences(userId, foodPreferences);

    // ✅ Trigger XML Generation after user is created
    console.log("Generating global XML after registration...");
    await generateGlobalXMLSchema(); // ✅ Add this line

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
});





app.post("/login", async (req, res) => {
  const { userId, password } = req.body;
  try {
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    req.session.userId = user.userId; // Store user ID in session
    res.json({ message: "Logged in successfully" });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Failed to login" });
  }
});


// Middleware to authenticate session
function authenticateSession(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Access denied. Please login." });
  }
  next();
}

// Example protected route
router.get("/protected", authenticateSession, async (req, res) => {
  res.json({ message: "Hello, authenticated user!" });
});


// Use routes
app.use(router);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
