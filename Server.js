const express = require("express");
const bodyParser = require("body-parser");
const oracledb = require("oracledb");

const app = express();
const PORT = 3000;

const path = require("path");

// Landing page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "landing.html"));
});

// Admin dashboard (for now just a placeholder HTML)
app.get("/admin", (req, res) => {
  res.send("<h2>Admin Dashboard (coming soon)</h2>");
});

// Customer form (your existing index.html)
app.get("/customer", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (like index.html, styles.css)
app.use(express.static(path.join(__dirname)));

// Oracle DB connection config
const dbConfig = {
  user: "SVANEGAS",
  password: "SVANEGAS",
  connectString: "190.60.231.121:8080/isispdb.utadeo.edu.co"
};

// Route to serve the homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Handle form submissions
app.post("/submit-form", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    const { name, phone, city, letter_reason, email, address } = req.body;

    if (!name || !phone || !city || !letter_reason || !email || !address) {
      return res.status(400).send("Missing required fields");
    }

    // Generate ID (Oracle requires it and it's NOT NULL)
    const id = Math.floor(Math.random() * 1000000);

    const sql = `INSERT INTO CLIENT (id, name, phone, city, letter_reason, email, address)
                 VALUES (:id, :name, :phone, :city, :letter_reason, :email, :address)`;

    const binds = { id, name, phone, city, letter_reason, email, address };

    await connection.execute(sql, binds, { autoCommit: true });

    res.send("Form submitted successfully!");
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send("Internal Server Error: " + err.message);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
