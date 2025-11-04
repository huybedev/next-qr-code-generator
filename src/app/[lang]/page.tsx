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
              {/* TypeSelection */}
              <div className="w-full md:flex-1 flex">
                <div className="w-full md:h-full">
                  <TypeSelection dict={dict} />
                </div>
              </div>

              {/* QrGenerated */}
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