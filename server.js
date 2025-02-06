// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Enable CORS for all routes
app.use(cors());

const morgan = require("morgan");
// Install first: npm install morgan

// Basic logging
app.use(morgan("dev"));

// Or for more detailed logging
app.use(morgan("combined"));
// If you want to specify allowed origins:
const corsOptions = {
  origin: "*", // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["X-Total-Count"],
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

// Routes
app.use("/users", require("./routes/users"));
app.use("/posts", require("./routes/posts"));
app.use("/onboarding", require("./routes/onboarding"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
