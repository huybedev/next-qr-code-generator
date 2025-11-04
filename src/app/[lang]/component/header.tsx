'use client'

import { LanguageSwitcher } from "@/components/language-switcher"
import { ModeToggle } from "@/components/theme-mode-toggle"

type Dict = {
  qr: {
    title: string;
  };
  [key: string]: any;
}

function HeaderQRPage({ dict }: { dict: Dict }) {
  return (
    <div className="relative">

      <div className='flex flex-col items-center justify-center'>
        <span className='text-2xl font-bold'>
          {dict.qr.title}
        </span>
        <span>
          by <i>huybe</i>
        </span>
      </div>
      <div className="absolute top-0 right-0 gap-2 flex">

        <LanguageSwitcher />
        <ModeToggle />
      </div>
    </div>
  )
}

export default HeaderQRPage