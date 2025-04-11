/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Clipboard, Menu } from "@webpack/common";
import type { Embed } from "discord-types/general";

export default function MessageEmbedData({ embed, index }: { embed: Embed; index: number }) {
    return (
        <>
            <Menu.MenuItem
                label={`Copy Embed ${index + 1}`}
                key={`Copy-Message-Embed-${index}`}
                id={`Copy-Message-Embed-${index}`}>
                <Menu.MenuItem
                    id="Copy-Role-Icon"
                    label="png"
                    action={() => Clipboard.copy("hfgdhjfduis9ghuidpghuifdhgu")}
                />
            </Menu.MenuItem>
        </>
    );
}
