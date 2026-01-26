import mongoose from 'mongoose';

const postEventReportSchema = mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Event'
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'ClubProfile' // Or User, depending on how auth works with profiles. Sticking to Profile ID for now.
    },
    impact: {
        type: String,
        required: [true, 'Please add impact details'],
    },
    photos: [{
        data: Buffer,
        contentType: String
    }]
}, {
    timestamps: true
});

const PostEventReport = mongoose.model('PostEventReport', postEventReportSchema);

export default PostEventReport;
