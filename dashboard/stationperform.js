const pool = require('../middelware/db');
const express = require('express');
const app = express();
app.use(express.json()); // for parsing application/json

// ================================
// 1. View Station Performance
// ================================
app.get('/api/stations/:station_id/performance', async (req, res) => {
    const { station_id } = req.params;
    try {
      const query = `
        SELECT 
          COUNT(*) AS total_sessions,
          COALESCE(SUM(energy_used), 0) AS total_energy_kwh,
          COALESCE(SUM(cost), 0) AS total_earnings
        FROM charging_sessions cs
        JOIN connectors c ON cs.connector_id = c.id
        WHERE c.station_id = $1;
      `;
      const result = await db.query(query, [station_id]);
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  // ================================
  // 2. Monthly/Daily Statistics
  // ================================
  app.get('/api/stations/:station_id/statistics', async (req, res) => {
    const { station_id } = req.params;
    const { range } = req.query; // 'daily' or 'monthly'
  
    const dateFormat = range === 'monthly' ? 'YYYY-MM' : 'YYYY-MM-DD';
    try {
      const query = `
        SELECT 
          TO_CHAR(cs.created_at, $2) AS period,
          SUM(energy_used) AS total_kwh,
          SUM(cost) AS earnings,
          COUNT(*) AS session_count
        FROM charging_sessions cs
        JOIN connectors c ON cs.connector_id = c.id
        WHERE c.station_id = $1
        GROUP BY period
        ORDER BY period DESC
        LIMIT 30;
      `;
      const result = await db.query(query, [station_id, dateFormat]);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  // ================================
  // 3. Live Charger Status
  // ================================
  app.get('/api/stations/:station_id/connectors/status', async (req, res) => {
    const { station_id } = req.params;
    try {
      const query = `
        SELECT id AS connector_id, status, state, last_updated
        FROM connectors
        WHERE station_id = $1;
      `;
      const result = await db.query(query, [station_id]);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  // ================================
  // 4. View Earnings Breakdown
  // ================================
  app.get('/api/hosts/:user_id/earnings', async (req, res) => {
    const { user_id } = req.params;
    try {
      const query = `
        SELECT
          SUM(CASE WHEN transaction_type = 'host_earning' THEN amount ELSE 0 END) AS total_earned,
          SUM(CASE WHEN transaction_type = 'host_payout' THEN amount ELSE 0 END) AS payouts_requested
        FROM transactions
        WHERE user_id = $1 AND status = 'completed';
      `;
      const summary = await db.query(query, [user_id]);
  
      const recentQuery = `
        SELECT * FROM transactions
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 10;
      `;
      const recent = await db.query(recentQuery, [user_id]);
  
      res.json({ ...summary.rows[0], recent_transactions: recent.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  // ================================
  // 5. Request Payout
  // ================================
  app.post('/api/hosts/:user_id/payouts', async (req, res) => {
    const { user_id } = req.params;
    const { amount, bank_details, notes } = req.body;
  
    try {
      const query = `
        INSERT INTO transactions (
          user_id, type, amount, transaction_type, status, bank_details, notes
        ) VALUES ($1, 'debit', $2, 'host_payout', 'pending', $3, $4)
        RETURNING *;
      `;
      const result = await db.query(query, [user_id, amount, bank_details, notes]);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
module.exports ={}