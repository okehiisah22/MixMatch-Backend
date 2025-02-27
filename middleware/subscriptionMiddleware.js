const subscriptionMiddleware = (allowedTiers) => {
  return (req, res, next) => {
    const userSubscription = req.user.subscriptionTier;

    const tiers = {
      trialing: 3,
      rookie: 1,
      'pro(monthly)': 2,
      'pro(yearly)': 2,
      'master(monthly)': 3,
      'master(yearly)': 3,
    };

    const userTierLevel = tiers[userSubscription];
    const isAllowed = allowedTiers.some((tier) => userTierLevel >= tiers[tier]);

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: `Access denied.`,
      });
    }

    next();
  };
};

module.exports = subscriptionMiddleware;
