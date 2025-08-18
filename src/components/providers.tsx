"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import React from "react";

// Define the props for our provider component
interface ProvidersProps {
  children: React.ReactNode;
}

// Create the Providers component
const Providers = ({ children }: ProvidersProps) => {
  // Wrap the children with the SessionProvider from next-auth
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  );
};

export default Providers;
