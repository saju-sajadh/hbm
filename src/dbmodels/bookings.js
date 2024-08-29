import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    place: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' },
    user: String,
    checkin: Date,
    checkout: Date,
    numberofguests: Number,
    name: String,
    phone: String,
    price: Number,
    email: String,
});

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

export default Booking;
