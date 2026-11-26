const { isObjectIdOrHexString } = require('mongoose');
const { Application, Company } = require('../models');

const STATUSES = Application.schema.path('status').enumValues;
const MAX_LENGTH = { company: 200, jobTitle: 200, notes: 2000 };

exports.listApplications = async (req, res) => {
  const query = { userID: req.userId };
  if (req.query.status !== undefined) {
    const { status } = req.query;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${STATUSES.join(', ')}` });
    }
    query.status = status === 'applied' ? { $in: ['applied', 'Pending'] } : status;
  }

  const applications = await Application.find(query).sort({ dateApplied: -1, _id: -1 }).lean();
  // Older records store a company reference and used Pending for the initial status.
  const legacyCompanyIds = applications
    .filter(application => !application.company)
    .map(application => application.companyID)
    .filter(isObjectIdOrHexString);
  const companies = legacyCompanyIds.length
    ? await Company.find({ _id: { $in: legacyCompanyIds } }).select('name').lean()
    : [];
  const companyNames = new Map(companies.map(company => [String(company._id), company.name]));

  return res.json(applications.map(application => ({
    ...application,
    company: application.company || companyNames.get(String(application.companyID)) || '',
    status: application.status === 'Pending' ? 'applied' : application.status,
  })));
};

exports.createApplication = async (req, res) => {
  const body = req.body ?? {};
  const fields = {};

  for (const [key, limit] of Object.entries(MAX_LENGTH)) {
    if (body[key] === undefined) continue;
    if (typeof body[key] !== 'string') {
      return res.status(400).json({ error: `${key} must be a string` });
    }
    const value = body[key].trim();
    if (!value && key !== 'notes') {
      return res.status(400).json({ error: `${key} cannot be empty` });
    }
    if (value.length > limit) {
      return res.status(400).json({ error: `${key} must be at most ${limit} characters` });
    }
    fields[key] = value;
  }

  if (!fields.company) {
    return res.status(400).json({ error: 'company is required' });
  }

  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) {
      return res.status(400).json({ error: `status must be one of: ${STATUSES.join(', ')}` });
    }
    fields.status = body.status;
  }

  if (body.dateApplied !== undefined) {
    const date = typeof body.dateApplied === 'string' ? new Date(body.dateApplied) : null;
    if (!date || Number.isNaN(date.getTime())) {
      return res.status(400).json({ error: 'dateApplied must be a valid date' });
    }
    fields.dateApplied = date;
  }

  const application = await Application.create({ ...fields, userID: req.userId });
  return res.status(201).json(application);
};
