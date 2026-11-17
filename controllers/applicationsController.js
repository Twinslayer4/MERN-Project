const { Application } = require('../models');
const { isAdmin } = require('../middleware/requireSelfOrAdmin');

// Reads allowed statuses from model, so they're defined in one place.
const STATUSES = Application.schema.path('status').enumValues;
const MAX_LEN = { jobTitle: 200, company: 200, notes: 2000 };

// Whitelist and validate the request body. Returns { fields } or { error }.
function pickFields(body = {}) {
  const fields = {};

  for (const key of ['jobTitle', 'company', 'notes']) {
    if (body[key] === undefined) continue;
    if (typeof body[key] !== 'string') return { error: `${key} must be a string` };
    const value = body[key].trim();
    if (key !== 'notes' && value === '') return { error: `${key} cannot be empty` };
    if (value.length > MAX_LEN[key]) {
      return { error: `${key} must be at most ${MAX_LEN[key]} characters` };
    }
    fields[key] = value;
  }

  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) {
      return { error: `status must be one of: ${STATUSES.join(', ')}` };
    }
    fields.status = body.status;
  }

  if (body.dateApplied !== undefined) {
    const date = typeof body.dateApplied === 'string' ? new Date(body.dateApplied) : null;
    if (!date || Number.isNaN(date.getTime())) {
      return { error: 'dateApplied must be a valid date' };
    }
    fields.dateApplied = date;
  }

  return { fields };
}

// Loads one application + checks caller can touch it.
// If not, sends error response + returns null.
async function loadApplication(req, res, { adminCanRead = false } = {}) {
  const application = await Application.findById(req.params.id);
  if (!application) {
    res.status(404).json({ error: 'Application not found' });
    return null;
  }
  if (String(application.userID) !== req.userId) {
    const allowed = adminCanRead && (await isAdmin(req.userId));
    if (!allowed) {
      res.status(403).json({ error: 'You can only access your own applications' });
      return null;
    }
  }
  return application;
}

// GET /api/users/:userId/applications?status=offer
exports.listApplications = async (req, res, next) => {
  try {
    const query = { userID: req.params.userId };

    if (req.query.status !== undefined) {
      const status = String(req.query.status);
      if (!STATUSES.includes(status)) {
        return res.status(400).json({ error: `status must be one of: ${STATUSES.join(', ')}` });
      }
      query.status = status;
    }

    const applications = await Application.find(query).sort({ dateApplied: -1 });
    res.status(200).json(applications);
  } catch (err) {
    next(err);
  }
};

// POST /api/users/:userId/applications
exports.createApplication = async (req, res, next) => {
  try {
    const { fields, error } = pickFields(req.body);
    if (error) return res.status(400).json({ error });
    if (!fields.company) {
      return res.status(400).json({ error: 'company is required' });
    }

    const application = await Application.create({ ...fields, userID: req.userId });
    res.status(201).location(`/api/applications/${application._id}`).json(application);
  } catch (err) {
    next(err);
  }
};

// GET /api/applications/:id  (owner, or an admin)
exports.getApplication = async (req, res, next) => {
  try {
    const application = await loadApplication(req, res, { adminCanRead: true });
    if (!application) return;
    res.status(200).json(application);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/applications/:id  (owner only)
exports.updateApplication = async (req, res, next) => {
  try {
    const application = await loadApplication(req, res);
    if (!application) return;

    const { fields, error } = pickFields(req.body);
    if (error) return res.status(400).json({ error });
    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    application.set(fields);
    await application.save();
    res.status(200).json(application);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/applications/:id  (owner only)
exports.deleteApplication = async (req, res, next) => {
  try {
    const application = await loadApplication(req, res);
    if (!application) return;

    await application.deleteOne();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};