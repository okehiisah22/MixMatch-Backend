const { Router } = require('express');
const BookingsController = require('../controllers/bookingsController');
const auth = require('../middleware/auth');

const router = Router();

router
  .route('/')
  .get(auth, BookingsController.getAllBookings)
  .post(auth, BookingsController.createBooking);
router
  .route('/:id')
  .get(auth, BookingsController.getBooking)
  .post(BookingsController.createBookingUnauth)
  .put(auth, BookingsController.editBooking)
  .delete(auth, BookingsController.deleteBooking);
router.route('/respond/:id').put(auth, BookingsController.respondToBooking);
router
  .route('/admin/getAllBookings')
  .get(auth, BookingsController.getAllBookingsforAdmin);
router.route('/allbookings/:id').get(BookingsController.getAllBookingsforUser);

module.exports = router;
