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

import { ModalContent, ModalHeader, ModalProps, ModalRoot, openModal } from "@utils/modal";
import { Button, Forms, React } from "@webpack/common";

import { getCachedData } from "../utils";
import { ManageMessageModal } from "./ManageMessageModal";

export function EditMessagesModal({ props }: { props: ModalProps; }) {
    const buttons: React.JSX.Element[] = [];
    getCachedData().forEach(messageData => {
        buttons.push(
            <Button
                onClick={() => openModal(props => (
                    <ManageMessageModal
                        props={props}
                        title={`Editing ${messageData.label}`}
                        currentLabel={messageData.label}
                        currentMessage={messageData.message}
                        currentGroup={messageData.group || ""}
                        edit={true} />
                ))}
                style={{ marginTop: "10px" }}
                color={Button.Colors.BRAND}>{`Edit ${messageData.label}`}</Button>
        );
    });

    return (
        <ModalRoot {...props}>
            <ModalHeader>
                <Forms.FormTitle tag="h4">Editing Messages</Forms.FormTitle>
            </ModalHeader>
            <ModalContent style={{ marginTop: "10px" }}>
                {...buttons}
            </ModalContent>
        </ModalRoot >
    );
}
