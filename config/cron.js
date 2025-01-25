const cron = require("node-cron");
const Coupon = require("../models/Coupon"); // Update the path as necessary

const couponCronJob = () => {
  cron.schedule("59 23 28-31 * *", async () => {
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    if (today.getDate() === lastDayOfMonth) {
      console.log("Running coupon expiration task...");

      try {
        const result = await Coupon.updateMany(
          { isValid: true },
          { $set: { isValid: false, expiredAt: new Date() } }
        );

        console.log(`Coupons invalidated: ${result.modifiedCount}`);
      } catch (error) {
        console.error("Error invalidating coupons:", error.message);
      }
    }
  });
};

module.exports = couponCronJob;
