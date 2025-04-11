import definePlugin from "../utils/types";
import { Devs } from "../utils/constants";

async function getcuteneko(): Promise<string> {
    const res = await fetch('https://nekos.best/api/v2/neko');
    const url = (await res.json()).results[0].url as string;
    return url;
  }



export default definePlugin({
    name: "Cute nekos",
    authors: [
        Devs.echo
    ],
    description: "what the fuck am i doing with my life",
    dependencies: ["CommandsAPI"],
    commands: [{
        name: "nekos",
        description: "AAAAAAAAAAAAAAAAAAAAAA",
        execute: async opts => ({
            content: await getcuteneko()
        })
    }]
});
