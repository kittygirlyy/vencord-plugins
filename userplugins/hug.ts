import definePlugin from "../utils/types";
import { Devs } from "../utils/constants";

async function hugg(): Promise<string> {
    const res = await fetch('https://nekos.best/api/v2/hug');
    const url = (await res.json()).results[0].url as string;
    return url;
  }



export default definePlugin({
    name: "Hug",
    authors: [
        Devs.echo
    ],
    description: "mew",
    dependencies: ["CommandsAPI"],
    commands: [{
        name: "hug",
        description: "wouf",
        execute: async opts => ({
            content: await hugg()
        })
    }]
});
