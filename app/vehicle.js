const express = require('express');
const pool = require('../middelware/db');
const {validateJwt,authorizeRoles} = require('../middelware/auth')


const create_vehi = async (req, res) => {
    const {
        vehicle_number,
        vin_number,
        wheel_type,
        make,
        model,
        auto_charging_enabled
        } = req.body;
     const user_id=req.user.id

     try {
        const result = await pool.query(
            `INSERT INTO vehicles 
        (vehicle_number, vin_number, user_id, wheel_type, make, model, auto_charging_enabled) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [vehicle_number, vin_number, user_id, wheel_type, make, model, auto_charging_enabled||false]
        );
        res.json({
          message: "Vehicle created successfully",
          vehicle: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const update_vehi=async (req, res) => {
    const updates = [];
    const values = [];
    let idx = 1;

  
    // Build dynamic query based on provided fields
    for (const field of [
      'vehicle_number',
      'vin_number',
      'wheel_type',
      'make',
      'model',
      'auto_charging_enabled'
    ]) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${idx}`);
        values.push(req.body[field]);
        idx++;
      }
    }
  
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
  
    values.push(req.params.id); // last value for WHERE clause
  
    const query = `
      UPDATE vehicles SET 
      ${updates.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;
  
    try {
      const result = await pool.query(query, values);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
      res.json({
        message: "Vehicle updated successfully",
        vehicle: result.rows[0]
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  const delete_vehi=async (req, res) => {
    const { id } = req.params;
  
    try {
      const result = await pool.query(
        'DELETE FROM vehicles WHERE id = $1 RETURNING *',
        [id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
  
      res.json({
        message: 'Vehicle deleted successfully',
        vehicle: result.rows[0]
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
  const getvehiclebyuser= async (req, res) => {
    const  user_id = req.user.id;
  
    try {
      const result = await pool.query(
        'SELECT * FROM vehicles WHERE user_id = $1 ORDER BY created_at DESC',
        [user_id]
      );
  
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  const toggle_auto=async (req, res) => {
    const { id } = req.params;
  
    try {
      const result = await pool.query(
        `UPDATE vehicles 
         SET auto_charging_enabled = NOT auto_charging_enabled 
         WHERE id = $1 
         RETURNING *`,
        [id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
  
      const updated = result.rows[0];
      const status = updated.auto_charging_enabled ? 'turned ON' : 'turned OFF';
  
      res.json({
        message: `Auto charging has been ${status}`,
        auto_charging:status,
        vehicle: updated
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  const toggleselect= async (req, res) => {
    const {  vehicle_id } = req.params;
    const user_id =req.user.id
  
    if (!user_id || !vehicle_id) {
      return res.status(400).json({ error: 'user_id and vehicle_id are required' });
    }
  
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
  
      // Deselect all vehicles for the user
      await client.query(
        `UPDATE vehicles
         SET currently_selected = FALSE
         WHERE user_id = $1`,
        [user_id]
      );
  
      // Set selected vehicle
      const updateResult = await client.query(
        `UPDATE vehicles
         SET currently_selected = TRUE
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [vehicle_id, user_id]
      );
  
      if (updateResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Vehicle not found or does not belong to the user' });
      }
  
      await client.query('COMMIT');
      res.json({ message: 'Vehicle selected successfully', vehicle: updateResult.rows[0] });
  
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Toggle vehicle selection error:', error);
      res.status(500).json({ error: 'Server error' });
    } finally {
      client.release();
    }
  }
  

module.exports = { create_vehi,update_vehi,getvehiclebyuser,toggle_auto,delete_vehi,toggleselect};
