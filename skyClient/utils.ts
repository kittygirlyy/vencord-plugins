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

import { DataStore } from "@api/index";
import { useAwaiter } from "@utils/react";
import { UserStore } from "@webpack/common";

export interface SavedMessageData {
    label: string,
    message: string,
    group: string | null,
}


const getDataKey = () => `QuickSendMessages_${UserStore.getCurrentUser().id}`;

var savedDataCache: SavedMessageData[] = [];

export function clearDataFromDataStore(): SavedMessageData[] {
    savedDataCache = [];
    DataStore.del(getDataKey());
    DataStore.set(getDataKey(), savedDataCache);
    return savedDataCache;
}

export function saveDataToDataStore(data: SavedMessageData): SavedMessageData[] {
    savedDataCache = savedDataCache.filter(cacheData => cacheData !== data).filter(cacheData => cacheData.label !== data.label);
    if ((data.group || "").length === 0) data.group = null;
    if (data.message.length > 0) savedDataCache.push(data);
    DataStore.set(getDataKey(), savedDataCache);
    return savedDataCache;
}

export function getCachedData(): SavedMessageData[] {
    useAwaiter(() => DataStore.get<SavedMessageData[]>(getDataKey()).then(dataStoreData => {
        if (!dataStoreData) return;
        savedDataCache = [];
        dataStoreData.forEach(data => savedDataCache.push({ label: data.label, message: data.message, group: data.group }));
    }));
    return savedDataCache;
}
