const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { initializeOracle } = require("./src/utils/database");
const apiRoutes = require("./src/routes/api");

const app = express();
const PORT = process.env.PORT || 3002; // Changed to 3002 to avoid conflicts

// Initialize Oracle client
initializeOracle();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// ================== ROUTES ================== //

// Landing page (main index)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Customer form page
app.get("/customer", (req, res) => {
  res.sendFile(path.join(__dirname, "customer.html"));
});

// Admin dashboard
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// API routes
app.use("/api", apiRoutes);

// Legacy route mappings for backward compatibility
app.post("/submit-form", (req, res) => {
  // Redirect to new API endpoint
  req.url = "/api/submit-form";
  app._router.handle(req, res);
});

app.post("/add-doll", (req, res) => {
  // Redirect to new API endpoint
  req.url = "/api/add-doll";
  app._router.handle(req, res);
});

app.post("/add-letter", (req, res) => {
  // Redirect to new API endpoint
  req.url = "/api/add-letter";
  app._router.handle(req, res);
});

// ================== START SERVER ================== //
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Admin Dashboard: http://localhost:${PORT}/admin`);
  console.log(`👥 Customer Form: http://localhost:${PORT}/customer`);
  console.log(`🔧 Using port: ${PORT}`);
});