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
    const { thingName, switchNumber, state } = req.body;
  
    if (!thingName || !switchNumber || !['on', 'off'].includes(state.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid payload. Provide thingName, switchNumber, and state (on/off).' });
    }
  
    const payload = {
      state: {
        desired: {
          command: "power",
          c: switchNumber.toString(),
          s: state.toLowerCase(),
          u: "safvan13473@gmail.com"
        }
      }
    };
  
    turnonswitch(thingName, payload, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to publish to AWS IoT' });
      }
      res.json({ message: `Switch ${switchNumber} turned ${state}` });
    });
  };

module.exports = {toggleswitch};