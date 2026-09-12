import './globals.css';
export const metadata = { title: 'JurisAI', description: 'Tax Engine MVP' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className="dark"><body className="bg-[#090d16] text-[#f3f4f6]">{children}</body></html>;
}
