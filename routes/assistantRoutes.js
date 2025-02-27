const { Router } = require('express');
const auth = require('../middleware/auth');
const AssistantController = require('../controllers/assistantController');

const router = Router();

router.route('/').get(auth, AssistantController.getAssistant);
router.route('/:id').patch(auth, AssistantController.updateAssistant);

module.exports = router;
