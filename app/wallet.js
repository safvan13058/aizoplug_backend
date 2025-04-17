const pool = require('../middelware/db');
const express = require('express');
const app = express();
app.use(express.json()); // for parsing application/json


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
    const walletId = req.params.walletId;
  
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
      const transactionRes = await pool.query(
        `INSERT INTO transactions 
         (user_id, amount, transaction_type, payment_gateway_id, status, notes)
         VALUES ($1, $2, 'top-up', $3, 'completed', $4)
         RETURNING *`,
        [wallet.user_id, amount, 'gateway_placeholder', 'Top-up of ₹' + amount]
      );
  
      const transaction = transactionRes.rows[0];
  
      res.json({
        message: `Wallet topped up with ₹${amount}`,
        // wallet: updatedWallet,
        transaction: transaction
      });
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


  const { v4: uuidv4 } = require('uuid');

  const create_wallet = async (req, res) => {
    const user_id = req.user.id;
    const {
      wallet_type = 'general',
      currency = 'INR',
      is_default = false
    } = req.body;
  
    const wallet_number = uuidv4(); // generate wallet number
  
    try {
      const result = await pool.query(
        `INSERT INTO wallets (
          user_id, wallet_number, wallet_type, currency, is_default
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [user_id, wallet_number, wallet_type, currency, is_default]
      );
  
      res.status(201).json({
        message: "Wallet created successfully",
        wallet: result.rows[0]
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
const userwallethistory= async (req, res) => {
    const userId = req.params.userId;
  
    try {
      const result = await pool.query(
        `SELECT * FROM transactions
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
    const userId = req.user.id;
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
  
module.exports={ topup,spent,userwallethistory, getuserwallet,create_wallet}