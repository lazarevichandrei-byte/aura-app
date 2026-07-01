"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  ReactNode
} from "react";

import Notification from "./Notification";

type NotifyData = {
  title: string;
  text: string;
  icon?: string;
  type?: "success" | "error" | "warning" | "info";
};

type NotificationContextType = {

  notify: (
    data: NotifyData
  ) => void;

  success: (
    title: string,
    text: string
  ) => void;

  error: (
    title: string,
    text: string
  ) => void;

  warning: (
    title: string,
    text: string
  ) => void;

  info: (
    title: string,
    text: string
  ) => void;

};

const NotificationContext =
  createContext<NotificationContextType | null>(null);

export function NotificationProvider({
  children
}:{
  children: ReactNode;
}){

  const queue =
    useRef<NotifyData[]>([]);

  const showing =
    useRef(false);

  const [notification,setNotification] =
    useState<NotifyData | null>(null);

  function showNext(){

 

  if(queue.current.length===0){

      showing.current=false;

      setNotification(null);

      return;

    }

    showing.current=true;

    setNotification(
      queue.current.shift() || null
    );

  }

  function notify(
  data: NotifyData
){

  queue.current.push(data);

  const tg =
  (window as any)?.Telegram?.WebApp;

if(tg?.HapticFeedback){

  switch(data.type){

    case "success":

      tg.HapticFeedback.notificationOccurred(
        "success"
      );

      break;

    case "error":

      tg.HapticFeedback.notificationOccurred(
        "error"
      );

      break;

    case "warning":

      tg.HapticFeedback.notificationOccurred(
        "warning"
      );

      break;

    default:

      tg.HapticFeedback.impactOccurred(
        "light"
      );

  }

}

  if(showing.current){
    return;
  }

  showNext();

}

  function handleClose(){

    showNext();

  }

  return(

    <NotificationContext.Provider
  value={{

    notify,

    success(title, text){

      notify({
        title,
        text,
        icon:"✅",
        type:"success"
      });

    },

    error(title, text){

      notify({
        title,
        text,
        icon:"❌",
        type:"error"
      });

    },

    warning(title, text){

      notify({
        title,
        text,
        icon:"⚠️",
        type:"warning"
      });

    },

    info(title, text){

      notify({
        title,
        text,
        icon:"ℹ️",
        type:"info"
      });

    }

  }}
>

      {children}

      {notification && (

        <Notification

  title={notification.title}

  text={notification.text}

  icon={notification.icon}

  type={notification.type}

  onClose={handleClose}

/>

      )}

    </NotificationContext.Provider>

  );

}

export function useNotification(){

  const context =
    useContext(
      NotificationContext
    );

  if(!context){

    throw new Error(
      "NotificationProvider not found"
    );

  }

  return context;

}