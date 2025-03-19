import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    userId: String,  // Common key for integration
    name: String,
    age: Number,
    dietType: String,
    calorieTarget: Number
});

export const User = mongoose.model("User", UserSchema);
