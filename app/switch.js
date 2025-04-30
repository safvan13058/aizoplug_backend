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
    const { deviceid, state } = req.body;
  
    if (!deviceid || !['on', 'off'].includes(state.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid payload. Provide deviceid and state (on/off).' });
    }
  
    const [thingName, switchNumber] = deviceid.split('_');
  
    if (!thingName || !switchNumber) {
      return res.status(400).json({ error: 'Invalid deviceid format. Expected format: <thingName>_<switchNumber>' });
    }
  
    const payload = {
      state: {
        desired: {
          command: "power",
          c: switchNumber,
          s: state.toLowerCase(),
          u: deviceid
        }
      }
    };
  
    turnonswitch(thingName, payload, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to publish to AWS IoT' });
      }
      res.json({ message: `Switch ${switchNumber} of ${thingName} turned ${state}` });
    });
  };
  

module.exports = {toggleswitch};