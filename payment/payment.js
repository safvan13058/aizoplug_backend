
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
        notes:{
          user_id:req.user.id
        }
      };

      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// Verify payment signature
// app.post("/verify",
//   validateJwt,
//   authorizeRoles('admin', 'customer', 'staff', 'dealer'),
//    (req, res) => {
//   const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

//   const hash = crypto
//     .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//     .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//     .digest("hex");

//   if (hash === razorpay_signature) {
//     res.json({ success: true, message: "Payment verified" });
//   } else {
//     res.status(400).json({ success: false, message: "Invalid signature" });
//   }
// });
// app.post("/verify",
//   validateJwt,

//   authorizeRoles('admin', 'customer', 'staff', 'dealer'),
//   async (req, res) => {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
//     const user_id = req.user.id;

//     const hash = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest("hex");

//     const isValid = hash === razorpay_signature;

//     try {
//       const order = await razorpay.orders.fetch(razorpay_order_id);
//       const amountInRupees = order.amount / 100;

//       const client = await db.connect();
//       try {
//         await client.query("BEGIN");

//         // Insert transaction
//         const transactionText = `
//           INSERT INTO transactions (
//             user_id, type, amount, transaction_type,
//             payment_gateway_id, status, notes
//           ) VALUES ($1, $2, $3, $4, $5, $6, $7)
//         `;
//         await client.query(transactionText, [
//           user_id,
//           'credit',
//           amountInRupees,
//           'top-up',
//           razorpay_payment_id,
//           isValid ? 'completed' : 'failed',
//           isValid ? 'Wallet top-up successful' : 'Signature mismatch or failed payment'
//         ]);

//         if (isValid) {
//           // Update wallet
//           const walletText = `
//             UPDATE wallets
//             SET balance = balance + $1,
//                 last_transaction_at = NOW(),
//                 updated_at = NOW()
//             WHERE user_id = $2 AND status = 'active'
//           `;
//           await client.query(walletText, [amountInRupees, user_id]);
//         }

//         await client.query("COMMIT");

//         if (isValid) {
//           console.log("Payment verified and wallet updated")
//           res.json({ success: true, message: "Payment verified and wallet updated" });
//         } else {
//            console.log("Invalid signature. Payment verification failed")
//           res.status(400).json({ success: false, message: "Invalid signature. Payment verification failed" });
//         }
//       } catch (err) {
//         await client.query("ROLLBACK");
//          console.log("DB transaction error")
//         console.error("DB transaction error:", err);
//         res.status(500).json({ success: false, message: "Database error" });
//       } finally {
//         client.release();
//       }
//     } catch (err) {
//       console.error("Payment verify error:", err);
//       res.status(500).json({ success: false, message: "Payment verification failed" });
//     }
// });

// app.post("/verify",
//   validateJwt,
//   authorizeRoles('admin', 'customer', 'staff', 'dealer'),
//   async (req, res) => {
//     console.log("payment verify")
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
//     const user_id = req.user.id;

//     try {
//       // Validate signature
//       const expectedSignature = crypto
//         .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//         .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//         .digest("hex");

//       const isSignatureValid = expectedSignature === razorpay_signature;

//       // Fetch Razorpay order and payment info
//       const order = await razorpay.orders.fetch(razorpay_order_id);
//       const payment = await razorpay.payments.fetch(razorpay_payment_id);
//       const amountInRupees = order.amount / 100;

//       const paymentStatus = payment.status; // e.g., 'captured', 'failed', etc.

//       // Determine if payment is successful
//       const isPaymentSuccessful = isSignatureValid && paymentStatus === 'captured';

//       const client = await db.connect();
//       try {
//         await client.query("BEGIN");

//         // Insert transaction record
//         const transactionText = `
//           INSERT INTO transactions (
//             user_id, type, amount, transaction_type,
//             payment_gateway_id, status, notes
//           ) VALUES ($1, $2, $3, $4, $5, $6, $7)
//         `;
//         await client.query(transactionText, [
//           user_id,
//           'credit',
//           amountInRupees,
//           'top-up',
//           razorpay_payment_id,
//           isPaymentSuccessful ? 'completed' : 'failed',
//           `Status: ${paymentStatus}. ${isSignatureValid ? 'Signature valid' : 'Invalid signature'}`
//         ]);

//         // Update wallet if successful
//         if (isPaymentSuccessful) {
//           const walletText = `
//             UPDATE wallets
//             SET balance = balance + $1,
//                 last_transaction_at = NOW(),
//                 updated_at = NOW()
//             WHERE user_id = $2 AND status = 'active'
//           `;
//           await client.query(walletText, [amountInRupees, user_id]);
//         }

//         await client.query("COMMIT");

