// POST /api/charging-sessions/start
const express = require('express');
const router = express.Router();
router.use(express.json());
const pool = require('../middelware/db'); // your PostgreSQL connection instance
const { validateJwt, authorizeRoles } = require('../middelware/auth')





module.exports = router;