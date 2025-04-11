/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { Devs } from "@utils/constants";
import { getCurrentGuild } from "@utils/discord";
import definePlugin from "@utils/types";
import { Clipboard, GuildStore, Menu, SnowflakeUtils } from "@webpack/common";
import type { Channel, Guild, Message, User } from "discord-types/general";

import MessageEmbedData from "./components/MessageEmbedData";
import { ChannelType, hexToRgb, rgbToHSL } from "./Utils";

const UserContextMenuPatch: NavContextMenuPatchCallback = (children, { user }: { user: User }) => {
    children.push(
        <Menu.MenuItem label="Copy" key="Copy-User" id="Copy-User">
            <Menu.MenuItem id="Copy-User-Id" label="User ID" action={() => Clipboard.copy(user.id)} />
            <Menu.MenuItem id="Copy-User-Username" label="Username" action={() => Clipboard.copy(user.username)} />
            <Menu.MenuItem id="Copy-User-Mention" label="Mention" action={() => Clipboard.copy(`<@${user.id}>`)} />
            <Menu.MenuItem
                id="Copy-User-Profile-URL"
                label="Profile Url"
                action={() => Clipboard.copy(`https://discord.com/users/${user.id}`)}
            />

            {user.globalName ? (
                <Menu.MenuItem
                    id="Copy-User-Global-Name"
                    label="Global Name"
                    action={() => Clipboard.copy(user.globalName)}
                />
            ) : (
                <></>
            )}

            {user.bio ? (
                <Menu.MenuItem id="Copy-User-Bio" label="Bio" action={() => Clipboard.copy(user.bio)} />
            ) : (
                <></>
            )}

            {user.getAvatarURL() ? (
                <Menu.MenuItem
                    id="Copy-User-Avatar"
                    label="Avatar URL"
                    action={() => Clipboard.copy(user.getAvatarURL())}
                />
            ) : (
                <></>
            )}

            {user.banner ? (
                <>
                    <Menu.MenuItem
                        id="Copy-User-Banner"
                        label="Banner"
                        action={() =>
                            Clipboard.copy(`https://cdn.discordapp.com/banners/${user.id}/${user.banner}.gif?size=1024`)
                        }
                    />
                </>
            ) : (
                <></>
            )}

            <Menu.MenuItem
                id="Copy-User-Raw"
                label="Raw"
                action={() => Clipboard.copy(JSON.stringify(user, null, 2))}
            />
        </Menu.MenuItem>
    );
};

const ChannelContextMenuPatch: NavContextMenuPatchCallback = (children, { channel }: { channel: Channel }) => {
    children.push(
        <Menu.MenuItem label="Copy" key="Copy-Channel" id="Copy-Channel">
            <Menu.MenuItem
                id="Copy-Channel-Url"
                label="Channel Url"
                action={() => Clipboard.copy(`https://discord.com/channels/${channel.guild_id}/${channel.id}`)}
            />
            <Menu.MenuItem id="Copy-Channel-Id" label="Channel ID" action={() => Clipboard.copy(channel.id)} />
            <Menu.MenuItem id="Copy-Channel-Name" label="Name" action={() => Clipboard.copy(channel.name)} />

            {channel.topic ? (
                <Menu.MenuItem id="Copy-Channel-Topic" label="Topic" action={() => Clipboard.copy(channel.topic)} />
            ) : (
                <></>
            )}

            <Menu.MenuItem
                id="Copy-Channel-Mention"
                label="Mention"
                action={() => Clipboard.copy(`<#${channel.id}>`)}
            />

            {channel.type === ChannelType.GuildVoice ? (
                <>
                    <Menu.MenuItem
                        id="Copy-Channel-User-Limit"
                        label="User Limit"
                        action={() => Clipboard.copy(channel.userLimit.toString())}
                    />
                    <Menu.MenuItem
                        id="Copy-Channel-Bit-Rate"
                        label="Bit Rate"
                        action={() => Clipboard.copy(channel.bitrate.toString())}
                    />
                    <Menu.MenuItem
                        id="Copy-Channel-Voice-Region"
                        label="Voice Region"
                        action={() =>
                            Clipboard.copy(channel.rtcRegion === "rtcRegion" ? "automatic" : channel.rtcRegion)
                        }
                    />
                </>
            ) : (
                <></>
            )}

            <Menu.MenuItem
                id="Copy-Channel-Raw"
                label="Raw"
                action={() => Clipboard.copy(JSON.stringify(channel, null, 2))}
            />
        </Menu.MenuItem>
    );
};

