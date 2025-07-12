const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

const validateRegistration = [
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateProfile = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('bio')
    .optional()
    .isLength({ max: 250 })
    .withMessage('Bio must be less than 250 characters'),
  body('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters'),
  handleValidationErrors
];

const validateSkill = [
  body('skillName')
    .isLength({ min: 2, max: 100 })
    .withMessage('Skill name must be between 2 and 100 characters'),
  body('category')
    .isIn(['Technology', 'Creative', 'Business', 'Languages', 'Life Skills', 'Other'])
    .withMessage('Invalid category'),
  body('level')
    .optional()
    .isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'])
    .withMessage('Invalid skill level'),
  body('priority')
    .optional()
    .isIn(['HIGH', 'MEDIUM', 'LOW'])
    .withMessage('Invalid priority level'),
  handleValidationErrors
];

const validateSwapRequest = [
  body('receiverId')
    .isInt({ min: 1 })
    .withMessage('Valid receiver ID is required'),
  body('skillOffered')
    .isLength({ min: 2, max: 100 })
    .withMessage('Skill offered must be between 2 and 100 characters'),
  body('skillRequested')
    .isLength({ min: 2, max: 100 })
    .withMessage('Skill requested must be between 2 and 100 characters'),
  body('message')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Message must be less than 500 characters'),
  body('format')
    .isIn(['IN_PERSON', 'VIRTUAL', 'HYBRID'])
    .withMessage('Invalid session format'),
  body('duration')
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  body('priority')
    .optional()
    .isIn(['HIGH', 'MEDIUM', 'LOW'])
    .withMessage('Invalid priority level'),
  body('proposedSchedule')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  handleValidationErrors
];

const validateScheduleSession = [
  body('date')
    .isISO8601()
    .withMessage('Valid date is required'),
  body('duration')
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  body('platform')
    .isLength({ min: 2, max: 50 })
    .withMessage('Platform must be between 2 and 50 characters'),
  body('meetingLink')
    .optional()
    .isURL()
    .withMessage('Invalid meeting link URL'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
  handleValidationErrors
];

const validateReview = [
  body('revieweeId')
    .isInt({ min: 1 })
    .withMessage('Valid reviewee ID is required'),
  body('overall')
    .isInt({ min: 1, max: 5 })
    .withMessage('Overall rating must be between 1 and 5'),
  body('teachingQuality')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Teaching quality rating must be between 1 and 5'),
  body('reliability')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Reliability rating must be between 1 and 5'),
  body('communication')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Communication rating must be between 1 and 5'),
  body('review')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Review must be less than 500 characters'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  handleValidationErrors
];

const validateCreditTransfer = [
  body('receiverId')
    .isInt({ min: 1 })
    .withMessage('Valid receiver ID is required'),
  body('amount')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Amount must be between 1 and 1000'),
  body('description')
    .isLength({ min: 1, max: 200 })
    .withMessage('Description must be between 1 and 200 characters'),
  handleValidationErrors
];

const validateMessage = [
  body('receiverId')
    .isInt({ min: 1 })
    .withMessage('Valid receiver ID is required'),
  body('content')
    .optional()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content must be between 1 and 1000 characters'),
  body('swapRequestId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid swap request ID required'),
  body('messageType')
    .optional()
    .isIn(['TEXT', 'FILE'])
    .withMessage('Invalid message type'),
  handleValidationErrors
];

const validateVideoSession = [
  body('swapRequestId')
    .isInt({ min: 1 })
    .withMessage('Valid swap request ID is required'),
  body('scheduledDate')
    .isISO8601()
    .withMessage('Valid scheduled date is required'),
  body('duration')
    .isInt({ min: 15, max: 240 })
    .withMessage('Duration must be between 15 and 240 minutes'),
  body('recordingEnabled')
    .optional()
    .isBoolean()
    .withMessage('Recording enabled must be a boolean'),
  handleValidationErrors
];

const validateReport = [
  body('reportedUserId')
    .isInt({ min: 1 })
    .withMessage('Valid reported user ID is required'),
  body('reason')
    .isIn(['HARASSMENT', 'INAPPROPRIATE_CONTENT', 'FRAUD', 'SPAM', 'OTHER'])
    .withMessage('Invalid report reason'),
  body('description')
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  handleValidationErrors
];

const validateEndorsement = [
  body('userId')
    .isInt({ min: 1 })
    .withMessage('Valid user ID is required'),
  body('skillName')
    .isLength({ min: 2, max: 100 })
    .withMessage('Skill name must be between 2 and 100 characters'),
  body('message')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Message must be less than 200 characters'),
  handleValidationErrors
];

const validateSocialShare = [
  body('platform')
    .isIn(['facebook', 'twitter', 'linkedin', 'whatsapp', 'email'])
    .withMessage('Invalid platform'),
  body('customMessage')
    .optional()
    .isLength({ max: 280 })
    .withMessage('Message must be less than 280 characters'),
  handleValidationErrors
];

const validateReferral = [
  body('platform')
    .isIn(['facebook', 'twitter', 'linkedin', 'whatsapp', 'email'])
    .withMessage('Invalid platform'),
  body('campaign')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Campaign name must be less than 50 characters'),
  handleValidationErrors
];

const validateBroadcast = [
  body('title')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('message')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
  body('targetAudience')
    .isIn(['ALL', 'VERIFIED_USERS', 'NEW_USERS', 'ACTIVE_USERS'])
    .withMessage('Invalid target audience'),
  body('channels')
    .isArray({ min: 1 })
    .withMessage('At least one communication channel is required'),
  body('channels.*')
    .isIn(['IN_APP', 'EMAIL', 'PUSH'])
    .withMessage('Invalid communication channel'),
  body('scheduledFor')
    .optional()
    .isISO8601()
    .withMessage('Invalid scheduled date format'),
  handleValidationErrors
];

const validateNotification = [
  body('title')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('content')
    .isLength({ min: 10, max: 500 })
    .withMessage('Content must be between 10 and 500 characters'),
  body('targetCriteria')
    .isObject()
    .withMessage('Target criteria must be an object'),
  body('notificationType')
    .optional()
    .isIn(['SYSTEM_MESSAGE', 'ANNOUNCEMENT', 'PROMOTION'])
    .withMessage('Invalid notification type'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Invalid priority level'),
  handleValidationErrors
];

const validateEmailCampaign = [
  body('name')
    .isLength({ min: 3, max: 100 })
    .withMessage('Campaign name must be between 3 and 100 characters'),
  body('subject')
    .isLength({ min: 3, max: 200 })
    .withMessage('Subject must be between 3 and 200 characters'),
  body('htmlContent')
    .isLength({ min: 50 })
    .withMessage('HTML content must be at least 50 characters'),
  body('campaignType')
    .optional()
    .isIn(['MARKETING', 'TRANSACTIONAL', 'ANNOUNCEMENT'])
    .withMessage('Invalid campaign type'),
  body('scheduledFor')
    .optional()
    .isISO8601()
    .withMessage('Invalid scheduled date format'),
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateProfile,
  validateSkill,
  validateSwapRequest,
  validateScheduleSession,
  validateReview,
  validateCreditTransfer,
  validateMessage,
  validateVideoSession,
  validateReport,
  validateEndorsement,
  validateSocialShare,
  validateReferral,
  validateBroadcast,
  validateNotification,
  validateEmailCampaign,
  handleValidationErrors
};
