import { VizPanel } from "@grafana/scenes";
import { Button, Dropdown, IconName, Menu } from "@grafana/ui";
import { DebugModal } from "pages/Home/QueryDebugModal/DebugModal";
import { QueryHistoryModal } from "pages/Home/QueryHistoryModal/QueryHistoryModal";
import React, { useEffect, useState } from "react";
export interface DropdownItem {
    label: string;
    icon: IconName;
    onClick: Function;
    componentName?: string;
}
export interface SettingDropdownProps {
    dropdownItems: DropdownItem[]
    getParent: () => VizPanel;
    getSearchPanel: () => VizPanel
}
export interface State {
    get: boolean
    set: Function
}
export interface States {
    [key: string]: State
}
export const SettingDropdown = ({ dropdownItems, getParent, getSearchPanel }: SettingDropdownProps) => {
    const [isDebugModalOpen, setIsDebugModalOpen] = useState(false)
    const [isQueryHistoryModalOpen, setIsQueryHistoryModalOpen] = useState(false)
    const [states, setStates] = useState<States>({})
    useEffect(() => {
        setStates({
            'DebugModal': {
                get: isDebugModalOpen,
                set: setIsDebugModalOpen
            },
            'QueryHistoryModal': {
                get: isQueryHistoryModalOpen,
                set: setIsQueryHistoryModalOpen
            }
        })
    }, [setStates, isDebugModalOpen, setIsDebugModalOpen, isQueryHistoryModalOpen, setIsQueryHistoryModalOpen])
    const menu = (
        <Menu>
            <span>{dropdownItems.map((child, index) => {
                return (
                    <Menu.Item key={index} label={child.label} icon={child.icon} onClick={() => {
                        if (typeof child.componentName !== 'undefined' && typeof states[child.componentName] !== 'undefined') {
                            child.onClick(states[child.componentName])
                        } else {
                            child.onClick()
                        }
                    }} />
                )
            })}</span>
        </Menu>
    );
    return (
        <span>
            <Dropdown overlay={menu}>
                <Button icon="bars" fill="text" variant="secondary" />

            </Dropdown>
            {dropdownItems.find(item => item.componentName === 'DebugModal') && <DebugModal modalIsOpen={isDebugModalOpen} setModalIsOpen={setIsDebugModalOpen} />}
            {dropdownItems.find(item => item.componentName === 'QueryHistoryModal') && <QueryHistoryModal modalIsOpen={isQueryHistoryModalOpen} setModalIsOpen={setIsQueryHistoryModalOpen} getParent={getSearchPanel} />}

        </span>


    )
}
