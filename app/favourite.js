
const pool = require('../middelware/db');


const toggleFavorite = async (req, res) => {
    const client = await pool.connect();
    const user_id = req.user.id;
    const station_id = req.params.station_id;
  
    try {
      const result = await client.query(
        `SELECT id, is_favorite FROM user_favorites_station WHERE user_id = $1 AND station_id = $2`,
        [user_id, station_id]
      );
  
      let is_favorite;
      let message;
  
      if (result.rows.length > 0) {
        // Toggle existing favorite
        const current = result.rows[0].is_favorite;
        is_favorite = !current;
  
        await client.query(
          `UPDATE user_favorites_station 
           SET is_favorite = $1, favorited_at = CURRENT_TIMESTAMP 
           WHERE user_id = $2 AND station_id = $3`,
          [is_favorite, user_id, station_id]
        );
  
        message = is_favorite ? 'Station favorited' : 'Station unfavorited';
      } else {
        // Insert new favorite
        const insertResult = await client.query(
          `INSERT INTO user_favorites_station (user_id, station_id)
           VALUES ($1, $2)
           RETURNING is_favorite`,
          [user_id, station_id]
        );
        is_favorite = insertResult.rows[0].is_favorite;
        message = 'Station favorited';
      }
  
      res.json({ message, is_favorite });
    } catch (err) {
      console.error('Error toggling favorite:', err);
      res.status(500).json({ message: 'Internal server error' });
    } finally {
      client.release();
    }
  };

const getAllFavorites = async (req, res) => {
    const client = await pool.connect();
    const user_id = req.user.id;
    // Default values: page 1, limit 10
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
  
    try {
      // Get paginated favorites
      const result = await client.query(
        `SELECT cs.*, ufs.is_favorite
         FROM user_favorites_station ufs
         JOIN charging_stations cs ON ufs.station_id = cs.id
         WHERE ufs.user_id = $1 AND ufs.is_favorite = TRUE
         ORDER BY ufs.favorited_at DESC
         LIMIT $2 OFFSET $3`,
        [user_id, limit, offset]
      );
  
      // Get total count for pagination metadata
      const countResult = await client.query(
        `SELECT COUNT(*) AS total
         FROM user_favorites_station
         WHERE user_id = $1 AND is_favorite = TRUE`,
        [user_id]
      );
  
      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);
  
      res.json({
        page,
        limit,
        total,
        totalPages,
        favorites: result.rows
      });
    } catch (err) {
      console.error('Error fetching favorites:', err);
      res.status(500).json({ message: 'Internal server error' });
    } finally {
      client.release();
    }
  };
  
module.exports = {toggleFavorite, getAllFavorites};
