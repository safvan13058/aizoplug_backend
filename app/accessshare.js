const pool = require('../middelware/db');
const express = require('express');
const app = express();
app.use(express.json());



const shareaccess = async (req, res) => {
    const client = await db.connect();
    try {
        const { station_id } = req.params;
        const { serial, securitykey } = req.body;

        await client.query('BEGIN');

        // Verify the thing
        const thingQuery = `
            SELECT id FROM things 
            WHERE serialno = $1 AND securitykey = $2
        `;
        const thingResult = await client.query(thingQuery, [serial, securitykey]);

        if (thingResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Thing not found or invalid credentials" });
        }

        const thingId = thingResult.rows[0].id;

        // Get devices linked to the thing
        const deviceQuery = `SELECT * FROM devices WHERE thingId = $1`;
        const deviceResult = await client.query(deviceQuery, [thingId]);

        if (deviceResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "No devices found for this thing" });
        }

        // Check if any device is already connected
        for (const device of deviceResult.rows) {
            const hubIndex = device.hubindex || device.deviceid;

            if (device.type === 'charger') {
                const connectorExistsQuery = `
                    SELECT 1 FROM connectors 
                    WHERE station_id = $1 AND ocpp_id = $2
                `;
                const exists = await client.query(connectorExistsQuery, [station_id, hubIndex]);
                if (exists.rows.length > 0) {
                    await client.query('ROLLBACK');
                    return res.status(400).json({ message: "Device already connected" });
                }
            } else {
                const switchExistsQuery = `
                    SELECT 1 FROM plug_switches 
                    WHERE station_id = $1 AND device_id = $2
                `;
                const exists = await client.query(switchExistsQuery, [station_id, device.deviceid]);
                if (exists.rows.length > 0) {
                    await client.query('ROLLBACK');
                    return res.status(400).json({ message: "Device already connected" });
                }
            }
        }

        // If all devices are new, insert them
        for (const device of deviceResult.rows) {
            const hubIndex = device.hubindex || device.deviceid;

            if (device.type === 'charger') {
                const insertConnectorQuery = `
                    INSERT INTO connectors (station_id, type, power_output, state, status, ocpp_id)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `;
                await client.query(insertConnectorQuery, [
                    station_id,
                    device.icon || 'CCS',
                    22.0,
                    'available',
                    'idle',
                    hubIndex
                ]);
            } else {
                const insertSwitchQuery = `
                    INSERT INTO plug_switches (station_id, device_id, hub_index, type, status)
                    VALUES ($1, $2, $3, $4, $5)
                `;
                await client.query(insertSwitchQuery, [
                    station_id,
                    device.deviceid,
                    hubIndex,
                    device.type || 'smart_switch',
                    'off'
                ]);
            }
        }

        await client.query('COMMIT');
        return res.status(201).json({ message: "Devices successfully linked" });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error in shareaccess:", error);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        client.release();
    }
};




module.exports={shareaccess}