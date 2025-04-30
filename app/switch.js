// POST /api/charging-sessions/start
const express = require('express');
const app = express.Router();
app.use(express.json());
const pool = require('../middelware/db'); // your PostgreSQL connection instance
const { validateJwt, authorizeRoles } = require('../middelware/auth')
const {turnonswitch}=require('./eventcharger')

// API to turn switch ON or OFF
const toggleswitch=async (req, res) => {
    const { thingName, switchNumber, state } = req.body;
  
    if (!thingName || !switchNumber || !['ON', 'OFF'].includes(state)) {
      return res.status(400).json({ error: 'Invalid payload. Provide thingName, switchNumber, and state (ON/OFF).' });
    }
  
    const turnOn = state === 'ON';
  
    const payload = {
      state: {
        desired: {
          [`s${switchNumber}`]: turnOn ? "1" : "0",
          [`v${switchNumber}`]: turnOn ? "100" : "0",
          t: turnOn ? "ON" : "OFF"
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