

const express = require('express')
const app = express.Router()
const db = require('../middelware/db')
require('dotenv').config();
app.use(express.json());
const { validateJwt, authorizeRoles } = require('../middelware/auth')

async function initiatePayout({ amount, bankDetails, userId, walletId }) {
  try {
    const response = await axios.post('https://api.razorpay.com/v1/payouts', {
      account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
      amount: amount * 100, // in paise
      currency: 'INR',
      mode: 'IMPS',
      purpose: 'payout',
      fund_account: {
        account_type: 'bank_account',
        bank_account: {
          name: bankDetails.account_holder_name,
          ifsc: bankDetails.ifsc,
          account_number: bankDetails.account_number,
        },
        contact: {
          name: bankDetails.account_holder_name,
          type: 'employee',
          email: bankDetails.email,
          contact: bankDetails.phone
        }
      },
      queue_if_low_balance: true,
    }, {
      auth: {
        username: process.env.RAZORPAY_KEY,
        password: process.env.RAZORPAY_SECRET
      }
    });

    return {
      success: true,
      payout_id: response.data.id
    };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data || err.message
    };
  }
}

async function initiateUPIPayout({ amount, upiId, user }) {
    const payload = {
      account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
      amount: amount * 100,
      currency: 'INR',
      mode: 'UPI',
      purpose: 'payout',
      fund_account: {
        account_type: 'vpa',
        vpa: { address: upiId },
        contact: {
          name: user.name,
          type: 'customer',
          email: user.email,
          contact: user.phone
        }
      },
      queue_if_low_balance: true
    };
  
    const response = await axios.post('https://api.razorpay.com/v1/payouts', payload, {
      auth: {
        username: process.env.RAZORPAY_KEY,
        password: process.env.RAZORPAY_SECRET
      }
    });
  
    return response.data;
  }

  app.post('/api/user-bank-accounts', validateJwt, async (req, res) => {
    const {
      account_type, // 'bank' or 'upi'
      account_holder_name,
      account_number,
      ifsc,         // only for bank
      upi_id,       // only for upi
      email,
      phone
    } = req.body;
  
    if (!['bank', 'upi'].includes(account_type)) {
      return res.status(400).json({ error: 'Invalid account type' });
    }
  
    try {
      let insertQuery, values;
  
      if (account_type === 'bank') {
        if (!account_number || !ifsc || !account_holder_name) {
          return res.status(400).json({ error: 'Missing bank details' });
        }
        insertQuery = `
          INSERT INTO user_bank_accounts 
          (user_id, account_type, account_holder_name, account_number, ifsc, email, phone) 
          VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
        `;
        values = [req.user.id, account_type, account_holder_name, account_number, ifsc, email, phone];
      } else {
        if (!upi_id || !account_holder_name) {
          return res.status(400).json({ error: 'Missing UPI details' });
        }
        insertQuery = `
          INSERT INTO user_bank_accounts 
          (user_id, account_type, account_holder_name, account_number, email, phone) 
          VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `;
        values = [req.user.id, account_type, account_holder_name, upi_id, email, phone];
      }
  
      const result = await pool.query(insertQuery, values);
      res.status(201).json({ message: 'Payout account added', account: result.rows[0] });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to save account', details: err.message });
    }
  });

  app.get('/api/user-bank-accounts', validateJwt, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM user_bank_accounts WHERE user_id = $1 ORDER BY created_at DESC`,
        [req.user.id]
      );
      res.json({ accounts: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch accounts' });
    }
  });

  app.delete('/api/user-bank-accounts/:id', validateJwt, async (req, res) => {
    try {
      // Optional: verify ownership first
      const check = await pool.query(
        `SELECT * FROM user_bank_accounts WHERE id = $1 AND user_id = $2`,
        [req.params.id, req.user.id]
      );
      if (check.rows.length === 0) {
        return res.status(404).json({ error: 'Account not found or unauthorized' });
      }
  
      await pool.query(`DELETE FROM user_bank_accounts WHERE id = $1`, [req.params.id]);
      res.json({ message: 'Account deleted successfully' });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete account' });
    }
  });
  
  app.post('/api/wallets/:id/withdraw', validateJwt, async (req, res) => {
    const { amount, method, account_id } = req.body; // method: 'bank' or 'upi'
  
    if (!['bank', 'upi'].includes(method)) {
      return res.status(400).json({ error: 'Invalid withdrawal method' });
    }
  
    if (amount <= 0) return res.status(400).json({ error: 'Invalid amount' });
  
    try {
      // 🔐 Get wallet
      const walletResult = await pool.query(`SELECT * FROM wallets WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
      const wallet = walletResult.rows[0];
      if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
  
      if (wallet.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });
  
      // 🏦 Get user’s saved bank/UPI account
      const accountResult = await pool.query(`
        SELECT * FROM user_bank_accounts WHERE id = $1 AND user_id = $2 AND account_type = $3
      `, [account_id, req.user.id, method]);
  
      const account = accountResult.rows[0];
      if (!account) return res.status(404).json({ error: 'Bank/UPI account not found' });
  
      // 🧾 Prepare user info
      const userInfo = {
        name: account.account_holder_name,
        email: account.email,
        phone: account.phone
      };
  
      // 🚀 Call correct payout function
      let payoutResponse;
      if (method === 'bank') {
        payoutResponse = await initiatePayout({ amount, bankDetails: account, userId: req.user.id, walletId: wallet.id });
      } else {
        payoutResponse = await initiateUPIPayout({ amount, upiId: account.account_number, user: userInfo });
      }
  
      if (!payoutResponse.success && method === 'bank') {
        return res.status(400).json({ error: 'Bank payout failed', details: payoutResponse.error });
      }
  
      // 💰 Deduct balance & log transaction
      const updatedWallet = await pool.query(`
        UPDATE wallets SET balance = balance - $1, last_transaction_at = NOW()
        WHERE id = $2 RETURNING *
      `, [amount, wallet.id]);
  
      await pool.query(`
        INSERT INTO wallet_transactions 
        (wallet_id, user_id, transaction_type, amount, balance_after, description)
        VALUES ($1, $2, 'withdraw', $3, $4, $5)
      `, [
        wallet.id,
        req.user.id,
        amount,
        updatedWallet.rows[0].balance,
        method === 'bank' ? 'Withdrawal to bank account' : 'Withdrawal to UPI'
      ]);
  
      res.json({
        message: `Withdrawal to ${method === 'upi' ? 'UPI' : 'bank'} successful`,
        payout_id: payoutResponse.payout_id || payoutResponse.id,
        wallet: updatedWallet.rows[0]
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
  