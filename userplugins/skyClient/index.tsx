/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
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

import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { Devs } from "@utils/constants";
import { insertTextIntoChatInputBox, sendMessage } from "@utils/discord";
import definePlugin from "@utils/types";
import { Menu } from "@webpack/common";
import { Channel, Guild, Message } from "discord-types/general";



const skyClientGuildIds: string[] = ["780181693100982273", "822066990423605249"];
const ChannelContextMenuPatch: NavContextMenuPatchCallback = (children, { guild, channel }: { guild: Guild, channel: Channel; }) => {
    if (skyClientGuildIds.includes(guild.id) === false) return;
    children.push(
        <Menu.MenuItem
            id="skyclient-bump"
            label="Bump Ticket"
            action={() => insertTextIntoChatInputBox("/bump ")}
        />
    );
};

const MessageContextMenuPatch: NavContextMenuPatchCallback = (children, { channel, message }: { channel: Channel, message: Message; }) => {
    children.push(
        <Menu.MenuItem
            id="skyclient-bump"
            label="Bump Ticket"
            action={() => { sendMessage(channel.id, { content: "meow :3" }); }}
        />
    );
};

export default definePlugin({
    name: "SkyClient",
    authors: [Devs.Kathund],
    description: "SkyClient Plugin",
    dependencies: ["UserSettingsAPI"],
    contextMenus: {
        "message": MessageContextMenuPatch,
    }
});
