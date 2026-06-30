"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode
} from "react";

import Notification from "./Notification";

type NotifyData = {
  title: string;
  text: string;
  icon?: string;
};

type NotificationContextType = {
  notify: (data: NotifyData) => void;
};

const NotificationContext =
  createContext<NotificationContextType | null>(null);

export function NotificationProvider({
  children
}:{
  children: ReactNode;
}){

  const [notification, setNotification] =
    useState<NotifyData | null>(null);

  function notify(data: NotifyData){

    setNotification(data);

  }

  return(

    <NotificationContext.Provider
      value={{ notify }}
    >

      {children}

      {notification && (

        <Notification

          title={notification.title}

          text={notification.text}

          icon={notification.icon}

          onClose={()=>
            setNotification(null)
          }

        />

      )}

    </NotificationContext.Provider>

  );

}

export function useNotification(){

  const context =
    useContext(NotificationContext);

  if(!context){

    throw new Error(
      "NotificationProvider not found"
    );

  }

  return context;

}