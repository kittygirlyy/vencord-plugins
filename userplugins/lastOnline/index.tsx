import definePlugin from "@utils/types";
import { moment } from "@webpack/common";
import { findByProps } from "@webpack";
import { React } from "@webpack/common";
import { User } from "discord-types/general";

interface PresenceStatus {
    hasBeenOnline: boolean;
    lastOffline: number | null;
}

const recentlyOnlineList: Map<string, PresenceStatus> = new Map();

function handlePresenceUpdate(status: string, userId: string) {
    if (recentlyOnlineList.has(userId)) {
        const presenceStatus = recentlyOnlineList.get(userId)!;
        if (status !== "offline") {
            presenceStatus.hasBeenOnline = true;
            presenceStatus.lastOffline = null;
        } else if (presenceStatus.hasBeenOnline && presenceStatus.lastOffline == null) {
            presenceStatus.lastOffline = Date.now();
        }
    } else {
        recentlyOnlineList.set(userId, {
            hasBeenOnline: status !== "offline",
            lastOffline: status === "offline" ? Date.now() : null
        });
    }
}

function formatTime(time: number) {
    const diff = moment.duration(moment().diff(time));
    const d = Math.floor(diff.asDays());
    const h = Math.floor(diff.asHours());
    const m = Math.floor(diff.asMinutes());

    if (d > 0) return `${d}d`;
    if (h > 0) return `${h}h`;
    if (m > 0) return `${m}m`;
    return "1m";
}

export default definePlugin({
    name: "LastOnline",
    description: "Adds a last online indicator under usernames in your DM list and guild and GDM member list.",
    authors: [
        {
            id: 644298972420374528n,
            name: "Nick"
        }
    ],
    flux: {
        PRESENCE_UPDATES({ updates }) {
            updates.forEach(update => {
                handlePresenceUpdate(update.status, update.user.id);
            });
        }
    },
    patches: [
        {
            find: "Z.MEMBER_LIST_ITEM_AVATAR_DECORATION_PADDING);",
            replacement: {
                match: /(\(0,\i.Z\)\(\i,(\i),\i\);)(return\(0,\i.jsx)/,
                replace: "$1if($self.shouldShowRecentlyOffline($2)){return $self.buildRecentlyOffline($2)}$3"
            }
        },
        {
            find: "PrivateChannel.renderAvatar",
            replacement: {
                match: /(user:(\i)}\):)/,
                replace: "$1$self.shouldShowRecentlyOffline($2)?$self.buildRecentlyOffline($2):"
            }
        }
    ],
    shouldShowRecentlyOffline(user: User) {
        const presenceStatus = recentlyOnlineList.get(user.id);
        return presenceStatus && presenceStatus.hasBeenOnline && presenceStatus.lastOffline !== null;
    },
    buildRecentlyOffline(user: User) {
        const activityClass = findByProps("interactiveSelected", "interactiveSystemDM", "activity", "activityText", "subtext");

        const presenceStatus = recentlyOnlineList.get(user.id);
        const formattedTime = presenceStatus && presenceStatus.lastOffline !== null
            ? formatTime(presenceStatus.lastOffline)
            : "";
        return (
            <div className={activityClass.activity}>
                <div className={activityClass.activityText}>
                    <>Online <strong>{formattedTime} ago</strong></>
                </div>
            </div>
        );
    }
});