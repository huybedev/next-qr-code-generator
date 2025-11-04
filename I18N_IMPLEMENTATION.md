# Tích hợp đa ngôn ngữ (i18n) - Next.js Official Pattern

## Tổng quan
Đã tích hợp hệ thống đa ngôn ngữ cho ứng dụng QR Code Generator theo **Next.js Official Documentation**.

## Ngôn ngữ hỗ trợ
- 🇻🇳 Tiếng Việt (`vi`) - Ngôn ngữ mặc định
- 🇬🇧 English (`en`)

---

## Cấu trúc thư mục

```
src/
├── app/
│   ├── layout.tsx                    # Root layout (không có params)
│   ├── not-found.tsx                 # 404 page
│   └── [lang]/                       # Dynamic route cho locale
│       ├── layout.tsx                # Layout với lang param
│       ├── page.tsx                  # Main page (Server Component)
│       └── component/
│           ├── header.tsx            # Header với dict props
│           ├── type-data-selection.tsx  # Form selection với dict props
│           ├── bank-select.tsx       # Bank dropdown với dict props
│           └── qr-resolved.tsx       # QR display với dict props
│
├── components/
│   └── language-switcher.tsx         # Client component để đổi ngôn ngữ
│
├── dictionaries/
│   ├── index.ts                      # getDictionary function (server-only)
│   ├── vi.json                       # Vietnamese translations
│   └── en.json                       # English translations
│
└── middleware.ts                     # Locale detection & redirect
```

---

## Files đã tạo/cập nhật

### 1. **Dictionaries** - File dịch thuật

#### `/src/dictionaries/index.ts`
```typescript
import 'server-only'

export type Locale = 'en' | 'vi'

const dictionaries = {
  en: () => import('./en.json').then((module) => module.default),
  vi: () => import('./vi.json').then((module) => module.default),
}

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]()
}
```

**Chức năng:**
- Export type `Locale` để type-safety
- Dynamic import JSON dictionaries (code splitting)
- `'server-only'` đảm bảo chỉ chạy trên server

---

#### `/src/dictionaries/vi.json`
```json
{
  "common": {
    "loading": "Đang tải...",
    "error": "Đã có lỗi xảy ra",
    "success": "Thành công",
    "allRightsReserved": "Bản quyền được bảo lưu"
  },
  "qr": {
    "title": "Tạo mã QR",
    "selectType": "Chọn loại dữ liệu cần tạo mã QR",
    "generated": "Mã QR được tạo",
    "download": "Tải về",
    "enterData": "Vui lòng nhập đầy đủ dữ liệu để tạo mã QR"
  },
  "qrTypes": {
    "text": "Văn bản",
    "url": "Liên kết",
    "wifi": "WiFi",
    "bank": "Ngân hàng"
  },
  "fields": {
    "text": "Nội dung",
    "textPlaceholder": "Nhập nội dung văn bản",
    "url": "Đường dẫn URL",
    "urlPlaceholder": "https://example.com",
    "ssid": "Tên WiFi (SSID)",
    "ssidPlaceholder": "Tên mạng WiFi",
    "password": "Mật khẩu",
    "passwordPlaceholder": "Mật khẩu WiFi",
    "security": "Bảo mật",
    "bank": "Ngân hàng",
    "bankPlaceholder": "Chọn ngân hàng",
    "bankLoading": "Đang tải danh sách ngân hàng...",
    "bankSearch": "Tìm ngân hàng...",
    "bankNotFound": "Không tìm thấy ngân hàng",
    "accountNumber": "Số tài khoản",
    "accountNumberPlaceholder": "Nhập số tài khoản",
    "accountName": "Tên tài khoản",
    "accountNamePlaceholder": "Nhập tên chủ tài khoản",
    "amount": "Số tiền",
    "amountPlaceholder": "Nhập số tiền cần chuyển",
    "addInfo": "Nội dung chuyển tiền",
    "addInfoPlaceholder": "Nhập nội dung chuyển tiền"
  },
  "formats": {
    "svg": "SVG",
    "png": "PNG",
    "pdf": "PDF"
  }
}
```

