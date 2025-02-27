const { Router } = require('express');
const auth = require('../middleware/auth');
const MessageController = require('../controllers/messageController');
const subscriptionMiddleware = require('../middleware/subscriptionMiddleware');

const router = Router();

router
  .route('/:conversationId')
  .get(
    auth,
    subscriptionMiddleware([
      'pro(monthly)',
      'pro(yearly)',
      'master(monthly)',
      'master(yearly)',
      'trialing',
    ]),
    MessageController.getMessages
  );
router
  .route('/send/dj')
  .post(
    auth,
    subscriptionMiddleware([
      'pro(monthly)',
      'pro(yearly)',
      'master(monthly)',
      'master(yearly)',
      'trialing',
    ]),
    MessageController.sendMessageDJ
  );
router.route('/send/user').post(MessageController.sendMessageUser);

module.exports = router;
