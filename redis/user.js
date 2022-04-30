import { client, connect } from "./redis.js";
import schemaCampaign from "./models/campaign.js";
import schemaUser from "./models/user.js";

export const getUserCount = async (userEmail) => {
  await connect(client);

  const repository = client.fetchRepository(schemaUser);

  console.log("userEmail >>>", userEmail);

  let match = await repository
    .search()
    .where("email")
    .equals(userEmail)
    .returnCount();

  console.log("getUser match >>>", match);

  return match;
};

export const getUser = async (userEmail) => {
  await connect(client);

  const repository = client.fetchRepository(schemaUser);

  console.log("userEmail >>>", userEmail);

  let match = await repository
    .search()
    .where("email")
    .equals(userEmail)
    .returnFirst();

  console.log("getUser match >>>", match);

  return match;
};

export const registerUser = async (data) => {
  await connect(client);

  const repository = client.fetchRepository(schemaUser);

  const id = await repository.createAndSave(data);

  return;
};

export const setUnixLastLogin = async (entityId) => {
  await connect(client);

  const repository = client.fetchRepository(schemaUser);
  const user = await repository.fetch(entityId);
  console.log("user before >", user);
  user.unixLastLogin = Date.now();

  console.log("user after > ", user);

  await repository.save(user);

  return;
};
