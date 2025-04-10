const pool = require('../middelware/db');


const verifyWalletOwner = async (req, res, next) => {
    const walletId = req.params.id;
    const userId = req.user.id;
  
    const result = await pool.query(
      `SELECT * FROM wallets WHERE id = $1 AND user_id = $2`,
      [walletId, userId]
    );
  
    if (result.rows.length === 0) {
      return res.status(403).json({ error: "Unauthorized access to wallet" });
    }
  
    req.wallet = result.rows[0];
    next();
  };
 
  
const topup=async (req, res) => {
    const { amount } = req.body;
    const walletId = req.params.id;
  
    try {
      // Get wallet to retrieve user_id
      const walletRes = await pool.query(`SELECT * FROM wallets WHERE id = $1`, [walletId]);
      if (walletRes.rows.length === 0) return res.status(404).json({ error: 'Wallet not found' });
  
      const wallet = walletRes.rows[0];
  
      // Update balance
      const updateRes = await pool.query(
        `UPDATE wallets
         SET balance = balance + $1,
             last_transaction_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [amount, walletId]
      );
  
      const updatedWallet = updateRes.rows[0];
  
      // Insert log with user_id
      await pool.query(
        `INSERT INTO wallet_transactions
         (wallet_id, user_id, transaction_type, amount, balance_after, description)
         VALUES ($1, $2, 'top_up', $3, $4, $5)`,
        [walletId, wallet.user_id, amount, updatedWallet.balance, `Top-up of ₹${amount}`]
      );
  
      res.json({ message: `Wallet topped up with ₹${amount}`, wallet: updatedWallet });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
const spent= async (req, res) => {
    const { amount } = req.body;
    const walletId = req.params.id;
  
    try {
      const walletRes = await pool.query(`SELECT * FROM wallets WHERE id = $1`, [walletId]);
      if (walletRes.rows.length === 0) return res.status(404).json({ error: 'Wallet not found' });
  
      const wallet = walletRes.rows[0];
      if (wallet.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });
  
      // Update wallet
      const updateRes = await pool.query(
        `UPDATE wallets
         SET balance = balance - $1,
             last_transaction_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [amount, walletId]
      );
  
      const updatedWallet = updateRes.rows[0];
  
      // Insert log with user_id
      await pool.query(
        `INSERT INTO wallet_transactions
         (wallet_id, user_id, transaction_type, amount, balance_after, description)
         VALUES ($1, $2, 'spend', $3, $4, $5)`,
        [walletId, wallet.user_id, amount, updatedWallet.balance, `Spent ₹${amount}`]
      );
  
      res.json({ message: `₹${amount} spent from wallet`, wallet: updatedWallet });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };



const userwallethistory= async (req, res) => {
    const userId = req.params.userId;
  
    try {
      const result = await pool.query(
        `SELECT * FROM wallet_transactions
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
      );
  
      res.json({ user_id: userId, transactions: result.rows });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  


const getuserwallet=async (req, res) => {
    const userId = req.params.userId;
  
    try {
      const result = await pool.query(
        `SELECT * FROM wallets
         WHERE user_id = $1
         ORDER BY is_default DESC, created_at`,
        [userId]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No wallets found for this user' });
      }
  
      res.json({
        user_id: userId,
        wallets: result.rows
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
  
module.exports={ topup,spent,userwallethistory, getuserwallet}