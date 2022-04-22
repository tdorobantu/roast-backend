import "dotenv/config";
import { Client } from "redis-om";

export const client = new Client();
 
export const connect = async (client) => {
  if (!client.isOpen()) {
    await client.open(process.env.REDIS_URL);
  }
};