//         if (isPaymentSuccessful) {
//           console.log("✅ Payment verified and wallet updated");
//           res.json({ success: true, message: "Payment verified and wallet updated" });
//         } else {
//           console.warn("❌ Payment failed or signature invalid");
//           res.status(400).json({
//             success: false,
//             message: `Payment verification failed. Status: ${paymentStatus}`
//           });
//         }
//       } catch (err) {
//         await client.query("ROLLBACK");
//         console.error("❌ DB transaction error:", err);
//         res.status(500).json({ success: false, message: "Database error" });
//       } finally {
//         client.release();
//       }
//     } catch (err) {
//       console.error("❌ Payment verify error:", err);
//       res.status(500).json({ success: false, message: "Payment verification failed" });
//     }
//   }
// );

// app.post("/webhook", express.json(), (req, res) => {
//   const webhookSecret = "YOUR_WEBHOOK_SECRET";

//   const crypto = require("crypto");
//   const shasum = crypto.createHmac("sha256", webhookSecret);
//   shasum.update(JSON.stringify(req.body));
//   const digest = shasum.digest("hex");

//   if (digest === req.headers["x-razorpay-signature"]) {
//     const event = req.body.event;
//     const payload = req.body.payload;

//     if (event === "payment.failed") {
//       const { order_id, id, error_description } = payload.payment.entity;

//       db.run(
//         `INSERT INTO payment_logs (order_id, payment_id, status, reason) VALUES (?, ?, ?, ?)`,
//         [order_id, id, "FAILED", error_description || "Unknown error"],
//         (err) => {
//           if (err) console.error("DB error:", err);
//         }
//       );
//     }

//     if (event === "payment.captured") {
//       const { order_id, id } = payload.payment.entity;

//       db.run(
//         `INSERT INTO payment_logs (order_id, payment_id, status, reason) VALUES (?, ?, ?, ?)`,
//         [order_id, id, "SUCCESS", "Payment Captured via Webhook"],
//         (err) => {
//           if (err) console.error("DB error:", err);
//         }
//       );
//     }

//     res.status(200).json({ status: "ok" });
//   } else {
//     res.status(400).send("Invalid signature");
//   }
// });


app.post(
  "/verify",
  validateJwt,
  authorizeRoles("admin", "customer", "staff", "dealer"),
  async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const user_id = req.user.id;

    try {
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      const isSignatureValid = expectedSignature === razorpay_signature;

      const order = await razorpay.orders.fetch(razorpay_order_id);
      const payment = await razorpay.payments.fetch(razorpay_payment_id);

      const paymentStatus = payment.status;
      const isPaymentSuccessful = isSignatureValid && paymentStatus === "captured";

      if (!isPaymentSuccessful) {
        return res.status(400).json({
          success: false,
          message: `Payment verification failed. Status: ${paymentStatus}`,
          reason: isSignatureValid ? "Payment not captured" : "Invalid signature",
        });
      }

      // Payment successful, update wallet in DB
      const amountInRupees = order.amount / 100;

      // Start transaction to avoid race conditions
      const client = await db.connect();
      try {
        await client.query("BEGIN");

        const updateWalletQuery = `
          UPDATE wallets
          SET balance = balance + $1,
              last_transaction_at = NOW(),
              updated_at = NOW()
          WHERE user_id = $2 AND status = 'active'
        `;

        const result = await client.query(updateWalletQuery, [amountInRupees, user_id]);

        if (result.rowCount === 0) {
          // Wallet not found or inactive
          await client.query("ROLLBACK");
          return res.status(404).json({
            success: false,
            message: "Active wallet not found for user",
          });
        }

        await client.query("COMMIT");

        console.log("✅ Payment verified and wallet updated for user:", user_id);

        res.json({
          success: true,
          message: "Payment verified and wallet updated",
          data: {
            user_id,
            order_id: razorpay_order_id,
            payment_id: razorpay_payment_id,
            amount: amountInRupees,
            status: paymentStatus,
          },
        });
      } catch (dbErr) {
        await client.query("ROLLBACK");
        console.error("❌ DB transaction error:", dbErr);
        res.status(500).json({ success: false, message: "Database error during wallet update" });
      } finally {
        client.release();
      }
    } catch (err) {
      console.error("❌ Payment verify error:", err);
      res.status(500).json({ success: false, message: "Payment verification failed" });
    }
  }
);

// app.post("/webhook", async (req, res) => {
//   console.log("🔔 Razorpay webhook received");

//   const webhookSecret = "@bWEPRJB5XdT6VD"; // Set this in your .env
//   const crypto = require("crypto");

//   const signature = req.headers["x-razorpay-signature"];
//   const body = JSON.stringify(req.body);
//    console.log(body)
//   const expectedSignature = crypto
//     .createHmac("sha256", webhookSecret)
//     .update(body)
//     .digest("hex");

