import user from "../models/auth.js";
import otp from "../models/otp.js";
import { sendOTPEmail, sendSMSOTP } from "../utils/mailer.js";

const SUPPORTED_LANGUAGES = ["en", "es", "hi", "pt", "zh", "fr"];
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// REQUEST OTP before language switch
export const requestLanguageOTP = async (req, res) => {
  const userId = req.userid;
  const { language } = req.body;

  if (!SUPPORTED_LANGUAGES.includes(language)) {
    return res.status(400).json({ message: "Unsupported language." });
  }

  try {
    const currentUser = await user.findById(userId);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Remove previous unused OTPs for this user
    await otp.deleteMany({ email: currentUser.email, type: "language-switch" });

    await otp.create({
      email: currentUser.email,
      otp: otpCode,
      type: "language-switch",
      expiresAt,
    });

    if (language === "fr") {
      await sendOTPEmail(currentUser.email, otpCode, "Email Verification OTP — Language Change");
      res.status(200).json({
        message: "OTP sent to your registered email address for French language verification."
      });
    } else {
      if (!currentUser.phone) {
        return res.status(400).json({ message: "A registered mobile number is required to switch to this language." });
      }
      await sendSMSOTP(currentUser.phone, otpCode);
      res.status(200).json({
        message: "OTP sent to your registered mobile number for language verification."
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// VERIFY OTP and switch language
export const verifyLanguageOTP = async (req, res) => {
  const userId = req.userid;
  const { otpCode, language } = req.body;

  try {
    const currentUser = await user.findById(userId);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    const otpRecord = await otp.findOne({
      email: currentUser.email,
      otp: otpCode,
      type: "language-switch",
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) return res.status(400).json({ message: "Invalid or expired OTP." });

    otpRecord.used = true;
    await otpRecord.save();

    await user.findByIdAndUpdate(userId, { language });
    res.status(200).json({ message: "Language updated successfully!", language });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
