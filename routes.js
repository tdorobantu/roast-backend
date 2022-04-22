import express from "express";
import * as controller from "./controllers/campaign.js"

const router = express.Router()

router.get("/", (req, res) => {
    res.send("Hello World!");
  });

// Campaign Routes 🗺

router.post("/campaign", controller.createCampaignAPI) 
router.delete("/campaign/:id", controller.deleteCampaignAPI) 

export default router;