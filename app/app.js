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

// ..................................... find chargers .............................................................

app.get('/api/chargers', async (req, res) => {
    // console.log("/api/chargers",req.body);
    try {
        const { lat, long, radius } = req.query;

        if (!lat || !long || !radius) {
            return res.status(400).json({ error: 'lat, long, and radius are required' });
        }

        // Fetch all chargers from the database
        const result = await db.query("SELECT * FROM chargerstatus");

        // Filter chargers based on distance calculation
        const filteredChargers = result.rows
            .map(charger => ({
                ...charger,
                distance: haversine(parseFloat(lat), parseFloat(long), charger.lat, charger.long)
            }))
            .filter(charger => charger.distance <= parseFloat(radius)) // Keep only chargers within radius
            .sort((a, b) => a.distance - b.distance); // Sort by nearest first

        res.json(filteredChargers);
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

app.delete('/api/delete/vehicles',
    validateJwt, authorizeRoles('admin', 'customer', 'staff', 'dealer')
    , delete_vehi);

app.patch('/api/vehicles/:id/toggle-auto',
    validateJwt, authorizeRoles('admin', 'customer', 'staff', 'dealer')
    , toggle_auto);
//--------------------------------end vehicle--------------------------
//-------------------------------for charging session--------------------
const charging=require('./charging')
app.use('/charging',charging)

// -----------------------end charging session-------------------------
const {
  topup, userwallethistory, getuserwallet,create_wallet
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
const {addstations} = require('../dashboard/stations');

 app.post(
   '/api/add/station',
   validateJwt,
   authorizeRoles('admin','staff','dealer','host', 'customer'),
   addstations
 );
// ----------------------------------charging sessions------------------
const {getchargingsession} = require('./chargingsession');

app.get('/api/sessions/recent', validateJwt, authorizeRoles('admin', 'customer', 'staff', 'dealer'), getchargingsession);

module.exports = app