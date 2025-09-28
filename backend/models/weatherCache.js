import mongoose from "mongoose";

//Defines a schema for the database based on the values stored. It defines its datatype, default values, etc.
const weatherCacheSchema = new mongoose.Schema({
  //Tip: Use index on fields used for search/filter frequently to query faster
  city: { type: String, required: true, lowercase: true, index:true },
  data: { type: mongoose.Schema.Types.Mixed, required:true },
  timestamp: { type: Date, default: Date.now }
});

//TTL (Time to Live) index based on the timestamp field, to auto delete after the specified time, to ensure cache doesn't grow big.
weatherCacheSchema.index({ timestamp: 1 },{ expireAfterSeconds: 6 * 60 * 60 });   //timestamp: 1 for ascending order > older ones first (-1 descending)

//Creates a model for the schema so CRUD operartions can be performed on it.
export default mongoose.model("weatherCache", weatherCacheSchema);