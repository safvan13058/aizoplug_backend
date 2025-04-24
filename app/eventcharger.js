const mqtt = require("mqtt");
const db = require("../middelware/db");
require("dotenv").config(); // For environment variables
const AWS = require("aws-sdk");
// MQTT Broker Connection
const brokerUrl = process.env.MQTT_BROKER_URL || "mqtts://an1ua1ij15hp7-ats.iot.ap-south-1.amazonaws.com";

console.log("mqtt page working")
const fs = require("fs");

const client = mqtt.connect("mqtts://an1ua1ij15hp7-ats.iot.ap-south-1.amazonaws.com", {
  port: 8883,
  clientId: "test-client-" + Math.random().toString(16).substr(2, 8),
  key: fs.readFileSync("certificate/63211473333aba881532e2ff88093a2ea78dea687fa519bdf78b2dc787e6972b-private.pem.key"),
  cert: fs.readFileSync("certificate/63211473333aba881532e2ff88093a2ea78dea687fa519bdf78b2dc787e6972b-certificate.pem.crt"),
  ca: fs.readFileSync("certificate/AmazonRootCA1 (1).pem"),
  debug: true, // Enable MQTT debugging
});

client.on("connect", () => {
  console.log("Connected to AWS IoT Core via MQTTS");
});

client.on("error", (err) => {
  console.error("MQTT connection error:", err.message);
});

client.on("offline", () => {
  console.log("MQTT client went offline");
});

client.on("close", () => {
  console.log("MQTT connection closed");
});

// AWS IoT Configuration
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "ap-south-1", // Adjust to your region
});
const iotData = new AWS.IotData({
  endpoint: "an1ua1ij15hp7-ats.iot.ap-south-1.amazonaws.com", // Replace with your IoT endpoint
});
client.on("connect", () => {
  console.log("Connected to MQTT broker");

  // Subscribe to shadow update topic
  // client.subscribe("$aws/things/+/shadow/update/accepted", { qos: 1 }, (err) => {
  //   if (err) {
  //     console.error("Subscription error:", err);
  //   } else {
  //     console.log("Subscribed to device shadow updates");
  //   }
  // });
  // Subscribe to custom topic: e.g., charging updates
  client.subscribe("+/out", { qos: 1 }, (err) => {
    if (err) console.error("Subscription error (+/out):", err);
    else console.log("Subscribed to charger status updates");
  });

  // Subscribe to meter values
  client.subscribe("+/in", { qos: 1 }, (err) => {
    if (err) console.error("Subscription error (+/in):", err);
    else console.log("Subscribed to meter value updates");
  });

  client.subscribe("$aws/things/+/shadow/update/delta", { qos: 1 }, (err) => {
    if (err) {
      console.error("Failed to subscribe with wildcard:", err);
    } else {
      console.log("🔍 Listening for all device shadow status changes (delta)...");
    }
  });

});

client.on("message", async (topic, messageBuffer) => {
  if (topic.includes("/shadow/update/delta")) {
    const delta = JSON.parse(messageBuffer.toString());

    // Extract the thingName from the topic
    const thingName = topic.split("/")[2]; // This will be your ocppId

    // ✅ Check if the connector exists
    const res = await db.query(`
        SELECT id FROM connectors WHERE ocpp_id = $1
      `, [thingName]);

    if (res.rows.length === 0) {
      // thingName (ocpp_id) not found — silently skip
      return;
    }
    // console.log("delta of charger==",delta)

    if (delta.state && delta.state.status) {
      const status = delta.state.status;
      // console.log("Status from delta.state:", status);



      if (status === "connected") {
        console.log(`✅ [${thingName}] is CONNECTED (from desired state).`);
        await updateConnectorstate(thingName, "connected");
      } else if (status === "disconnected") {
        console.log(`❌ [${thingName}] is DISCONNECTED (from desired state).`);
        await updateConnectorstate(thingName, "disconnected");
      } else {
        console.log(`ℹ️ [${thingName}] status changed to ${status} (unhandled).`);
        await updateConnectorstate(thingName, status);
      }
    }
  }
});

