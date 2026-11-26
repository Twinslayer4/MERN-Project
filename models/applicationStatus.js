const mongoose = require('mongoose');

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

        company: {
            type: String,
            required: [function () { return !this.companyID; }, 'company Required'],
            trim: true
        },

        companyID: {
            type: String,
            trim: true
        },

        dateApplied: {
            type: Date,
            default: Date.now
        },

        notes: {
            type: String,
            default: '',
            trim: true
        }
    },
    {
        collection: 'application',
        versionKey: false
    }
);

module.exports = mongoose.model('Application', applicationSchema);
