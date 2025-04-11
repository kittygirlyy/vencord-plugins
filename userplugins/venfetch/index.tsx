/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ApplicationCommandInputType, Argument, CommandContext } from "@api/Commands";
import { gitHash } from "@shared/vencordUserAgent";
import { Devs } from "@utils/constants";
import { sendMessage } from "@utils/discord";
import definePlugin, { Plugin } from "@utils/types";
import { GuildMemberStore, UserStore } from "@webpack/common";

import plugins, { PluginMeta } from "~plugins";

import SettingsPlugin from "../../plugins/_core/settings";
import { isPluginDev } from "@utils/misc";
import { findByCodeLazy } from "@webpack";

const clientVersion = () => {
    const version = IS_DISCORD_DESKTOP ? DiscordNative.app.getVersion() : IS_VESKTOP ? VesktopNative.app.getVersion() : null;
    // @ts-ignore
    const name = IS_DISCORD_DESKTOP ? "Desktop" : IS_VESKTOP ? "Vesktop" : typeof unsafeWindow !== "undefined" ? "UserScript" : "Web";

    return `${name}${version ? ` v${version}` : ''}`;
};

const lines = `\
VV       VV
 VV     VV
  VV   VV
   VV VV
    VVV
        [2;35mCCCCCCC
       [2;35mCC
      [2;35mCC
       [2;35mCC
        [2;35mCCCCCCC[0m\
`.split("\n");
const sanitised = `\
VV       VV
 VV     VV
  VV   VV
   VV VV
    VVV
        CCCCCCC
       CC
      CC
       CC
        CCCCCCC\
`.split("\n");

// ```ansi
// VV       VV                 thepotatofamine
//  VV     VV                  ---------------
//   VV   VV                   Version: v1.10.5 • 88e8fa7e (Dev) - 25 Oct 2024
//    VV VV                    [2;35m[0m[2;35mClient: [0m[0mcanary ~ Vesktop v1.5.3[0m[2;35m[0m
//     VVV                     [2;35m[0m[2;35mPlatform: [0m[0mMacIntel[0m[2;35m[0m
//         [2;35mCCCCCCC             [2;35m[0m[2;35mPlugin Count: [0m[0m119[0m[2;35m[0m
//        [2;35mCC                   [2;35m[0m[2;35mUptime: [0m[0m1997s[0m[2;35m[0m
//       [2;35mCC                    [2;35m[0m[2;35mDonor: [0m[0myes[0m[2;35m[0m
//        [2;35mCC
//         [2;35mCCCCCCC[0m             [2;40m[2;30m███[0m[2;40m[0m[2;31m[0m[2;30m███[0m[2;31m███[0m[2;32m███[0m[2;33m███[0m[2;34m███[0m[2;35m███[0m[2;36m███[0m[2;37m███[0m
// ```;

const isApiPlugin = (plugin: Plugin) => plugin.name.endsWith("API") || plugin.required;

function getEnabledPlugins() {
    const counters = {
        official: {
            enabled: 0,
            total: 0
        },
        user: {
            enabled: 0,
            total: 0
        }
    };

    Object.values(Vencord.Plugins.plugins).filter((plugin) => !isApiPlugin(plugin)).forEach((plugin) => {
        if (PluginMeta[plugin.name]?.userPlugin) {
            if (plugin.started) counters.user.enabled++;
            counters.user.total++;
        } else {
            if (plugin.started) counters.official.enabled++;
            counters.official.total++;
        }
    });

    return `${counters.official.enabled} / ${counters.official.total} (official)` + (counters.user.total ? `, ${counters.user.enabled} / ${counters.user.total} (userplugins)` : "");
}
function getDonorStatus() {
    return GuildMemberStore.getMember("1015060230222131221", UserStore.getCurrentUser().id).roles.includes("1042507929485586532");
}
function getContribStatus() {
    const userId = UserStore.getCurrentUser().id;
    return isPluginDev(userId) || GuildMemberStore.getMember("1015060230222131221", userId).roles.includes("1026534353167208489");
}

