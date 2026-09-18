const crypto = require("crypto");

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return res.status(500).json({
        error: "Webhook secret is not configured"
      });
    }

    const rawBody = await getRawBody(req);

    const signature = req.headers["x-razorpay-signature"];

    if (!signature) {
      return res.status(400).json({
        error: "Missing Razorpay signature"
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({
        error: "Invalid webhook signature"
      });
    }

    const event = JSON.parse(rawBody.toString());

    console.log("Razorpay Event:", event.event);

    if (event.event === "payment.captured") {
      console.log("Payment Captured");
    }

    if (event.event === "payment.failed") {
      console.log("Payment Failed");
    }

    if (event.event === "order.paid") {
      console.log("Order Paid");
    }

    return res.status(200).json({
      success: true
    });

  } catch (error) {
    console.error("Webhook Error:", error);

    return res.status(500).json({
      error: "Webhook processing failed"
    });
  }
}

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => {
      chunks.push(chunk);
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    req.on("error", reject);
  });
}

module.exports = handler;

module.exports.config = {
  api: {
    bodyParser: false
  }
};