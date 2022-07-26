import { getUserById } from "../redis/user.js";
import jwt from "jsonwebtoken";

export const refreshToken = async (req, res) => {
  const { decoded, token } = req.authMiddleware;

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
  // ! Will delete after fingerprint is done
  // verify refresh token matches with db
  if (userMatch.entityData.refreshToken !== token) {
    return res.status(403).json({
      message: "Refresh token sent does not match db record. Contact Admin!",
    });
  }
  // if all OK, issue new token!

  // create token and refresh token
  const newToken = jwt.sign(
    {
      data: {
        id: userMatch.entityId,
        email: userMatch.email,
        tokenType: "token",
      },
    },
    process.env.CONFIRM_KEY,
    { expiresIn: "15m" }
  );

  return res
    .status(200)
    .json({ token: newToken, message: "Token refresh successful!" });
};
