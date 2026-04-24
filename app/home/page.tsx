"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import BottomNav from "../../components/BottomNav";

export default function Home() {
  const [users, setUsers] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [exitX, setExitX] = useState(0);

  const currentUserId = 123; // потом заменим

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const { data } = await supabase
      .from("users")
      .select("*")
      .neq("telegram_id", currentUserId);

    if (data) setUsers(data);
  }

  const currentUser = users[index];
  const nextCard = users[index + 1];

  async function handleLike() {
    if (!currentUser) return;

    setExitX(500);

    await supabase.from("likes").insert({
      from_user: currentUserId,
      to_user: currentUser.telegram_id,
    });

    setTimeout(() => {
      setIndex((prev)=>prev+1);
      setExitX(0);
    },300);
  }

  function handleSkip() {
    setExitX(-500);

    setTimeout(()=>{
      setIndex((prev)=>prev+1);
      setExitX(0);
    },300);
  }

  function handleDragEnd(_:any, info:any){
    if(info.offset.x > 120){
      handleLike();
    } else if(info.offset.x < -120){
      handleSkip();
    }
  }

  return (
    <div
      style={{
        minHeight:"100vh",
        background:"#F8F9FD",
        padding:"18px",
        paddingBottom:"120px"
      }}
    >

      {/* Верх */}
      <div
        style={{
          display:"flex",
          justifyContent:"space-between",
          marginBottom:"20px"
        }}
      >
        <button style={topBtn}>←</button>
        <button style={topBtn}>⚙</button>
      </div>


      {/* STACK */}
      <div
        style={{
          position:"relative",
          height:"620px"
        }}
      >

      {nextCard && (
        <div
          style={{
            ...cardStyle,
            transform:"scale(.96) translateY(16px)",
            opacity:.8,
            zIndex:1
          }}
        >
          <img
            src={nextCard.avatar_url}
            style={imgStyle}
          />
        </div>
      )}


<AnimatePresence>

{currentUser && (
<motion.div
 key={currentUser.telegram_id}
 drag="x"
 onDragEnd={handleDragEnd}
 animate={{ x:0, rotate:0 }}
 exit={{ x: exitX, rotate: exitX>0 ? 20 : -20 }}
 whileTap={{ scale:.98 }}
 style={{
  ...cardStyle,
  zIndex:2
 }}
>

<img
 src={currentUser.avatar_url}
 style={imgStyle}
/>

{/* счетчик фото */}
<div style={{
position:"absolute",
top:18,
left:18,
background:"rgba(0,0,0,.35)",
color:"#fff",
padding:"8px 14px",
borderRadius:"18px"
}}>
1 / 8
</div>


{/* белый инфо блок */}
<div style={infoPanel}>
<h2 style={{
marginBottom:8,
fontSize:"34px"
}}>
{currentUser.name}, {currentUser.age}
</h2>

<div style={{
opacity:.7,
marginBottom:14
}}>
📍 {currentUser.city}
</div>

<p style={{
lineHeight:1.5,
marginBottom:18
}}>
Люблю путешествия и новые впечатления ✨
</p>

<div style={{
display:"flex",
flexWrap:"wrap",
gap:"10px"
}}>
{["Путешествия","Музыка","Спорт","Кино"].map(tag=>(
<span key={tag} style={tagStyle}>
{tag}
</span>
))}
</div>
</div>

</motion.div>
)}

</AnimatePresence>

</div>


{/* ACTION BUTTONS */}
<div
style={{
display:"flex",
justifyContent:"center",
gap:"30px",
marginTop:"-30px",
marginBottom:"30px"
}}
>

<button
onClick={handleSkip}
style={circleBtn}
>
✕
</button>

<button
onClick={handleLike}
style={{
...circleBtn,
width:"90px",
height:"90px",
background:"linear-gradient(135deg,#4FACFE,#2979FF)",
color:"#fff",
fontSize:"34px",
boxShadow:"0 15px 35px rgba(41,121,255,.35)"
}}
>
❤
</button>

<button
style={circleBtn}
>
★
</button>

</div>

<BottomNav/>

    </div>
  );
}



const topBtn={
width:"52px",
height:"52px",
borderRadius:"50%",
border:"none",
background:"#fff",
boxShadow:"0 8px 20px rgba(0,0,0,.06)",
fontSize:"22px"
} as const;


const cardStyle={
position:"absolute" as const,
width:"100%",
height:"100%",
borderRadius:"34px",
overflow:"hidden",
background:"#fff",
boxShadow:"0 25px 60px rgba(0,0,0,.12)"
};


const imgStyle={
width:"100%",
height:"68%",
objectFit:"cover" as const
};


const infoPanel={
background:"#fff",
height:"32%",
padding:"26px"
};


const tagStyle={
padding:"10px 18px",
background:"#EEF4FF",
borderRadius:"30px",
color:"#2979FF",
fontSize:"14px"
};


const circleBtn={
width:"72px",
height:"72px",
borderRadius:"50%",
border:"none",
background:"#fff",
fontSize:"28px",
boxShadow:"0 10px 25px rgba(0,0,0,.08)"
} as const;