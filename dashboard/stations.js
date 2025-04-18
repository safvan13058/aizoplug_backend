const pool = require('../middelware/db');
const express = require('express');
const app = express();
app.use(express.json()); // for parsing application/json



const addstations= async (req, res) => {
    const {
        name,
        latitude,
        longitude,
        amenities,
        contact_info,
        dynamic_pricing
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO charging_stations 
            (name, latitude, longitude, amenities, contact_info, dynamic_pricing) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [name, latitude, longitude, amenities, contact_info, dynamic_pricing]
        );

        res.status(201).json({
            message: 'Charging station created successfully',
            station: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating station:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}













module.exports = {addstations};