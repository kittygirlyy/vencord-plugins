/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { Devs } from "@utils/constants";
import { insertTextIntoChatInputBox } from "@utils/discord";
import definePlugin from "@utils/types";
import { Menu } from "@webpack/common";
import type { Message } from "discord-types/general";

const MessageContextMenuPatch: NavContextMenuPatchCallback = (children, { message }: { message: Message }): void => {
    if (!message || !message.author) return;
    if (message.author.id !== "1025590776861819012" || message.author.bot !== true) {
        return;
    }

    if (message.components.length !== 0) return;
    const buttons = [];
    message.components.forEach((stupid) => {
        stupid.components.forEach((dumb) => {
            buttons.push(dumb);
        });
    });

    const found = buttons.find((button) => button.customId.split(",")[1] === "y");
    if (!found) return;
    children.push(
        <Menu.MenuItem
            label="Boar Solve"
            key="boar-hack-solve"
            id="boar-hack-solve"
            action={() => insertTextIntoChatInputBox(found.id)}
        />
    );
};

export default definePlugin({
    name: "BoarHack",
    authors: [Devs.Kathund],
    description: "Hack boar.",
    dependencies: ["UserSettingsAPI"],
    contextMenus: {
        message: MessageContextMenuPatch
    }
});
