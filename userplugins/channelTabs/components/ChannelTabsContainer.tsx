/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { classNameFactory } from "@api/Styles";
import { useForceUpdater } from "@utils/react";
import { findByPropsLazy } from "@webpack";
import { Button, ContextMenuApi, Flex, FluxDispatcher, Forms, useCallback, useEffect, useRef, UserStore, useState } from "@webpack/common";

import { BasicChannelTabsProps, ChannelTabsProps, createTab, handleChannelSwitch, openedTabs, openStartupTabs, saveTabs, settings, setUpdaterFunction, useGhostTabs } from "../util";
import BookmarkContainer from "./BookmarkContainer";
import ChannelTab, { PreviewTab } from "./ChannelTab";
import { BasicContextMenu } from "./ContextMenus";

type TabSet = Record<string, ChannelTabsProps[]>;

const { PlusSmallIcon } = findByPropsLazy("PlusSmallIcon");
const cl = classNameFactory("vc-channeltabs-");

var ref;
var collapsed: boolean;

export function hideTabsBar() {
    let container = ref?.current;

    if (!container) return;
    collapsed = settings.store.hideTabs;
    
    container.style.transform = `scale(${collapsed ? 0 : 1})`;
    container.style.opacity = collapsed ? "0%" : "100%";
    // this is very scuffed, but I cannot .animate or CSS transition the height so.. 
    container.style['margin-bottom'] = collapsed ? `-${container.clientHeight}px` : `0px`;
}

export default function ChannelsTabsContainer(props: BasicChannelTabsProps) {
    const [userId, setUserId] = useState("");
    const { showBookmarkBar, widerTabsAndBookmarks } = settings.use(["showBookmarkBar", "widerTabsAndBookmarks"]);
    const GhostTabs = useGhostTabs();

    const _update = useForceUpdater();
    const update = useCallback((save = true) => {
        _update();
        if (save) saveTabs(userId);
    }, [userId]);

    useEffect(() => {
        // for some reason, the app directory is it's own page instead of a layer, so when it's opened
        // everything behind it is destroyed, including our container. this workaround is required
        // to properly add the container back without reinitializing everything
        if ((Vencord.Plugins.plugins.ChannelTabs as any).appDirectoryClosed) {
            setUserId(UserStore.getCurrentUser().id);
            update(false);
        }
    }, []);

    ref = useRef<HTMLDivElement>(null);
    hideTabsBar();

    useEffect(() => {
        setUpdaterFunction(update);
        const onLogin = () => {
            const { id } = UserStore.getCurrentUser();
            if (id === userId && openedTabs.length) return;
            setUserId(id);

            openStartupTabs({ ...props, userId: id }, setUserId);
        };

        FluxDispatcher.subscribe("CONNECTION_OPEN_SUPPLEMENTAL", onLogin);
        return () => {
            FluxDispatcher.unsubscribe("CONNECTION_OPEN_SUPPLEMENTAL", onLogin);
        };
    }, []);

    useEffect(() => {
        (Vencord.Plugins.plugins.ChannelTabs as any).containerHeight = ref.current?.clientHeight;
    }, [userId, showBookmarkBar]);

    useEffect(() => {
        _update();
    }, [widerTabsAndBookmarks]);

    if (!userId) return null;
    handleChannelSwitch(props);
    saveTabs(userId);

    return (
        <div
            className={cl("container")}
            ref={ref}
            onContextMenu={e => ContextMenuApi.openContextMenu(e, () => <BasicContextMenu />)}
        >
            <div className={cl("tab-container")}>
                {openedTabs.map((tab, i) =>
                    <ChannelTab {...tab} index={i} />
                )}

                <button
                    onClick={() => createTab(props, true)}
                    className={cl("button", "new-button", "hoverable")}
                >
                    <PlusSmallIcon height={20} width={20} />
                </button>

                {GhostTabs}
            </div >
            {showBookmarkBar && <>
                <div className={cl("separator")} />
                <BookmarkContainer {...props} userId={userId} />
            </>}

        </div>
    );
}

export function ChannelTabsPreview(p) {
    const id = UserStore.getCurrentUser()?.id;
    if (!id) return <Forms.FormText>there's no logged in account?????</Forms.FormText>;

    const { setValue }: { setValue: (v: TabSet) => void; } = p;
    const { tabSet }: { tabSet: TabSet; } = settings.use(["tabSet"]);

    const placeholder = [{ guildId: "@me", channelId: undefined as any }];
    const [currentTabs, setCurrentTabs] = useState(tabSet?.[id] ?? placeholder);

    return (
        <>
            <Forms.FormTitle>Startup tabs</Forms.FormTitle>
            <Flex flexDirection="row" style={{ gap: "2px" }}>
                {currentTabs.map(t => <>
                    <PreviewTab {...t} />
                </>)}
            </Flex>
            <Flex flexDirection="row-reverse">
                <Button
                    onClick={() => {
                        setCurrentTabs([...openedTabs]);
                        setValue({ ...tabSet, [id]: [...openedTabs] });
                    }}
                >Set to currently open tabs</Button>
            </Flex>
        </>
    );
}
