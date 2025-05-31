const express = require('express');
const multer = require('multer');
const pool = require('../middelware/db'); // Adjust as needed
const s3 = require('../middelware/aws'); // Import the AWS S3 setup from aws.js
const multerS3 = require('multer-s3');

// Store images temporarily in memory (or disk if preferred)
const storage = multer.memoryStorage(); // Use diskStorage if you prefer saving locally
const uploadMultiple = multer({ storage }).array('files', 10); // 'images' is the form field name


const uploadImage = (req, res) => {
  uploadMultiple(req, res, async function (err) {
    if (err) {
      console.error('Multer error:', err);
      return res.status(500).json({ message: 'Upload failed' });
    }

    const stationId = req.params.stationId;
    const isPrimaryIndex = parseInt(req.body.primary_index);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    try {
      const client = await pool.connect();

      // If there's a primary image, reset existing primary flags
      if (!isNaN(isPrimaryIndex)) {
        await client.query(
          'UPDATE station_images SET is_primary = FALSE WHERE station_id = $1',
          [stationId]
        );
      }

      const uploadPromises = req.files.map((file, index) => {
        const fileName = `stations/${Date.now()}-${file.originalname}`;
        const params = {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: fileName,
          Body: file.buffer,
          ACL: 'public-read',
          ContentType: file.mimetype
        };

        return s3.upload(params).promise()
          .then(data => {
            const isPrimary = index === isPrimaryIndex;
            return client.query(
              `INSERT INTO station_images (station_id, image_url, is_primary)
               VALUES ($1, $2, $3)`,
              [stationId, data.Location, isPrimary]
            ).then(() => ({
              url: data.Location,
              is_primary: isPrimary
            }));
          });
      });

      const images = await Promise.all(uploadPromises);
      client.release();

      res.status(201).json({
        message: 'Images uploaded successfully',
        images
      });

    } catch (err) {
      console.error('Error during upload/save:', err);
      res.status(500).json({ message: 'Failed to upload and save images' });
    }
  });
};
const getAllImages = async (req, res) => {
  const stationId = req.params.stationId;

  try {
    const client = await pool.connect();

    // Query to fetch all images for the given station
    const result = await client.query(
      `SELECT id, station_id, image_url, is_primary, uploaded_at 
       FROM station_images 
       WHERE station_id = $1`,
      [stationId]
    );

    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No images found for this station' });
    }

    res.status(200).json({
      images: result.rows
    });
  } catch (err) {
    console.error('Error fetching images:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const deleteImage = async (req, res) => {
  const { stationId, imageId } = req.params;

  try {
    const client = await pool.connect();

    // Query to delete the image by ID and station ID
    const result = await client.query(
      `DELETE FROM station_images WHERE id = $1 AND station_id = $2 RETURNING *`,
      [imageId, stationId]
    );

    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.status(200).json({
      message: 'Image deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting image:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const setPrimaryImage = async (req, res) => {
  const { stationId, imageId } = req.params;

  try {
    const client = await pool.connect();

    // Reset primary flag for all images of the station
    await client.query(
      `UPDATE station_images 
       SET is_primary = FALSE 
       WHERE station_id = $1`,
      [stationId]
    );

    // Set the specified image as primary
    const result = await client.query(
      `UPDATE station_images 
       SET is_primary = TRUE 
       WHERE id = $1 AND station_id = $2 RETURNING *`,
      [imageId, stationId]
    );

    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Image not found or invalid for this station' });
    }

    res.status(200).json({
      message: 'Image set as primary successfully',
      image: result.rows[0]
    });
  } catch (err) {
    console.error('Error setting image as primary:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {uploadImage,getAllImages,deleteImage,setPrimaryImage};
