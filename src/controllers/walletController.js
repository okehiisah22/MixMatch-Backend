const User = require('../models/User');
const StellarSdk = require('stellar-sdk');

exports.connectWallet = async (req, res) => {
    try {
        const { publicKey } = req.body;

        if (!publicKey) {
            return res.status(400).json({ message: 'Public key is required' });
        }

        try {
            StellarSdk.Keypair.fromPublicKey(publicKey);
        } catch (error) {
            return res.status(400).json({ message: 'Invalid Stellar address format' });
        }

        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.stellarAddress && user.stellarAddress !== publicKey) {
            return res.status(400).json({
                message: 'You already have a wallet connected. Please contact support to change your wallet address.',
            });
        }

        const existingUser = await User.findOne({
            stellarAddress: publicKey,
            _id: { $ne: userId },
        });

        if (existingUser) {
            return res.status(400).json({ message: 'This Stellar address is already linked to another account' });
        }

        user.stellarAddress = publicKey;
        await user.save();

        return res.status(200).json({
            message: 'Wallet connected successfully',
            stellarAddress: publicKey,
        });
    } catch (error) {
        console.error('Error connecting wallet:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.getWalletStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('stellarAddress');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            isConnected: !!user.stellarAddress,
            stellarAddress: user.stellarAddress || null,
        });
    } catch (error) {
        console.error('Error getting wallet status:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.disconnectWallet = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.stellarAddress = null;
        await user.save();

        return res.status(200).json({ message: 'Wallet disconnected successfully' });
    } catch (error) {
        console.error('Error disconnecting wallet:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
