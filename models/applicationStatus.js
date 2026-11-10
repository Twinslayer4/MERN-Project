const mongoose = require('mongoose');
const company = require('./company');

const applicationSchema = new mongoose.Schema(
    {
        jobTitle: {
            type: String,
            default: 'Internship'
        },

        status: {
            type: String,
            enum: ['applied', 'interviewing', 'offer', 'rejected'],
            default: 'applied'
        },
        
        userID: {
            type: String,
            required: [true, 'userID Required'],
            trim: true
        },

        companyID: {
            type: String,
            required: [true, 'companyID Required'],
            trim: true
        },
    },
    {
        collection: 'application',
        versionKey: false
    }
);

module.exports = mongoose.model('Application', applicationSchema);