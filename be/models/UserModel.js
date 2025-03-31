import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  dietType: { type: String, required: true },
  calorieTarget: { type: Number, required: true },
  password: { type: String, required: true }, // For login
});

const User = mongoose.model("User", userSchema);

export default User;
