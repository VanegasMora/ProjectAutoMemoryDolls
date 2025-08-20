const express = require("express");
const bodyParser = require("body-parser");
const oracledb = require("oracledb");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files, but disable default index.html auto-loading
app.use(express.static(path.join(__dirname), { index: false }));

// Oracle DB config
const dbConfig = {
  user: "SVANEGAS",
  password: "SVANEGAS",
  connectString: "190.60.231.121:8080/isispdb.utadeo.edu.co"
};

// Root route → landing.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "landing.html"));
});

// -------- CLIENT --------
app.post("/submit-form", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const { name, phone, city, email, address } = req.body;

    if (!name || !phone || !city || !email || !address) {
      return res.status(400).send("Missing required fields");
    }

    const id = Math.floor(Math.random() * 1000000);

    const sql = `INSERT INTO CLIENT (id, name, phone, city, email, address)
                 VALUES (:id, :name, :phone, :city, :email, :address)`;

    await connection.execute(sql, { id, name, phone, city, email, address }, { autoCommit: true });

    res.send("Client registered successfully");
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

    // Find a doll with less than 5 letters
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

    const id = Math.floor(Math.random() * 100000);
    const today = new Date();

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
      status: 1 // Active
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

// -------- GET ALL CUSTOMERS --------
app.get("/api/customers", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(`
      SELECT id, name, phone, city, email, address
      FROM CLIENT
      ORDER BY id
    `);

    // Map rows into objects
    const customers = result.rows.map(row => ({
      id: row[0],
      name: row[1],
      phone: row[2],
      city: row[3],
      email: row[4],
      address: row[5]
    }));

    res.json(customers);
  } catch (err) {
    console.error("Database error (GET CUSTOMERS):", err);
    res.status(500).send("Internal Server Error: " + err.message);
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
});

// -------- DELETE CUSTOMER --------
app.delete("/api/customers/:id", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const customerId = req.params.id;

    const sql = `DELETE FROM CLIENT WHERE id = :id`;
    const result = await connection.execute(sql, { id: customerId }, { autoCommit: true });

    if (result.rowsAffected === 0) {
      return res.status(404).send("Customer not found");
    }

    res.send("✅ Customer deleted successfully");
  } catch (err) {
    console.error("Database error (DELETE CUSTOMER):", err);
    res.status(500).send("Internal Server Error: " + err.message);
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
});

// -------- GET DOLLS --------
app.get("/api/dolls", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    const sql = `
      SELECT d.id, d.name, d.age, COUNT(l.id) AS letters
      FROM AUTO_MEMORY_DOLL d
      LEFT JOIN LETTER l ON d.id = l.auto_memory_doll_id
      GROUP BY d.id, d.name, d.age
      ORDER BY d.id
    `;
    const result = await connection.execute(sql);

    const dolls = result.rows.map(r => ({
      id: r[0],
      name: r[1],
      age: r[2],
      letters: r[3]
    }));

    res.json(dolls);
  } catch (err) {
    console.error("Database error (GET DOLLS):", err);
    res.status(500).send("Internal Server Error: " + err.message);
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
});

// -------- DELETE DOLL --------
app.delete("/api/dolls/:id", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const dollId = req.params.id;

    const sql = `DELETE FROM AUTO_MEMORY_DOLL WHERE id = :id`;
    const result = await connection.execute(sql, { id: dollId }, { autoCommit: true });

    if (result.rowsAffected === 0) {
      return res.status(404).send("Doll not found");
    }

    res.send("✅ Doll deleted successfully");
  } catch (err) {
    console.error("Database error (DELETE DOLL):", err);
    res.status(500).send("Internal Server Error: " + err.message);
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
});


// -------- GET LETTERS --------
app.get("/api/letters", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    const sql = `
      SELECT id, letter_date, content_summary, client_id, auto_memory_doll_id, letter_status_id
      FROM LETTER
      ORDER BY id
    `;
    const result = await connection.execute(sql);

    const letters = result.rows.map(r => ({
      id: r[0],
      letter_date: r[1],
      content_summary: r[2],
      client_id: r[3],
      auto_memory_doll_id: r[4],
      letter_status_id: r[5]
    }));

    res.json(letters);
  } catch (err) {
    console.error("Database error (GET LETTERS):", err);
    res.status(500).send("Internal Server Error: " + err.message);
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
});

// -------- DELETE LETTER --------
app.delete("/api/letters/:id", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const letterId = req.params.id;

    const sql = `DELETE FROM LETTER WHERE id = :id`;
    const result = await connection.execute(sql, { id: letterId }, { autoCommit: true });

    if (result.rowsAffected === 0) {
      return res.status(404).send("Letter not found");
    }

    res.send("✅ Letter deleted successfully");
  } catch (err) {
    console.error("Database error (DELETE LETTER):", err);
    res.status(500).send("Internal Server Error: " + err.message);
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
});


// ================== START SERVER ================== //
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