//   if (expectedSignature !== signature) {
//     console.warn("❌ Invalid webhook signature");
//     return res.status(400).send("Invalid signature");
//   }

//   const event = req.body.event;
//   const payment = req.body.payload.payment.entity;

//   const {
//     order_id,
//     id: razorpay_payment_id,
//     amount,
//     status,
//     notes,
//     error_description
//   } = payment;

//   const user_id = notes?.user_id || null;
//   const amountInRupees = amount / 100;

//   const paymentLogText = `
//     INSERT INTO payment_logs (order_id, payment_id, status, reason, amount)
//     VALUES ($1, $2, $3, $4, $5)
//   `;

//   const transactionText = `
//     INSERT INTO transactions (
//       user_id, type, amount, transaction_type,
//       payment_gateway_id, status, notes,created_at
//     ) VALUES ($1, $2, $3, $4, $5, $6, $7,NOW())
//   `;

//   const txnStatus = status === "captured" ? "completed" : "failed";
//   const txnNote = error_description || `Webhook Event: ${event}. Status: ${status}.`;

//   const dbClient = await db.connect();
//   try {
//     await dbClient.query("BEGIN");

//     // Insert payment log
//     await dbClient.query(paymentLogText, [
//       order_id,
//       razorpay_payment_id,
//       status.toUpperCase(),
//       error_description || "N/A",
//       amountInRupees,
//     ]);

//     // Insert transaction record
//     await dbClient.query(transactionText, [
//       user_id,
//       "credit",
//       amountInRupees,
//       "top-up",
//       razorpay_payment_id,
//       txnStatus,
//       txnNote,

//     ]);

//     await dbClient.query("COMMIT");

//     console.log(`✅ Webhook processed: ${status} | user_id=${user_id}`);
//     res.status(200).json({ status: "ok" });

//   } catch (err) {
//     await dbClient.query("ROLLBACK");
//     console.error("❌ Webhook DB transaction error:", err);
//     res.status(500).json({ status: "fail", message: "Database error in webhook" });
//   } finally {
//     dbClient.release();
//   }
// });

app.post("/webhook", async (req, res) => {
  console.log("🔔 Razorpay webhook received");

  const webhookSecret = "@bWEPRJB5XdT6VD"; // Store in .env in production
  const signature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);

  console.log(body); // Log the payload

  // Verify signature
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== signature) {
    console.warn("❌ Invalid webhook signature");
    return res.status(400).send("Invalid signature");
  }

  const event = req.body.event;
  const payment = req.body.payload.payment.entity;

  const {
    order_id,
    id: razorpay_payment_id,
    amount,
    status, // Razorpay status: 'authorized', 'captured', etc.
    notes,
    error_description,
  } = payment;

  const user_id = notes?.user_id || null;
  const amountInRupees = amount / 100;

  const txnNote = error_description || `Webhook Event: ${event}. Status: ${status}.`;

  // Map Razorpay status to your app status
  const appTxnStatus =
    status === "authorized"
      ? "pending"
      : status === "captured"
      ? "completed"
      : "failed";

  const dbClient = await db.connect();

  try {
    await dbClient.query("BEGIN");

    // Insert into payment_logs
    const paymentLogText = `
      INSERT INTO payment_logs (order_id, payment_id, status, reason, amount)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await dbClient.query(paymentLogText, [
      order_id,
      razorpay_payment_id,
      status.toUpperCase(),
      error_description || "N/A",
      amountInRupees,
    ]);

    // Upsert into transactions
    const transactionUpsertText = `
      INSERT INTO transactions (
        user_id, type, amount, transaction_type,
        payment_gateway_id, status, notes, razorpay_status, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (payment_gateway_id) DO UPDATE SET
        status = EXCLUDED.status,
        notes = EXCLUDED.notes,
        razorpay_status = EXCLUDED.razorpay_status
    `;
    await dbClient.query(transactionUpsertText, [
      user_id,
      "credit",
      amountInRupees,
      "top-up",
      razorpay_payment_id,
      appTxnStatus,
      txnNote,
      status,
    ]);

    await dbClient.query("COMMIT");

    // Log final result
    if (status === "authorized") {
      console.log(`🕓 Payment Authorized → Processing | user_id=${user_id} | ₹${amountInRupees}`);
    } else if (status === "captured") {
      console.log(`✅ Payment Captured → Completed | user_id=${user_id} | ₹${amountInRupees}`);
    } else {
      console.warn(`❌ Payment Failed | user_id=${user_id} | Reason: ${error_description}`);
    }

    res.status(200).json({ status: "ok" });

  } catch (err) {
    await dbClient.query("ROLLBACK");
    console.error("❌ Webhook DB transaction error:", err);
    res.status(500).json({ status: "fail", message: "Database error in webhook" });
  } finally {
    dbClient.release();
  }
});
module.exports = app