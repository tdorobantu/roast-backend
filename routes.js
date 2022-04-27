import express from "express";
import * as campaign from "./controllers/campaign.js"
import * as user from "./controllers/user.js"

const router = express.Router()

router.get("/", (req, res) => {
    res.send("Hello World!");
  });

// Campaign Routes 🗺

router.post("/campaign", campaign.createCampaignAPI) 
router.delete("/campaign/:id", campaign.deleteCampaignAPI)
router.post("/user/register", user.registerUserAPI)  

export default router;