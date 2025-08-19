const express = require('express');
const router = express.Router();
const { executeQuery } = require('../utils/database');

// -------- CLIENT ROUTES --------
router.post('/submit-form', async (req, res) => {
  try {
    const { name, phone, city, letter_reason, email, address } = req.body;

    if (!name || !phone || !city || !letter_reason || !email || !address) {
      return res.status(400).send("Missing required fields");
    }

    // Use sequence instead of random ID
    const sql = `INSERT INTO CLIENT (name, phone, city, letter_reason, email, address)
                 VALUES (:name, :phone, :city, :letter_reason, :email, :address)`;

    await executeQuery(sql, { name, phone, city, letter_reason, email, address });

    res.send("✅ Client registered successfully!");
  } catch (err) {
    console.error("Database error (CLIENT):", err);
    res.status(500).send("Internal Server Error: " + err.message);
  }
});

// -------- DOLL ROUTES --------
router.post('/add-doll', async (req, res) => {
  try {
    const { name, age } = req.body;

    if (!name || !age) {
      return res.status(400).send("Missing required fields");
    }

    const sql = `
      INSERT INTO AUTO_MEMORY_DOLL (name, age)
      VALUES (:name, :age)`;

    await executeQuery(sql, { name, age });

    res.send("✅ Doll created and set to Active!");
  } catch (err) {
    console.error("Database error (DOLL):", err);
    res.status(500).send("Internal Server Error: " + err.message);
  }
});

// -------- LETTER ROUTES --------
router.post('/add-letter', async (req, res) => {
  try {
    const { content_summary, client_id, letter_date } = req.body;

    if (!content_summary || !client_id || !letter_date) {
      return res.status(400).send("Missing required fields: content_summary, client_id, and letter_date are required");
    }

    // Buscar un doll con menos de 5 cartas
    const dollResult = await executeQuery(
      `SELECT d.id 
       FROM AUTO_MEMORY_DOLL d
       LEFT JOIN LETTER l ON d.id = l.AUTO_MEMORY_DOLL_id
       GROUP BY d.id
       HAVING COUNT(l.id) < 5
       FETCH FIRST 1 ROWS ONLY`
    );

    if (dollResult.rows.length === 0) {
      return res.status(400).send("No dolls available (all have 5 letters)");
    }

    const auto_memory_doll_id = dollResult.rows[0][0];

    const sql = `
    INSERT INTO LETTER ("date", content_summary, CLIENT_id, AUTO_MEMORY_DOLL_id)
    VALUES (TO_DATE(:letter_date, 'YYYY-MM-DD'), :content_summary, :client_id, :auto_memory_doll_id)
    `;

    const binds = {
      letter_date,
      content_summary,
      client_id,
      auto_memory_doll_id
    };

    await executeQuery(sql, binds);

    res.send(`✅ Letter created successfully and assigned to Doll ID: ${auto_memory_doll_id}`);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send("Internal Server Error: " + err.message);
  }
});

// -------- GET ROUTES --------
// Get all dolls
router.get('/dolls', async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT d.id, d.name, d.age, s.status 
       FROM AUTO_MEMORY_DOLL d 
       JOIN DOLL_STATUS s ON d.DOLL_STATUS_id = s.id
       ORDER BY d.id`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send("Internal Server Error: " + err.message);
  }
});

// Get all letters
router.get('/letters', async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT l.id, l."date", l.content_summary, c.name as client_name, 
              d.name as doll_name, s.status
       FROM LETTER l 
       JOIN CLIENT c ON l.CLIENT_id = c.id
       JOIN AUTO_MEMORY_DOLL d ON l.AUTO_MEMORY_DOLL_id = d.id
       JOIN LETTER_STATUS s ON l.LETTER_STATUS_id = s.id
       ORDER BY l."date" DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send("Internal Server Error: " + err.message);
  }
});

// Get all clients
router.get('/clients', async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT id, name, phone, city, letter_reason, email, address 
       FROM CLIENT 
       ORDER BY id`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send("Internal Server Error: " + err.message);
  }
});

module.exports = router;
