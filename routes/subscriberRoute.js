const { Router } = require("express");
const { createSubscriber, getAllSubscribers } = require("../controllers/subscriberController");
const auth = require("../middleware/auth");

const router = Router();

router.route("/").post(createSubscriber).get(auth, getAllSubscribers);

module.exports = router;
