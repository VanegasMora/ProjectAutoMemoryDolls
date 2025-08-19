const express = require("express");
const bodyParser = require("body-parser");
const oracledb = require("oracledb");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Oracle DB config
const dbConfig = {
  user: "SVANEGAS",
  password: "SVANEGAS",
  connectString: "190.60.231.121:8080/isispdb.utadeo.edu.co"
};

// ================== ROUTES ================== //

// Landing page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "landing.html"));
});

// Customer form page
app.get("/customer", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// -------- CLIENT --------
app.post("/submit-form", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const { name, phone, city, letter_reason, email, address } = req.body;

    if (!name || !phone || !city || !letter_reason || !email || !address) {
      return res.status(400).send("Missing required fields");
    }

    const id = Math.floor(Math.random() * 1000000);

    const sql = `INSERT INTO CLIENT (id, name, phone, city, letter_reason, email, address)
                 VALUES (:id, :name, :phone, :city, :letter_reason, :email, :address)`;

    await connection.execute(sql, { id, name, phone, city, letter_reason, email, address }, { autoCommit: true });

    res.send("✅ Client registered successfully!");
  } catch (err) {
    console.error("Database error (CLIENT):", err);
    res.status(500).send("Internal Server Error: " + err.message);
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
});

// -------- DOLL --------
app.post("/add-doll", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const { name, age } = req.body;

    if (!name || !age) {
      return res.status(400).send("Missing required fields");
    }

    const id = Math.floor(Math.random() * 100000);

    const sql = `
      INSERT INTO AUTO_MEMORY_DOLL (id, name, age, doll_status_id)
      VALUES (:id, :name, :age, :status)`;

    await connection.execute(sql, { id, name, age, status: 1 }, { autoCommit: true });

    res.send("✅ Doll created and set to Active!");
  } catch (err) {
    console.error("Database error (DOLL):", err);
    res.status(500).send("Internal Server Error: " + err.message);
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
});

// -------- LETTER --------
app.post("/add-letter", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    const { content_summary, client_id } = req.body;

    if (!content_summary || !client_id) {
      return res.status(400).send("Missing required fields");
    }

    // Buscar un doll con menos de 5 cartas
    const dollResult = await connection.execute(
      `SELECT d.id 
       FROM AUTO_MEMORY_DOLL d
       LEFT JOIN LETTER l ON d.id = l.auto_memory_doll_id
       GROUP BY d.id
       HAVING COUNT(l.id) < 5
       FETCH FIRST 1 ROWS ONLY`
    );

    if (dollResult.rows.length === 0) {
      return res.status(400).send("No dolls available (all have 5 letters)");
    }

    const auto_memory_doll_id = dollResult.rows[0][0];

    // Generar ID para la carta
    const id = Math.floor(Math.random() * 100000);

    // Fecha actual
    const today = new Date();

    // Insertar carta
    const sql = `
    INSERT INTO LETTER (id, letter_date, content_summary, client_id, auto_memory_doll_id, letter_status_id)
    VALUES (:id, :letter_date, :content_summary, :client_id, :auto_memory_doll_id, :status)
    `;

    const binds = {
      id,
      letter_date: today,
      content_summary,
      client_id,
      auto_memory_doll_id,
      status: 1 // "Active"
    };

    await connection.execute(sql, binds, { autoCommit: true });

    res.send(`✅ Letter created successfully and assigned to Doll ID: ${auto_memory_doll_id}`);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send("Internal Server Error: " + err.message);
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
});

// ================== START SERVER ================== //
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));