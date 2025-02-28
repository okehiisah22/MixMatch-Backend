const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { createInteraction } = require('../controllers/interactionController');

router.post(
  '/',
  [
    body('userId').isMongoId(),
    body('eventId').isMongoId(),
    body('actionType').isIn([
      'page_view',
      'button_click',
      'form_submit',
      'purchase_initiated',
      'details_expanded',
    ]),
  ],
  createInteraction
);

module.exports = router;
