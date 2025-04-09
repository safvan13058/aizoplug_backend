// POST /api/charging-sessions/start
const express = require('express');
const router = express.Router();
const db = require('../middelware/db'); // your PostgreSQL connection instance
const {publishToConnector}=require('./eventcharger')
router.post('/start', async (req, res) => {
  const {
    user_id,
    vehicle_id,
    connector_id,
    payment_method,
    estimated_cost, // estimated cost for the session
    promotion_id,
    sponsored_by,
    sponsorship_note
  } = req.body;

  try {
    await db.query('BEGIN');

    // 1. Fetch user's default wallet and check balance
    const walletRes = await db.query(`
      SELECT id, balance FROM wallets
      WHERE user_id = $1 AND is_default = TRUE AND status = 'active'
      LIMIT 1
    `, [user_id]);

    if (walletRes.rows.length === 0) {
      throw new Error('No active wallet found for this user.');
    }

    const wallet = walletRes.rows[0];

    if (parseFloat(wallet.balance) < parseFloat(estimated_cost)) {
      throw new Error('Insufficient wallet balance to start session.');
    }

    // 2. Create the session
    const sessionRes = await db.query(`
      INSERT INTO charging_sessions (
        user_id, vehicle_id, connector_id,
        payment_method, status, cost,
        promotion_id, sponsored_by, sponsorship_note
      )
      VALUES ($1, $2, $3, $4, 'ongoing', $5, $6, $7, $8)
      RETURNING *
    `, [
      user_id,
      vehicle_id,
      connector_id,
      payment_method,
      estimated_cost,
      promotion_id,
      sponsored_by,
      sponsorship_note
    ]);


     // 4. Publish MQTT message to start charger
     const topic = `${ocppId}/out`;
     const mqttMessage = {
       action: "RemoteStartTransaction",
       data: {
         connectorId: 1, // This may need to be dynamic
         idTag: `${user_id}`
       }
     };
     publishToConnector(ocppId,mqttMessage)

    await db.query('COMMIT');

    res.status(201).json({
      message: 'Charging session started successfully.',
      session: sessionRes.rows[0]
    });

  } catch (err) {
    await db.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  }
});

// POST /api/charging-sessions/stop
router.post('/stop', async (req, res) => {
    const { ocppId } = req.body;
    try {

      const mqttMessage = {
        action: "RemoteStopTransaction",
        data: {
          transactionId: 1,
        }
      };
      publishToConnector(ocppId, mqttMessage);
      res.status(200).json({
        message: 'Charging session stopped and completed.',
      });
  
    } catch (err) {
      await db.query('ROLLBACK');
      res.status(400).json({ error: err.message });
    }
  });
  
module.exports = router;
