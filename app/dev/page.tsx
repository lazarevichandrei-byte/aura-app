"use client";

import { useNotification } from "../../components/NotificationContext";

export default function DevPage() {

  const {
  success,
  error,
  warning,
  info
} = useNotification();

  return (

    <div
      style={{
        minHeight: "100vh",
        background: "#F5F7FB",
        padding: 24
      }}
    >

      <h1
        style={{
          marginBottom: 24
        }}
      >
        AURA Developer
      </h1>

      <button

        onClick={() => {

  success(
    "Успешно",
    "Профиль сохранён"
  );

  setTimeout(() => {

    error(
      "Ошибка",
      "Не удалось сохранить"
    );

  },300);

  setTimeout(() => {

    warning(
      "Внимание",
      "Заполните возраст"
    );

  },600);

  setTimeout(() => {

    info(
      "Информация",
      "Добро пожаловать!"
    );

  },900);

}}

        style={{

          width: "100%",

          height: 60,

          border: "none",

          borderRadius: 16,

          background: "#2F80FF",

          color: "#fff",

          fontSize: 18,

          fontWeight: 600,

          cursor: "pointer"

        }}

      >

        Проверить очередь

      </button>

    </div>

  );

}