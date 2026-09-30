// Filename: server/models/offerModel.js

import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true, 
    },
  
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, 
    },
    message: {
      type: String,
      required: [true, "Offer message is required."],
      trim: true,
      maxlength: [50000, "Offer message cannot be more than 50000 characters."],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Offer = mongoose.model("Offer", offerSchema);

export default Offer;