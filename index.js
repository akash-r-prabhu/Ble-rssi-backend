const express = require("express");
const fs = require("fs").promises;
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;
const USERS_FILE = "users.json";

// Middleware
app.use(bodyParser.json());

// Load users from file
async function loadUsers() {
  try {
    const data = await fs.readFile(USERS_FILE);
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading users file:", err);
    return [];
  }
}

// Save users to file
async function saveUsers(users) {
  try {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("Error writing users file:", err);
  }
}

// Register a new user
app.post("/register", async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).send("Please provide username, password, and role");
  }

  let users = await loadUsers();
  users.push({ username, password, role });
  await saveUsers(users);
  res.status(201).send("User registered successfully");
});

// User login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  let users = await loadUsers();
  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(404).send("User not found");
  }
  if (user.password !== password) {
    return res.status(401).send("Invalid password");
  }
  res.send("Login successful");
});

// Vidhya creates a PA account
app.post("/create-pa-account", async (req, res) => {
  const { username, password } = req.body;
  let users = await loadUsers();
  const vidhya = users.find((u) => u.role === "Vidhya");
  if (!vidhya) {
    return res.status(404).send("Vidhya not found");
  }
  users.push({ username, password, role: "PA" });
  await saveUsers(users);
  res.status(201).send("PA account created successfully");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
