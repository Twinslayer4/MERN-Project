const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            default: '',
        },

        country: {
            type: String,
            required: [true, 'Country required']
        },

        address: {
            type: String,
            trim: false,
            required: [true, 'Address required']
        },

        state: {
            type: String,
            required: [true, 'State required']
        },

        city: {
            type:String,
            required: [true, 'City required']
        },

        zipCode: {
            type: int,
            required: [true, 'Zip code required']
        }
    },
    {
        collection: 'companies',
        versionKey: false
    }
);

module.exports = mongoose.model('Company', companySchema);