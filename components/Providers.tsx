"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { SWRConfig } from "swr";
import { Toaster } from "react-hot-toast";

const swrFetcher = async (url: string) => {
  const res = await fetch(url);
  
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    const errorData = await res.json();
    (error as any).info = errorData;
    (error as any).status = res.status;
    throw error;
  }
  
  return res.json();
};

interface ProvidersProps {
  children: React.ReactNode;
  session: Session | null;
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <SWRConfig
        value={{
          fetcher: swrFetcher,
          onError: (err) => {
            console.error(err);
          },
        }}
      >
        <Toaster position="top-center" />
        {children}
      </SWRConfig>
    </SessionProvider>
  );
}
