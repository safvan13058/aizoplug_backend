const express = require('express')
const app = express.Router()
const db = require('../middelware/db')
require('dotenv').config();
app.use(express.json());
const { validateJwt, authorizeRoles } = require('../middelware/auth')


function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const toRad = angle => (angle * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function parseRadius(radiusStr) {
  if (!radiusStr) return null;

  let meters = 0;
  const regex = /(\d+)\s*(km|m)/g;
  let match;

  while ((match = regex.exec(radiusStr.toLowerCase())) !== null) {
    const value = parseFloat(match[1]);
    const unit = match[2];

    if (unit === 'km') meters += value * 1000;
    else if (unit === 'm') meters += value;
  }

  return meters;
}

// ..................................... find chargers .............................................................

// app.get('/api/chargers/location', async (req, res) => {
//   try {
//     const { lat, long, radius, search, type, power_output } = req.query;


//     // If no search, validate required location parameters
//     if (!search && (!lat || !long || !radius)) {
//       return res.status(400).json({ error: 'lat, long, and radius are required unless using search' });
//     }

//     const query = `
//   SELECT 
//     cs.id AS station_id,
//     cs.name,
//     cs.latitude,
//     cs.longitude,
//     cs.amenities,
//     cs.contact_info,
//     cs.dynamic_pricing,
//     cs.created_at AS station_created_at,
//     cs.updated_at,
//     c.id AS connector_id,
//     c.type,
//     c.power_output,
//     c.state,
//     c.status,
//     c.ocpp_id,
//     c.last_updated,
//     c.created_at AS connector_created_at
//   FROM charging_stations cs
//   LEFT JOIN connectors c ON cs.id = c.station_id
//   WHERE cs.enable = true
// `;

//     const result = await db.query(query);
//     const stationsMap = {};

//     for (let row of result.rows) {
//       const stationId = row.station_id;

//       // If searching, only apply search filter
//       if (search) {
//         const term = search.toLowerCase();

//         const name = row.name?.toLowerCase() || '';
//         const amenities = row.amenities?.toLowerCase() || '';
//         const contact = typeof row.contact_info === 'string'
//           ? row.contact_info.toLowerCase()
//           : JSON.stringify(row.contact_info || '').toLowerCase();

//         if (
//           !name.includes(term) &&
//           !amenities.includes(term) &&
//           !contact.includes(term)
//         ) {
//           continue;
//         }
//       } else {
//         // Location-based filtering
//         const distance = haversine(parseFloat(lat), parseFloat(long), row.latitude, row.longitude);
//         if (distance > parseFloat(radius) * 1000) continue;
//       }

//       // New: Filter by connector type and power_output if specified
//       if (type && row.type?.toLowerCase() !== type.toLowerCase()) continue;
//       if (power_output && parseFloat(row.power_output) !== parseFloat(power_output)) continue;


//       const distanceInKm = lat && long ? parseFloat((haversine(parseFloat(lat), parseFloat(long), row.latitude, row.longitude) / 1000).toFixed(2)) : null;

//       if (!stationsMap[stationId]) {
//         stationsMap[stationId] = {
//           id: stationId,
//           name: row.name,
//           latitude: row.latitude,
//           longitude: row.longitude,
//           amenities: row.amenities,
//           contact_info: row.contact_info,
//           dynamic_pricing: row.dynamic_pricing,
//           created_at: row.station_created_at,
//           updated_at: row.updated_at,
//           distance: distanceInKm ? `${distanceInKm} Km` : null,
//           connectors: []
//         };
//       }

//       if (row.connector_id) {
//         stationsMap[stationId].connectors.push({
//           id: row.connector_id,
//           type: row.type,
//           power_output: row.power_output,
//           state: row.state,
//           status: row.status,
//           ocpp_id: row.ocpp_id,
//           last_updated: row.last_updated,
//           created_at: row.connector_created_at
//         });
//       }
//     }

//     const filteredStations = Object.values(stationsMap).sort((a, b) => {
//       if (a.distance && b.distance) return parseFloat(a.distance) - parseFloat(b.distance);
//       return 0; // If no distance, keep order as is
//     });

//     if (filteredStations.length === 0) {
//       return res.status(200).json({ message: "No charging stations found for your request.", data: [] });
//     }

//     res.json(filteredStations);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });
app.get('/api/chargers/location', async (req, res) => {
  try {
    const { lat, long, radius, search, type, power_output, amenities } = req.query;

    // If no search, validate required location parameters
    if (!search && (!lat || !long || !radius)) {
      return res.status(400).json({ error: 'lat, long, and radius are required unless using search' });
    }

    const amenitiesArray = amenities ? amenities.toLowerCase().split(',').map(a => a.trim()) : null;

    const query = `
      SELECT 
        cs.id AS station_id,
        cs.name,
        cs.latitude,
        cs.longitude,
        cs.amenities,
        cs.contact_info,
        cs.dynamic_pricing,
        cs.created_at AS station_created_at,
        cs.updated_at,
        c.id AS connector_id,
        c.type,
        c.power_output,
        c.state,
        c.status,
        c.ocpp_id,
        c.last_updated,
        c.created_at AS connector_created_at
      FROM charging_stations cs
      LEFT JOIN connectors c ON cs.id = c.station_id
      WHERE cs.enable = true
    `;

    const result = await db.query(query);
    const stationsMap = {};

    for (let row of result.rows) {
      const stationId = row.station_id;

      // If searching, only apply search filter
      if (search) {
        const term = search.toLowerCase();

        const name = row.name?.toLowerCase() || '';
        const amenities = row.amenities?.toLowerCase() || '';
        const contact = typeof row.contact_info === 'string'
          ? row.contact_info.toLowerCase()
          : JSON.stringify(row.contact_info || '').toLowerCase();

        if (
          !name.includes(term) &&
          !amenities.includes(term) &&
          !contact.includes(term)
        ) {
          continue;
        }
      } else {
        // Location-based filtering
        const distance = haversine(parseFloat(lat), parseFloat(long), row.latitude, row.longitude);
        if (distance > parseFloat(radius) * 1000) continue;
      }

      // Amenities filtering
      if (amenitiesArray) {
        const stationAmenities = row.amenities?.toLowerCase() || '';
        const matchesAll = amenitiesArray.every(a => stationAmenities.includes(a));
        if (!matchesAll) continue;
      }

      // Filter by connector type and power_output if specified
      if (type && row.type?.toLowerCase() !== type.toLowerCase()) continue;
      if (power_output && parseFloat(row.power_output) !== parseFloat(power_output)) continue;

      const distanceInKm = lat && long
        ? parseFloat((haversine(parseFloat(lat), parseFloat(long), row.latitude, row.longitude) / 1000).toFixed(2))
        : null;

      if (!stationsMap[stationId]) {
        stationsMap[stationId] = {
          id: stationId,
          name: row.name,
          latitude: row.latitude,
          longitude: row.longitude,
          amenities: row.amenities,
          contact_info: row.contact_info,
          dynamic_pricing: row.dynamic_pricing,
          created_at: row.station_created_at,
          updated_at: row.updated_at,
          distance: distanceInKm ? `${distanceInKm} Km` : null,
          connectors: []
        };
      }

      if (row.connector_id) {
        stationsMap[stationId].connectors.push({
          id: row.connector_id,
          type: row.type,
          power_output: row.power_output,
          state: row.state,
          status: row.status,
          ocpp_id: row.ocpp_id,
          last_updated: row.last_updated,
          created_at: row.connector_created_at
        });
      }
    }

    const filteredStations = Object.values(stationsMap).sort((a, b) => {
      if (a.distance && b.distance) return parseFloat(a.distance) - parseFloat(b.distance);
      return 0; // If no distance, keep order as is
    });

    if (filteredStations.length === 0) {
      return res.status(200).json({ message: "No charging stations found for your request.", data: [] });
    }

    res.json(filteredStations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});
app.get('/api/chargers/suggestions', async (req, res) => {
  try {
    const { q, lat, lon, radius } = req.query;
    if (!q) return res.status(400).json({ error: 'Query parameter `q` is required.' });

    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);
    const radiusKm = parseFloat(radius); // radius in kilometers

    // Step 1: fetch stations matching text (no radius filter in DB for simplicity)
    const query = `
      SELECT id, name, latitude, longitude
      FROM charging_stations
      WHERE LOWER(name) LIKE $1
      OR LOWER(amenities::text) LIKE $1
      OR LOWER(contact_info::text) LIKE $1
      LIMIT 100
    `;
    const values = [`%${q.toLowerCase()}%`];
    const result = await db.query(query, values);

    let stations = result.rows;

    if (!isNaN(userLat) && !isNaN(userLon) && !isNaN(radiusKm)) {
      stations = stations
        .map(station => ({
          ...station,
          distance: haversine(userLat, userLon, station.latitude, station.longitude) / 1000, // convert to km
        }))
        .filter(station => station.distance <= radiusKm) // filter using km
        .sort((a, b) => a.distance - b.distance);
    }

    stations = stations.slice(0, 10);

    res.json({ suggestions: stations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


// ............................ wallet test ..........................................
app.post('/api/webhooks/payment', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']; // or use Razorpay's validation
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const walletId = paymentIntent.metadata.wallet_id;
    const amount = paymentIntent.amount / 100;

    // Top-up the wallet securely
    const walletRes = await pool.query(`SELECT * FROM wallets WHERE id = $1`, [walletId]);
    if (walletRes.rows.length) {
      const wallet = walletRes.rows[0];

      await pool.query(
        `UPDATE wallets SET balance = balance + $1, last_transaction_at = NOW() WHERE id = $2`,
        [amount, walletId]
      );

      await pool.query(
        `INSERT INTO wallet_transactions (wallet_id, user_id, transaction_type, amount, balance_after, description)
           VALUES ($1, $2, 'top_up', $3, $4, $5)`,
        [wallet.id, wallet.user_id, amount, wallet.balance + amount, 'Top-up via webhook']
      );
    }
  }

  res.status(200).json({ received: true });
});
// -------------------------------vehicle------------------------------
const {
  create_vehi,
  update_vehi,
  toggle_auto,
  getvehiclebyuser,
  delete_vehi,
  toggleselect,
} = require('./vehicle');
app.get('/working', (req, res) => {
  res.send('app Server is working!');
});


app.post('/api/add/vehicles/',
  validateJwt, authorizeRoles('admin', 'customer', 'staff', 'dealer')
  , create_vehi);

app.put('/api/update/vehicles/:id',
  validateJwt, authorizeRoles('admin', 'customer', 'staff', 'dealer')
  , update_vehi);

app.get('/api/display/user/vehicles',
  validateJwt, authorizeRoles('admin', 'customer', 'staff', 'dealer')
  , getvehiclebyuser);

app.delete('/api/delete/vehicles/:id',
  validateJwt, authorizeRoles('admin', 'customer', 'staff', 'dealer')
  , delete_vehi);

app.patch('/api/vehicles/:id/toggle-auto',
  validateJwt, authorizeRoles('admin', 'customer', 'staff', 'dealer')
  , toggle_auto);
app.post('/api/set/selected/vehicles/:vehicle_id',
  validateJwt, authorizeRoles('admin', 'customer', 'staff', 'dealer')
  , toggleselect);


//--------------------------------end vehicle--------------------------
//-------------------------------for charging session--------------------
const charging = require('./charging')
app.use('/charging', charging)

// -----------------------end charging session-------------------------
const {
  topup, userwallethistory, getuserwallet, create_wallet
} = require('./wallet');

app.post('/api/add/wallet/',
  validateJwt, authorizeRoles('admin', 'customer', 'staff', 'dealer')
  , create_wallet);

app.get('/api/display/wallet/',
  validateJwt, authorizeRoles('admin', 'customer', 'staff', 'dealer')
  , getuserwallet);
app.get('/api/display/wallet/history',
  validateJwt, authorizeRoles('admin', 'customer', 'staff', 'dealer')
  , userwallethistory);

app.post('/api/topup/wallet/:walletId',
  validateJwt, authorizeRoles('admin', 'customer', 'staff', 'dealer')
  , topup);

// --------------------------------------------------------------------
const { addstations, adduserstations } = require('../dashboard/stations');

app.post(
  '/api/add/station',
  validateJwt,
  authorizeRoles('admin', 'staff', 'dealer', 'host', 'customer'),
  addstations
);

// ----------------------------------charging sessions------------------
const { getchargingsession, sessionBilling } = require('./chargingsession');

app.get('/api/sessions/recent', validateJwt, authorizeRoles('admin', 'customer', 'staff', 'dealer'), getchargingsession);
app.get('/api/session/billing/:session_id', validateJwt, authorizeRoles('admin', 'customer', 'staff', 'dealer'), sessionBilling)

// ----------------------------------share access------------------------------------------------------
const { shareaccess } = require('./accessshare')
app.post('/api/device/accessshare/:station_id',
  validateJwt, authorizeRoles('admin', 'customer', 'staff', 'dealer'),
  shareaccess);


const { stationconnectors } = require('../dashboard/stations')
app.get('/api/station/devices/:station_id',
  validateJwt, authorizeRoles('admin', 'customer', 'staff', 'dealer'),
  stationconnectors);

const { displayChargerAndStation } = require('../dashboard/stations')

app.get('/api/connector/qr/:ocppid',
  validateJwt, authorizeRoles('admin', 'customer', 'staff', 'dealer'),
  displayChargerAndStation)


// -----------------------------------switch -----------------------------
const { toggleswitch } = require('./switch')
app.post('/api/toggle/switch', validateJwt, authorizeRoles('admin', 'customer', 'staff', 'dealer'), toggleswitch)


// ------------------------user fav-station--------------
const { toggleFavorite, getAllFavorites } = require('./favourite')
app.post('/api/toggle/fav/:station_id',
  validateJwt, authorizeRoles('admin', 'customer', 'staff', 'dealer'),
  toggleFavorite)

app.get('/api/fav/stations',
  validateJwt, authorizeRoles('admin', 'customer', 'staff', 'dealer'),
  getAllFavorites)
module.exports = app