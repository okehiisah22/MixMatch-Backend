const { Router } = require('express');
const ContractsController = require('../controllers/contractsController');
const auth = require('../middleware/auth');
const subscriptionMiddleware = require('../middleware/subscriptionMiddleware');

const router = Router();

router
  .route('/')
  .get(
    auth,
    subscriptionMiddleware([
      'pro(monthly)',
      'pro(yearly)',
      'master(monthly)',
      'master(yearly)',
      'trialing',
    ]),
    ContractsController.getAllContracts
  )
  .post(
    auth,
    subscriptionMiddleware([
      'pro(monthly)',
      'pro(yearly)',
      'master(monthly)',
      'master(yearly)',
      'trialing',
    ]),
    ContractsController.createContract
  );

router
  .route('/:id')
  .get(ContractsController.getContract)
  .put(
    auth,
    subscriptionMiddleware([
      'pro(monthly)',
      'pro(yearly)',
      'master(monthly)',
      'master(yearly)',
      'trialing',
    ]),
    ContractsController.updateContract
  )
  .delete(
    auth,
    subscriptionMiddleware([
      'pro(monthly)',
      'pro(yearly)',
      'master(monthly)',
      'master(yearly)',
      'trialing',
    ]),
    ContractsController.deleteContract
  );

router.route('/sign/:id').put(ContractsController.signContract);
module.exports = router;
