# 🏗️ KIẾN TRÚC QR CODE GENERATOR - GIẢI THÍCH CHI TIẾT

## 📋 Tổng quan

Dự án này sử dụng **React 19**, **Next.js 15**, **Zustand** và **TypeScript** để xây dựng một ứng dụng tạo mã QR động với nhiều loại dữ liệu khác nhau.

---

## 🔄 FLOW DỮ LIỆU (Data Flow)

```
User chọn loại QR (Text/URL/WiFi)
         ↓
   useQrTypeStore.setQrType(type)
         ↓
   TypeSelection component re-render
         ↓
   Hiển thị dynamic form inputs dựa trên QR_TYPE_FIELDS
         ↓
User nhập dữ liệu vào inputs (ví dụ: WiFi password)
         ↓
   useQRDataStore.setField(fieldName, value)
         ↓
   QrGenerated component tự động re-render (React subscribe)
         ↓
   useMemo tính toán lại qrValue = formatQRData(qrType, qrData)
         ↓
   QRCode component render mã QR mới
```

---

## 📁 CẤU TRÚC FILE

### 1. **Stores (Zustand State Management)**

#### `/src/store/qr-type.store.ts`
```typescript
// Store lưu loại QR đang được chọn (TEXT, URL, WIFI...)
interface Props {
  qrType: QRType | null;
  setQrType: (type: QRType) => void;
}
```
**Mục đích:**
- Lưu loại QR hiện tại
- Sync giữa TypeSelection (chọn type) và QrGenerated (hiển thị QR)

#### `/src/store/qr-data.store.ts`
```typescript
// Store lưu dữ liệu người dùng nhập vào
interface QRDataState {
  qrData: Record<string, string>;  // { url: "...", ssid: "...", password: "..." }
  setField: (fieldName: string, value: string) => void;
  resetData: () => void;
  setData: (data: Record<string, string>) => void;
}
```
**Mục đích:**
- Lưu tất cả dữ liệu input từ user
- Dùng Record<string, string> để linh hoạt với nhiều loại QR khác nhau
- TypeSelection gọi `setField()` khi user type
- QrGenerated subscribe `qrData` để tự động cập nhật QR

---

### 2. **Constants (Cấu hình)**

#### `/src/constants/qr-types.constant.ts`

```typescript
// Danh sách các loại QR hỗ trợ
export const QR_TYPES_DATA = [
  { type: QRType.TEXT, label: "Text", icon: CaseSensitive },
  { type: QRType.WIFI, label: "WiFi", icon: Wifi },
  { type: QRType.URL, label: "Liên kết", icon: Link2 },
]

// Định nghĩa fields cho từng loại QR
export const QR_TYPE_FIELDS = {
  [QRType.URL]: [
    { name: 'url', labelKey: 'field_url', type: 'url', placeholderKey: 'placeholder_url' }
  ],
  [QRType.TEXT]: [
    { name: 'text', labelKey: 'field_text', type: 'text', placeholderKey: 'placeholder_text' }
  ],
  [QRType.WIFI]: [
    { name: 'ssid', labelKey: 'field_ssid', type: 'text' },
    { name: 'password', labelKey: 'field_password', type: 'text' },
    { name: 'security', labelKey: 'field_security', type: 'select', options: ['WPA', 'WEP', 'nopass'] }
  ],
}
```

**Cách hoạt động:**
- `QR_TYPES_DATA`: Render buttons chọn loại QR
- `QR_TYPE_FIELDS`: Dynamic form generation - TypeSelection tự động render đúng số lượng và loại input

---

### 3. **Utils (Xử lý logic)**

#### `/src/lib/qr-formatter.ts`

```typescript
export function formatQRData(
  qrType: QRType | null,
  qrData: Record<string, string>
): string
```

**Chức năng:**
- Convert dữ liệu từ store thành format QR Code chuẩn
- Mỗi loại QR có format riêng:
  - **TEXT**: Return text thô
  - **URL**: Thêm https:// nếu thiếu
  - **WIFI**: Format chuẩn `WIFI:T:WPA;S:ssid;P:password;;`
  - **EMAIL**: `mailto:email@example.com`
  - **PHONE**: `tel:+84123456789`

