import { Entity, Schema } from "redis-om";

class User extends Entity {}

const schemaUser = new Schema(
  User,
  {
    name: { type: "string" },
    email: { type: "string" },
    password: { type: "string" },
    unixJoin: { type: "string" },
    unixLastLogin: { type: "string" },
    blackListed: { type: "boolean" },
    confirmed: { type: "boolean" },
    tokenVersion: { type: "number" },
    refreshToken: { type: "string" },
    hashedFingerprint: { type: "string" },
  },
  {
    dataStructure: "JSON",
  }
);

export default schemaUser;
