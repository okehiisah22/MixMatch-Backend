const { Router } = require('express');
const InvoicesController = require('../controllers/invoiceController');
const auth = require('../middleware/auth');

const router = Router();

router.route('/getAll').get(auth, InvoicesController.getAllUserInvoices);
router
  .route('/')
  .get(auth, InvoicesController.getAllInvoices)
  .post(auth, InvoicesController.createInvoice);

router
  .route('/:id')
  .get(InvoicesController.getInvoice)
  .put(auth, InvoicesController.editInvoice)
  .delete(auth, InvoicesController.deleteInvoice);
router.route('/respond/:id').put(auth, InvoicesController.markAsPaid);
module.exports = router;
