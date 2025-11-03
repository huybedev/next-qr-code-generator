import { create } from "zustand";

/**
 * Interface cho dữ liệu QR
 * - Mỗi loại QR sẽ có các field khác nhau
 * - Sử dụng Record để lưu trữ linh hoạt các field name và value
 */
interface QRDataState {
  // Dữ liệu QR dạng key-value, ví dụ: { url: "https://...", text: "..." }
  qrData: Record<string, string>;

  // Hàm set một field cụ thể
  setField: (fieldName: string, value: string) => void;

  // Hàm reset toàn bộ dữ liệu
  resetData: () => void;

  // Hàm set nhiều field cùng lúc
  setData: (data: Record<string, string>) => void;
}

/**
 * Zustand Store cho QR Data
 * 
 * CÁCH HOẠT ĐỘNG:
 * 1. Component TypeSelection sẽ gọi setField() mỗi khi user nhập liệu
 * 2. Component QrGenerated sẽ subscribe vào qrData để tự động re-render
 * 3. Khi qrType thay đổi, component TypeSelection sẽ gọi resetData()
 * 
 * ƯU ĐIỂM của Zustand với React 19:
 * - Tự động re-render chỉ component sử dụng state đó
 * - Không cần Provider wrapper như Context API
 * - Type-safe với TypeScript
 * - Dễ debug với DevTools
 */
export const useQRDataStore = create<QRDataState>((set) => ({
  // State ban đầu
  qrData: {},

  // Set một field đơn lẻ
  setField: (fieldName, value) =>
    set((state) => ({
      qrData: {
        ...state.qrData,
        [fieldName]: value,
      },
    })),

  // Reset toàn bộ data về rỗng
  resetData: () => set({ qrData: {} }),

  // Set nhiều field cùng lúc (hữu ích khi load data từ server)
  setData: (data) => set({ qrData: data }),
}));
