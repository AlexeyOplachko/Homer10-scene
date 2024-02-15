import { Button, Dropdown, IconName, Menu } from "@grafana/ui";
import React from "react";
export interface DropdownItem {
    label: string;
    icon: IconName;
    onClick: Function;
}
export interface SettingDropdownProps {
    dropdownItems: DropdownItem[]
}
export const SettingDropdown = ({ dropdownItems }: SettingDropdownProps) => {
    const menu = (
        <Menu>
            <span>{dropdownItems.map((child, index) => {
                return (
                    <Menu.Item key={index} label={child.label} icon={child.icon} onClick={() => child.onClick()} />
                )
            })}</span>
        </Menu>
    );
    return (
        <Dropdown overlay={menu}>
            <Button icon="bars" fill="text" variant="secondary" />
        </Dropdown>
    )
}
