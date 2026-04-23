import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();

  const [name, setName] = useState("");

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;

    if (user) {
      setName(user.first_name || "");
    }
  }, []);

  const handleSubmit = async () => {
    const tg = window.Telegram?.WebApp;
    const userId = tg?.initDataUnsafe?.user?.id ?? null;

    const { error } = await supabase.from("users").upsert([
      {
        telegram_id: userId,
        name,
      },
    ]);

    if (error) {
      alert(error.message);
    } else {
      navigate("/home");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Создание профиля</h2>

      <input
        placeholder="Имя"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br /><br />

      <button onClick={handleSubmit}>Сохранить</button>
    </div>
  );
}