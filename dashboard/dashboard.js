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
const {addstations,toggleStationEnable,adduserstations,editStation,listStations,deleteStation,listuserstation} = require('./stations');

dashboard.post(
   '/api/add/station',
   validateJwt,
   authorizeRoles('admin','staff','dealer','host', 'customer'),
   addstations
 );
 dashboard.patch(
  '/api/update/station/:id',
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
  '/api/delete/station/:id',
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
dashboard.post(
  '/api/user/add/station',
  validateJwt,
  authorizeRoles('admin','staff','dealer','host', 'customer'),
  adduserstations
);
dashboard.patch(
  '/api/enable/toggle/:station_id',
  validateJwt,
  authorizeRoles('admin','staff','dealer','host', 'customer'),
  toggleStationEnable
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
const {addConnector, deleteConnector,deleteswitch} = require('./connectors');
dashboard.post('/api/stations/:station_id/connectors', 
  validateJwt,
  authorizeRoles('admin', 'staff', 'dealer'),
  addConnector);
  dashboard.delete('/api/connectors/:id',
    validateJwt,
    authorizeRoles('admin', 'staff', 'dealer'),
    deleteConnector
  ); 
  dashboard.delete('/api/switch/remove/:deviceId',
    validateJwt,
    authorizeRoles('admin', 'staff', 'dealer'),
    deleteswitch
  );

  // -----------------------------------------------------------
const {uploadImage,getAllImages,deleteImage,setPrimaryImage} = require('./stationimage');
dashboard.post('/api/stations/upload/images/:stationId', 
  validateJwt,
  authorizeRoles('admin', 'staff', 'dealer'),
  uploadImage);
// Get all images for a station
dashboard.get('/api/stations/images/:stationId',
  validateJwt,
  authorizeRoles('admin', 'staff', 'dealer'),
  getAllImages
);

// Delete an image for a station
dashboard.delete('/api/stations/images/:stationId/:imageId',
  validateJwt,
  authorizeRoles('admin', 'staff', 'dealer'),
  deleteImage
);
dashboard.put('/api/stations/images/:stationId/:imageId/primary',
  validateJwt,
  authorizeRoles('admin', 'staff', 'dealer'),
  setPrimaryImage
);

module.exports = dashboard