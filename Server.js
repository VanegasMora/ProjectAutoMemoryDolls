const express = require("express");
const bodyParser = require("body-parser");
const oracledb = require("oracledb");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to Oracle DB
async function initDB() {
  try {
    await oracledb.createPool({
      user: "SVANEGAS",
      password: "SVANEGAS",
      connectString: "localhost:1521/xe" 
    });
    console.log("✅ Connected to Oracle Database");
  } catch (err) {
    console.error("DB Connection Error:", err);
  }
}
initDB();

// Handle form submission
app.post("/submit-form", async (req, res) => {
  const { name, city, address, phone, email } = req.body;

  try {
    const connection = await oracledb.getConnection();
    await connection.execute(
      `INSERT INTO clients (name, city, address, phone, email)
       VALUES (:name, :city, :address, :phone, :email)`,
      { name, city, address, phone, email },
      { autoCommit: true }
    );
    res.send("✅ Form data saved to Oracle!");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Error saving data");
  }
});

// Start server
app.listen(3000, () => console.log("Server running on http://localhost:3000"));