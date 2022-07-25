import jwt from "jsonwebtoken";

const authorizeJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.CONFIRM_KEY);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
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
    next();
  } else {
    return res.status(400).json({ message: "No Auth header!" });
  }
};

export default authorizeJWT;
