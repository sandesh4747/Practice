import Coupon from "../models/coupon.model.js";

export const getCoupon = async (req, res) => {
  try {
    // Find an active coupon belonging to the logged-in user
    const coupon = await Coupon.findOne({
      userId: req.user._id,
      isActive: true,
    });
    console.log("coupon", coupon, "user", req.user._id);
    // If found, return the coupon; if not, return null
    res.status(200).json(coupon || null);
  } catch (error) {
    console.log("Error in getCoupon controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    // Check if the coupon exists for the current user and is active
    const coupon = await Coupon.findOne({
      code,
      userId: req.user._id,
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    // Check if the coupon is expired
    if (coupon.expirationDate < new Date()) {
      coupon.isActive = false;
      await coupon.save();
      return res.status(404).json({ message: "Coupon expired" });
    }

    // If valid, return coupon details
    res.status(200).json({
      message: "Coupon is valid",
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
    });
  } catch (error) {
    console.log("Error in validateCoupon controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
