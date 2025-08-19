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

// Handle doll submissions
app.post("/add-doll", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    const { name, age } = req.body;

    if (!name || !age) {
      return res.status(400).send("Missing required fields");
    }

   // ID limitado a 5 dígitos
  const id = Math.floor(Math.random() * 100000); 

  // Siempre que insertes un doll:
  const sql = `
    INSERT INTO AUTO_MEMORY_DOLL (id, name, age, doll_status_id)
    VALUES (:id, :name, :age, :status)`;

  const binds = {
    id,
    name,
    age,
    status: 1 // asegurarte que 1 exista en la tabla AUTO_MEMORY_DOLL_STATUS
  };

    await connection.execute(sql, binds, { autoCommit: true });

    res.send("✅ Doll created and set to Active!");
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
