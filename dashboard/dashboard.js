const express = require('express')
const dashboard = express.Router()
const db = require('../middelware/db')
dashboard.use(express.json()); 
const { validateJwt, authorizeRoles } = require('../middelware/auth');

dashboard.get('/working', (req, res) => {
  res.send('app Server is working!');
});
// ............................................................................. insert ...........................................................................

dashboard.post('/insert/charger', async (req, res) => {
    console.log("reqbody:", req.body);
    

    const { chargerid, lat, long, state, status } = req.body;

    if (!chargerid || !lat || !long || !state || !status) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        await db.query(
            'INSERT INTO chargerstatus(chargerid, lat, long, state, status) VALUES ($1, $2, $3, $4, $5)',
            [chargerid, lat, long, state, status]
        );

        return res.status(200).json({ message: "Insertion successful" });
    } catch (error) {
        console.error("Database error:", error);
        return res.status(500).json({ error: "Error inserting data" });
    }
});
// --------------------------------station users----------------------------
const {addstations,editStation,listStations,deleteStation,listuserstation} = require('./stations');

dashboard.post(
   '/api/add/station',
   validateJwt,
   authorizeRoles('admin','staff','dealer','host', 'customer'),
   addstations
 );
 dashboard.put(
  '/api/update/station',
  validateJwt,
  authorizeRoles('admin','staff','dealer','host', 'customer'),
  editStation
);
dashboard.get(
  '/api/list/station',
  validateJwt,
  authorizeRoles('admin','staff','dealer','host', 'customer'),
  listStations
);
dashboard.delete(
  '/api/delete/station',
  validateJwt,
  authorizeRoles('admin','staff','dealer','host', 'customer'),
  deleteStation
);
dashboard.get(
  '/api/list/user/station',
  validateJwt,
  authorizeRoles('admin','staff','dealer','host', 'customer'),
  listuserstation
);
// -----------------------------------------
const {
    addPartner,
    updatePartner,
    deletePartner,
    listPartners
  } = require('./station_user');
  
const allowedRoles = ['admin','staff'];

// Add partner to a station
dashboard.post(
  '/api/station/:station_id/partners',
  validateJwt,
  authorizeRoles(...allowedRoles),
  addPartner
);

// Update a partner
dashboard.put(
  '/api/station/:station_id/partners/:user_id',
  validateJwt,
  authorizeRoles(...allowedRoles),
  updatePartner
);

// Delete a partner
dashboard.delete(
  '/api/station/:station_id/partners/:user_id',
  validateJwt,
  authorizeRoles(...allowedRoles),
  deletePartner
);

// List all partners
dashboard.get(
  '/api/display/:station_id/partners',
  validateJwt,
  authorizeRoles('admin', 'staff', 'dealer'),
  listPartners
);
// ---------------------------------------------------------------------------
// ----------------------connectors-------------------------------------
const {addConnector} = require('./connectors');
dashboard.post('/api/stations/:station_id/connectors', 
  validateJwt,
  authorizeRoles('admin', 'staff', 'dealer'),
  addConnector);

module.exports = dashboard