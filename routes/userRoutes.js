const { Router } = require('express');
const UserController = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = Router();

router.route('/').get(auth, UserController.getUser);
router.route('/change-password').patch(auth, UserController.changePassword);
router.route('/update-profile').patch(auth, UserController.updateUserProfile);
router.route('/addGenres').post(auth, UserController.addGenres);
router
  .route('/automatedInvoice')
  .patch(auth, UserController.enableAutomatedInvoice);
router.route('/referral-code').get(auth, UserController.getReferralCode);

module.exports = router;
