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
if (decoded.data.hashedFingerprint !== hashedCookieFgp) {
  return res.status(400).json({
    errorType: "fgpError",
    message: "Invalid fingerprint!",
  });
}
