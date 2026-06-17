import user from "../models/auth.js";
import otp from "../models/otp.js";
import { sendOTPEmail, sendPasswordResetEmail } from "../utils/mailer.js";

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Generate letters-only password (upper + lower, no numbers/special chars)
const generateLetterPassword = (length = 12) => {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const all = upper + lower;
  let password = "";
  // Ensure at least 2 uppercase + 2 lowercase
  for (let i = 0; i < 2; i++) password += upper[Math.floor(Math.random() * upper.length)];
  for (let i = 0; i < 2; i++) password += lower[Math.floor(Math.random() * lower.length)];
  for (let i = 4; i < length; i++) password += all[Math.floor(Math.random() * all.length)];
  // Shuffle
  return password.split("").sort(() => Math.random() - 0.5).join("");
};

// Step 1: Request OTP for forgot password
export const requestForgotPasswordOTP = async (req, res) => {
  const { contact } = req.body; // Can be email or phone
  try {
    const isEmail = contact.includes("@");
    const query = isEmail ? { email: contact } : { phone: contact };
    const existingUser = await user.findOne(query);
    
    if (!existingUser) return res.status(404).json({ message: "No account found with this contact." });

    // Check daily limit (1 per day)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const existingRequest = await otp.findOne({
      email: existingUser.email,
      type: "forgot-password",
      createdAt: { $gte: todayStart },
    });
    if (existingRequest) {
      return res.status(429).json({ message: "You can use this option only one time per day." });
    }

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await otp.create({ email: existingUser.email, otp: otpCode, type: "forgot-password", expiresAt });
    
    if (isEmail) {
      await sendOTPEmail(existingUser.email, otpCode, "Password Reset OTP - StackOverflow Clone");
      res.status(200).json({ message: "OTP sent to your email address." });
    } else {
      console.log(`[SIMULATED SMS] Sending OTP ${otpCode} to phone ${existingUser.phone}`);
      res.status(200).json({ message: "OTP sent to your phone number." });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// Step 2: Verify OTP and reset password
export const verifyOTPAndResetPassword = async (req, res) => {
  const { contact, otpCode } = req.body;
  try {
    const isEmail = contact.includes("@");
    const query = isEmail ? { email: contact } : { phone: contact };
    const existingUserQuery = await user.findOne(query);
    if (!existingUserQuery) return res.status(404).json({ message: "No account found." });

    const otpRecord = await otp.findOne({
      email: existingUserQuery.email,
      otp: otpCode,
      type: "forgot-password",
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) return res.status(400).json({ message: "Invalid or expired OTP." });

    // Mark OTP as used
    otpRecord.used = true;
    await otpRecord.save();

    // Generate new password
    const newPassword = generateLetterPassword(12);
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.default.hash(newPassword, 12);

    const existingUser = await user.findOneAndUpdate(
      { email: existingUserQuery.email },
      { password: hashedPassword },
      { new: true }
    );

    // Send new password via email regardless of phone or email to ensure delivery
    await sendPasswordResetEmail(existingUser.email, newPassword, existingUser.name);

    if (!isEmail) {
      console.log(`[SIMULATED SMS] Your new password is ${newPassword}`);
      res.status(200).json({ message: "Password reset successful! Check your phone/email for the new password." });
    } else {
      res.status(200).json({ message: "Password reset successful! Check your email for the new password." });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong." });
  }
};
