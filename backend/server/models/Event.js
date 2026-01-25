import mongoose from 'mongoose';

const eventSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    date: {
        type: Date,
        required: [true, 'Please add a date']
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        enum: ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Other']
    },
    budget: {
        type: Number,
        required: [true, 'Please add a budget goal']
    },
    raised: {
        type: Number,
        default: 0
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'ClubProfile'
    },
    sponsors: [{
        sponsor: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'profileType'
        },
        profileType: {
            type: String,
            enum: ['AlumniProfile', 'CompanyProfile'],
        },
        name: {
            type: String,
            required: false
        },
        amount: {
            type: Number,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['open', 'closed', 'completed'],
        default: 'open'
    },
    poster: {
        data: Buffer,
        contentType: String
    },
    brochure: {
        data: Buffer,
        contentType: String
    }
}, {
    timestamps: true
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
