import Skill from '../models/skill.model.js';

// Get all skills
const getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.find().sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      data: skills,
      message: "Skills retrieved successfully"
    });
  } catch (error) {
    console.error("Error fetching skills:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch skills"
    });
  }
};

// Get single skill by ID
const getSkillById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const skill = await Skill.findById(id);
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: skill,
      message: "Skill retrieved successfully"
    });
  } catch (error) {
    console.error("Error fetching skill:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch skill"
    });
  }
};

// Create new skill
const createSkill = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Skill name is required"
      });
    }
    
    // Check if skill already exists
    const existingSkill = await Skill.findOne({ name: name.toLowerCase().trim() });
    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: "Skill already exists"
      });
    }
    
    const skill = await Skill.create({
      name: name.trim()
    });
    
    res.status(201).json({
      success: true,
      data: skill,
      message: "Skill created successfully"
    });
  } catch (error) {
    console.error("Error creating skill:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Skill already exists"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to create skill"
    });
  }
};

// Update skill
const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Skill name is required"
      });
    }
    
    // Check if skill exists
    const existingSkill = await Skill.findById(id);
    if (!existingSkill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found"
      });
    }
    
    // Check if new name already exists (excluding current skill)
    const duplicateSkill = await Skill.findOne({ 
      name: name.toLowerCase().trim(),
      _id: { $ne: id }
    });
    
    if (duplicateSkill) {
      return res.status(400).json({
        success: false,
        message: "Skill name already exists"
      });
    }
    
    const updatedSkill = await Skill.findByIdAndUpdate(
      id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedSkill,
      message: "Skill updated successfully"
    });
  } catch (error) {
    console.error("Error updating skill:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Skill name already exists"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to update skill"
    });
  }
};

// Delete skill
const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    
    const skill = await Skill.findById(id);
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found"
      });
    }
    
    await Skill.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: "Skill deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting skill:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete skill"
    });
  }
};

// Bulk create skills (for initial setup)
const bulkCreateSkills = async (req, res) => {
  try {
    const { skills } = req.body;
    
    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Skills array is required"
      });
    }
    
    const skillsToCreate = skills.map(skill => ({
      name: skill.trim()
    }));
    
    const createdSkills = await Skill.insertMany(skillsToCreate, { 
      ordered: false,
      rawResult: true 
    });
    
    res.status(201).json({
      success: true,
      data: createdSkills.insertedIds,
      message: `${createdSkills.insertedCount} skills created successfully`
    });
  } catch (error) {
    console.error("Error bulk creating skills:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create skills"
    });
  }
};

export {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  bulkCreateSkills
};
