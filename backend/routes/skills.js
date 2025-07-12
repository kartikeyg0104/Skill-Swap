const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const { authenticateToken } = require('../middleware/auth');
const { validateSkill } = require('../middleware/validation');

// Skills offered
router.post('/offered', authenticateToken, validateSkill, skillController.addSkillOffered);
router.put('/offered/:id', authenticateToken, validateSkill, skillController.updateSkillOffered);
router.delete('/offered/:id', authenticateToken, skillController.deleteSkillOffered);

// Skills wanted
router.post('/wanted', authenticateToken, validateSkill, skillController.addSkillWanted);
router.put('/wanted/:id', authenticateToken, validateSkill, skillController.updateSkillWanted);
router.delete('/wanted/:id', authenticateToken, skillController.deleteSkillWanted);

// Categories
router.get('/categories', skillController.getSkillCategories);

module.exports = router;
