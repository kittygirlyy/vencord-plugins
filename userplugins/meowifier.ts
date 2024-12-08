/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2022 exhq
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { findOption, RequiredMessageOption } from "@api/Commands";
import { addPreEditListener, addPreSendListener, MessageObject, removePreEditListener, removePreSendListener } from "@api/MessageEvents";
import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";

const endings = [
    "meow",
    "nya",
    "purr",
    "meow~",
    "mew",
    "nya~",
    "mew~",
    "purr~",
    "meow meow",
    "nyaa~",
    "myaa~",
    "mew mew",
    "rawr x3",
    "^^",
    "^^;;",
    "(ˆ ﻌ ˆ)♡",
    "^•ﻌ•^",
    "/(^•ω•^)"
];

const replacements = [
    ["small", "smol"],
    ["cute", "kawaii"],
    ["fluff", "floof"],
    ["love", "luv"],
    ["stupid", "baka"],
    ["what", "nani"],
    ["hello", "mewllo"],
    ["friend", "furriend"],
    ["cat", "kitteh"],
];

const settings = definePluginSettings({
    meowEveryMessage: {
        description: "Make every single message meowified",
        type: OptionType.BOOLEAN,
        default: false,
        restartNeeded: false
    },
    meowEverything: {
        description: "Makes *all* text meowified - really bad idea",
        type: OptionType.BOOLEAN,
        default: false,
        restartNeeded: true
    }
});

function selectRandomElement(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);

    return arr[randomIndex];
}
const isOneCharacterString = (str: string): boolean => {
    return str.split('').every((char: string) => char === str[0]);
};

function replaceString(inputString) {
    let replaced = false;
    for (const replacement of replacements) {
        const regex = new RegExp(`\\b${replacement[0]}\\b`, "gi");
        if (regex.test(inputString)) {
            inputString = inputString.replace(regex, replacement[1]);
            replaced = true;
        }
    }
    return replaced ? inputString : false;
}

function meowify(message: string): string {
    const rule = /\S+|\s+/g;
    const words: string[] | null = message.match(rule);
    let answer = "";

    if (words === null) return "";

    for (let i = 0; i < words.length; i++) {
        if (isOneCharacterString(words[i]) || words[i].startsWith("https://")) {
            answer += words[i];
            continue;
        }

        if (!replaceString(words[i])) {
            answer += words[i]
                .replace(/n(?=[aeo])/g, "ny")
                .replace(/l|r/g, "w");
        } else answer += replaceString(words[i]);

    }

    answer += " " + selectRandomElement(endings);
    return answer;
}

function meowifyArray(arr) {
    const newArr = [...arr];

    newArr.forEach((item, index) => {
        if (Array.isArray(item)) {
            newArr[index] = meowifyArray(item);
        } else if (typeof item === "string") {
            newArr[index] = meowify(item);
        }
    });

    return newArr;
}


// actual command declaration
export default definePlugin({
    name: "Meowifier",
    description: "make everything meow",
    authors: [Devs.echo],
    dependencies: ["CommandsAPI", "MessageEventsAPI"],
    settings,

    commands: [
        {
            name: "meowify",
            description: "meowifies your messages",
            options: [RequiredMessageOption],

            execute: opts => ({
                content: meowify(findOption(opts, "message", "")),
            }),
        },
    ],

    patches: [{
        find: ".isPureReactComponent=!0;",
        predicate: () => settings.store.meowEverything,
        replacement: {
            match: /(?<=.defaultProps\)void 0.{0,60})props:(\i)/,
            replace: "props:$self.meowifyProps($1)"
        }
    }, {
        find: ".__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner",
        predicate: () => settings.store.meowEverything,
        replacement: {
            match: /(?<=.defaultProps\)void 0.{0,60})props:(\i)/,
            replace: "props:$self.meowifyProps($1)"
        },
        all: true
    }],

    meowifyProps(props: any) {
        if (!props.children) return props;
        if (typeof props.children === "string") props.children = meowify(props.children);
        else if (Array.isArray(props.children)) props.children = meowifyArray(props.children);
        return props;
    },

    onSend(msg: MessageObject) {
        // Only run when it's enabled
        if (settings.store.meowEveryMessage) {
            msg.content = meowify(msg.content);
        }
    },

    start() {
        this.preSend = addPreSendListener((_, msg) => this.onSend(msg));
        this.preEdit = addPreEditListener((_cid, _mid, msg) =>
            this.onSend(msg)
        );
    },

    stop() {
        removePreSendListener(this.preSend);
        removePreEditListener(this.preEdit);
    },
});
