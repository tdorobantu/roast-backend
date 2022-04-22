import { createCampaign, removeCampaign } from "../redis/campaign.js";

export const createCampaignAPI = async (req, res) => {
  const id = await createCampaign(req.body);
  res.send(id);
};

export const deleteCampaignAPI = async (req, res) => {
  await removeCampaign(req.params.id);
  res.send(req.params.id);
};