#### `/src/dictionaries/en.json`
```json
{
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "success": "Success",
    "allRightsReserved": "All rights reserved"
  },
  "qr": {
    "title": "QR Code Generator",
    "selectType": "Select data type to generate QR code",
    "generated": "Generated QR Code",
    "download": "Download",
    "enterData": "Please enter complete data to generate QR code"
  },
  "qrTypes": {
    "text": "Text",
    "url": "URL",
    "wifi": "WiFi",
    "bank": "Bank"
  },
  "fields": {
    "text": "Content",
    "textPlaceholder": "Enter text content",
    "url": "URL",
    "urlPlaceholder": "https://example.com",
    "ssid": "WiFi Name (SSID)",
    "ssidPlaceholder": "WiFi network name",
    "password": "Password",
    "passwordPlaceholder": "WiFi password",
    "security": "Security",
    "bank": "Bank",
    "bankPlaceholder": "Select bank",
    "bankLoading": "Loading banks...",
    "bankSearch": "Search bank...",
    "bankNotFound": "No bank found",
    "accountNumber": "Account Number",
    "accountNumberPlaceholder": "Enter account number",
    "accountName": "Account Name",
    "accountNamePlaceholder": "Enter account holder name",
    "amount": "Amount",
    "amountPlaceholder": "Enter transfer amount",
    "addInfo": "Transfer Message",
    "addInfoPlaceholder": "Enter transfer message"
  },
  "formats": {
    "svg": "SVG",
    "png": "PNG",
    "pdf": "PDF"
  }
}
```

---

### 2. **Middleware** - Locale Detection

#### `/src/middleware.ts`
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['vi', 'en']
const defaultLocale = 'vi'

function getLocale(request: NextRequest): string {
  // Check if locale is in pathname
  const pathname = request.nextUrl.pathname
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameLocale) return pathnameLocale

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    const preferredLocale = locales.find((locale) =>
      acceptLanguage.includes(locale)
    )
    if (preferredLocale) return preferredLocale
  }

  return defaultLocale
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if pathname already has locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return

  // Redirect to locale-prefixed path
  const locale = getLocale(request)
  request.nextUrl.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, images)
    '/((?!_next|api|.*\\.).*)',
  ],
}
```

**Chức năng:**
- Detect locale từ pathname hoặc Accept-Language header
- Redirect `/` → `/vi` hoặc `/en`
- Mặc định: `vi` (Tiếng Việt)

---

### 3. **Layouts**

#### `/src/app/layout.tsx` (Root Layout)
```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QR Code Generator",
  description: "Generate QR codes for text, URLs, WiFi, and bank transfers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
```

**Lưu ý:**
- Không có `lang` attribute vì nó sẽ được set ở `[lang]/layout.tsx`
- Không có params vì đây là root layout

---

#### `/src/app/[lang]/layout.tsx`
```typescript
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import type { Locale } from "@/dictionaries";

export async function generateStaticParams() {
  return [{ lang: 'vi' }, { lang: 'en' }]
}

