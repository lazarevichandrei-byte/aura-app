
"use client";

import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { supabase } from "../../lib/supabase";
import BottomNav from "../../components/BottomNav";

export default function Home() {
  const [users, setUsers] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [matchedUser, setMatchedUser] = useState<any>(null);

  const controls = useAnimation();

  const currentUserId = 123; // потом заменим на telegram id

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

  function nextUser() {
    setIndex((prev) => prev + 1);
  }

  async function flyRightLike() {
    await controls.start({
      x: 900,
      rotate: 22,
      opacity: 0,
      transition: { duration: 0.18 },
    });

    await handleLikeLogic();

    controls.set({ x:0, rotate:0, opacity:1 });
  }

  async function flyLeftSkip() {
    await controls.start({
      x: -900,
      rotate: -22,
      opacity: 0,
      transition: { duration: 0.18 },
    });

    nextUser();

    controls.set({ x:0, rotate:0, opacity:1 });
  }

  async function handleLikeLogic() {
    if (!currentUser) return;

    const likedUserId = currentUser.telegram_id;

    await supabase.from("likes").insert({
      from_user: currentUserId,
      to_user: likedUserId,
    });

    const { data: reverseLike } = await supabase
      .from("likes")
      .select("*")
      .eq("from_user", likedUserId)
      .eq("to_user", currentUserId)
      .maybeSingle();

    if (reverseLike) {
      const user1=Math.min(currentUserId,likedUserId);
      const user2=Math.max(currentUserId,likedUserId);

      const { data: existingMatch } = await supabase
        .from("matches")
        .select("*")
        .eq("user1",user1)
        .eq("user2",user2)
        .maybeSingle();

      if(!existingMatch){
        await supabase.from("matches").insert({
          user1,
          user2,
        });

        setMatchedUser(currentUser);
      }
    }

    nextUser();
  }

  async function handleDragEnd(_:any, info:any){
    if(info.offset.x > 140){
      await flyRightLike();
      return;
    }

    if(info.offset.x < -140){
      await flyLeftSkip();
      return;
    }

    controls.start({
      x:0,
      rotate:0,
      transition:{
        type:"spring",
        stiffness:650,
        damping:24,
      }
    });
  }

  if(!currentUser){
    return (
      <div style={{padding:30}}>
        Нет пользователей
        <BottomNav />
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight:"100vh",
        background:"#F8FAFF",
        padding:"18px",
        paddingBottom:"150px"
      }}
    >

{/* верх */}
<div
style={{
display:"flex",
justifyContent:"space-between",
marginBottom:"18px"
}}
>

<button
style={{
width:54,
height:54,
borderRadius:"50%",
border:"none",
background:"#fff",
boxShadow:"0 4px 14px rgba(0,0,0,.06)",
fontSize:24
}}
>
←
</button>

<button
style={{
width:54,
height:54,
borderRadius:"50%",
border:"none",
background:"#fff",
boxShadow:"0 4px 14px rgba(0,0,0,.06)",
fontSize:22
}}
>
⚙
</button>

</div>


<motion.div
 drag="x"
 dragElastic={0.08}
 dragMomentum
 whileDrag={{scale:1.01}}
 onDragEnd={handleDragEnd}
 animate={controls}
 style={{
position:"relative",
height:"72vh",
maxHeight:"630px",
borderRadius:"32px",
overflow:"hidden",
background:"white",
boxShadow:"0 20px 45px rgba(0,0,0,.12)"
}}
>

<img
src={currentUser.avatar_url}
style={{
width:"100%",
height:"72%",
objectFit:"cover"
}}
/>

<div
style={{
position:"absolute",
top:22,
left:22,
background:"rgba(0,0,0,.35)",
padding:"10px 18px",
borderRadius:"18px",
color:"white",
fontSize:22
}}
>
1 / 8
</div>

<div
style={{
position:"absolute",
bottom:220,
left:0,
right:0,
height:120,
background:
"linear-gradient(to top, white 10%, rgba(255,255,255,0) 100%)"
}}
/>

<div
style={{
position:"absolute",
bottom:0,
left:0,
right:0,
background:"white",
padding:"28px",
borderTopLeftRadius:"32px",
borderTopRightRadius:"32px"
}}
>

<div
style={{
display:"flex",
alignItems:"center",
gap:12
}}
>
<h2
style={{
margin:0,
fontSize:42,
fontWeight:700,
lineHeight:1
}}
>
{currentUser.name}, {currentUser.age}
</h2>

<span
style={{
fontSize:24,
color:"#2979FF"
}}
>
✔
</span>

</div>

<p
style={{
marginTop:12,
fontSize:22,
color:"#6d7480"
}}
>
📍 {currentUser.city}, 2 км от вас
</p>

<p
style={{
marginTop:18,
fontSize:18,
lineHeight:1.5,
color:"#1e2430"
}}
>
{currentUser.bio || "Люблю путешествия и новые впечатления ✈✨"}
</p>

<div
style={{
display:"flex",
flexWrap:"wrap",
gap:12,
marginTop:18
}}
>
{(currentUser.interests || ["Путешествия","Музыка","Спорт"]).map((tag:any)=>(
<span
key={tag}
style={{
padding:"10px 18px",
borderRadius:30,
background:"#EEF4FF",
color:"#2979FF"
}}
>
{tag}
</span>
))}
</div>

</div>

</motion.div>


{/* кнопки как в рефе */}
<div
style={{
marginTop:34,
display:"flex",
justifyContent:"center",
alignItems:"center",
gap:34
}}
>

<button
onClick={flyLeftSkip}
style={{
width:78,
height:78,
borderRadius:"50%",
border:"none",
background:"#fff",
boxShadow:"0 8px 22px rgba(0,0,0,.08)",
fontSize:40,
color:"#a4aab4"
}}
>
✕
</button>

<button
onClick={flyRightLike}
style={{
width:96,
height:96,
borderRadius:"50%",
border:"none",
background:
"linear-gradient(135deg,#43A5FF,#1D74FF)",
boxShadow:"0 14px 34px rgba(41,121,255,.35)",
color:"white",
fontSize:42
}}
>
❤
</button>

<button
style={{
width:78,
height:78,
borderRadius:"50%",
border:"none",
background:"#fff",
boxShadow:"0 8px 22px rgba(0,0,0,.08)",
fontSize:34,
color:"#a4aab4"
}}
>
★
</button>

</div>


{matchedUser && (
<div
style={{
position:"fixed",
inset:0,
background:"rgba(0,0,0,.72)",
display:"flex",
justifyContent:"center",
alignItems:"center",
zIndex:999
}}
>
<div
style={{
background:"white",
padding:32,
borderRadius:32,
width:320,
textAlign:"center"
}}
>
<h1 style={{color:'#2979FF'}}>
It's a Match 💙
</h1>

<img
src={matchedUser.avatar_url}
style={{
width:110,
height:110,
borderRadius:'50%',
objectFit:'cover'
}}
/>

<p>Вы понравились друг другу</p>

<button
onClick={()=>setMatchedUser(null)}
style={{
marginTop:18,
border:'none',
padding:'14px 24px',
borderRadius:16,
background:
'linear-gradient(135deg,#4FACFE,#2979FF)',
color:'white'
}}
>
Продолжить
</button>

</div>
</div>
)}

<BottomNav />

</div>
  );
}
