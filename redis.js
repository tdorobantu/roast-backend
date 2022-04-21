import "dotenv/config"
import { Client, Entity, Schema, Repository } from "redis-om";

const client = new Client();

const connect = async () => {
  console.log("THIS IS REDIS URL:", process.env.REDIS_URL);
  if (!client.isOpen()) {
    await client.open(process.env.REDIS_URL);
  }
};

class Coupon extends Entity {}

let schema = new Schema(
  Coupon,
  {
    campaignId: { type: "string" },
    couponId: { type: "string" },
    senderId: { type: "string" },
    receiverId: { type: "string" },
  },
  {
    dataStructure: "JSON",
  }
);

export const createCoupon = async (data) => {
  await connect();

  const repository = client.fetchRepository(schema);

  const coupon = repository.createEntity(data);

  const id = await repository.save(coupon);

  return id;
};
