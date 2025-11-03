import { QRType } from "@/enums/qr.enum";

/**
 * FORMAT QR CODE DATA
 * 
 * Utils này chuyển đổi dữ liệu từ form inputs thành format QR code chuẩn
 * Mỗi loại QR có format khác nhau:
 * - TEXT: Trả về text thô
 * - URL: Trả về URL (có thể thêm UTM tracking)
 * - WIFI: Format chuẩn WIFI:T:WPA;S:ssid;P:password;;
 */

/**
 * Format dữ liệu WiFi theo chuẩn QR Code WiFi
 * Format: WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:false;;
 * 
 * @param data - Object chứa ssid, password, security
 * @returns String đã format cho QR WiFi
 */
function formatWiFiData(data: Record<string, string>): string {
  const { ssid = '', password = '', security = 'WPA' } = data;

  // Nếu không có SSID, return empty
  if (!ssid) return '';

  // Format chuẩn WiFi QR: WIFI:T:type;S:ssid;P:password;H:hidden;;
  return `WIFI:T:${security};S:${ssid};P:${password};H:false;;`;
}

function formatBankData(data: Record<string, string>): string {
  const accountNumber = data?.account_number ?? ''
  const accountName = data?.account_name ?? ''
  const amount = data?.amount ?? ''
  const addInfo = data?.add_info ?? ''
  const bin = data?.bin ?? ''

  if (!bin || !accountNumber) return ''
  return `https://img.vietqr.io/image/${bin}-${accountNumber}-qr_with_logo.png?amount=${amount}&addInfo=${addInfo}&accountName=${accountName}`
}

/**
 * Format dữ liệu URL
 * Đảm bảo URL có protocol (http/https)
 * 
 * @param data - Object chứa url
 * @returns URL đã format
 */
function formatURLData(data: Record<string, string>): string {
  const { url = '' } = data;

  if (!url) return '';

  // Thêm https:// nếu URL không có protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }

  return url;
}

/**
 * Format dữ liệu TEXT
 * Return text thô
 * 
 * @param data - Object chứa text
 * @returns Text đã format
 */
function formatTextData(data: Record<string, string>): string {
  return data.text || '';
}

/**
 * MAIN FORMATTER FUNCTION
 * 
 * Hàm chính để format QR data dựa trên type
 * Sử dụng trong component QrGenerated để convert store data thành QR value
 * 
 * @param qrType - Loại QR (TEXT, URL, WIFI...)
 * @param qrData - Dữ liệu từ store
 * @returns String đã format sẵn sàng cho QR Code
 * 
 * VÍ DỤ SỬ DỤNG:
 * const qrValue = formatQRData(QRType.WIFI, { ssid: 'MyWiFi', password: '12345', security: 'WPA' })
 * // => "WIFI:T:WPA;S:MyWiFi;P:12345;H:false;;"
 */
export function formatQRData(
  qrType: QRType | null,
  qrData: Record<string, string>
): string {
  if (!qrType) return '';

  switch (qrType) {
    case QRType.TEXT:
      return formatTextData(qrData);

    case QRType.URL:
      return formatURLData(qrData);

    case QRType.WIFI:
      return formatWiFiData(qrData);

    case QRType.BANK:
      return formatBankData(qrData);

    // Thêm các type khác ở đây

    default:
      return '';
  }
}

/**
 * GET LABEL TEXT
 * 
 * Hàm helper để lấy text hiển thị cho label
 * Tạm thời hard-code, sau này có thể dùng i18n
 */
export function getFieldLabel(labelKey: string): string {
  const labels: Record<string, string> = {
    field_url: 'Địa chỉ URL',
    field_text: 'Nội dung văn bản',
    field_ssid: 'Tên WiFi (SSID)',
    field_password: 'Mật khẩu WiFi',
    field_security: 'Loại bảo mật',
    field_account_number: 'Số tài khoản',
    field_bin: 'Chọn ngân hàng',
    field_account_name: 'Chủ tài khoản',
    field_amount: 'Số tiền',
    field_add_info: 'Nội dung chuyển tiền',
  };

  return labels[labelKey] || labelKey;
}

/**
 * GET PLACEHOLDER TEXT
 */
export function getFieldPlaceholder(placeholderKey: string): string {
  const placeholders: Record<string, string> = {
    placeholder_url: 'https://example.com',
    placeholder_text: 'Nhập nội dung cần mã hóa...',
    placeholder_ssid: 'Tên mạng WiFi',
    placeholder_password: 'Mật khẩu WiFi',
    placeholder_account_number: 'Nhập số tài khoản',
    placeholder_account_name: 'Nhập tên chủ tài khoản',
    placeholder_amount: 'Nhập số tiền cần chuyển',
    placeholder_add_info: 'Nhập nội dung chuyển tiền',
  };

  return placeholders[placeholderKey] || '';
}