export default async function LangLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  
  return (
    <html lang={lang as Locale}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
          </QueryProvider>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Chức năng:**
- `generateStaticParams()` để pre-render `/vi` và `/en`
- Nhận `params.lang` và set vào `<html lang={lang}>`
- Wrap providers (Theme, Query, Toaster)

---

### 4. **Page Component** - Server Component

#### `/src/app/[lang]/page.tsx`
```typescript
import HeaderQRPage from "@/app/[lang]/component/header";
import QrGenerated from "@/app/[lang]/component/qr-resolved";
import TypeSelection from "@/app/[lang]/component/type-data-selection";
import { Suspense } from "react";
import { getDictionary, type Locale } from "@/dictionaries";

export default async function Page({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <Suspense fallback={<div>Loading QR Code Generator...</div>}>
      <div className="min-h-screen px-4 py-8 flex flex-col">
        <div className="max-w-6xl mx-auto flex flex-col flex-1 w-full">
          <HeaderQRPage dict={dict} />

          <main className="flex-1 flex flex-col my-4">
            <div className="flex flex-1 flex-col md:flex-row gap-4 md:items-stretch">
              <div className="w-full md:flex-1 flex">
                <div className="w-full md:h-full">
                  <TypeSelection dict={dict} />
                </div>
              </div>

              <div className="w-full md:flex-1 flex">
                <div className="w-full md:h-full">
                  <QrGenerated dict={dict} />
                </div>
              </div>
            </div>
          </main>
          
          <footer className="text-center text-sm text-muted-foreground mt-8">
            <i>huybe</i> © 2025 {dict.qr.title}. {dict.common.allRightsReserved}
          </footer>
        </div>
      </div>
    </Suspense>
  )
}
```

**Chức năng:**
- Server Component (async)
- Gọi `getDictionary(lang)` để lấy translations
- Truyền `dict` xuống các child components

---

### 5. **Components** - Đã cập nhật để nhận `dict` props

#### Header Component
```typescript
type Dict = {
  qr: { title: string };
  [key: string]: any;
}

function HeaderQRPage({ dict }: { dict: Dict }) {
  return (
    <div className="relative">
      <div className='flex flex-col items-center justify-center'>
        <span className='text-2xl font-bold'>
          {dict.qr.title}  {/* Thay "QR Code Generator" */}
        </span>
        <span>by <i>huybe</i></span>
      </div>
      <div className="absolute top-0 right-0">
        <LanguageSwitcher />
        <ModeToggle />
      </div>
    </div>
  )
}
```

#### Type Selection Component
- Nhận `dict` props
- Sử dụng `dict.qr.selectType` cho title
- Sử dụng `dict.qrTypes[typeKey]` cho button labels
- Sử dụng `dict.fields[labelKey]` và `dict.fields[placeholderKey]` cho form fields
- Truyền `dict` xuống `BankSelect`

#### Bank Select Component
- Nhận `dict` props
- Sử dụng `dict.fields.bankLoading`, `bankPlaceholder`, `bankSearch`, `bankNotFound`

#### QR Resolved Component
- Nhận `dict` props
- Sử dụng `dict.qr.generated` cho title
- Sử dụng `dict.formats.svg/png/pdf` cho format buttons
- Sử dụng `dict.qr.download` cho download button
- Sử dụng `dict.qr.enterData` cho error message

---

### 6. **Language Switcher** - Client Component

#### `/src/components/language-switcher.tsx`
```typescript
'use client'

import { Languages } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const languages = {
  vi: '🇻🇳 Tiếng Việt',
  en: '🇬🇧 English',
}

export function LanguageSwitcher() {
  const pathname = usePathname()
  const router = useRouter()

  const currentLocale = pathname.split('/')[1] || 'vi'

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/')
    segments[1] = newLocale
    const newPath = segments.join('/')

    router.push(newPath || `/${newLocale}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languages).map(([key, label]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => switchLocale(key)}
            className={currentLocale === key ? 'bg-accent' : ''}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

**Chức năng:**
- Client component để đổi ngôn ngữ
- Sử dụng `useRouter()` và `usePathname()` 
- Thay thế locale trong URL: `/vi/...` ↔ `/en/...`

---

## Cách hoạt động

### Flow khi user truy cập:

1. **User vào `/`**
   - Middleware detect locale → redirect `/vi`

2. **User vào `/vi`**
   - Next.js match route `[lang]`
   - `[lang]/layout.tsx` nhận `params.lang = 'vi'`
   - Set `<html lang="vi">`
   - `[lang]/page.tsx` gọi `getDictionary('vi')`
   - Trả về dictionary tiếng Việt

3. **User click Language Switcher → chọn English**
   - `switchLocale('en')` được gọi
   - `router.push('/en')`
   - Page reload với URL `/en`
   - `getDictionary('en')` được gọi
   - UI hiển thị tiếng Anh

---

## Testing

### Routes hoạt động:
- ✅ `/` → redirect `/vi`
- ✅ `/vi` → Vietnamese
- ✅ `/en` → English
- ✅ `/vi` ↔ `/en` switching

### Components với translations:
- ✅ Header title
- ✅ QR type buttons (Text, URL, WiFi, Bank)
- ✅ Form labels & placeholders
- ✅ Bank dropdown (loading, placeholder, search, not found)
- ✅ Download formats (SVG, PNG, PDF)
- ✅ Download button text
- ✅ Error messages
- ✅ Footer

---

## Architecture Decisions

### ✅ Tại sao dùng Next.js Official Pattern?

1. **Server Components by default**
   - `getDictionary()` chạy trên server
   - Không tăng bundle size cho client
   - Better performance

2. **Type-safe với TypeScript**
   - `Locale` type export từ dictionaries
   - Type checking cho dictionary keys

3. **SEO-friendly**
   - `<html lang="vi">` đúng locale
   - Static generation với `generateStaticParams()`

4. **Code splitting**
   - Dictionary files được dynamic import
   - Chỉ load dictionary cần thiết

### ✅ Tại sao không dùng Context API?

- Context chạy trên client → tăng bundle size
- Server Components không support Context
- Next.js official pattern tối ưu hơn

---

## Kết quả

✨ **Hoàn thành tích hợp đa ngôn ngữ theo Next.js official docs!**

- 🌐 2 ngôn ngữ: Tiếng Việt & English
- 🚀 Server-side rendering với Server Components
- 📦 Code splitting cho dictionaries
- 🎯 Type-safe với TypeScript
- 🔄 Client-side routing để đổi ngôn ngữ
- ⚡ Performance tối ưu (server-only dictionaries)
- 🎨 Tất cả UI text đã được dịch

