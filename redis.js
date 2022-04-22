import "dotenv/config";
import { Client, Entity, Schema, Repository } from "redis-om";

const client = new Client();

const connect = async () => {
  if (!client.isOpen()) {
    await client.open(process.env.REDIS_URL);
  }
};

class Campaign extends Entity {}

let schemaCampaign = new Schema(
  Campaign,
  {
    id: { type: "string" },
    title: { type: "string" },
    date: { type: "string" },
    coupons: { type: "string" },
    product: { type: "string" },
  },
  {
    dataStructure: "JSON",
  }
);

export const createCampaign = async (data) => {
  await connect();

  const repository = client.fetchRepository(schemaCampaign);
  const id = await repository.createAndSave(data);

  return id;
};

export const remove = async (id) => {
  await connect();

  const repository = client.fetchRepository(schemaCampaign);

  await repository.remove(id)

};
