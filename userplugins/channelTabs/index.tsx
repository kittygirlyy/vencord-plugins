/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./style.css";

import { findGroupChildrenByChildId, NavContextMenuPatchCallback } from "@api/ContextMenu";
import ErrorBoundary from "@components/ErrorBoundary";
import { Devs, Dev } from "@utils/constants";
import definePlugin from "@utils/types";
import { ChannelStore, Menu } from "@webpack/common";
import { Channel, Message } from "discord-types/general";

import ChannelsTabsContainer from "./components/ChannelTabsContainer";
import { BasicChannelTabsProps, createTab, settings } from "./util";
import * as ChannelTabsUtils from "./util";
import { hideTabsBar } from "./components/ChannelTabsContainer";

const EquicordDevs = Object.freeze({
    keifufu: {
        name: "keifufu",
        id: 469588398110146590n
    },
} satisfies Record<string, Dev>);

const contextMenuPatch: NavContextMenuPatchCallback = (children, props: { channel: Channel, messageId?: string; }) =>
    () => {
        const { channel, messageId } = props;
        const group = findGroupChildrenByChildId("channel-copy-link", children);
        group?.push(
            <Menu.MenuItem
                label="Open in New Tab"
                id="open-link-in-tab"
                action={() => createTab({
                    guildId: channel.guild_id,
                    channelId: channel.id
                }, true, messageId)}
            />
        );
    };

export default definePlugin({
    name: "ChannelTabs",
    description: "Group your commonly visited channels in tabs, like a browser",
    authors: [Devs.TheSun, Devs.TheKodeToad, EquicordDevs.keifufu, Devs.Nickyux],
    dependencies: ["ContextMenuAPI"],
    contextMenus: {
        "channel-mention-context": contextMenuPatch,
        "channel-context": contextMenuPatch
    },
    patches: [
        // add the channel tab container at the top
        {
            find: ".COLLECTIBLES_SHOP_FULLSCREEN))",
            replacement: {
                match: /(\?void 0:(\i)\.channelId.{0,200})\i\.Fragment,{/,
                replace: "$1$self.render,{currentChannel:$2,"
            }
        },
        // ctrl click to open in new tab in inbox unread
        {
            find: ".messageContainer,onKeyDown",
            replacement: {
                match: /.jumpButton,onJump:\i=>(\i)\(\i,(\i)\.id\)/,
                replace: ".jumpButton,onJump: event => { if (event.ctrlKey) $self.open($2); else $1(event, $2.id) }"
            }
        },
        // ctrl click to open in new tab in inbox mentions
        {
            find: ".deleteRecentMention(",
            replacement: {
                match: /(?<=.jumpMessageButton,onJump:)(\i)(?=.{0,20}message:(\i))/,
                replace: "event => { if (event.ctrlKey) $self.open($2); else $1(event) }"
            }
        },
        // ctrl click to open in new tab in search results
        {
            find: "(this,\"handleMessageClick\"",
            replacement: {
                match: /(?<=(\i)\.isSearchHit\));(?=null!=(\i))/,
                replace: ";if ($1.ctrlKey) return $self.open($2);"
            }
        },
        // prevent issues with the pins/inbox popouts being too tall
        {
            find: ".messagesPopoutWrap",
            replacement: {
                match: /\i&&\((\i).maxHeight-=\d{1,3}\)/,
                replace: "$&;$1.maxHeight-=$self.containerHeight"
            }
        },
        // workaround for app directory killing our component, see comments in ChannelTabContainer.tsx
        {
            find: ".ApplicationDirectoryEntrypointNames.EXTERNAL",
            replacement: {
                match: /(\.guildSettingsSection\).{0,30})},\[/,
                replace: "$1;$self.onAppDirectoryClose()},["
            }
        }
    ],

    settings,

    containerHeight: 0,

    render({ currentChannel, children }: {
        currentChannel: BasicChannelTabsProps,
        children: JSX.Element;
    }) {
        return (
            <>
                <ErrorBoundary>
                    <ChannelsTabsContainer {...currentChannel} />
                </ErrorBoundary>
                {children}
            </>
        );
    },

    open(message: Message) {
        const tab = {
            channelId: message.channel_id,
            guildId: ChannelStore.getChannel(message.channel_id)?.guild_id,
            compact: false
        };
        createTab(tab, false, message.id);
    },

    onAppDirectoryClose() {
        this.appDirectoryClosed = true;
        setTimeout(() => this.appDirectoryClosed = false, 0);
    },

    toolboxActions: {
        "Hide Tabs"() {
            settings.store.hideTabs = !settings.store.hideTabs;
            hideTabsBar();
        }
    },

    util: ChannelTabsUtils,
});
