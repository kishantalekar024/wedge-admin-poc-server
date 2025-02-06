const mongoose = require("mongoose");
const fs = require("fs/promises");
const OnBoarding = require("../models/Onboarding");
const path = require("path");
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

// Clean and prepare data
function prepareData(data) {
  return data.map((record) => {
    // Convert 'null' strings to actual null values
    if (record.failureReason === "null") {
      record.failureReason = "";
    }

    // Clean IDVs
    if (record.idvs) {
      record.idvs = record.idvs.map((idv) => {
        if (idv.failureCode === "null") {
          idv.failureCode = "";
        }
        return idv;
      });
    }

    return record;
  });
}

async function insertData() {
  try {
    const rawData = await fs.readFile(
      path.join(__dirname, "ADMIN_PORTAL.json"),
      "utf8"
    );
    const records = JSON.parse(rawData);

    console.log(`Processing ${records.length} records...`);

    // Insert the data
    console.log(`Processing ${records.length} records...`);

    // Insert data
    const result = await OnBoarding.insertMany(prepareData(records), {
      ordered: true, // Continues insertion even if some documents fail
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
