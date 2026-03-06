const Message = require('../models/Message');
const Booking = require('../models/Booking');
const User = require('../models/User');

// @desc    Send a message
// @route   POST /api/chat/send
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { bookingId, content, type } = req.body;
        const senderId = req.user.id; // Always User ID

        if (!bookingId || !content) {
            return res.status(400).json({ message: 'Booking ID and content are required' });
        }

        // Validate booking and 7-day window
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Identify sender and receiver
        let receiverId;
        let receiverModel;

        // Check if sender is the patient (User)
        if (booking.user.toString() === senderId) {
            // Sender is Patient
            receiverId = booking.doctor;
            // We assume the Booking's doctor ref points to the Doctor's 'User' or 'Doctor' entity.
            // Based on Booking schema, it says 'Doctor'. We will use 'Doctor' to match schema. 
            // If the app relies on User IDs, this might need 'User'. 
            // We'll trust the Booking schema for the Ref.
            receiverModel = 'Doctor';
        }
        // Check if sender is the doctor
        else if (booking.doctor.toString() === senderId) {
            // Sender is Doctor (and their ID matches booking.doctor)
            receiverId = booking.user;
            receiverModel = 'User';
        } else {
            // Fallback: If booking.doctor doesn't match senderId, maybe sender is a User but booking.doctor is a Doctor ID?
            // Since we can't easily resolve this without a comprehensive map, and we assume strict access control:
            return res.status(403).json({ message: 'You are not authorized to chat in this booking' });
        }

        // Identify roles
        const isPatient = booking.user.toString() === senderId;
        const isDoctor = booking.doctor.toString() === senderId;

        if (!isPatient && !isDoctor) {
            return res.status(403).json({ message: 'Not authorized to chat in this booking' });
        }

        // Rule: Only allow chat for confirmed or completed bookings
        if (!['confirmed', 'completed', 'verified'].includes(booking.status)) {
            return res.status(403).json({ message: 'Chat is only available for confirmed appointments' });
        }

        // Rule: Chat is available for 7 days from the appointment date for BOTH patient and doctor.
        // Example: Appointment on 15/02/2026 → chat available until 21/02/2026.
        const now = new Date();
        const appointmentDate = new Date(booking.date);
        const chatExpiryDate = new Date(appointmentDate);
        chatExpiryDate.setDate(appointmentDate.getDate() + 7);

        if (now > chatExpiryDate) {
            return res.status(403).json({
                message: 'Chat window has expired. Chat is available for 7 days after the appointment date.'
            });
        }

        const message = await Message.create({
            sender: senderId,
            senderModel: 'User', // Logged in user is always a User
            receiver: receiverId,
            receiverModel: receiverModel,
            booking: bookingId,
            content,
            type: type || 'text'
        });

        res.status(201).json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get chat history for a booking
// @route   GET /api/chat/:bookingId
// @access  Private
const getChatHistory = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.id;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Verify access: only the patient or doctor of this booking can view the chat
        if (booking.user.toString() !== userId && booking.doctor.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to view this chat' });
        }

        // Also check 7-day expiry for read access
        const now = new Date();
        const appointmentDate = new Date(booking.date);
        const chatExpiryDate = new Date(appointmentDate);
        chatExpiryDate.setDate(appointmentDate.getDate() + 7);

        const isChatExpired = now > chatExpiryDate;

        const messages = await Message.find({ booking: bookingId })
            .sort({ createdAt: 1 })
            .populate('sender', 'name image');

        res.json({
            messages,
            isChatExpired,
            chatExpiryDate: chatExpiryDate.toISOString(),
            appointmentDate: appointmentDate.toISOString()
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    sendMessage,
    getChatHistory
};
