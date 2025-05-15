// POST /api/charging-sessions/start
const express = require('express');
const router = express.Router();
router.use(express.json());
const db = require('../middelware/db'); // your PostgreSQL connection instance
const { publishToConnector } = require('./eventcharger')
const { validateJwt, authorizeRoles } = require('../middelware/auth')

router.post('/start',
  validateJwt,
  authorizeRoles('admin', 'customer', 'staff', 'dealer'),
  async (req, res) => {
    const {
      vehicle_id,
      ocppid,
      payment_method,
      estimated_cost,  // estimated cost for the session
      promotion_id,
      sponsored_by,
      sponsorship_note
    } = req.body;
    const user_id = req.user.id;

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
      // Find the connector_id using ocpp_id
      const connectorResult = await db.query(
        'SELECT id FROM connectors WHERE ocpp_id = $1',
        [ocppid]
      );

      if (connectorResult.rows.length === 0) {
        return res.status(404).json({ message: "Connector not found" });
      }

      const connector_id = connectorResult.rows[0].id;


      const connectorRes = await db.query(`
        SELECT ocpp_id,status,state FROM connectors
        WHERE id = $1
       `, [connector_id]);

      if (connectorRes.rows.length === 0) {
        throw new Error('Connector not found.');
      }

      const { ocpp_id, status: connectorStatus, state: connectorState } = connectorRes.rows[0];

      // Ensure the charger is physically connected and logically ready to start
      console.log("charging", ocpp_id, connectorStatus, connectorState)
      if (connectorState !== 'connected') {
        throw new Error('Sorry...,The connector is not functional');
      }

      if (connectorStatus !== 'Preparing') {
        throw new Error('Connector is not ready ,Please connect the connector to the vehicle before starting the session.');
      }





      // 2. Create the session
      const sessionRes = await db.query(`
      INSERT INTO charging_sessions (
        user_id, vehicle_id, connector_id,
        payment_method, status,
        promotion_id, sponsored_by, sponsorship_note
      )
      VALUES ($1, $2, $3, $4, 'ongoing', $5, $6, $7)
      RETURNING *
    `, [
        user_id,
        vehicle_id,
        connector_id,
        payment_method,
        // estimated_cost,
        promotion_id,
        sponsored_by,
        sponsorship_note
      ]);


      // 4. Publish MQTT message to start charger
      // 3. Get ocpp_id from connector_id

      const mqttMessage = {
        action: "RemoteStartTransaction",
        data: {
          connectorId: 1, // This may need to be dynamic
          idTag: `${user_id}`
        }
      };
      publishToConnector(ocpp_id, mqttMessage)

      await db.query('COMMIT');

      res.status(201).json({
        message: 'Charging session started successfully.',
        session: sessionRes.rows[0]
      });

    } catch (err) {
      await db.query('ROLLBACK');
      if (err.code === '23503' && err.constraint === 'charging_sessions_vehicle_id_fkey') {
        return res.status(400).json({ error: 'Invalid vehicle_id: Vehicle does not exist' });
      }

      res.status(400).json({ error: err.message });
    }
  });
// POST /api/charging-sessions/stop
router.post('/stop', validateJwt,
  authorizeRoles('admin', 'customer', 'staff', 'dealer'), async (req, res) => {
  const { ocppid } = req.body;

  try {
    // 1. Fetch ocpp_id from connector_id
    const connectorRes = await db.query(`
      SELECT id, ocpp_id FROM connectors
      WHERE ocpp_id = $1
    `, [ocppid]);

    if (connectorRes.rows.length === 0) {
      throw new Error('Connector not found.');
    }

    const ocppId = connectorRes.rows[0].ocpp_id;
    const connector_id = connectorRes.rows[0].id

    // 2. Get the latest transaction/session ID if needed
    // Replace this logic with actual active session query if required
    const sessionRes = await db.query(`
      SELECT id,user_id FROM charging_sessions
      WHERE connector_id = $1 AND status = 'ongoing'
      ORDER BY created_at DESC
      LIMIT 1
    `, [connector_id]);

    if (sessionRes.rows.length === 0) {
      throw new Error('No ongoing session found for this connector.');
    }


    // ✅ Check if the session belongs to the logged-in user
    if (sessionRes.user_id !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to stop this charging session." });
    }

    const transactionId = sessionRes.rows[0].id;

    // 3. Publish MQTT RemoteStopTransaction
    const mqttMessage = {
      action: "RemoteStopTransaction",
      data: {
        transactionId: transactionId
      }
    };

    publishToConnector(ocppId, mqttMessage);

    res.status(200).json({
      message: 'Charging session stop command sent successfully.',
      transactionId: transactionId
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
