import { getUserById } from "../redis/user.js";
import jwt from "jsonwebtoken";
import { getRefreshToken } from "../redis/user.js";
import crypto from "crypto";

export const refreshToken = async (req, res) => {
  const { refreshToken: token } = req.body;

  // decrypt token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.CONFIRM_KEY);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({
        errorType: "tokenExpired",
        message: "Session expired! Bye bye 👋",
      });
    } else {
      return res.status(400).json({
        errorType: "tokenError",
        message: `${error.message}. Please call admin`,
      });
    }
  }

  // verify user is not blacklisted
  let userMatch;
  try {
    // get user from db
    userMatch = await getUserById(decoded.data.id);
  } catch (error) {
    return res.status(500).json({
      message: "Redis db failed to retrieve user data. Contact Admin!",
    });
  }

  // Check if user is blacklisted
  if (userMatch.entityData.blackListed) {
    return res
      .status(403)
      .json({ message: "Your account has been blacklisted." });
  }

  // verify token version matches with db
  if (userMatch.entityData.tokenVersion !== decoded.data.tokenVersion) {
    return res.status(403).json({
      message:
        "Your refresh token has been invalidated by the server admin. Please refresh page and login again",
    });
  }

  // check if cookie exists
  if (req.cookies["__Secure-Fgp"] === undefined) {
    return res.status(400).json({
      errorType: "noCookie",
      message: "There is no secure cookie for auth",
    });
  }

  // verify fingerprint vs refreshToken send by user

  const hashedCookieFgp = crypto
    .createHash("sha256")
    .update(req.cookies["__Secure-Fgp"])
    .digest("hex");

  if (decoded.data.hashedFingerprint !== hashedCookieFgp) {
    return res.status(400).json({
      errorType: "fgpError",
      message: "Invalid fingerprint sent by User!",
    });
  }

  // get refreshToken from db
  const dbRefreshToken = await getRefreshToken(decoded.data.id);
  console.log("db refresh token: ", refreshToken);

  // decode db token
  // decrypt token
  let dbDecoded;
  try {
    dbDecoded = jwt.verify(dbRefreshToken, process.env.CONFIRM_KEY);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({
        errorType: "tokenExpired",
        message: "Session expired! Bye bye 👋",
      });
    } else {
      return res.status(400).json({
        errorType: "tokenError",
        message: `${error.message}. Please call admin`,
      });
    }
  }

  // verify fingerprint vs refreshToken in db
  if (dbDecoded.data.hashedFingerprint !== hashedCookieFgp) {
    return res.status(400).json({
      errorType: "fgpError",
      message: "Invalid fingerprint sent by User!",
    });
  }

  // create token
  // ! Don't forget to set expiresIn back to 15m after testing
  const newToken = jwt.sign(
    {
      data: {
        id: userMatch.entityId,
        email: userMatch.email,
        tokenType: "token",
        hashedFingerprint: dbDecoded.data.hashedFingerprint,
      },
    },
    process.env.CONFIRM_KEY,
    { expiresIn: "15m" }
  );

  return res
    .status(200)
    .json({ token: newToken, message: "Token refresh successful!" });
};
