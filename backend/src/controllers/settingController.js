const Setting = require('../models/Setting');

// @desc    Get settings (auto-seeds defaults if empty)
// @route   GET /api/settings
// @access  Private/Admin
const getSettings = async (req, res, next) => {
  try {
    let settings = await Setting.find({});

    if (settings.length === 0) {
      const defaultSettings = [
        { key: 'APP_NAME', value: 'BoxStories', category: 'General' },
        { key: 'COMPANY_NAME', value: 'BoxStories Pvt Ltd', category: 'General' },
        { key: 'SUPPORT_EMAIL', value: 'support@boxstories.com', category: 'General' },
        { key: 'SUPPORT_PHONE', value: '+91 98765 43210', category: 'General' },
        { key: 'LOGO_URL', value: '', category: 'Branding' },
        { key: 'SMTP_HOST', value: 'smtp.gmail.com', category: 'Email' },
        { key: 'SMTP_PORT', value: '587', category: 'Email' },
        { key: 'SMTP_USERNAME', value: 'noreply@boxstories.com', category: 'Email' },
        { key: 'SMTP_PASSWORD', value: '********', category: 'Email' },
        { key: 'SMTP_FROM_NAME', value: 'BoxStories', category: 'Email' },
        { key: 'SMTP_FROM_EMAIL', value: 'noreply@boxstories.com', category: 'Email' },
      ];
      settings = await Setting.insertMany(defaultSettings);
    }

    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk update setting parameters
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;

    const updated = [];
    for (const set of settings) {
      const up = await Setting.findOneAndUpdate(
        { key: set.key },
        { value: set.value, updatedBy: req.user._id },
        { new: true, upsert: true }
      );
      updated.push(up);
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
