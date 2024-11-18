const mongoose = require("mongoose");
const { Schema } = mongoose;

const CustomerSchema = new Schema(
  {
    uid: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    age: {
      type: Number,
      required: true,
      validate: {
        validator: (value) => value > 0,
        message: "Age must be a positive number",
      },
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    lastVisit: {
      type: Date,
      required: true,
      validate: {
        validator: (value) => value <= new Date(),
        message: "Last visit cannot be in the future",
      },
    },
    totalVisits: { type: Number, required: true, default: 0 },
    latestPurchase: { type: Number, required: true },
    totalPurchase: { type: Number, required: true, default: 0 },
  },
  {
    collection: "customerinfo",
    timestamps: true,
  }
);

CustomerSchema.index({ uid: 1, email: 1 }, { unique: true });
CustomerSchema.index({ lastVisit: -1 });

module.exports = mongoose.model("customerinfo", CustomerSchema);