**Ví dụ:**
```typescript
// Input
qrType = QRType.WIFI
qrData = { ssid: "MyWiFi", password: "123456", security: "WPA" }

// Output
"WIFI:T:WPA;S:MyWiFi;P:123456;H:false;;"
```

---

### 4. **Components**

#### `TypeSelection` Component

**Trách nhiệm:**
1. Hiển thị buttons chọn loại QR
2. Dynamic render form inputs dựa trên `QR_TYPE_FIELDS`
3. Capture user input và cập nhật vào store

**Code flow:**
```typescript
// 1. User click button chọn WiFi
handleTypeChange(QRType.WIFI)
  -> setQrType(QRType.WIFI)  // Update type store
  -> resetData()              // Clear old data
  -> Component re-render với WiFi fields

// 2. User nhập password
handleInputChange('password', '123456')
  -> setField('password', '123456')  // Update data store
  -> QrGenerated tự động re-render
```

**Key Features:**
- **Dynamic Form**: Tự động render đúng số lượng inputs
- **Type Safety**: TypeScript kiểm tra field types
- **React 19**: Automatic batching - nhiều setField() chỉ trigger 1 re-render

---

#### `QrGenerated` Component

**Trách nhiệm:**
1. Subscribe vào 2 stores: `qrType` và `qrData`
2. Format dữ liệu thành chuỗi QR
3. Render QR Code

**Code flow:**
```typescript
// 1. Subscribe stores
const { qrType } = useQrTypeStore()
const { qrData } = useQRDataStore()

// 2. useMemo optimization
const qrValue = useMemo(() => {
  return formatQRData(qrType, qrData)
}, [qrType, qrData])  // Chỉ re-compute khi dependency thay đổi

// 3. Render QR
<QRCode value={qrValue} size={256} level="H" />
```

**Tối ưu với React 19:**
- `useMemo`: Cache qrValue, chỉ tính lại khi qrType/qrData thay đổi
- Concurrent Rendering: Render QR không block UI thread
- Automatic Batching: Multiple state updates = 1 render

---

## 🔥 CÔNG NGHỆ MỚI NHẤT (React 19)

### 1. **Automatic Batching**
```typescript
// React 18 trở xuống
setField('ssid', 'WiFi1')     // Re-render
setField('password', '123')   // Re-render
setField('security', 'WPA')   // Re-render
// Total: 3 re-renders

// React 19
setField('ssid', 'WiFi1')
setField('password', '123')
setField('security', 'WPA')
// Total: 1 re-render (batched automatically)
```

### 2. **useMemo Hook**
```typescript
const qrValue = useMemo(() => {
  console.log('Computing QR value...')
  return formatQRData(qrType, qrData)
}, [qrType, qrData])

// Only re-compute when qrType or qrData changes
// Not when component re-renders for other reasons
```

### 3. **Zustand với React 19**
```typescript
// Zustand tự động tích hợp React 19 concurrent features
// Components chỉ re-render khi state họ subscribe thực sự thay đổi

// TypeSelection subscribe: qrType, qrData
// QrGenerated subscribe: qrType, qrData
// Thay đổi qrData -> chỉ 2 components này re-render
```

---

## 🎯 WORKFLOW THỰC TẾ

### Scenario 1: Tạo QR WiFi

```
1. User click nút "WiFi"
   -> qrType = QRType.WIFI
   -> TypeSelection hiển thị 3 inputs: SSID, Password, Security

2. User nhập:
   - SSID: "CoffeeShop"
   - Password: "coffee123"
   - Security: "WPA"
   -> qrData = { ssid: "CoffeeShop", password: "coffee123", security: "WPA" }

3. QrGenerated tự động:
   - Nhận qrData từ store
   - formatQRData() -> "WIFI:T:WPA;S:CoffeeShop;P:coffee123;H:false;;"
   - QRCode render mã QR có thể scan được

4. User scan QR bằng điện thoại
   -> Tự động kết nối WiFi "CoffeeShop" với password "coffee123"
```

### Scenario 2: Chuyển từ WiFi sang URL

