import { CaseSensitive, Landmark, Link2, Wifi } from 'lucide-react';
import { QRType } from "@/enums/qr.enum";

export const QR_TYPES_DATA = [
  {
    type: QRType.TEXT,
    label: "Text",
    icon: CaseSensitive,
  },
  {
    type: QRType.WIFI,
    label: "WiFi",
    icon: Wifi,
  },
  {
    type: QRType.URL,
    label: "Liên kết",
    icon: Link2,
  },
  {
    type: QRType.BANK,
    label: "Ngân hàng",
    icon: Landmark,
  },
]

export const QR_TYPE_FIELDS = {
  [QRType.URL]: [
    {
      name: 'url',
      labelKey: 'field_url',
      type: 'url',
      placeholderKey: 'placeholder_url',
      hasCampaign: true,
    },
  ],
  [QRType.TEXT]: [
    {
      name: 'text',
      labelKey: 'field_text',
      type: 'text',
      placeholderKey: 'placeholder_text',
    },
  ],
  [QRType.WIFI]: [
    {
      name: 'ssid',
      labelKey: 'field_ssid',
      type: 'text',
      placeholderKey: 'placeholder_ssid',
    },
    {
      name: 'password',
      labelKey: 'field_password',
      type: 'text',
      placeholderKey: 'placeholder_password',
    },
    {
      name: 'security',
      labelKey: 'field_security',
      type: 'select',
      options: ['WPA', 'WEP', 'nopass'],
    },
  ],
  [QRType.BANK]: [
    {
      name: 'bin',
      labelKey: 'field_bin',
      type: 'select',
      options: 'dynamic-banks', // ⭐ Special marker cho dynamic data
      required: true,
    },
    {
      name: 'account_number',
      labelKey: 'field_account_number',
      type: 'text',
      placeholderKey: 'placeholder_account_number',
      required: true,
    },
    {
      name: 'account_name',
      labelKey: 'field_account_name',
      type: 'text',
      placeholderKey: 'placeholder_account_name',
      required: true,
    },
    {
      name: 'amount',
      labelKey: 'field_amount',
      type: 'number',
      placeholderKey: 'placeholder_amount',
    },
    {
      name: 'add_info',
      labelKey: 'field_add_info',
      type: 'text',
      placeholderKey: 'placeholder_add_info',
    },
  ],
}