// =========================================================
// ================== IMPORT DEPENDENCIES ==================
// =========================================================
const express = require("express");
const bodyParser = require("body-parser");
const oracledb = require("oracledb");
const path = require("path");

const app = express();
const PORT = 3000;


// =========================================================
// ================== MIDDLEWARE ===========================
// =========================================================
app.use(bodyParser.urlencoded({ extended: true })); // Parse form data (x-www-form-urlencoded)
app.use(bodyParser.json());                        // Parse JSON data
app.use(express.static(path.join(__dirname), { index: false })); // Serve static files (sin auto index.html)


// =========================================================
// ================== ORACLE DB CONFIG =====================
// =========================================================
const dbConfig = {
  user: "SVANEGAS",
  password: "SVANEGAS",
  connectString: "190.60.231.121:8080/isispdb.utadeo.edu.co"
};


// =========================================================
// ================== ROOT ROUTE ===========================
// =========================================================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "landing.html"));
});


// =========================================================
// ================== CLIENT ROUTES ========================
// =========================================================

// ➤ CREATE Client
app.post("/submit-form", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    const { name, phone, city, email, address } = req.body;
    if (!name || !phone || !city || !email || !address) {
      return res.status(400).send("Missing required fields");
    }

    const id = Math.floor(Math.random() * 1000000); // Random ID

    const sql = `
      INSERT INTO CLIENT (id, name, phone, city, email, address)
      VALUES (:id, :name, :phone, :city, :email, :address)
    `;

    await connection.execute(sql, { id, name, phone, city, email, address }, { autoCommit: true });
    res.send("✅ Client registered successfully");

  } catch (err) {
    console.error("Database error (CLIENT):", err);
    res.status(500).send("Internal Server Error: " + err.message);
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
});

// ➤ READ All Clients
app.get("/api/customers", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(`
      SELECT id, name, phone, city, email, address
      FROM CLIENT
      ORDER BY id
    `);

    // Map rows → JSON
    const customers = result.rows.map(row => ({
      id: row[0], name: row[1], phone: row[2], city: row[3], email: row[4], address: row[5]
    }));

    res.json(customers);

  } catch (err) {
    console.error("Database error (GET CUSTOMERS):", err);
    res.status(500).send("Internal Server Error: " + err.message);
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
});

// ➤ DELETE Client by ID
app.delete("/api/customers/:id", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const customerId = req.params.id;

    const sql = `DELETE FROM CLIENT WHERE id = :id`;
    const result = await connection.execute(sql, { id: customerId }, { autoCommit: true });

    if (result.rowsAffected === 0) return res.status(404).send("Customer not found");
    res.send("✅ Customer deleted successfully");

  } catch (err) {
    console.error("Database error (DELETE CUSTOMER):", err);
    res.status(500).send("Internal Server Error: " + err.message);
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
});

// ➤ UPDATE Client
app.put("/api/customers/:id", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const customerId = req.params.id;
    const { name, phone, city, email, address } = req.body;

    if (!name || !phone || !city || !email || !address) {
      return res.status(400).send("Missing required fields");
    }

    const sql = `
      UPDATE CLIENT
      SET name = :name,
          phone = :phone,
          city = :city,
          email = :email,
          address = :address
      WHERE id = :id
    `;

    const result = await connection.execute(
      sql,
      { id: customerId, name, phone, city, email, address },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) return res.status(404).send("Customer not found");

    res.send("✅ Customer updated successfully");

  } catch (err) {
    console.error("Database error (UPDATE CUSTOMER):", err);
    res.status(500).send("Internal Server Error: " + err.message);
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
});


// =========================================================
// ================== DOLL ROUTES ==========================
// =========================================================

// ➤ CREATE Doll
app.post("/add-doll", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    const { name, age } = req.body;
    if (!name || !age) return res.status(400).send("Missing required fields");

    const id = Math.floor(Math.random() * 100000);

    const sql = `
      INSERT INTO AUTO_MEMORY_DOLL (id, name, age, doll_status_id)
      VALUES (:id, :name, :age, :status)
    `;

    await connection.execute(sql, { id, name, age, status: 1 }, { autoCommit: true });
    res.send("✅ Doll created and set to Active!");

  } catch (err) {
    console.error("Database error (DOLL):", err);
    res.status(500).send("Internal Server Error: " + err.message);
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
});

// ➤ READ Dolls (with letters count)
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
      id: r[0], name: r[1], age: r[2], letters: r[3]
    }));

    res.json(dolls);

  } catch (err) {
    console.error("Database error (GET DOLLS):", err);
    res.status(500).send("Internal Server Error: " + err.message);
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
});

// ➤ DELETE Doll
app.delete("/api/dolls/:id", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const dollId = req.params.id;

    const sql = `DELETE FROM AUTO_MEMORY_DOLL WHERE id = :id`;
    const result = await connection.execute(sql, { id: dollId }, { autoCommit: true });

    if (result.rowsAffected === 0) return res.status(404).send("Doll not found");
    res.send("✅ Doll deleted successfully");

  } catch (err) {
    console.error("Database error (DELETE DOLL):", err);
    res.status(500).send("Internal Server Error: " + err.message);
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
});

