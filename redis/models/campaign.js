import { Entity, Schema } from "redis-om";

class Campaign extends Entity {}

const schemaCampaign = new Schema(
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

export default schemaCampaign;
