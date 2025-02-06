const mongoose = require("mongoose");
const fs = require("fs/promises");
const OnBoarding = require("../models/Onboarding");
const path = require("path");
const IDV = require("../models/IDV");
// MongoDB connection URI - replace with your connection string
const uri =
  "mongodb+srv://test:huZUUlNf7ZKgo4sH@cluster0.0te3dg9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB
mongoose.connect(uri);

// Connection error handling
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});

async function prepareData(data) {
  return Promise.all(
    data.map(async (record) => {
      // Convert 'null' strings to empty strings
      if (record.failureReason === "null") {
        record.failureReason = null;
      }

      // Insert IDVs separately and store their ObjectIds
      if (record.idvs && record.idvs.length > 0) {
        const idvIds = await Promise.all(
          record.idvs.map(async (idv) => {
            if (idv.failureCode === "null") {
              idv.failureCode = null;
            }
            const idvDoc = await IDV.create(idv); // Insert into IDV collection
            return idvDoc._id; // Store reference ID
          })
        );
        record.idvs = idvIds; // Replace with ObjectIds
      }

      return record;
    })
  );
}

async function insertData() {
  try {
    const rawData = await fs.readFile(
      path.join(__dirname, "ADMIN_PORTAL.json"),
      "utf8"
    );
    const records = JSON.parse(rawData);

    console.log(`Processing ${records.length} records...`);

    // Prepare data asynchronously
    const preparedRecords = await prepareData(records); // 🔹 Fix: Await preparation

    // Insert OnBoarding records
    const result = await OnBoarding.insertMany(preparedRecords, {
      ordered: true,
    });

    console.log(`Successfully imported ${result.length} records`);
    return result;
  } catch (error) {
    if (error.code === 11000) {
      console.error("Duplicate key error. Some records may already exist.");
    } else {
      console.error("Error:", error);
    }
    throw error;
  }
}

// Main execution
async function main() {
  try {
    await insertData();
    console.log("Data insertion completed successfully");
  } catch (error) {
    console.error("Failed to insert data:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

// Run the script
main();
