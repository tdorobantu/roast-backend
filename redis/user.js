import { client, connect } from "./redis.js"
import schemaCampaign from "./models/campaign.js";

export const getUser = async (userEmail) => {
    await connect(client)

    const repository = client.fetchRepository(schemaCampaign);

    // ! createindex on app.on('listen', () => )
    // await repository.createIndex();

    let match = await repository.search().where('title').equals("redis refactor").returnAll()

    return match
}