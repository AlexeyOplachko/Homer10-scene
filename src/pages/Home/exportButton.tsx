import { DropdownItem } from "components/SettingDropdown/SettingDropdown";


export const ExportButtonPNG: DropdownItem = {
    label: 'Export flow as PNG',
    icon: 'file-download',
    onClick: () => document.dispatchEvent(new CustomEvent('export-flow-as-png'))

}
export const ExportButtonTXT: DropdownItem = {
    label: 'Export flow as TXT',
    icon: 'file-download',
    onClick: () => document.dispatchEvent(new CustomEvent('export-flow-as-text'))

}
