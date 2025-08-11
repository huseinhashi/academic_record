import express from 'express';
import {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  bulkCreateSkills
} from '../controllers/skill.controller.js';

const router = express.Router();

// Public route to get all skills (for SkillsSelect component)
router.get('/', getAllSkills);

// Admin-only routes
router.get('/:id', getSkillById);
router.post('/', createSkill);
router.put('/:id', updateSkill);
router.delete('/:id', deleteSkill);
router.post('/bulk', bulkCreateSkills);

export default router;
