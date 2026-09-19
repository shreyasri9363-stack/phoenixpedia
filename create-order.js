const Razorpay = require("razorpay");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

module.exports = async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        const { plan, amount } = req.body;

        const allowedPlans = {
            normal: 2500,
            blue: 5000,
            vip: 10000
        };

        if (!allowedPlans[plan]) {
            return res.status(400).json({
                error: "Invalid plan"
            });
        }

        const order = await razorpay.orders.create({
            amount: allowedPlans[plan] * 100,
            currency: "INR",
            receipt: `pp_${Date.now()}`
        });

        return res.status(200).json({
            success: true,
            order,
            key_id: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Unable to create order"
        });
    }
};