```
1. User đang ở WiFi mode (qrData có ssid, password, security)

2. User click nút "Liên kết"
   -> handleTypeChange(QRType.URL)
   -> setQrType(QRType.URL)
   -> resetData()  // ⚠️ Clear qrData cũ
   -> TypeSelection hiển thị 1 input: URL

3. User nhập URL: "example.com"
   -> qrData = { url: "example.com" }
   -> formatQRData() thêm https:// -> "https://example.com"
   -> QRCode render mã QR mới
```

---

## 🚀 CÁCH MỞ RỘNG

### Thêm loại QR mới (ví dụ: EMAIL)

#### Bước 1: Thêm vào enum
```typescript
// src/enums/qr.enum.ts
export enum QRType {
  EMAIL = "EMAIL",  // ← Thêm dòng này
  // ... các type khác
}
```

#### Bước 2: Thêm vào constants
```typescript
// src/constants/qr-types.constant.ts
export const QR_TYPES_DATA = [
  { type: QRType.EMAIL, label: "Email", icon: Mail },  // ← Thêm button
]

export const QR_TYPE_FIELDS = {
  [QRType.EMAIL]: [  // ← Định nghĩa fields
    { name: 'email', labelKey: 'field_email', type: 'email' },
    { name: 'subject', labelKey: 'field_subject', type: 'text' },
    { name: 'body', labelKey: 'field_body', type: 'textarea' },
  ],
}
```

#### Bước 3: Thêm formatter
```typescript
// src/lib/qr-formatter.ts
function formatEmailData(data: Record<string, string>): string {
  const { email, subject, body } = data;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function formatQRData(...) {
  switch (qrType) {
    case QRType.EMAIL:
      return formatEmailData(qrData);  // ← Thêm case
    // ... các case khác
  }
}
```

**Xong!** Component tự động:
- Hiển thị button EMAIL
- Render 3 inputs (email, subject, body)
- Format và tạo QR đúng định dạng

---

## 📊 PERFORMANCE

### Tối ưu với Zustand
```typescript
// ✅ GOOD: Chỉ subscribe state cần thiết
const qrType = useQrTypeStore(state => state.qrType)

// ❌ BAD: Subscribe toàn bộ store
const store = useQrTypeStore()
```

### Tối ưu với useMemo
```typescript
// ✅ GOOD: Cache expensive computation
const qrValue = useMemo(() => formatQRData(qrType, qrData), [qrType, qrData])

// ❌ BAD: Re-compute mỗi lần render
const qrValue = formatQRData(qrType, qrData)
```

---

## 🐛 DEBUG TIPS

### 1. Kiểm tra store state
```typescript
// Thêm vào component
useEffect(() => {
  console.log('Current qrType:', qrType)
  console.log('Current qrData:', qrData)
}, [qrType, qrData])
```

### 2. Kiểm tra QR value
```typescript
// Đã có sẵn trong QrGenerated component
<code className="bg-muted px-2 py-1 rounded">
  {qrValue}
</code>
```

### 3. Zustand DevTools
```typescript
import { devtools } from 'zustand/middleware'

export const useQRDataStore = create(
  devtools((set) => ({ ... }))
)
```

---

## ✅ BEST PRACTICES

1. **Separation of Concerns**
   - Stores: State management only
   - Components: UI rendering only
   - Utils: Business logic only

2. **Type Safety**
   - Sử dụng TypeScript cho tất cả
   - Define interfaces rõ ràng
   - Avoid `any` type

3. **Performance**
   - useMemo cho expensive computations
   - React.memo cho heavy components
   - Zustand selector cho granular subscriptions

4. **Maintainability**
   - Comment rõ ràng
   - Naming conventions nhất quán
   - File structure organized

---

## 🎓 KẾT LUẬN

Kiến trúc này cho phép:
- ✅ **Dễ mở rộng**: Thêm loại QR mới chỉ cần 3 bước
- ✅ **Type-safe**: TypeScript catch lỗi compile-time
- ✅ **Performance**: React 19 + Zustand optimize tự động
- ✅ **Maintainable**: Code clean, structured, well-documented
- ✅ **User-friendly**: Real-time QR generation, no lag

Happy coding! 🚀
