import "dotenv/config";
import { Client, Repository } from "redis-om";
import schemaCampaign from "./models/campaign.js";
import schemaUser from "./models/user.js";

export const client = new Client();
 
export const connect = async (client) => {
  if (!client.isOpen()) {
    await client.open(process.env.REDIS_URL);
  }
};


export const initiateRedis = async () => {

  await connect(client);

  const campaignRepo = new Repository(schemaCampaign, client);
  const userRepo = new Repository(schemaUser, client);

  await campaignRepo.createIndex();
  await userRepo.createIndex();

}