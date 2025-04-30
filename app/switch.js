// POST /api/charging-sessions/start
const express = require('express');
const app = express.Router();
app.use(express.json());
const pool = require('../middelware/db'); // your PostgreSQL connection instance
const { validateJwt, authorizeRoles } = require('../middelware/auth')
const {turnonswitch}=require('./eventcharger')

// API to turn switch ON or OFF
// API to turn switch ON or OFF
const toggleswitch = async (req, res) => {
    const { deviceid, state, voltage = 100, payment_method, promotion_id, sponsored_by, sponsorship_note } = req.body;
    const user_id = req.user.id; // Assuming you're using auth middleware
    const username = req.user.username;
  
    if (!deviceid || !['on', 'off'].includes(state.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid payload. Provide deviceid and state (on/off).' });
    }
  
    const [thingName, switchNumber] = deviceid.split('_');
    if (!thingName || !switchNumber) {
      return res.status(400).json({ error: 'Invalid deviceid format. Expected format: <thingName>_<switchNumber>' });
    }
    if (state==='off'){
        // 4. Publish MQTT message
     const payload = {
       state: {
         desired: {
           command: "power",
           c: switchNumber,
           s: state.toLowerCase(),
           u: username,
           v: voltage.toString()
         }
       }
     };
 
     turnonswitch(thingName, payload, async (err) => {
       if (err) {
         await pool.query('ROLLBACK');
         return res.status(500).json({ error: 'Failed to publish to AWS IoT' });
       }
 
       await pool.query('COMMIT');
       res.json({ message: `Switch ${switchNumber} of ${thingName} turned ${state}`, session: sessionRes.rows[0] });
     });
   }
 
  
    try {
      await pool.query('BEGIN');
  
      // 1. Get default wallet
      const walletRes = await pool.query(`
        SELECT id, balance FROM wallets
        WHERE user_id = $1 AND is_default = TRUE AND status = 'active'
        LIMIT 1
      `, [user_id]);
  
      if (walletRes.rows.length === 0) throw new Error('No active wallet found for this user.');
  
      const wallet = walletRes.rows[0];
      const estimated_cost = 1; // Replace with actual logic/calculation
      if (parseFloat(wallet.balance) < parseFloat(estimated_cost)) {
        throw new Error('Insufficient wallet balance to start session.');
      }
  
      // 2. Get connector
      const connectorResult = await pool.query(
        'SELECT id FROM plug_switches WHERE device_id = $1',
        [deviceid]
      );
      if (connectorResult.rows.length === 0) throw new Error('Connector not found.');
  
      const connector_id = connectorResult.rows[0].id;
  
      const connectorRes = await pool.query(`
        SELECT device_id, status FROM plug_switches
        WHERE id = $1
      `, [connector_id]);
  
      if (connectorRes.rows.length === 0) throw new Error('Connector not found.');
      const { status: connectorStatus } = connectorRes.rows[0];
  
      // 3. Create the session
      const sessionRes = await pool.query(`
        INSERT INTO charging_sessions (
          user_id, plug_switches_id,
          payment_method, status,
          promotion_id, sponsored_by, sponsorship_note
        )
        VALUES ($1, $2, $3, 'ongoing', $4, $5, $6)
        RETURNING *
      `, [
        user_id,
        connector_id,
        payment_method,
        promotion_id,
        sponsored_by,
        sponsorship_note
      ]);
  
      // 4. Publish MQTT message
      const payload = {
        state: {
          desired: {
            command: "power",
            c: switchNumber,
            s: state.toLowerCase(),
            u: username,
            v: voltage.toString()
          }
        }
      };
  
      turnonswitch(thingName, payload, async (err) => {
        if (err) {
          await pool.query('ROLLBACK');
          return res.status(500).json({ error: 'Failed to publish to AWS IoT' });
        }
  
        await pool.query('COMMIT');
        res.json({ message: `Switch ${switchNumber} of ${thingName} turned ${state}`, session: sessionRes.rows[0] });
      });
    } catch (err) {
      await pool.query('ROLLBACK');
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  };

module.exports = {toggleswitch};