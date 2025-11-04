
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

  return <>{children}</>;
}