client.on("message", async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());
    // console.log("Received message on topic:", topic);
    // console.log("Payload:", payload);

    // Topic format: "<ocppId>/out" or "<ocppId>/in"
    const [ocppId, direction] = topic.split('/');

    if (!ocppId || direction !== 'out') {
      // Only handle status updates from <ocppId>/out
      return;
    }

    // Ensure it's a StatusNotification action
    if (payload.action !== "StatusNotification" || !payload.payload) {
      return;
    }

    const { connectorId, status, errorCode, timestamp, vendorId, vendorErrorCode } = payload.payload;

    if (typeof status === 'undefined') {
      // Skip if there's no status value
      return;
    }

    // You could use additional fields here if needed
    console.log(`OCPP ID: ${ocppId}, Connector: ${connectorId}, Status: ${status}`);

    // Update the connector status (your custom function)
    await updateConnectorStatus(ocppId, status);

  } catch (err) {
    console.error("Error handling MQTT message:", err);
  }
});



async function updateConnectorStatus(ocppId, status) {
  try {
    // First: Check if the connector exists
    const checkQuery = `SELECT id FROM connectors WHERE ocpp_id = $1`;
    const checkResult = await db.query(checkQuery, [ocppId]);

    if (checkResult.rowCount === 0) {
      console.warn(`Connector with ocpp_id "${ocppId}" not found. Skipping update.`);
      return; // Skip
    }
    // Then: Perform the update
    const updateQuery = `
        UPDATE connectors
        SET status = $1, last_updated = NOW()
        WHERE ocpp_id = $2
      `;
    await db.query(updateQuery, [status, ocppId]);
    console.log(`Updated connector ${ocppId} to status "${status}".`);
  } catch (err) {
    console.error("Error updating connector status:", err);
  }
}

