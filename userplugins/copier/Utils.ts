/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

// Credit: https://github.com/discordjs/discord-api-types/blob/main/payloads/v9/channel.ts#L387-L479
export enum ChannelType {
    GuildText,
    DM,
    GuildVoice,
    GroupDM,
    GuildCategory,
    GuildAnnouncement,
    AnnouncementThread = 10,
    PublicThread,
    PrivateThread,
    GuildStageVoice,
    GuildDirectory,
    GuildForum,
    GuildMedia,
}

export function hexToRgb(hex: string): { r: number; g: number; b: number; } {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        }
        : { r: 255, g: 255, b: 255 };
}

export function rgbToHSL(r: number, g: number, b: number): { h: number; s: number; l: number; } {
    r /= 255;
    g /= 255;
    b /= 255;
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    const delta = max - min;
    let l = (min + max) / 2;
    let s = 0;
    if (delta !== 0) s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    let h = 0;
    if (delta !== 0) {
        if (max === r) {
            h = (g - b) / delta;
        } else if (max === g) {
            h = (b - r) / delta + 2;
        } else {
            h = (r - g) / delta + 4;
        }
        h *= 60;
        if (h < 0) h += 360;
    }

    s *= 100;
    l *= 100;
    h = Math.round(h);
    s = Math.round(s);
    l = Math.round(l);
    return { h, s, l };
}
