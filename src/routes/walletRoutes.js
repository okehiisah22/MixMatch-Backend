const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const {
    connectWallet,
    getWalletStatus,
    disconnectWallet,
} = require('../controllers/walletController');

router.post('/connect', isAuthenticated, connectWallet);
router.get('/status', isAuthenticated, getWalletStatus);
router.delete('/disconnect', isAuthenticated, disconnectWallet);

module.exports = router;
