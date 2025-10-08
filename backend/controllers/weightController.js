import Weight from "../models/weight.js";

//GET /weights/:year/:month - Fetch existing data
export const getWeightData = async (req, res) => {
  const { year, month } = req.params;
  const dataKey = `${year}-${month}`;

  try {
    let weightDoc = await Weight.findOne({ userId: req.user.id });      //Fetches the document by userId if it exists

    if (!weightDoc) return res.json({});                                //No data yet, send empty response

    const weightData = weightDoc.weightData[dataKey] || {};
    res.json(weightData);
  }
  catch (err) {
    console.log("Fetch weight error: ", err);
    return res.status(500).json({ error: "Server error" });
  }
};

//POST /weights/:year/:month - Save/Overwrite new data
export const postWeightData = async (req, res) => {
  const { year, month } = req.params;
  const dataKey = `${year}-${month}`;
  const data = req.body;

  if (!data || typeof data !== "object") {
    return res.status(400).json({ error: "Invalid data format" });
  }

  try {
    let weightDoc = await Weight.findOne({ userId: req.user.id });

    if (!weightDoc) {
      weightDoc = new Weight({ userId: req.user.id, weightData: {} });      //If no document exists for userId, create a userId with blank weightData
    }

    weightDoc.weightData[dataKey] = data;
    weightDoc.markModified("weightData");           //Inform Mongoose that 'weightData' has changed (needed when modifying nested/dynamic keys & type is object/mixed)
    await weightDoc.save();

    res.json({ message: "Data saved", dataKey, data });
  }
  catch (err) {
    console.log("Save weight error: ", err);
    res.status(500).json({ error: "Server error" });
  }
};