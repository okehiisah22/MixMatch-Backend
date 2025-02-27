const { Router } = require('express');
const auth = require('../middleware/auth');
const subscriptionMiddleware = require('../middleware/subscriptionMiddleware');

const AutomatedContractController = require('../controllers/automatedContractController');

const router = Router();

router
  .route('/')
  .get(
    auth,
    subscriptionMiddleware(['master(monthly)', 'master(yearly)', 'trialing']),
    AutomatedContractController.getAutomatedContract
  );
router
  .route('/')
  .post(
    auth,
    subscriptionMiddleware(['master(monthly)', 'master(yearly)', 'trialing']),
    AutomatedContractController.createAutomatedContract
  );

module.exports = router;
