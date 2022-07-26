import express from "express";
import * as campaign from "./controllers/campaign.js";
import * as user from "./controllers/user.js";
import * as init from "./controllers/init.js";
import authorizeJWT from "./services/authorizeJWT.js";
import * as tokenServices from "./controllers/tokenServices.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello World!");
});

// All Routes 🗺
router.post("/campaign", campaign.createCampaignAPI);
router.delete("/campaign/:id", campaign.deleteCampaignAPI);
router.post("/user/register", user.registerUserAPI);
router.post("/user/login", user.loginUserAPI);
router.post("/user/forgotpass", user.forgotPassAPI);
router.post("/user/confirmEmail", user.confirmEmailAPI);
router.post("/user/resendConfirmation", user.resendConfirmationAPI);
router.post("/user/confirmPassword", user.confirmPasswordAPI);
router.get("/init/app", authorizeJWT, init.appAPI);
router.get(
  "/tokenServices/refreshToken",
  authorizeJWT,
  tokenServices.refreshToken
);

export default router;
