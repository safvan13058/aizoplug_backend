const pool = require('../middelware/db');
const express = require('express');
const app = express();
app.use(express.json()); // for parsing application/json
// const getchargingsession=async (req, res) => {
//     const userId = req.user.id;
//     const { status, from, to, limit = 30, page = 1 } = req.query;
  
//     let filters = ['user_id = $1'];
//     let values = [userId];
//     let idx = 2;
  
//     // Optional filters
//     if (status) {
//       filters.push(`status = $${idx}`);
//       values.push(status);
//       idx++;
//     }
//     if (from) {
//       filters.push(`start_time >= $${idx}`);
//       values.push(new Date(from));
//       idx++;
//     }
//     if (to) {
//       filters.push(`start_time <= $${idx}`);
//       values.push(new Date(to));
//       idx++;
//     }
  
//     const offset = (parseInt(page) - 1) * parseInt(limit);
//     values.push(limit);
//     values.push(offset);
  
//     const query = `
//       SELECT * FROM charging_sessions
//       WHERE ${filters.join(' AND ')}
//       ORDER BY start_time DESC
//       LIMIT $${idx} OFFSET $${idx + 1}
//     `;
  
//     const countQuery = `
//       SELECT COUNT(*) FROM charging_sessions
//       WHERE ${filters.join(' AND ')}
//     `;
  
//     try {
//       const [dataResult, countResult] = await Promise.all([
//         pool.query(query, values),
//         pool.query(countQuery, values.slice(0, idx - 1))
//       ]);
  
//       res.json({
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total_count: parseInt(countResult.rows[0].count),
//         sessions: dataResult.rows
//       });
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   }
const getchargingsession = async (req, res) => {
  const userId = req.user.id;
  const { status, from, to, limit = 30, page = 1 } = req.query;

  let filters = ['cs.user_id = $1'];
  let values = [userId];
  let idx = 2;

  if (status) {
    filters.push(`cs.status = $${idx}`);
    values.push(status);
    idx++;
  }
  if (from) {
    filters.push(`cs.start_time >= $${idx}`);
    values.push(new Date(from));
    idx++;
  }
  if (to) {
    filters.push(`cs.start_time <= $${idx}`);
    values.push(new Date(to));
    idx++;
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);
  values.push(limit);
  values.push(offset);

  const query = `
    SELECT 
      cs.*, 
      c.id AS connector_id, c.type AS connector_type, c.power_output, c.state AS connector_state, 
      c.status AS connector_status, c.ocpp_id, c.station_id,
      s.name AS station_name, s.latitude, s.longitude, s.amenities, s.contact_info, s.dynamic_pricing
    FROM charging_sessions cs
    JOIN connectors c ON cs.connector_id = c.id
    JOIN charging_stations s ON c.station_id = s.id
    WHERE ${filters.join(' AND ')}
    ORDER BY cs.start_time DESC
    LIMIT $${idx} OFFSET $${idx + 1}
  `;

  const countQuery = `
    SELECT COUNT(*) FROM charging_sessions cs
    WHERE ${filters.join(' AND ')}
  `;

  try {
    const [dataResult, countResult] = await Promise.all([
      pool.query(query, values),
      pool.query(countQuery, values.slice(0, idx - 1))
    ]);

    // Nest connector and station in each session
    const sessions = dataResult.rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      vehicle_id: row.vehicle_id,
      connector_id: row.connector_id,
      plug_switches_id: row.plug_switches_id,
      start_time: row.start_time,
      end_time: row.end_time,
      updated_at: row.updated_at,
      energy_used: row.energy_used,
      power: row.power,
      ampere: row.ampere,
      voltage: row.voltage,
      cost: row.cost,
      payment_method: row.payment_method,
      status: row.status,
      created_at: row.created_at,
      promotion_id: row.promotion_id,
      discount_amount: row.discount_amount,
      sponsored_by: row.sponsored_by,
      sponsorship_note: row.sponsorship_note,
      connector: {
        id: row.connector_id,
        type: row.connector_type,
        power_output: row.power_output,
        state: row.connector_state,
        status: row.connector_status,
        ocpp_id: row.ocpp_id,
        last_updated: row.connector_last_updated,
        created_at: row.connector_created_at,
        station: {
          id: row.station_id,
          name: row.station_name,
          latitude: row.latitude,
          longitude: row.longitude,
          amenities: row.amenities,
          contact_info: row.contact_info,
          dynamic_pricing: row.dynamic_pricing
        }
      }
    }));
    

    res.json({
      page: parseInt(page),
      limit: parseInt(limit),
      total_count: parseInt(countResult.rows[0].count),
      sessions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const sessionBilling = async (req, res) => {
  const sessionId = req.params.session_id;

  try {
    const { rows } = await pool.query(
      `
      SELECT 
        cs.*,
        u.name AS user_name,
        v.vehicle_number,
        c.ocpp_id,
        ps.device_id AS switch_id,
        t.id AS transaction_id,
        t.amount AS transaction_amount,
        t.type AS transaction_type,
        t.status AS transaction_status
      FROM charging_sessions cs
      LEFT JOIN users u ON cs.user_id = u.id
      LEFT JOIN vehicles v ON cs.vehicle_id = v.id
      LEFT JOIN connectors c ON cs.connector_id = c.id
      LEFT JOIN plug_switches ps ON cs.plug_switches_id = ps.id
      LEFT JOIN transactions t ON t.session_id = cs.id
      LEFT JOIN transactions t ON t.user_id = u.id
      WHERE cs.id = $1
      `,
      [sessionId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const row = rows[0];

    const connector = [];

    if (row.ocpp_id) {
      connector.push({
        id: row.connector_id,
        ocppid:row.ocpp_id,
        type: row.connector_type
      });
    }

    if (row.switch_id) {
      connector.push({
        deviceid: row.switch_id
      });
    }

    // Build response excluding raw connector/plug_switch columns
    const response = {
      session_id: row.id,
      user_name: row.user_name,
      vehicle_number: row.vehicle_number,
      start_time: row.start_time,
      end_time: row.end_time,
      energy_used: row.energy_used,
      power: row.power,
      ampere: row.ampere,
      voltage: row.voltage,
      cost: row.cost,
      payment_method: row.payment_method,
      status: row.status,
      transaction: {
        id: row.transaction_id,
        amount: row.transaction_amount,
        type: row.transaction_type,
        status: row.transaction_status
      },
      connector // combined array from connector or switch
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching session data:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = sessionBilling;


module.exports={getchargingsession,sessionBilling}