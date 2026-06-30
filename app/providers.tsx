"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import {
  NotificationProvider
} from "././components/NotificationContext";

export default function Providers({
  children
}: any) {

  const [queryClient] =
    useState(
      () => new QueryClient()
    );

  return (

    <QueryClientProvider
      client={queryClient}
    >

      <NotificationProvider>

        {children}

      </NotificationProvider>

    </QueryClientProvider>

  );

}