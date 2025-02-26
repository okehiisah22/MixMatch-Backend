const { Router } = require("express");
const AuthController = require("../controllers/authController");

const router = Router();

router.route("/register").post(AuthController.register);
router.route("/login").post(AuthController.login);
router
  .route("/resendverification")
  .post(AuthController.resendVerificationEmail);
router.route("/forgotpassword").post(AuthController.forgotPassword);
router.route("/resetpassword/:token/:user").patch(AuthController.resetPassword);
router.route("/verifyemail/:token/:user").patch(AuthController.verifyEmail);

router.route("/googlelogin").post(AuthController.googleLogin);

module.exports = router;
