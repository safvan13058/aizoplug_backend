
const express = require('express')
const app = express.Router()
const db = require('../middelware/db')
const razorpay = require("./razorpay");
app.use(express.json()); 
const crypto = require("crypto");
const { validateJwt, authorizeRoles } = require('../middelware/auth')

// Create order route
require('dotenv').config(); // Load environment variables from .env

app.post("/create-order",
   validateJwt,
  authorizeRoles('admin', 'customer', 'staff', 'dealer'),
 async (req, res) => {
  const { amount } = req.body;
  try {
    const options = {
      amount: amount * 100, // in paisa
      currency: "INR",
      receipt: `receipt_order_${Math.floor(Math.random() * 1000)}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify payment signature
app.post("/verify",
  validateJwt,
  authorizeRoles('admin', 'customer', 'staff', 'dealer'),
  async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const user_id = req.user.id;

    const hash = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isValid = hash === razorpay_signature;

    try {
      const order = await razorpay.orders.fetch(razorpay_order_id);
      const amountInRupees = order.amount / 100;

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        // Insert transaction
        const transactionText = `
          INSERT INTO transactions (
            user_id, type, amount, transaction_type,
            payment_gateway_id, status, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        await client.query(transactionText, [
          user_id,
          'credit',
          amountInRupees,
          'top-up',
          razorpay_payment_id,
          isValid ? 'completed' : 'failed',
          isValid ? 'Wallet top-up successful' : 'Signature mismatch or failed payment'
        ]);

        if (isValid) {
          // Update wallet
          const walletText = `
            UPDATE wallets
            SET balance = balance + $1,
                last_transaction_at = NOW(),
                updated_at = NOW()
            WHERE user_id = $2 AND status = 'active'
          `;
          await client.query(walletText, [amountInRupees, user_id]);
        }

        await client.query("COMMIT");

        if (isValid) {
          res.json({ success: true, message: "Payment verified and wallet updated" });
        } else {
          res.status(400).json({ success: false, message: "Invalid signature. Payment verification failed" });
        }
      } catch (err) {
        await client.query("ROLLBACK");
        console.error("DB transaction error:", err);
        res.status(500).json({ success: false, message: "Database error" });
      } finally {
        client.release();
      }
    } catch (err) {
      console.error("Payment verify error:", err);
      res.status(500).json({ success: false, message: "Payment verification failed" });
    }
});


module.exports = app