const GuildContextMenuPatch: NavContextMenuPatchCallback = (children, { guild }: { guild: Guild }) => {
    children.push(
        <Menu.MenuItem label="Copy" key="Copy-Guild" id="Copy-Guild">
            <Menu.MenuItem id="Copy-Guild-Id" label="Guild ID" action={() => Clipboard.copy(guild.id)} />
            <Menu.MenuItem id="Copy-Guild-Name" label="Name" action={() => Clipboard.copy(guild.name)} />
            <Menu.MenuItem id="Copy-Guild-Owner-Id" label="Owner Id" action={() => Clipboard.copy(guild.ownerId)} />
            <Menu.MenuItem id="Copy-Guild-Creation-Date" label="Creation Date">
                <Menu.MenuItem
                    id="Copy-Guild-Creation-Date-Unix"
                    label="Unix"
                    action={() => Clipboard.copy(SnowflakeUtils.extractTimestamp(guild.id).toString())}
                />
                <Menu.MenuItem id="Copy-Guild-Creation-Date-String" label="Date String">
                    <Menu.MenuItem
                        id="Copy-Guild-Creation-Date-String-Long"
                        label="Long"
                        action={() => Clipboard.copy(new Date(SnowflakeUtils.extractTimestamp(guild.id)).toString())}
                    />
                    <Menu.MenuItem
                        id="Copy-Guild-Creation-Date-String-Short"
                        label="Short"
                        action={() =>
                            Clipboard.copy(new Date(SnowflakeUtils.extractTimestamp(guild.id)).toLocaleString())
                        }
                    />
                </Menu.MenuItem>
            </Menu.MenuItem>

            {guild.description ? (
                <Menu.MenuItem
                    id="Copy-Guild-Topic"
                    label="Description"
                    action={() => Clipboard.copy(guild.description!)}
                />
            ) : (
                <></>
            )}

            {guild.vanityURLCode ? (
                <Menu.MenuItem
                    id="Copy-Guild-Vanity"
                    label="Vanity Invite"
                    action={() => Clipboard.copy(`https://discord.gg/${guild.vanityURLCode}`)}
                />
            ) : (
                <></>
            )}
            <Menu.MenuItem
                id="Copy-Guild-Raw"
                label="Raw"
                action={() => Clipboard.copy(JSON.stringify(guild, null, 2))}
            />
        </Menu.MenuItem>
    );
};

const RoleContextMenuPatch: NavContextMenuPatchCallback = (children, { id }: { id: string }) => {
    const guild = getCurrentGuild();
    if (!guild) return;

    const role = GuildStore.getRole(guild.id, id);
    if (!role) return;
    children.push(
        <Menu.MenuItem label="Copy" key="Copy-Role" id="Copy-Role">
            <Menu.MenuItem id="Copy-Role-Id" label="Role ID" action={() => Clipboard.copy(role.id)} />
            <Menu.MenuItem id="Copy-Role-Name" label="Name" action={() => Clipboard.copy(role.name)} />
            <Menu.MenuItem id="Copy-Role-Mention" label="Mention" action={() => Clipboard.copy(`<@&${role.id}>`)} />
            {role.colorString ? (
                <Menu.MenuItem label="Copy Color" key="Copy-Role-Color" id="Copy-Role-Color">
                    <Menu.MenuItem
                        id="Copy-Role-Color-Hex"
                        label="Hex"
                        action={() => Clipboard.copy(role.colorString!)}
                    />
                    <Menu.MenuItem
                        id="Copy-Role-Color-RGB"
                        label="RGB"
                        action={() => {
                            const rgb = hexToRgb(role.colorString!);
                            Clipboard.copy(`RGB(${rgb.r}, ${rgb.g}, ${rgb.b})`);
                        }}
                    />
                    <Menu.MenuItem
                        id="Copy-Role-Color-HSL"
                        label="HSL"
                        action={() => {
                            const { r, g, b } = hexToRgb(role.colorString!);
                            const hsl = rgbToHSL(r, g, b);
                            Clipboard.copy(`HSL(${hsl.h}%, ${hsl.s}%, ${hsl.l}%)`);
                        }}
                    />
                </Menu.MenuItem>
            ) : (
                <></>
            )}

            {role.icon ? (
                <Menu.MenuItem label="Copy Role Icon" key="Copy-Role-Icon" id="Copy-Role-Icon">
                    <Menu.MenuItem
                        id="Copy-Role-Icon-png"
                        label="png"
                        action={() =>
                            Clipboard.copy(`https://cdn.discordapp.com/role-icons/${role.id}/${role.icon}.png`)
                        }
                    />
                    <Menu.MenuItem
                        id="Copy-Role-Icon-webp"
                        label="webp"
                        action={() =>
                            Clipboard.copy(`https://cdn.discordapp.com/role-icons/${role.id}/${role.icon}.webp`)
                        }
                    />
                    <Menu.MenuItem
                        id="Copy-Role-Icon-jpg"
                        label="jpg"
                        action={() =>
                            Clipboard.copy(`https://cdn.discordapp.com/role-icons/${role.id}/${role.icon}.jpg`)
                        }
                    />
                </Menu.MenuItem>
            ) : (
                <></>
            )}
        </Menu.MenuItem>
    );
};

const MessageContextMenuPatch: NavContextMenuPatchCallback = (children, { message }: { message: Message }) => {
    children.push(
        <Menu.MenuItem label="Copy" key="Copy-Message" id="Copy-Message">
            <Menu.MenuItem id="Copy-Message-Id" label="Message ID" action={() => Clipboard.copy(message.id)} />
            <Menu.MenuItem
                id="Copy-Message-Raw-Content"
                label="Raw Content"
                action={() => Clipboard.copy(message.content)}
            />
            {message.embeds.length > 0 ? (
                <Menu.MenuItem label="Copy Embeds" key="Copy-Role-Icon" id="Copy-Role-Icon">
                    <Menu.MenuItem id="Copy-Message-Id" label="Message ID" action={() => Clipboard.copy(message.id)} />
                    {message.embeds.forEach((embed: any, index: any) => {
                        return (
                            <>
                                <MessageEmbedData embed={embed} index={index} />
                            </>
                        );
                    }).map()}
                </Menu.MenuItem>
            ) : (
                <></>
            )}
        </Menu.MenuItem>
    );
};

export default definePlugin({
    name: "Copier",
    authors: [Devs.Kathund],
    description: "Copy things",
    dependencies: ["MessagePopoverAPI"],
    contextMenus: {
        "user-context": UserContextMenuPatch,
        "user-profile-overflow-menu": UserContextMenuPatch,
        "channel-context": ChannelContextMenuPatch,
        "guild-context": GuildContextMenuPatch,
        "guild-header-popout": GuildContextMenuPatch,
        "dev-context": RoleContextMenuPatch,
        message: MessageContextMenuPatch
    }
});
