const pool = require('../middelware/db');
const express = require('express');
const app = express();
app.use(express.json()); // for parsing application/json
function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(' ');
}

// const getchargingsession = async (req, res) => {
//   const userId = req.user.id;
//   const { status, from, to, limit = 30, page = 1 } = req.query;

//   let filters = ['cs.user_id = $1'];
//   let values = [userId];
//   let idx = 2;

//   if (status) {
//     filters.push(`LOWER(cs.status) = $${idx}`);
//     values.push(status.toLowerCase());
//     idx++;
//   }
//   if (from) {
//     filters.push(`cs.start_time >= $${idx}`);
//     values.push(new Date(from).toISOString());
//     idx++;
//   }
//   if (to) {
//     filters.push(`cs.start_time <= $${idx}`);
//     values.push(new Date(to).toISOString());
//     idx++;
//   }

//   const offset = (parseInt(page) - 1) * parseInt(limit);
//   values.push(limit);
//   values.push(offset);

//   const query = `
//     SELECT 
//       cs.*,
//       t.id AS transaction_id,
//       t.amount AS transaction_amount,
//       t.type AS transaction_type,
//       t.status AS transaction_status,

//       -- Connector & Station
//       c.id AS connector_id, c.type AS connector_type, c.power_output, 
//       c.state AS connector_state, c.status AS connector_status, 
//       c.ocpp_id, c.station_id AS connector_station_id,
//       s.name AS connector_station_name, s.latitude AS connector_station_latitude,
//       s.longitude AS connector_station_longitude, s.amenities AS connector_station_amenities,
//       s.contact_info AS connector_station_contact_info, s.dynamic_pricing AS connector_station_dynamic_pricing,

//       -- Plug switch
//       ps.id AS switch_id, ps.device_id AS switch_device_id, ps.hub_index, 
//       ps.type AS switch_type, ps.status AS switch_status, 
//       ps.dynamic_pricing AS switch_dynamic_pricing, ps.last_heartbeat AS switch_last_heartbeat,
//       ps.station_id AS switch_station_id,

//       -- Station from plug switch
//       pss.name AS switch_station_name, pss.latitude AS switch_station_latitude,
//       pss.longitude AS switch_station_longitude, pss.amenities AS switch_station_amenities,
//       pss.contact_info AS switch_station_contact_info, pss.dynamic_pricing AS switch_station_dynamic_pricing

//     FROM charging_sessions cs
//     LEFT JOIN connectors c ON cs.connector_id = c.id
//     LEFT JOIN charging_stations s ON c.station_id = s.id
//     LEFT JOIN plug_switches ps ON cs.plug_switches_id = ps.id
//     LEFT JOIN charging_stations pss ON ps.station_id = pss.id
//     LEFT JOIN transactions t ON t.session_id = cs.id
//     WHERE ${filters.join(' AND ')}
//     ORDER BY cs.start_time DESC
//     LIMIT $${idx} OFFSET $${idx + 1}
//   `;

//   const countQuery = `
//     SELECT COUNT(*) FROM charging_sessions cs
//     WHERE ${filters.join(' AND ')}
//   `;

//   try {
//     const [dataResult, countResult] = await Promise.all([
//       pool.query(query, values),
//       pool.query(countQuery, values.slice(0, idx - 1))
//     ]);

//     const sessions = dataResult.rows.map(row => ({
//       id: row.id,
//       user_id: row.user_id,
//       vehicle_id: row.vehicle_id,
//       connector_id: row.connector_id,
//       plug_switches_id: row.plug_switches_id,
//       start_time: row.start_time,
//       end_time: row.end_time,
//       duration: row.end_time && row.start_time
//         ? formatDuration(new Date(row.end_time) - new Date(row.start_time))
//         : null,
//       updated_at: row.updated_at,
//       energy_used: row.energy_used,
//       power: row.power,
//       ampere: row.ampere,
//       voltage: row.voltage,
//       cost: row.cost,
//       payment_method: row.payment_method,
//       status: row.status,
//       created_at: row.created_at,
//       promotion_id: row.promotion_id,
//       discount_amount: row.discount_amount,
//       sponsored_by: row.sponsored_by,
//       sponsorship_note: row.sponsorship_note,
//       // station: row.switch_station_id ? {
//       //   id: row.switch_station_id,
//       //   name: row.switch_station_name,
//       //   latitude: row.switch_station_latitude,
//       //   longitude: row.switch_station_longitude,
//       //   amenities: row.switch_station_amenities,
//       //   contact_info: row.switch_station_contact_info,
//       //   dynamic_pricing: row.switch_station_dynamic_pricing
//       // } : null,

