import mongoose from 'mongoose';

const eventImageSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    imageData: {
        type: Buffer,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    caption: {
        type: String,
        required: false
    }
}, { timestamps: true });

export default mongoose.model('EventImage', eventImageSchema);
