const Interview = require('../models/Interview');

const TYPES = Interview.schema.path('type').enumValues;

function readInterview(body) {
  const company = typeof body?.company === 'string' ? body.company.trim() : '';
  const role = typeof body?.role === 'string' ? body.role.trim() : '';
  if (!company || !role || company.length > 200 || role.length > 200) {
    return { error: 'Enter a company and role with up to 200 characters each.' };
  }
  if (!TYPES.includes(body.type)) return { error: 'Choose a valid interview type.' };

  const startsAt = typeof body.startsAt === 'string' ? new Date(body.startsAt) : null;
  if (!startsAt || Number.isNaN(startsAt.getTime()) || startsAt.toISOString() !== body.startsAt) {
    return { error: 'Provide the interview date and time as a UTC ISO timestamp.' };
  }
  return { fields: { company, role, type: body.type, startsAt } };
}

exports.listInterviews = async (req, res) => {
  const interviews = await Interview.find({ userID: req.userId }).sort({ startsAt: 1, _id: 1 }).lean();
  return res.json(interviews);
};

exports.createInterview = async (req, res) => {
  const { error, fields } = readInterview(req.body);
  if (error) return res.status(400).json({ error });
  const interview = await Interview.create({ ...fields, userID: req.userId });
  return res.status(201).json(interview);
};

exports.updateInterview = async (req, res) => {
  const { error, fields } = readInterview(req.body);
  if (error) return res.status(400).json({ error });
  const interview = await Interview.findOneAndUpdate(
    { _id: req.params.interviewId, userID: req.userId },
    { $set: fields },
    { returnDocument: 'after', runValidators: true },
  );
  if (!interview) return res.status(404).json({ error: 'Interview not found.' });
  return res.json(interview);
};

exports.deleteInterview = async (req, res) => {
  const { deletedCount } = await Interview.deleteOne({ _id: req.params.interviewId, userID: req.userId });
  if (!deletedCount) return res.status(404).json({ error: 'Interview not found.' });
  return res.status(204).end();
};
