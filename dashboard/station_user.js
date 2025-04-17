
const pool = require('../middelware/db');
const express = require('express');
const app = express();
app.use(express.json()); // for parsing application/json


const addPartner = async (req, res) => {
    const { station_id } = req.params;
    const { user_id, share_percentage = 0, role = 'partner' } = req.body;
  
    try {
      const result = await pool.query(
        `INSERT INTO user_station_partners (user_id, station_id, share_percentage, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, station_id) DO NOTHING
         RETURNING *`,
        [user_id, station_id, share_percentage, role]
      );
  
      if (result.rowCount === 0) {
        return res.status(400).json({ message: 'Partner already exists.' });
      }
  
      res.status(201).json({ message: 'Partner added successfully', data: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  const updatePartner = async (req, res) => {
    const { station_id, user_id } = req.params;
    const { share_percentage, role } = req.body;
  
    try {
      const result = await pool.query(
        `UPDATE user_station_partners
         SET share_percentage = COALESCE($1, share_percentage),
             role = COALESCE($2, role)
         WHERE station_id = $3 AND user_id = $4
         RETURNING *`,
        [share_percentage, role, station_id, user_id]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Partner not found.' });
      }
  
      res.status(200).json({ message: 'Partner updated', data: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  const deletePartner = async (req, res) => {
    const { station_id, user_id } = req.params;
  
    try {
      const result = await pool.query(
        `DELETE FROM user_station_partners
         WHERE station_id = $1 AND user_id = $2`,
        [station_id, user_id]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Partner not found.' });
      }
  
      res.status(200).json({ message: 'Partner removed' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  const listPartners = async (req, res) => {
    const { station_id } = req.params;
  
    try {
      const result = await pool.query(
        `SELECT u.id, u.name, u.email, usp.share_percentage, usp.role
         FROM user_station_partners usp
         JOIN users u ON usp.user_id = u.id
         WHERE usp.station_id = $1`,
        [station_id]
      );
  
      res.status(200).json({ partners: result.rows });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  module.exports = {
    addPartner,
    updatePartner,
    deletePartner,
    listPartners
  };