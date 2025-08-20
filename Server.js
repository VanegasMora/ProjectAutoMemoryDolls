const express = require("express");
const bodyParser = require("body-parser");
const oracledb = require("oracledb");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname), { index: false }));

// Database connection
const dbConfig = {
  user: "SVANEGAS",
  password: "SVANEGAS",
  connectString: "190.60.231.121:8080/isispdb.utadeo.edu.co"
};

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "landing.html"));
});

// ===== CLIENT ROUTES =====

// Create client
app.post("/submit-form", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const { name, phone, city, email, address } = req.body;
    
    const id = Math.floor(Math.random() * 1000000);
    const sql = `INSERT INTO CLIENT (id, name, phone, city, email, address) VALUES (:id, :name, :phone, :city, :email, :address)`;
    
    await connection.execute(sql, { id, name, phone, city, email, address }, { autoCommit: true });
    res.send("Client registered successfully");
  } catch (err) {
    res.send("Error: " + err.message);
  } finally {
    if (connection) await connection.close();
  }
});

// Get all clients
app.get("/api/customers", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(`SELECT id, name, phone, city, email, address FROM CLIENT ORDER BY id`);
    
    const customers = result.rows.map(row => ({
      id: row[0], name: row[1], phone: row[2], city: row[3], email: row[4], address: row[5]
    }));
    
    res.json(customers);
  } catch (err) {
    res.send("Error: " + err.message);
  } finally {
    if (connection) await connection.close();
  }
});

// Delete client
app.delete("/api/customers/:id", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const customerId = req.params.id;
    
    await connection.execute(`DELETE FROM CLIENT WHERE id = :id`, { id: customerId }, { autoCommit: true });
    res.send("Customer deleted successfully");
  } catch (err) {
    res.send("Error: " + err.message);
  } finally {
    if (connection) await connection.close();
  }
});

// Update client
app.put("/api/customers/:id", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const customerId = req.params.id;
    const { name, phone, city, email, address } = req.body;
    
    const sql = `UPDATE CLIENT SET name = :name, phone = :phone, city = :city, email = :email, address = :address WHERE id = :id`;
    await connection.execute(sql, { id: customerId, name, phone, city, email, address }, { autoCommit: true });
    
    res.send("Customer updated successfully");
  } catch (err) {
    res.send("Error: " + err.message);
  } finally {
    if (connection) await connection.close();
  }
});

// ===== DOLL ROUTES =====

// Create doll
app.post("/add-doll", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const { name, age } = req.body;
    
    const id = Math.floor(Math.random() * 100000);
    const sql = `INSERT INTO AUTO_MEMORY_DOLL (id, name, age, doll_status_id) VALUES (:id, :name, :age, :status)`;
    
    await connection.execute(sql, { id, name, age, status: 1 }, { autoCommit: true });
    res.send("Doll created successfully!");
  } catch (err) {
    res.send("Error: " + err.message);
  } finally {
    if (connection) await connection.close();
  }
});

// Get all dolls
app.get("/api/dolls", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    
    const sql = `SELECT d.id, d.name, d.age, COUNT(l.id) AS letters FROM AUTO_MEMORY_DOLL d LEFT JOIN LETTER l ON d.id = l.auto_memory_doll_id GROUP BY d.id, d.name, d.age ORDER BY d.id`;
    const result = await connection.execute(sql);
    
    const dolls = result.rows.map(r => ({
      id: r[0], name: r[1], age: r[2], letters: r[3]
    }));
    
    res.json(dolls);
  } catch (err) {
    res.send("Error: " + err.message);
  } finally {
    if (connection) await connection.close();
  }
});

// Delete doll
app.delete("/api/dolls/:id", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const dollId = req.params.id;
    
    await connection.execute(`DELETE FROM AUTO_MEMORY_DOLL WHERE id = :id`, { id: dollId }, { autoCommit: true });
    res.send("Doll deleted successfully");
  } catch (err) {
    res.send("Error: " + err.message);
  } finally {
    if (connection) await connection.close();
  }
});

