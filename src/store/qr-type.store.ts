import { QRType } from "@/enums/qr.enum";
import { create } from "zustand";

interface Props {
  qrType: QRType | null;
  setQrType: (type: QRType) => void;

}

export const useQrTypeStore = create<Props>((set) => ({
  qrType: QRType.TEXT,
  setQrType: (type) => set({ qrType: type }),
}))