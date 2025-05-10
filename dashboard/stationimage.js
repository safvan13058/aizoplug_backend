const express = require('express');
const multer = require('multer');
const pool = require('./db'); // Adjust as needed
const s3 = require('./aws'); // Import the AWS S3 setup from aws.js
const multerS3 = require('multer-s3');


// Multer-S3 config for uploading images to S3
// Accept multiple images (max 10 per request)
const uploadMultiple = multer({
    storage: multerS3({
      s3,
      bucket: process.env.AWS_S3_BUCKET,
      acl: 'public-read',
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req, file, cb) => {
        const fileName = `stations/${Date.now()}-${file.originalname}`;
        cb(null, fileName);
      }
    })
  }).array('images', 10); // 'images' is the form field name
  

// Define the image upload handler with the correct middleware usage
const uploadImage = (req, res) => {
    uploadMultiple(req, res, async function (err) {
      if (err) {
        console.error('Upload error:', err);
        return res.status(500).json({ message: 'Upload failed' });
      }
  
      const stationId = req.params.stationId;
      const isPrimaryIndex = parseInt(req.body.primary_index); // e.g. 0 if the first image is primary
  
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No images uploaded' });
      }
  
      try {
        const client = await pool.connect();
  
        // Reset primary flags if any image is set as primary
        if (!isNaN(isPrimaryIndex)) {
          await client.query(
            'UPDATE station_images SET is_primary = FALSE WHERE station_id = $1',
            [stationId]
          );
        }
  
        const insertPromises = req.files.map((file, index) => {
          const isPrimary = index === isPrimaryIndex;
          return client.query(
            `INSERT INTO station_images (station_id, image_url, is_primary)
             VALUES ($1, $2, $3)`,
            [stationId, file.location, isPrimary]
          );
        });
  
        await Promise.all(insertPromises);
        client.release();
  
        res.status(201).json({
          message: 'Images uploaded successfully',
          images: req.files.map((file, index) => ({
            url: file.location,
            is_primary: index === isPrimaryIndex
          }))
        });
      } catch (err) {
        console.error('Database insert error:', err);
        res.status(500).json({ message: 'Failed to save image data' });
      }
    });
  }

module.exports = {uploadImage};
