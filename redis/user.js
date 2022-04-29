import { client, connect } from "./redis.js"
import schemaCampaign from "./models/campaign.js";

export const getUser = async (userEmail) => {
    await connect(client)

    const repository = client.fetchRepository(schemaCampaign);

    let match = await repository.search().where('email').equals(userEmail).returnCount()

    return match
}