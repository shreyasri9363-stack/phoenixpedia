const crypto = require("crypto");

module.exports = async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const body =
            razorpay_order_id +
            "|" +
            razorpay_payment_id;

        const expectedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(body)
                .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                error: "Invalid payment signature"
            });
        }

        return res.status(200).json({
            success: true,
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            error: "Payment verification failed"
        });
    }
};