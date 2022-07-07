import bcrypt from "bcrypt";
import {
  getUser,
  registerUser,
  getUserCount,
  setUnixLastLogin,
  setConfirmedUserFlag,
  setNewPassword,
} from "../redis/user.js";
import "dotenv/config";
import { sendMail } from "../services/sendEmail.js";
import jwt from "jsonwebtoken";

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
    const id = await registerUser({
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
      unixJoin: Date.now(),
      unixLastLogin: 0,
      blackListed: false,
      confirmed: false,
    });

    const auth = jwt.sign(
      {
        data: { id: id, email: sanitizedEmail },
      },
      process.env.CONFIRM_KEY,
      { expiresIn: "15m" }
    );

    const confirmationLink = `http://localhost:3000/confirmEmail?token=${auth}`;

    try {
      await sendMail(
        sanitizedEmail,
        "Roast ☕️ - Confirm Account 👌",
        `Click on 👉  <a href="${confirmationLink}"> here </a> 👈 to confirm your email address.`
      );
    } catch {
      return res
        .status(500)
        .json({ message: "Email service is offline. Please contact Admin" });
    }

    return res.status(200).json({
      message: "Registered! A confirmation link was sent to your account.",
    });
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
  if (!userMatch) {
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

  if (!userMatch.entityData.confirmed) {
    return res.status(400).json({
      message: "An confirmation email was sent. Please confirm your account.",
    });
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

  const auth = jwt.sign(
    {
      data: { id: userMatch.entityId, email: sanitizedEmail },
    },
    process.env.CONFIRM_KEY,
    { expiresIn: "15m" }
  );

  const confirmationLink = `http://localhost:3000/resetPassword?token=${auth}`;

  const content = `<p> Reset your password by clicking  👉 <a href="${confirmationLink}"> here </a> 👈 </p><p> Copy and paste the following link in your browser if clickable link is broken: ${confirmationLink}</p>`;

  try {
    await sendMail(email, "Roast ☕️ - Reset Password", content);
  } catch {
    return res
      .status(500)
      .json({ message: "Email service is offline. Please contact Admin" });
  }

  return res.status(200).json({
    message:
      "An email was sent to your account with instructions for resetting your password.",
  });
};

export const confirmEmailAPI = async (req, res) => {
  const { token } = req.body;

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.CONFIRM_KEY);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        errorType: "tokenExpired",
        message: "Session expired! Please confirm email again!",
      });
    } else {
      return res.status(400).json({
        errorType: "tokenError",
        message: `${error.message}. Please call admin`,
      });
    }
  }
  const { id, email } = decoded.data;

  console.log("my ID: ", id);

  try {
    await setConfirmedUserFlag(id);
  } catch {
    return res.status(400).json({
      errorType: "user does not exist",
      message: "Could not retrieve email from database! Call Admin!",
    });
  }

  // Decrypt token; returns id, email: (token expired) => res.status(400) session expired. Please confirm your email again by followin this page!
  // Verify user with id: (TRUE) => set confirmed to true! and send status 200 OK | (FALSE) => send status 400 response with error message

  return res
    .status(200)
    .json({ message: "Email Confirmed. You may login with your credentials." });
};

export const resendConfirmationAPI = async (req, res) => {
  const blacklistEmail = /[` !#$%^&*()_+\-=[\]{};':"\\|,<>/?~]/g;
  const { email } = req.body;

  // sanitize req
  const sanitizedEmail = email.replace(blacklistEmail, "");

  let userMatch;

  try {
    // get user from db
    userMatch = await getUser(sanitizedEmail);
  } catch (error) {
    return res.status(500).json({
      errorType: "db failed",
      message: "Redis db failed to retrieve user data. Contact Admin!",
    });
  }

  // if there is no user with the provided email send error
  if (!userMatch) {
    return res.status(400).json({
      errorType: "user does not exist",
      message:
        "No user exists with the provided email adress. Please register.",
    });
  }

  // Check if user is blacklisted
  if (userMatch.entityData.blackListed) {
    return res.status(403).json({
      errorType: "blacklisted user",
      message: "Your account has been blacklisted.",
    });
  }

  console.log("my user match: ", userMatch);

  const auth = jwt.sign(
    {
      data: { id: userMatch.entityId, email: userMatch.entityData.email },
    },
    process.env.CONFIRM_KEY,
    { expiresIn: "15m" }
  );

  const confirmationLink = `http://localhost:3000/confirmEmail?token=${auth}`;

  await sendMail(
    sanitizedEmail,
    "Roast ☕️ - Confirm Account 👌",
    `Click on 👉  <a href="${confirmationLink}"> here </a> 👈 to confirm your email address.`
  );

  return res.status(200).json({
    message: "Registered! A confirmation link was sent to your account.",
  });
};

export const confirmPasswordAPI = async (req, res) => {
  const { token, password } = req.body;

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.CONFIRM_KEY);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        errorType: "tokenExpired",
        message: "Session expired! Please follow reset password process again!",
      });
    } else {
      return res.status(400).json({
        errorType: "tokenError",
        message: `${error.message}. Please call admin`,
      });
    }
  }
  const { id, email } = decoded.data;

  console.log("my ID: ", id);

  // encrypt password

  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.SALT_VALUE)
    );
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Encryption error. Contact Admin!" });
  }

  try {
    await setNewPassword(id, hashedPassword);
  } catch {
    return res.status(400).json({
      errorType: "user does not exist",
      message: "Could not retrieve email from database! Call Admin!",
    });
  }

  return res.status(200).json({
    message: "Password changed!. You may login with your new credentials.",
  });
};
