import { createCampaign } from "./../redis.js"

export const createCampaignAPI = async (req, res) => {
    const id = await createCampaign(req.body);
    res.send(id);
  };
  