const express = require("express");
const bodyParser = require("body-parser");
const oracledb = require("oracledb");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (your HTML and CSS)
app.use(express.static(__dirname));

// Oracle DB config
const dbConfig = {
  user: "SVANEGAS",     // put your Oracle username
  password: "SVANEGAS", // put your Oracle password
  connectString: "localhost:1521/xe" // adjust: host:port/service_name
};

// Route to handle form submission
app.post("/submit-form", async (req, res) => {
  const { name, city, address, phone, email } = req.body;

  try {
    const connection = await oracledb.getConnection(dbConfig);

    await connection.execute(
      `INSERT INTO CLIENTS (NAME, CITY, ADDRESS, PHONE, EMAIL)
       VALUES (:name, :city, :address, :phone, :email)`,
      [name, city, address, phone, email],
      { autoCommit: true }
    );

    await connection.close();

    res.send("✅ Data saved successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Error saving data");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});