// ➤ UPDATE Doll
app.put("/api/dolls/:id", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const dollId = req.params.id;
    const { name, age } = req.body;

    if (!name || !age) return res.status(400).send("Missing required fields");

    const sql = `
      UPDATE AUTO_MEMORY_DOLL
      SET name = :name,
          age = :age
      WHERE id = :id
    `;

    const result = await connection.execute(
      sql,
      { id: dollId, name, age },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) return res.status(404).send("Doll not found");

    res.send("✅ Doll updated successfully");

  } catch (err) {
    console.error("Database error (UPDATE DOLL):", err);
    res.status(500).send("Internal Server Error: " + err.message);
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
});


// =========================================================
// ================== LETTER ROUTES ========================
// =========================================================

// ➤ CREATE Letter
app.post("/add-letter", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    const { content_summary, client_email, letter_date } = req.body;
    if (!content_summary || !client_email || !letter_date) {
      return res.status(400).send("Missing required fields");
    }

    // 1) Find client by email
    const clientResult = await connection.execute(
      `SELECT id FROM CLIENT WHERE email = :email`,
      { email: client_email }
    );
    if (clientResult.rows.length === 0) return res.status(400).send("No client found with this email");
    const client_id = clientResult.rows[0][0];

    // 2) Find available Doll (less than 5 letters)
    const dollResult = await connection.execute(
      `SELECT d.id 
       FROM AUTO_MEMORY_DOLL d
       LEFT JOIN LETTER l ON d.id = l.auto_memory_doll_id
       GROUP BY d.id
       HAVING COUNT(l.id) < 5
       FETCH FIRST 1 ROWS ONLY`
    );
    if (dollResult.rows.length === 0) return res.status(400).send("No dolls available (all have 5 letters)");
    const auto_memory_doll_id = dollResult.rows[0][0];

    // 3) Insert Letter
    const id = Math.floor(Math.random() * 100000);

    const sql = `
      INSERT INTO LETTER (id, letter_date, content_summary, client_id, auto_memory_doll_id, letter_status_id)
      VALUES (:id, TO_DATE(:letter_date, 'YYYY-MM-DD'), :content_summary, :client_id, :auto_memory_doll_id, :status)
    `;

    await connection.execute(
      sql,
      { id, letter_date, content_summary, client_id, auto_memory_doll_id, status: 1 },
      { autoCommit: true }
    );

    res.send(`✅ Letter created successfully and assigned to Doll ID: ${auto_memory_doll_id}`);

  } catch (err) {
    console.error("Database error (LETTER):", err);
    res.status(500).send("Internal Server Error: " + err.message);
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
});

// ➤ READ Letters
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
      id: r[0], letter_date: r[1], content_summary: r[2], client_id: r[3], auto_memory_doll_id: r[4], letter_status_id: r[5]
    }));

    res.json(letters);

  } catch (err) {
    console.error("Database error (GET LETTERS):", err);
    res.status(500).send("Internal Server Error: " + err.message);
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
});

// ➤ DELETE Letter
app.delete("/api/letters/:id", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const letterId = req.params.id;

    const sql = `DELETE FROM LETTER WHERE id = :id`;
    const result = await connection.execute(sql, { id: letterId }, { autoCommit: true });

    if (result.rowsAffected === 0) return res.status(404).send("Letter not found");
    res.send("✅ Letter deleted successfully");

  } catch (err) {
    console.error("Database error (DELETE LETTER):", err);
    res.status(500).send("Internal Server Error: " + err.message);
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
});

// ➤ UPDATE Letter
app.put("/api/letters/:id", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const letterId = req.params.id;
    const { letter_date, content_summary, client_id, auto_memory_doll_id, letter_status_id } = req.body;

    if (!letter_date || !content_summary || !client_id || !auto_memory_doll_id || !letter_status_id) {
      return res.status(400).send("Missing required fields");
    }

    const sql = `
      UPDATE LETTER
      SET letter_date = TO_DATE(:letter_date, 'YYYY-MM-DD'),
          content_summary = :content_summary,
          client_id = :client_id,
          auto_memory_doll_id = :auto_memory_doll_id,
          letter_status_id = :letter_status_id
      WHERE id = :id
    `;

    const result = await connection.execute(
      sql,
      { id: letterId, letter_date, content_summary, client_id, auto_memory_doll_id, letter_status_id },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) return res.status(404).send("Letter not found");

    res.send("✅ Letter updated successfully");

  } catch (err) {
    console.error("Database error (UPDATE LETTER):", err);
    res.status(500).send("Internal Server Error: " + err.message);
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
});


// =========================================================
// ================== START SERVER =========================
// =========================================================
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));