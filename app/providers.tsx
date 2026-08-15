"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import {
  NotificationProvider
} from "../components/NotificationContext";
import RealtimeNotificationBridge from "../components/RealtimeNotificationBridge";
import ThemeProvider from "../components/ThemeProvider";
import I18nProvider from "../components/I18nProvider";


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

      <ThemeProvider>
      <I18nProvider>
      <NotificationProvider>

        <RealtimeNotificationBridge />

        {children}

      </NotificationProvider>
      </I18nProvider>
      </ThemeProvider>

    </QueryClientProvider>

  );

}
