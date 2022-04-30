import bcrypt from "bcrypt";
import {
  getUser,
  registerUser,
  getUserCount,
  setUnixLastLogin,
} from "../redis/user.js";
import "dotenv/config";
import { sendMail } from "../services/sendEmail.js";

export const registerUserAPI = async (req, res) => {
  // declare regex patterns for string sanitization and unpack request body
  const blacklistName = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/g;
  const blacklistEmail = /[` !#$%^&*()_+\-=[\]{};':"\\|,<>/?~]/g;
  const { name, email, password } = req.body;

  // sanitize req
  const sanitizedName = name.replace(blacklistName, "");
  const sanitizedEmail = email.replace(blacklistEmail, "");
  //check if user with email already exists
  try {
    const emailMatches = await getUserCount(sanitizedEmail);
    if (emailMatches === 1) {
      return res.status(400).json({
        message:
          "A user with the same email address already exists! Try forgot password.",
      });
    } else if (emailMatches > 1) {
      return res.status(500).json({
        message:
          "Multiple user with the same email address already exists! Contact Admin!",
      });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Redis db failed user check. Contact Admin!" });
  }

  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.SALT_VALUE)
    );
  } catch (error) {
    // console.log(error);
    // return next(error);
    return res
      .status(500)
      .json({ message: "Encryption error. Contact Admin!" });
  }

  try {
    await registerUser({
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
      unixJoin: Date.now(),
      unixLastLogin: 0,
      blackListed: false,
    });
    return res.status(200).json({ message: "Succesfully Registered!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Redis db failed user register. Contact Admin!" });
  }

  // if successful, confirm
  // else, send error.
};

export const loginUserAPI = async (req, res) => {
  const blacklistEmail = /[` !#$%^&*()_+\-=[\]{};':"\\|,<>/?~]/g;
  const { email, password } = req.body;

  // sanitize req
  const sanitizedEmail = email.replace(blacklistEmail, "");

  let userMatch;

  try {
    // get user from db
    userMatch = await getUser(sanitizedEmail);
  } catch (error) {
    return res.status(500).json({
      message: "Redis db failed to retrieve user data. Contact Admin!",
    });
  }

  // if there is no user with the provided email send error
  if (!!!userMatch) {
    return res.status(400).json({
      message:
        "No user exists with the provided email adress. Please register.",
    });
  }

  // Check if user is blacklisted
  if (userMatch.entityData.blackListed) {
    return res
      .status(403)
      .json({ message: "Your account has been blacklisted." });
  }

  let validated;

  try {
    validated = await bcrypt.compare(password, userMatch.entityData.password);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Encryption error. Contact Admin!" });
  }

  if (validated) {
    try {
      await setUnixLastLogin(userMatch.entityId);
    } catch (error) {
      return res.status(500).json({
        message: "Redis db error on setUnixLastLogin. Contact Admin!",
      });
    }
    return res.status(200).json({ message: "You are logged in!" });
  } else {
    return res.status(400).json({ message: "Invalid credentials!" });
  }
};

export const forgotPassAPI = async (req, res) => {
  const blacklistEmail = /[` !#$%^&*()_+\-=[\]{};':"\\|,<>/?~]/g;
  const { email } = req.body;

  // sanitize req
  const sanitizedEmail = email.replace(blacklistEmail, "");

  let userMatch;

  try {
    userMatch = await getUser(sanitizedEmail);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: "Redis db cannot get user. Contact Admin!" });
  }

  if (!!!userMatch) {
    return res.status(400).json({
      message:
        "No user exists with the provided email adress. Please register.",
    });
  }

  if (userMatch.entityData.blackListed) {
    return res
      .status(403)
      .json({ message: "Your account has been blacklisted." });
  }

  const content =
    '<p> Reset your password by clicking  👉 <a href="http://localhost:3000"> here </a> 👈 </p><p> Copy and paste the following link in your browser if clickable link is broken: http://localhost:3000</p>';
  try {
    await sendMail(email, "Roast ☕️ - Reset Password", content);
  } catch {
    return res
      .status(500)
      .json({ message: "Email service is offline. Please contact Admin" });
  }

  return res
    .status(200)
    .json({
      message:
        "An email was sent to your account with instructions for resetting your password.",
    });
};
