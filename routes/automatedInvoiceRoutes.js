const { Router } = require('express');
const auth = require('../middleware/auth');
const AutomatedInvoiceController = require('../controllers/automatedInvoiceController');
const subscriptionMiddleware = require('../middleware/subscriptionMiddleware');

const router = Router();

router
  .route('/')
  .get(
    auth,
    subscriptionMiddleware(['master(monthly)', 'master(yearly)', 'trialing']),
    AutomatedInvoiceController.getAutomatedInvoice
  );
router
  .route('/')
  .post(
    auth,
    subscriptionMiddleware(['master(monthly)', 'master(yearly)', 'trialing']),
    AutomatedInvoiceController.createAutomatedInvoice
  );
router
  .route('/:id')
  .patch(
    auth,
    subscriptionMiddleware(['master(monthly)', 'master(yearly)', 'trialing']),
    AutomatedInvoiceController.updateAutomatedInvoice
  );
router
  .route('/:id')
  .delete(
    auth,
    subscriptionMiddleware(['master(monthly)', 'master(yearly)', 'trialing']),
    AutomatedInvoiceController.deleteAutomatedInvoice
  );

module.exports = router;
