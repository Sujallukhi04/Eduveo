'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';

// Define the props for our provider component
interface ProvidersProps {
  children: React.ReactNode;
}

// Create the Providers component
const Providers = ({ children }: ProvidersProps) => {
  // Wrap the children with the SessionProvider from next-auth
  return <SessionProvider>{children}</SessionProvider>;
};

export default Providers;

