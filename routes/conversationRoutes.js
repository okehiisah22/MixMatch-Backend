const { Router } = require("express");
const auth = require("../middleware/auth");
const ConversationController = require("../controllers/coversationController");

const router = Router();

router.route("/delete").delete(auth, ConversationController.deleteConversation);
router
  .route("/user/:djId/:userEmail")
  .get(ConversationController.getConversationByUser);
router.route("/user/:djId").post(ConversationController.createConversation);
router.route("/user").patch(ConversationController.verifyConversation);
router.route("/").get(auth, ConversationController.getConversations);

module.exports = router;
