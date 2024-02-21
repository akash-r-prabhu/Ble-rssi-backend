// app.js

const express = require("express");
const bodyParser = require("body-parser");
const User = require("./models/user");
const sequelize = require("./database/connection");
const CSIInformation = require("./models/csiInformation");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Define associations if needed

// Sync the models with the database
sequelize
  .sync()
  .then(() => {
    console.log("Database synchronized");
  })
  .catch((err) => {
    console.error("Unable to sync database:", err);
  });

// Get and store CSI information
app.post("/csi", async (req, res) => {
  const { data } = req.body;
  if (!data) {
    return res.status(400).send("Please provide CSI data");
  }

  try {
    // Assuming you have a model named CSIInformation
    const csiEntry = await CSIInformation.create({ data });
    res.status(201).json(csiEntry);
  } catch (err) {
    console.error("Error storing CSI information:", err);
    res.status(500).send("Error storing CSI information");
  }
});

// Register a new user
app.post("/register", async (req, res) => {
  const { username, password, role, verifierUsername } = req.body;
  if (!username || !password || !role) {
    return res.status(400).send("Please provide username, password, and role");
  }

  try {
    if (role === "PA") {
      // Check if the verifier (main person) exists
      const verifier = await User.findOne({
        where: { username: verifierUsername, role: "MainPerson" },
      });
      if (!verifier) {
        return res.status(404).send("Verifier not found or not authorized");
      }
    }

    await User.create({ username, password, role });
    res.status(201).send("User registered successfully");
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).send("Error registering user");
  }
});

// User login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).send("User not found");
    }
    if (user.password !== password) {
      return res.status(401).send("Invalid password");
    }
    res.send("Login successful");
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).send("Error logging in");
  }
});

// Forgot Password Endpoint
app.post("/forgot-password", async (req, res) => {
  const { username, newPassword } = req.body;
  if (!username || !newPassword) {
    return res.status(400).send("Please provide username and new password");
  }

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.send("Password updated successfully");
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).send("Error updating password");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
