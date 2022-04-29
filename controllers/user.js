import bcrypt from "bcrypt";
import { getUser, registerUser } from "../redis/user.js";

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
    const emailMatches = await getUser(sanitizedEmail);
    if (emailMatches === 1) {
      return res.status(400).json({
        email: "",
        password: "",
        name: "",
        server:
          "A user with the same email address already exists! Try forgot password.",
      });
      return;
    } else if (emailMatches > 1) {
      return res.status(500).json({
        email: "",
        password: "",
        name: "",
        server:
          "Multiple user with the same email address already exists! Contact Admin!",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      email: "",
      password: "",
      name: "",
      server: "Redis db failed user check. Contact Admin!",
    });
  }

  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(password, 10);
  } catch (error) {
    console.log(error);
    return next(error);
  }

  try {
    const id = await registerUser({
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
      unixJoin: Date.now(),
      unixLastLogin: 0,
      blackListed: false,
    });
    return res.status(200).send(id);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      email: "",
      password: "",
      name: "",
      server: "Redis db failed user register. Contact Admin!",
    });
  }

  // if successful, confirm
  // else, send error.
};