async function updateConnectorstate(ocppId, state) {
  try {
    // Step 1: Find connector by ocpp_id
    const checkQuery = `SELECT id FROM connectors WHERE ocpp_id = $1`;
    const checkResult = await db.query(checkQuery, [ocppId]);

    if (checkResult.rowCount === 0) {
      console.warn(`⚠️ Connector with ocpp_id "${ocppId}" not found. Skipping update.`);
      return;
    }

    const connectorId = checkResult.rows[0].id;

    // Step 2: Update connector state
    const updateQuery = `
      UPDATE connectors
      SET state = $1, last_updated = NOW()
      WHERE ocpp_id = $2
    `;
    await db.query(updateQuery, [state, ocppId]);
    console.log(`🔄 Updated connector ${ocppId} to state "${state}".`);

    // Step 3: If disconnected, check for ongoing session
    if (state.toLowerCase() === 'disconnected') {
      const sessionRes = await db.query(
        `SELECT cs.id AS session_id, cs.user_id, cs.cost, cs.connector_id, c.station_id
         FROM charging_sessions cs
         JOIN connectors c ON cs.connector_id = c.id
         WHERE cs.connector_id = $1 AND cs.status = 'ongoing'
         ORDER BY cs.created_at DESC
         LIMIT 1`,
        [connectorId]
      );

      if (sessionRes.rows.length === 0) {
        console.warn(`⚠️ No active session found for connector ${connectorId}.`);
        return;
      }

      const {
        session_id: sessionId,
        user_id: userId,
        cost,
        station_id: stationId
      } = sessionRes.rows[0];

      // Step 4: Mark session as completed
      await db.query(
        `UPDATE charging_sessions 
         SET status = 'failed', end_time = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [sessionId]
      );
      await db.query(`
        INSERT INTO transactions (
          user_id, session_id, type, amount, transaction_type, status, notes
        ) VALUES (
          $1, $2, 'debit', $3, 'charge', 'completed', $4
        )
      `, [userId, sessionId, cost, 'Charging fee for session']);

      const partnersRes = await db.query(`
        SELECT user_id, share_percentage
        FROM user_station_partners
        WHERE station_id = $1
       `, [stationId]);
      for (const partner of partnersRes.rows) {
        const shareAmount = parseFloat(((cost * partner.share_percentage) / 100).toFixed(2));

        await db.query(`
         INSERT INTO transactions (
         user_id, session_id, type, amount, transaction_type, status, notes
          ) VALUES (
          $1, $2, 'credit', $3, 'host_earning', 'completed', $4
          )
          `, [
          partner.user_id,
          sessionId,
          shareAmount,
          `Revenue share from station ${stationId}`
        ]);

        console.log(`Credited ₹${shareAmount} to partner ${partner.user_id}`);
      }


      console.log(`✅ Charging session ${sessionId} marked as completed.`);
    }
  } catch (err) {
    console.error("❌ Error updating connector state or session:", err);
  }
}

client.on("message", async (topic, messageBuffer) => {
  try {
    const payload = JSON.parse(messageBuffer.toString());
    // console.log(`MQTT message received on ${topic}:`, payload);

    // 1. Extract ocpp_id from topic: "<ocpp_id>/out"
    // const [ocppId] = topic.split("/");
    const [ocppId, direction] = topic.split('/');

    if (!ocppId || direction !== 'out') {
      // Only handle status updates from <ocppId>/out
      return;
    }

    if (!ocppId) return console.warn("Invalid topic format, skipping.");

    // 2. Extract status from message
    // Ensure it's a StatusNotification action
    if (payload.action !== "StatusNotification" || !payload.payload) {
      return;
    }

    const { status } = payload.payload;

    if (typeof status === 'undefined') {
      // Skip if there's no status value
      return;
    }
    // const status = message?.status;
    if (!status)
      return
    // console.warn("No status field in message, skipping.");

    // 3. If status !== "charging", update connector + session
    if (status.toLowerCase() !== "charging") {
      console.log(`Status for ${ocppId} changed to ${status}, checking session...`);

      // 3a. Get connector ID from ocpp_id
      const connectorRes = await db.query(
        `SELECT id FROM connectors WHERE ocpp_id = $1`,
        [ocppId]
      );

      if (connectorRes.rows.length === 0) {
        console.warn(`No connector found for ocpp_id: ${ocppId}`);
        return;
      }

      const connectorId = connectorRes.rows[0].id;

      // 3b. Find ongoing session
      // 3b. Find ongoing session
      const sessionRes = await db.query(
        `SELECT cs.id AS session_id, cs.user_id, cs.cost, cs.connector_id, c.station_id
         FROM charging_sessions cs
         JOIN connectors c ON cs.connector_id = c.id
         WHERE cs.connector_id = $1 AND cs.status = 'ongoing'
         ORDER BY cs.created_at DESC
         LIMIT 1`,
        [connectorId]
      );

      if (sessionRes.rows.length === 0) {
        console.warn(`No active session found for connector ${connectorId}`);
        return;
      }


      const {
        session_id: sessionId,
        user_id: userId,
        cost,
        station_id: stationId
      } = sessionRes.rows[0];

      // 3c. Update session to "stopped"
      await db.query(
        `UPDATE charging_sessions SET status = 'completed', end_time = NOW() WHERE id = $1`,
        [sessionId]
      );
      await db.query(`
        INSERT INTO transactions (
          user_id, session_id, type, amount, transaction_type, status, notes
        ) VALUES (
          $1, $2, 'debit', $3, 'charge', 'completed', $4
        )
      `, [userId, sessionId, cost, 'Charging fee for session']);
      // 5. Revenue sharing with station partners
      const partnersRes = await db.query(`
         SELECT user_id, share_percentage
         FROM user_station_partners
         WHERE station_id = $1
        `, [stationId]);
      for (const partner of partnersRes.rows) {
        const shareAmount = parseFloat(((cost * partner.share_percentage) / 100).toFixed(2));

        await db.query(`
          INSERT INTO transactions (
          user_id, session_id, type, amount, transaction_type, status, notes
           ) VALUES (
           $1, $2, 'credit', $3, 'host_earning', 'completed', $4
           )
           `, [
          partner.user_id,
          sessionId,
          shareAmount,
          `Revenue share from station ${stationId}`
        ]);

        console.log(`Credited ₹${shareAmount} to partner ${partner.user_id}`);
      }

      // 3d. Update connector status
      await db.query(
        `UPDATE connectors SET status = $1, last_updated = NOW() WHERE id = $2`,
        [status, connectorId]
      );

      console.log(`Session ${sessionId} stopped and connector ${connectorId} marked as '${status}'.`);
    }
  } catch (err) {
    console.error("Error handling MQTT message:", err.message);
  }
});

client.on("message", async (topic, messageBuffer) => {
  try {
    const message = JSON.parse(messageBuffer.toString());

    const parts = topic.split("/");
    const ocppId = parts[0]; // e.g. CP101 from CP101/out

    const meterValues = message?.payload?.meterValue;

    if (!ocppId || !Array.isArray(meterValues)) {
      return; // silently skip
    }

    console.log(`metervalue${ocppId}==payload==${meterValues}`)

    // 1. Extract Energy.Active.Import.Register
    let currentWh = 0;
    let voltage = 0;
    let ampere  = 0;
    let power = 0;


    for (const entry of meterValues) {
      const energySample = entry.sampledValue?.find(
        sv => sv.measurand === "Energy.Active.Import.Register" && sv.value != null
      );

      const sampled = entry.sampledValue || [];

      const voltageL1 = sampled.find(
        sv => sv.measurand === "Voltage" && sv.phase === "L1-N"
      );
      const currentL1 = sampled.find(
        sv => sv.measurand === "Current.Import" && sv.phase === "L1-N"
      );
      const powerL1 = sampled.find(
        sv => sv.measurand === "Power.Active.Import"
      );
       voltage = voltageL1 ? parseFloat(voltageL1.value) : null;
       ampere = currentL1 ? parseFloat(currentL1.value) : null;
       power = powerL1 ? parseFloat(powerL1.value) : null;
    
      console.log("Voltage L1:", voltage);
      console.log("Current L1:", ampere);
      console.log("Power L1:", power);

      if (energySample) {
        currentWh = parseFloat(energySample.value);
        console.log("currect wh==", currentWh)

        if (isNaN(currentWh)) {
          console.warn("Invalid energy value in message");
          return;
        }
        break;
      }
    }

    if (currentWh === 0) return console.warn("No valid energy reading found");

    // 2. Get connector and station
    const connectorRes = await db.query(`
      SELECT id, station_id FROM connectors WHERE ocpp_id = $1
    `, [ocppId]);

    if (connectorRes.rows.length === 0) return console.warn("No connector found for", ocppId);

    const { id: connectorId, station_id: stationId } = connectorRes.rows[0];

    // 3. Get ongoing session
    const sessionRes = await db.query(`
      SELECT id, user_id, energy_used FROM charging_sessions
      WHERE connector_id = $1 AND status = 'ongoing'
      ORDER BY created_at DESC LIMIT 1
    `, [connectorId]);

    if (sessionRes.rows.length === 0) return console.warn("No ongoing session for connector", connectorId);

    const { id: sessionId, user_id: userId, energy_used: previousWh } = sessionRes.rows[0];

    const deltaWh = currentWh - (previousWh || 0);

    if (deltaWh <= 0) {
      console.warn("Meter value decreased or unchanged — skipping billing.");
      return;
    }

    // 4. Get dynamic pricing
    const stationRes = await db.query(`
      SELECT dynamic_pricing FROM charging_stations WHERE id = $1
    `, [stationId]);

    const pricing = stationRes.rows[0]?.dynamic_pricing;
    let rate = pricing?.base_rate || 10;

    if (pricing?.time_slots) {
      const now = new Date();
      const currentTime = now.toTimeString().substring(0, 5); // HH:MM
      for (const slot of pricing.time_slots) {
        if (currentTime >= slot.start && currentTime <= slot.end) {
          rate = slot.rate;
          break;
        }
      }
    }

    // 5. Compute cost
    const meterKWh = deltaWh / 1000;
    const cost = parseFloat((meterKWh * rate).toFixed(2));

    // 6. Check wallet balance
    const walletCheck = await db.query(`
      SELECT balance FROM wallets
      WHERE user_id = $1 AND is_default = TRUE AND status = 'active'
    `, [userId]);

    if (walletCheck.rows.length === 0) {
      return console.warn("Wallet not found or inactive for user", userId);
    }

    const currentBalance = parseFloat(walletCheck.rows[0].balance);

    if (currentBalance < cost) {
      console.warn(`User ${userId} has insufficient balance (₹${currentBalance}), required ₹${cost}`);

      // Optionally stop charging
      publishToConnector(ocppId, {
        action: "StopTransaction",
        reason: "InsufficientFunds",
        message: "Charging stopped due to low wallet balance."
      });

      return;
    }

    // 7. Deduct cost from wallet
    const walletUpdate = await db.query(`
      UPDATE wallets
      SET balance = balance - $1
      WHERE user_id = $2 AND is_default = TRUE AND status = 'active'
      RETURNING balance
    `, [cost, userId]);

    // await db.query(`
    //   INSERT INTO transactions (
    //     user_id,
    //     session_id,
    //     type,
    //     amount,
    //     transaction_type,
    //     status,
    //     notes
    //   ) VALUES (
    //     $1, $2, 'debit', $3, 'charge', 'completed', $4
    //   )
    // `, [userId, sessionId, cost, 'Charging fee deduction']);


    // 8. Update charging session
    await db.query(`
      UPDATE charging_sessions
      SET 
        energy_used = $1,
        cost = cost + $2,
        voltage = $3,
        ampere = $4,
        power = $5,
        updated_at = NOW()
      WHERE id = $6
    `, [currentWh, cost, voltage, ampere, power, sessionId]);
    
    // 9. Revenue sharing
    const partnersRes = await db.query(`
      SELECT user_id, share_percentage
      FROM user_station_partners
      WHERE station_id = $1
    `, [stationId]);

    for (const partner of partnersRes.rows) {
      const shareAmount = parseFloat(((cost * partner.share_percentage) / 100).toFixed(2));

      await db.query(`
        UPDATE wallets
        SET balance = balance + $1
        WHERE user_id = $2 AND is_default = TRUE AND status = 'active'
      `, [shareAmount, partner.user_id]);

      // await db.query(`
      //   INSERT INTO transactions (
      //     user_id,
      //     session_id,
      //     type,
      //     amount,
      //     transaction_type,
      //     status,
      //     notes
      //   ) VALUES (
      //     $1, $2, 'credit', $3, 'host_earning', 'completed', $4
      //   )
      // `, [partner.user_id, sessionId, shareAmount, `Earning from station ${stationId}`]);


      console.log(`Credited ₹${shareAmount} to partner ${partner.user_id}`);
    }

    console.log(`[${new Date().toISOString()}] Session ${sessionId}: +${deltaWh}Wh | ₹${cost} billed | New balance: ₹${walletUpdate.rows[0].balance}`);

  } catch (err) {
    console.error("Error handling metervalue:", err.message);
  }
});



function publishToConnector(thingId, messageObj) {

  const topic = `${thingId}/in`; // e.g., "connector001/in"
  const message = JSON.stringify(messageObj);
  client.publish(topic, message, { qos: 1 }, (err) => {
    if (err) {
      console.error(`Failed to publish to ${topic}:`, err);
    } else {
      console.log(`Published message to ${topic}:`, message);
    }
  });

}




process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

let isDbClosed = false; // Track if the database is already closed

process.on("SIGINT", async () => {
  console.log("Disconnecting MQTT client...");
  // client.end();
  console.log("MQTT client disconnected.");

  if (!isDbClosed) {
    console.log("Closing database connection...");
    try { // ✅ Close DB pool only once
      isDbClosed = true; // ✅ Mark DB as closed
      console.log("Database connection closed.");
    } catch (err) {
      console.error("Error closing database connection:", err);
    }
  } else {
    console.log("Database connection was already closed.");
  }

  process.exit(0);
});

module.exports = { publishToConnector };
