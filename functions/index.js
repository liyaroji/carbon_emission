const functions = require("firebase-functions");

exports.calculateEmission = functions.https.onRequest((req, res) => {

  if (req.method === "GET") {
    return res.send("Backend is running successfully 🚀");
  }

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { electricity, fuel, travel } = req.body;

  const electricityEmission = electricity * 0.82;
  const fuelEmission = fuel * 2.68;
  const travelEmission = travel * 0.21;

  const total = electricityEmission + fuelEmission + travelEmission;

  res.json({
    electricityEmission,
    fuelEmission,
    travelEmission,
    total
  });
});