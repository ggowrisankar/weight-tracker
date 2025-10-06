import mongoose from "mongoose";

const weightSchema = new mongoose.Schema({
  userId: {                                             //Use ObjectId & ref if 2 collections are logically related (Standard practice)
    type: mongoose.Schema.Types.ObjectId,               //Stores the unique ID (_id) of the referenced User document
    ref: "User",                                        //Tells Mongoose this ObjectId refers to the 'User' model (for population)
    required: true,
    unique:true 
  },
  weightData: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });                               //Automatically adds createdAt & updatedAt

export default mongoose.model("Weight", weightSchema);