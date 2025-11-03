import HeaderQRPage from "@/app/component/header";
import QrGenerated from "@/app/component/qr-resolved";
import TypeSelection from "@/app/component/type-data-selection";
import { Suspense } from "react";

export default async function Page() {
  return (
    <Suspense fallback={<div>Loading QR Code Generator...</div>}>
      <div className="min-h-screen px-4 py-8 flex flex-col">
        <div className="max-w-6xl mx-auto flex flex-col flex-1 w-full">
          <HeaderQRPage />

          <main className="flex-1 flex flex-col my-4">
            <div className="flex flex-1 flex-col md:flex-row gap-4 md:items-stretch">
              {/* TypeSelection */}
              <div className="w-full md:flex-1 flex">
                <div className="w-full md:h-full">
                  <TypeSelection />
                </div>
              </div>

              {/* QrGenerated */}
              <div className="w-full md:flex-1 flex">
                <div className="w-full md:h-full">
                  <QrGenerated />
                </div>
              </div>
            </div>
          </main>
          <footer className="text-center text-sm text-muted-foreground mt-8">
            <i>huybe</i> © 2025 QR Code Generator. All rights reserved.
          </footer>
        </div>
      </div>

    </Suspense>
  )
}