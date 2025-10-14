import Weight from "../models/weight.js";

//GET /weights - Fetch all existing weightData of user
export const getAllWeightData = async (req, res) => {
  try {
    let weightDoc = await Weight.findOne({ userId: req.user.id });      //Fetches the document by userId if it exists

    if (!weightDoc) return res.json({});                                //No data yet, send empty response

    const weightData = weightDoc.weightData || {};
    res.json(weightData);
  }
  catch (err) {
    console.log("Fetch all weights error: ", err);
    return res.status(500).json({ error: "Server error" });
  }
};

//GET /weights/:year/:month - Fetch existing weightData per month of user
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
    let weightDoc = await Weight.findOne({ userId: req.user.id });          //Check if a weight document already exists in the database for the current user

    if (!weightDoc) {
      weightDoc = new Weight({ userId: req.user.id, weightData: {} });      //If no document exists for userId, create a blank weightData for the same userId
    }

    weightDoc.weightData[dataKey] = data;
    weightDoc.markModified("weightData");           //Inform Mongoose that 'weightData' has changed (needed when modifying nested/dynamic keys & type is object/mixed)
    await weightDoc.save();                         //Explicitly call it to save the new weight document to the database

    res.json({ message: "Data saved", dataKey, data });
  }
  catch (err) {
    console.log("Save weight error: ", err);
    res.status(500).json({ error: "Server error" });
  }
};

//POST /weights/migrate - Migrate and sync pre-login data to the user db.
export const migrateWeightData = async (req, res) => {
  const weightData = req.body.data;                            //body eg: { "2025-9": { "1": 65, "2": 64.5 }, ... }
  const overwrite = req.body.overwrite;                        //Get the overwrite flag from frontend

  if (!weightData || typeof weightData !== "object") {
    return res.status(400).json({ error: "Missing or Invalid data format" });
  }

  const userId = req.user.id;
  try {
    let weightDoc = await Weight.findOne({ userId });       //Check if a weight document already exists in the database for the current user

    if (!weightDoc) {
      weightDoc = new Weight({ userId, weightData });       //If no document exists for userId, create new doc with the weightData for the same userId
    }
    else {
      if (overwrite && Object.keys(weightData).length === 0) {
        weightDoc.weightData = {};
      }
      else {
        //Merge: server keeps existing months unless overwritten by local data.
        /*Loop through each [key, value] pair in weightData using Object.entries():
        Object.entries(weightData) > ["2025-9", { "1": 65, "2": 64.5 }] ; key = "2025-9", monthData = { "1": 65, "2": 64.5 }*/
        for (const [key, monthData] of Object.entries(weightData)) {
          if (overwrite) {
            weightDoc.weightData[key] = monthData;              //Full replacement of monthKey with either server/local data
          }
          else {
            weightDoc.weightData[key] = {
              ...weightDoc.weightData[key],
              ...monthData                                      //Local values overwrite the server for same days
            };
          }
        }
        weightDoc.markModified("weightData");
      }
    }

    await weightDoc.save();                                 //Explicitly call it to save the new/updated weight document to the database
    res.json({ message: "Migrated data successfully", weightData: weightDoc.weightData });
  }
  catch (err) {
    console.log("Migration error: ", err);
    res.status(500).json({ error: "Server error during migration" });
  }
};