function humanFileSize(bytes, si = false, dp = 1) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
        return bytes + " B";
    }

    const units = si
        ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
        : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
    let u = -1;
    const r = 10 ** dp;

    do {
        bytes /= thresh;
        ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


    return bytes.toFixed(dp) + " " + units[u];
}

const getVersions = findByCodeLazy("logsUploaded:new Date().toISOString(),");

export default definePlugin({
    name: "venfetch",
    description: "neofetch for vencord",
    authors: [Devs.nin0dev],
    commands: [
        {
            name: "venfetch",
            description: "neofetch for vencord",
            inputType: ApplicationCommandInputType.BUILT_IN,
            execute: (args: Argument[], ctx: CommandContext) => {
                const { username } = UserStore.getCurrentUser();
                const versions = getVersions();
                const info: Record<string, string | null> = {
                    version: `${VERSION} ~ ${gitHash}${SettingsPlugin.additionalInfo} - ${Intl.DateTimeFormat(navigator.language, { dateStyle: "medium" }).format(BUILD_TIMESTAMP)}`,
                    client: `${t(window.GLOBAL_ENV.RELEASE_CHANNEL)} ~ ${clientVersion()}`,
                    'Build Number': `${versions.buildNumber} ~ Hash: ${versions.versionHash?.slice(0, 7) ?? 'unknown'}`,

                    _: null,

                    // @ts-ignore
                    platform: navigator.userAgentData?.platform ? `${navigator.userAgentData?.platform} (${navigator.platform})` : navigator.platform,
                    plugins: getEnabledPlugins(),
                    uptime: `${~~((Date.now() - window.GLOBAL_ENV.HTML_TIMESTAMP) / 1000)}s`,
                    // TODO: pr to vencord real and add to vencordnative
                    // memory: `${humanFileSize(VencordNative.memoryUsage().heapUsed)} / ${humanFileSize(VencordNative.memoryUsage().heapTotal)}`,

                    __: null,

                    donor: getDonorStatus() ? "yes" : "no",
                    contributor: getContribStatus() ? "yes" : "no",

                    ___: null,

                    __COLOR_TEST__: "[2;40m[2;30m███[0m[2;40m[0m[2;31m[0m[2;30m███[0m[2;31m███[0m[2;32m███[0m[2;33m███[0m[2;34m███[0m[2;35m███[0m[2;36m███[0m[2;37m███[0m"

                    // electron web context, want to get total memory usage
                };

                const computed: [string, string | null][] = Object.entries(info).map(([key, value]) => [key, value]);

                let str = "";

                str += `${lines[0]}${" ".repeat(25 - lines[0].length)}[1;2m[4;2m[0m[0m[4;2m[1;2m${username}[0m[0m\n`;

                for (let i = 1; i < computed.length + 1; i++) {
                    const line = computed[i - 1];

                    if (lines[i]) {
                        str += `${lines[i]}`;

                        if (line && line[1] !== null && line[0] !== "__COLOR_TEST__") str += `${" ".repeat(25 - sanitised[i].length)}[2;35m[0m[2;35m${t(line[0])}: [0m[0m${line[1]}[0m[2;35m[0m\n`;
                        else if (line[0] === "__COLOR_TEST__") str += line[0] + "\n"; else str += "\n";
                    } else {
                        if (line && line[1] !== null && line[0] !== "__COLOR_TEST__") str += `${" ".repeat(25)}[2;35m[0m[2;35m${t(line[0])}: [0m[0m${line[1]}[0m[2;35m[0m\n`;
                        else if (line[0] === "__COLOR_TEST__") str += `${" ".repeat(25)}${line[1]}\n`; else str += "\n";
                    }
                }

                sendMessage(ctx.channel.id, {
                    content: `\`\`\`ansi\n${str}\n\`\`\``
                });
                return;
            }
        }
    ]
});

const t = (e: string) => e.length > 0 ? e[0].toUpperCase() + e.slice(1) : "";
