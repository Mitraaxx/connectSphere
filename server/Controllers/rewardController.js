const User = require('../Models/userModel');
const nodemailer = require('nodemailer');

// @desc    User claims a reward by submitting UPI
// @route   POST /api/rewards/claim
// @access  Private
exports.claimReward = async (req, res) => {
    const { upiId } = req.body;
    const userId = req.user.id;

    try {
        // Get user's username and points
        const user = await User.findById(userId).select('username creditPoints');
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if user is eligible (at 0 points)
        if (user.creditPoints !== 0) {
            return res.status(400).json({ message: "You are not yet eligible for a reward." });
        }

        // --- Send Email with Nodemailer ---
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // --- MODIFIED: More formal and detailed email body ---
        const mailOptions = {
            from: `"Connect Sphere" <${process.env.EMAIL_USER}>`, 
            to: process.env.ADMIN_EMAIL,
            subject: `Action Required: New Reward Claim from ${user.username}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Reward Claim Notification</h2>
                    <p>A new reward claim has been submitted for processing. Please review the details below and take the appropriate action.</p>
                    
                    <hr style="border: 0; border-top: 1px solid #eee;">
                    
                    <h3>Claim Details</h3>
                    <ul style="list-style-type: none; padding: 0;">
                        <li><strong>User:</strong> ${user.username}</li>
                        <li><strong>User ID:</strong> ${userId}</li>
                        <li><strong>Submitted UPI ID:</strong> <strong style="color: #007aff;">${upiId}</strong></li>
                        <li><strong>Date Claimed:</strong> ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</li>
                    </ul>
                    
                    <p style="margin-top: 25px; font-size: 0.9em; color: #777;">
                        This is an automated message from your application. The user's credit points have been successfully reset to ${2}.
                    </p>
                </div>
            `,
        };
        // --- END MODIFIED ---

        // Send the email
        await transporter.sendMail(mailOptions);
        // --- END ---


        // Reset user's points
        user.creditPoints = 2;
        await user.save();

        res.status(200).json({ 
            message: "Reward claimed successfully! Your points have been reset.",
            creditPoints: user.creditPoints // Send back new points total
        });

    } catch (error) {
        console.error("Email send error:", error); // Log the error
        res.status(500).json({ message: "Server error while claiming reward." });
    }
};