//       transaction: row.transaction_id ? {
//         id: row.transaction_id,
//         amount: row.transaction_amount,
//         type: row.transaction_type,
//         status: row.transaction_status,
//       } : null,

//       connector: row.connector_id ? {
//         id: row.connector_id,
//         type: row.connector_type,
//         power_output: row.power_output,
//         state: row.connector_state,
//         status: row.connector_status,
//         ocpp_id: row.ocpp_id,
//         station: row.connector_station_id ? {
//           id: row.connector_station_id,
//           name: row.connector_station_name,
//           latitude: row.connector_station_latitude,
//           longitude: row.connector_station_longitude,
//           amenities: row.connector_station_amenities,
//           contact_info: row.connector_station_contact_info,
//           dynamic_pricing: row.connector_station_dynamic_pricing
//         } : null
//       } : null,

//       plug_switch: row.switch_id ? {
//         id: row.switch_id,
//         device_id: row.switch_device_id,
//         hub_index: row.hub_index,
//         type: row.switch_type,
//         status: row.switch_status,
//         dynamic_pricing: row.switch_dynamic_pricing,
//         last_heartbeat: row.switch_last_heartbeat,
//         station: row.switch_station_id ? {
//           id: row.switch_station_id,
//           name: row.switch_station_name,
//           latitude: row.switch_station_latitude,
//           longitude: row.switch_station_longitude,
//           amenities: row.switch_station_amenities,
//           contact_info: row.switch_station_contact_info,
//           dynamic_pricing: row.switch_station_dynamic_pricing
//         } : null
//       } : null
//     }));

//     res.json({
//       page: parseInt(page),
//       limit: parseInt(limit),
//       total_count: parseInt(countResult.rows[0].count),
//       sessions
//     });
//   } catch (err) {
//     console.error("getchargingsession error:", err);
//     res.status(500).json({ error: "Internal server error." });
//   }
// };


