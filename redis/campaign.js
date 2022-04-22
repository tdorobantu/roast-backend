import { client, connect } from "./redis.js";
import schemaCampaign from "./models/campaign.js";

export const createCampaign = async (data) => {
  await connect(client);

  const repository = client.fetchRepository(schemaCampaign);
  const id = await repository.createAndSave(data);

  return id;
};

export const removeCampaign = async (id) => {
  await connect(client);

  const repository = client.fetchRepository(schemaCampaign);
  console.log("delete id >>> ", id);
  await repository.remove(id);
};
