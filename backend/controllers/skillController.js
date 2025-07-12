const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const addSkillOffered = async (req, res) => {
  try {
    const { skillName, category, level, description } = req.body;

    const skill = await prisma.skillOffered.create({
      data: {
        userId: req.user.id,
        skillName,
        category,
        level,
        description
      }
    });

    res.status(201).json({
      message: 'Skill added successfully',
      skill
    });
  } catch (error) {
    console.error('Add skill offered error:', error);
    res.status(500).json({ error: 'Failed to add skill' });
  }
};

const addSkillWanted = async (req, res) => {
  try {
    const { skillName, priority, targetLevel, description } = req.body;

    const skill = await prisma.skillWanted.create({
      data: {
        userId: req.user.id,
        skillName,
        priority,
        targetLevel,
        description
      }
    });

    res.status(201).json({
      message: 'Skill wanted added successfully',
      skill
    });
  } catch (error) {
    console.error('Add skill wanted error:', error);
    res.status(500).json({ error: 'Failed to add skill wanted' });
  }
};

const updateSkillOffered = async (req, res) => {
  try {
    const { id } = req.params;
    const { skillName, category, level, description } = req.body;

    const skill = await prisma.skillOffered.update({
      where: {
        id: parseInt(id),
        userId: req.user.id
      },
      data: {
        skillName,
        category,
        level,
        description
      }
    });

    res.json({
      message: 'Skill updated successfully',
      skill
    });
  } catch (error) {
    console.error('Update skill offered error:', error);
    res.status(500).json({ error: 'Failed to update skill' });
  }
};

const updateSkillWanted = async (req, res) => {
  try {
    const { id } = req.params;
    const { skillName, priority, targetLevel, description } = req.body;

    const skill = await prisma.skillWanted.update({
      where: {
        id: parseInt(id),
        userId: req.user.id
      },
      data: {
        skillName,
        priority,
        targetLevel,
        description
      }
    });

    res.json({
      message: 'Skill wanted updated successfully',
      skill
    });
  } catch (error) {
    console.error('Update skill wanted error:', error);
    res.status(500).json({ error: 'Failed to update skill wanted' });
  }
};

const deleteSkillOffered = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.skillOffered.delete({
      where: {
        id: parseInt(id),
        userId: req.user.id
      }
    });

    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Delete skill offered error:', error);
    res.status(500).json({ error: 'Failed to delete skill' });
  }
};

const deleteSkillWanted = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.skillWanted.delete({
      where: {
        id: parseInt(id),
        userId: req.user.id
      }
    });

    res.json({ message: 'Skill wanted deleted successfully' });
  } catch (error) {
    console.error('Delete skill wanted error:', error);
    res.status(500).json({ error: 'Failed to delete skill wanted' });
  }
};

const getSkillCategories = async (req, res) => {
  try {
    const categories = await prisma.skillCategory.findMany({
      where: { isActive: true }
    });

    res.json(categories);
  } catch (error) {
    console.error('Get skill categories error:', error);
    res.status(500).json({ error: 'Failed to fetch skill categories' });
  }
};

const getUserSkills = async (req, res) => {
  try {
    const [skillsOffered, skillsWanted] = await Promise.all([
      prisma.skillOffered.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.skillWanted.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    res.json({
      skillsOffered,
      skillsWanted
    });
  } catch (error) {
    console.error('Get user skills error:', error);
    res.status(500).json({ error: 'Failed to get user skills' });
  }
};

const addUserSkill = async (req, res) => {
  try {
    const { skillName, category, level, description, type = 'offered' } = req.body;

    let skill;
    if (type === 'offered') {
      skill = await prisma.skillOffered.create({
        data: {
          userId: req.user.id,
          skillName,
          category,
          level,
          description
        }
      });
    } else {
      const { priority, targetLevel } = req.body;
      skill = await prisma.skillWanted.create({
        data: {
          userId: req.user.id,
          skillName,
          priority,
          targetLevel,
          description
        }
      });
    }

    res.status(201).json({
      message: `Skill ${type} added successfully`,
      skill
    });
  } catch (error) {
    console.error('Add user skill error:', error);
    res.status(500).json({ error: 'Failed to add skill' });
  }
};

const updateUserSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { skillName, category, level, description, type = 'offered' } = req.body;

    let skill;
    if (type === 'offered') {
      skill = await prisma.skillOffered.update({
        where: {
          id: parseInt(id),
          userId: req.user.id
        },
        data: { skillName, category, level, description }
      });
    } else {
      const { priority, targetLevel } = req.body;
      skill = await prisma.skillWanted.update({
        where: {
          id: parseInt(id),
          userId: req.user.id
        },
        data: { skillName, priority, targetLevel, description }
      });
    }

    res.json({
      message: 'Skill updated successfully',
      skill
    });
  } catch (error) {
    console.error('Update user skill error:', error);
    res.status(500).json({ error: 'Failed to update skill' });
  }
};

const deleteUserSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { type = 'offered' } = req.query;

    if (type === 'offered') {
      await prisma.skillOffered.delete({
        where: {
          id: parseInt(id),
          userId: req.user.id
        }
      });
    } else {
      await prisma.skillWanted.delete({
        where: {
          id: parseInt(id),
          userId: req.user.id
        }
      });
    }

    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Delete user skill error:', error);
    res.status(500).json({ error: 'Failed to delete skill' });
  }
};

module.exports = {
  addSkillOffered,
  addSkillWanted,
  updateSkillOffered,
  updateSkillWanted,
  deleteSkillOffered,
  deleteSkillWanted,
  getSkillCategories,
  getUserSkills,
  addUserSkill,
  updateUserSkill,
  deleteUserSkill
};
