import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@lib/auth";
import { Providers } from "@components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: {
    default: "Medical Survey Platform",
    template: "%s | Medical Survey Platform",
  },
  description: "A platform for pharmaceutical companies to create and manage surveys for doctors",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