// Update doll
app.put("/api/dolls/:id", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const dollId = req.params.id;
    const { name, age } = req.body;
    
    const sql = `UPDATE AUTO_MEMORY_DOLL SET name = :name, age = :age WHERE id = :id`;
    await connection.execute(sql, { id: dollId, name, age }, { autoCommit: true });
    
    res.send("Doll updated successfully");
  } catch (err) {
    res.send("Error: " + err.message);
  } finally {
    if (connection) await connection.close();
  }
});

// ===== LETTER ROUTES =====

// Create letter
app.post("/add-letter", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const { content_summary, client_email, letter_date } = req.body;
    
    // Find client by email
    const clientResult = await connection.execute(`SELECT id FROM CLIENT WHERE email = :email`, { email: client_email });
    if (clientResult.rows.length === 0) {
      res.send("No client found with this email");
      return;
    }
    const client_id = clientResult.rows[0][0];
    
    // Find available doll (less than 5 letters)
    const dollResult = await connection.execute(`
      SELECT d.id FROM AUTO_MEMORY_DOLL d
      LEFT JOIN LETTER l ON d.id = l.auto_memory_doll_id
      GROUP BY d.id
      HAVING COUNT(l.id) < 5
      FETCH FIRST 1 ROWS ONLY
    `);
    if (dollResult.rows.length === 0) {
      res.send("No dolls available (all have 5 letters)");
      return;
    }
    const auto_memory_doll_id = dollResult.rows[0][0];
    
    // Insert letter
    const id = Math.floor(Math.random() * 100000);
    const sql = `INSERT INTO LETTER (id, letter_date, content_summary, client_id, auto_memory_doll_id, letter_status_id) VALUES (:id, TO_DATE(:letter_date, 'YYYY-MM-DD'), :content_summary, :client_id, :auto_memory_doll_id, :status)`;
    
    await connection.execute(sql, { id, letter_date, content_summary, client_id, auto_memory_doll_id, status: 1 }, { autoCommit: true });
    res.send(`Letter created successfully and assigned to Doll ID: ${auto_memory_doll_id}`);
  } catch (err) {
    res.send("Error: " + err.message);
  } finally {
    if (connection) await connection.close();
  }
});

// Get all letters
app.get("/api/letters", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    
    const sql = `SELECT id, letter_date, content_summary, client_id, auto_memory_doll_id, letter_status_id FROM LETTER ORDER BY id`;
    const result = await connection.execute(sql);
    
    const letters = result.rows.map(r => ({
      id: r[0], letter_date: r[1], content_summary: r[2], client_id: r[3], auto_memory_doll_id: r[4], letter_status_id: r[5]
    }));
    
    res.json(letters);
  } catch (err) {
    res.send("Error: " + err.message);
  } finally {
    if (connection) await connection.close();
  }
});

// Delete letter (with simple status check)
app.delete("/api/letters/:id", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const letterId = req.params.id;
    
    // Check letter status
    const checkResult = await connection.execute(`SELECT letter_status_id FROM LETTER WHERE id = :id`, { id: letterId });
    if (checkResult.rows.length === 0) {
      res.send("Letter not found");
      return;
    }
    
    const letterStatus = checkResult.rows[0][0];
    
    // Only allow deletion if status is 1 (Draft)
    if (letterStatus != 1) {
      res.send("Cannot delete letter. Only Draft status letters can be deleted.");
      return;
    }
    
    // Delete the letter
    await connection.execute(`DELETE FROM LETTER WHERE id = :id`, { id: letterId }, { autoCommit: true });
    res.send("Letter deleted successfully");
  } catch (err) {
    res.send("Error: " + err.message);
  } finally {
    if (connection) await connection.close();
  }
});

// Update letter
app.put("/api/letters/:id", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const letterId = req.params.id;
    const { letter_date, content_summary, client_id, auto_memory_doll_id, letter_status_id } = req.body;
    
    const sql = `UPDATE LETTER SET letter_date = TO_DATE(:letter_date, 'YYYY-MM-DD'), content_summary = :content_summary, client_id = :client_id, auto_memory_doll_id = :auto_memory_doll_id, letter_status_id = :letter_status_id WHERE id = :id`;
    await connection.execute(sql, { id: letterId, letter_date, content_summary, client_id, auto_memory_doll_id, letter_status_id }, { autoCommit: true });
    
    res.send("Letter updated successfully");
  } catch (err) {
    res.send("Error: " + err.message);
  } finally {
    if (connection) await connection.close();
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));