const getchargingsession = async (req, res) => {
  const userId = req.user.id;
  const {
    status,
    from,
    to,
    date,
    limit = 30,
    page = 1,
    sort_by = 'start_time',
    sort_order = 'desc',
  } = req.query;

  let filters = ['cs.user_id = $1'];
  let values = [userId];
  let idx = 2;

  // Filter by status
  if (status) {
    filters.push(`LOWER(cs.status) = $${idx}`);
    values.push(status.toLowerCase());
    idx++;
  }

  // Filter by specific date
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    filters.push(`cs.start_time BETWEEN $${idx} AND $${idx + 1}`);
    values.push(startOfDay.toISOString(), endOfDay.toISOString());
    idx += 2;
  } else {
    // Filter by from/to
    if (from) {
      filters.push(`cs.start_time >= $${idx}`);
      values.push(new Date(from).toISOString());
      idx++;
    }
    if (to) {
      filters.push(`cs.start_time <= $${idx}`);
      values.push(new Date(to).toISOString());
      idx++;
    }
  }

  // Sort column and order
  const allowedSortFields = {
    cost: 'cs.cost',
    energy_used: 'cs.energy_used',
    start_time: 'cs.start_time',
  };

  const sortField = allowedSortFields[sort_by] || 'cs.start_time';
  const sortOrder = sort_order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const offset = (parseInt(page) - 1) * parseInt(limit);
  values.push(limit);
  values.push(offset);

  const query = `
    SELECT 
      cs.*,
      t.id AS transaction_id,
      t.amount AS transaction_amount,
      t.type AS transaction_type,
      t.status AS transaction_status,

      c.id AS connector_id, c.type AS connector_type, c.power_output, 
      c.state AS connector_state, c.status AS connector_status, 
      c.ocpp_id, c.station_id AS connector_station_id,
      s.name AS connector_station_name, s.latitude AS connector_station_latitude,
      s.longitude AS connector_station_longitude, s.amenities AS connector_station_amenities,
      s.contact_info AS connector_station_contact_info, s.dynamic_pricing AS connector_station_dynamic_pricing,

      ps.id AS switch_id, ps.device_id AS switch_device_id, ps.hub_index, 
      ps.type AS switch_type, ps.status AS switch_status, 
      ps.dynamic_pricing AS switch_dynamic_pricing, ps.last_heartbeat AS switch_last_heartbeat,
      ps.station_id AS switch_station_id,

      pss.name AS switch_station_name, pss.latitude AS switch_station_latitude,
      pss.longitude AS switch_station_longitude, pss.amenities AS switch_station_amenities,
      pss.contact_info AS switch_station_contact_info, pss.dynamic_pricing AS switch_station_dynamic_pricing

    FROM charging_sessions cs
    LEFT JOIN connectors c ON cs.connector_id = c.id
    LEFT JOIN charging_stations s ON c.station_id = s.id
    LEFT JOIN plug_switches ps ON cs.plug_switches_id = ps.id
    LEFT JOIN charging_stations pss ON ps.station_id = pss.id
    LEFT JOIN transactions t ON t.session_id = cs.id
    WHERE ${filters.join(' AND ')}
    ORDER BY ${sortField} ${sortOrder}
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

    const sessions = dataResult.rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      vehicle_id: row.vehicle_id,
      connector_id: row.connector_id,
      plug_switches_id: row.plug_switches_id,
      start_time: row.start_time,
      end_time: row.end_time,
      duration: row.end_time && row.start_time
        ? formatDuration(new Date(row.end_time) - new Date(row.start_time))
        : null,
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

      transaction: row.transaction_id ? {
        id: row.transaction_id,
        amount: row.transaction_amount,
        type: row.transaction_type,
        status: row.transaction_status,
      } : null,

      connector: row.connector_id ? {
        id: row.connector_id,
        type: row.connector_type,
        power_output: row.power_output,
        state: row.connector_state,
        status: row.connector_status,
        ocpp_id: row.ocpp_id,
        station: row.connector_station_id ? {
          id: row.connector_station_id,
          name: row.connector_station_name,
          latitude: row.connector_station_latitude,
          longitude: row.connector_station_longitude,
          amenities: row.connector_station_amenities,
          contact_info: row.connector_station_contact_info,
          dynamic_pricing: row.connector_station_dynamic_pricing
        } : null
      } : null,

      plug_switch: row.switch_id ? {
        id: row.switch_id,
        device_id: row.switch_device_id,
        hub_index: row.hub_index,
        type: row.switch_type,
        status: row.switch_status,
        dynamic_pricing: row.switch_dynamic_pricing,
        last_heartbeat: row.switch_last_heartbeat,
        station: row.switch_station_id ? {
          id: row.switch_station_id,
          name: row.switch_station_name,
          latitude: row.switch_station_latitude,
          longitude: row.switch_station_longitude,
          amenities: row.switch_station_amenities,
          contact_info: row.switch_station_contact_info,
          dynamic_pricing: row.switch_station_dynamic_pricing
        } : null
      } : null
    }));

    res.json({
      page: parseInt(page),
      limit: parseInt(limit),
      total_count: parseInt(countResult.rows[0].count),
      sessions
    });
  } catch (err) {
    console.error("getchargingsession error:", err);
    res.status(500).json({ error: "Internal server error." });
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
        c.type AS connector_type,
        ps.device_id AS switch_id,
        t.id AS transaction_id,
        t.amount AS transaction_amount,
        t.type AS transaction_type,
        t.status AS transaction_status,
        csn.id AS station_id,
        csn.name AS station_name,
        csn.latitude,
        csn.longitude,
        csn.amenities,
        csn.contact_info
      FROM charging_sessions cs
LEFT JOIN users u ON cs.user_id = u.id
LEFT JOIN vehicles v ON cs.vehicle_id = v.id
LEFT JOIN connectors c ON cs.connector_id = c.id
LEFT JOIN plug_switches ps ON cs.plug_switches_id = ps.id
LEFT JOIN transactions t ON t.session_id = cs.id
LEFT JOIN charging_stations csn ON c.station_id = csn.id

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
        ocppid: row.ocpp_id,
        type: row.connector_type,
      });
    }

    if (row.switch_id) {
      connector.push({
        deviceid: row.switch_id,
      });
    }

    const response = {
      session_id: row.id,
      user_name: row.user_name,
      vehicle_number: row.vehicle_number,
      start_time: row.start_time,
      end_time: row.end_time,
      duration: row.end_time && row.start_time
        ? formatDuration(new Date(row.end_time) - new Date(row.start_time))
        : null,
      energy_used: row.energy_used,
      power: row.power,
      ampere: row.ampere,
      voltage: row.voltage,
      cost: row.cost,
      payment_method: row.payment_method,
      status: row.status,
      connector: connector,
      station: {
        id: row.station_id,
        name: row.station_name,
        latitude: row.latitude,
        longitude: row.longitude,
        amenities: row.amenities,
        contact_info: row.contact_info,
      },
      transaction: {
        id: row.transaction_id,
        amount: row.transaction_amount,
        type: row.transaction_type,
        status: row.transaction_status,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching session data:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};





module.exports = { getchargingsession, sessionBilling }