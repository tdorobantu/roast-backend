import jwt from "jsonwebtoken";
import crypto from "crypto";

const authorizeJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.CONFIRM_KEY);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          errorType: "tokenExpired",
          message: "Session expired! Issuing new token.",
        });
      } else {
        return res.status(400).json({
          errorType: "tokenError",
          message: `${error.message}. Please call admin`,
        });
      }
    }

    if (req.cookies["__Secure-Fgp"] === undefined) {
      return res.status(400).json({
        errorType: "noCookie",
        message: "There is no secure cookie for auth",
      });
    }

    const hashedCookieFgp = crypto
      .createHash("sha256")
      .update(req.cookies["__Secure-Fgp"])
      .digest("hex");

    // Verify fingerprint is OK!
    console.log(decoded.data.hashedFingerprint);
    if (decoded.data.hashedFingerprint !== hashedCookieFgp) {
      return res.status(400).json({
        errorType: "fgpError",
        message: "Invalid fingerprint!",
      });
    }

    next();
  } else {
    return res.status(400).json({ message: "No Auth header!" });
  }
};

export default authorizeJWT;
