import { client, connect } from "./redis.js";
import schemaCampaign from "./models/campaign.js";
import schemaUser from "./models/user.js";

export const getUser = async (userEmail) => {
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

export const registerUser = async (data) => {
  await connect(client);
  console.log(data);

  const repository = client.fetchRepository(schemaUser);

  const id = await repository.createAndSave(data);

  return id;
};
