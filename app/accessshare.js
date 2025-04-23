const pool = require('../middelware/db');
const express = require('express');
const app = express();
app.use(express.json());



const shareaccess=async (req,res)=>{
    const {station_id}=req.params;
    const {serial,securitykey}=req.body;

    // find the thign that match the serial and securitykey

    // and find its devices

    // insert this devices into the if thing type is charger insert into connectors 

    // if it is switch insert into plug_switches
}



module.exports={}