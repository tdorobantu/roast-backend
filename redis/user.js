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

  let match = await repository
    .search()
    .where("email")
    .equals(userEmail)
    .returnFirst();

  return match;
};

export const registerUser = async (data) => {
  await connect(client);

  const repository = client.fetchRepository(schemaUser);

  const { entityId } = await repository.createAndSave(data);

  return entityId;
};

export const setUnixLastLogin = async (entityId) => {
  await connect(client);

  const repository = client.fetchRepository(schemaUser);
  const user = await repository.fetch(entityId);

  user.unixLastLogin = Date.now();



  await repository.save(user);

  return;
};