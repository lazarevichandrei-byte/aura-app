"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import BottomNav from "../../components/BottomNav";

export default function Home() {
  const [users, setUsers] = useState<any[]>([]);
  const [index, setIndex] = useState(0);

  const [photoIndex, setPhotoIndex] = useState(0);

  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const startX = useRef<number | null>(null);

  // временно как было
  const currentUserId = 123;

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

  function getPhotos(user:any){
    if(!user) return [];
    if(Array.isArray(user.photos) && user.photos.length){
      return user.photos;
    }
    if(user.avatar_url){
      return [user.avatar_url];
    }
    return [];
  }

  const photos = getPhotos(currentUser);

  async function handleLike() {
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
      const user1 = Math.min(currentUserId, likedUserId);
      const user2 = Math.max(currentUserId, likedUserId);

      const { data: existingMatch } = await supabase
        .from("matches")
        .select("*")
        .eq("user1", user1)
        .eq("user2", user2)
        .maybeSingle();

      if (!existingMatch) {
        await supabase.from("matches").insert({
          user1,
          user2,
        });
      }
    }

    animateOut(420);
  }

  function handleSkip() {
    animateOut(-420);
  }

  function nextUser() {
    setPhotoIndex(0);
    setIndex((prev)=>prev+1);
    setDragX(0);
  }

  function animateOut(value:number){
    setDragX(value);

    setTimeout(()=>{
      nextUser();
    },260);
  }

  function onStart(clientX:number){
    startX.current=clientX;
    setDragging(true);
  }

  function onMove(clientX:number){
    if(startX.current===null) return;
    setDragX(clientX-startX.current);
  }

  function onEnd(){
    setDragging(false);

    if(dragX>120){
      handleLike();
      return;
    }

    if(dragX<-120){
      handleSkip();
      return;
    }

    setDragX(0);
    startX.current=null;
  }

  function nextPhoto(e:any){
    if(!photos.length) return;

    const rect=e.currentTarget.getBoundingClientRect();
    const x=e.clientX-rect.left;

    if(x < rect.width/2){
      setPhotoIndex((p)=>
        p===0 ? photos.length-1 : p-1
      );
    } else {
      setPhotoIndex((p)=>
        p===photos.length-1 ? 0 : p+1
      );
    }
  }

  const rotation=dragX/28;

  return (
<div
style={{
background:"#F7F7F8",
minHeight:"100vh",
padding:"18px 18px 112px",
fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif"
}}
>

{/* top */}
<div
style={{
display:"flex",
justifyContent:"space-between",
marginTop:"8px",
marginBottom:"18px"
}}
>
<button
style={{
width:48,
height:48,
borderRadius:"50%",
border:"none",
background:"#fff",
boxShadow:
"0 4px 12px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04)"
}}
>
←
</button>

<button
style={{
width:48,
height:48,
borderRadius:"50%",
border:"none",
background:"#fff",
boxShadow:
"0 4px 12px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04)"
}}
>
⚙
</button>
</div>

{currentUser ? (
<>
<div
onMouseDown={(e)=>onStart(e.clientX)}
onMouseMove={(e)=>dragging&&onMove(e.clientX)}
onMouseUp={onEnd}
onMouseLeave={()=>dragging&&onEnd()}

onTouchStart={(e)=>onStart(e.touches[0].clientX)}
onTouchMove={(e)=>onMove(e.touches[0].clientX)}
onTouchEnd={onEnd}

style={{
height:"56vh",
background:"#fff",
borderRadius:34,
overflow:"hidden",
boxShadow:"0 10px 30px rgba(0,0,0,.06)",
position:"relative",
transform:`translateX(${dragX}px) rotate(${rotation}deg)`,
transition:dragging
? "none"
: "all .28s cubic-bezier(.2,.9,.2,1)"
}}
>

{/* photo */}
<div
onClick={nextPhoto}
style={{
height:"62%",
position:"relative",
overflow:"hidden"
}}
>
<img
src={photos[photoIndex]}
style={{
width:"100%",
height:"100%",
objectFit:"cover"
}}
/>

{/* progress */}
<div
style={{
position:"absolute",
top:22,
left:22,
background:"rgba(90,90,90,.45)",
backdropFilter:"blur(10px)",
padding:"10px 18px",
borderRadius:30,
color:"#fff",
fontWeight:500,
fontSize:18
}}
>
{photoIndex+1} / {photos.length || 1}
</div>

{/* super soft blur fade */}
<div
style={{
position:"absolute",
left:0,
right:0,
bottom:-8,
height:175,
background:`
linear-gradient(
to bottom,
rgba(255,255,255,0) 0%,
rgba(255,255,255,.22) 35%,
rgba(255,255,255,.55) 58%,
rgba(255,255,255,.82) 78%,
rgba(255,255,255,.96) 90%,
#fff 100%
)`,
filter:"blur(18px)",
transform:"scale(1.08)",
pointerEvents:"none"
}}
/>
</div>

{/* info */}
<div
style={{
padding:"16px 22px",
minHeight:115
}}
>

<div
style={{
display:"flex",
alignItems:"center",
gap:8,
marginBottom:8
}}
>
<div
style={{
fontSize:19,
fontWeight:600,
letterSpacing:"-.2px"
}}
>
{currentUser.name}, {currentUser.age}
</div>
</div>

<div
style={{
fontSize:14,
color:"#7B7B87",
marginBottom:10
}}
>
📍 {currentUser.city || "Город"}, 2 км от вас
</div>

<div
style={{
fontSize:14,
lineHeight:1.4,
marginBottom:14
}}
>
{currentUser.bio ||
"Люблю путешествия и новые впечатления ✈️✨"}
</div>

<div
style={{
display:"flex",
flexWrap:"wrap",
gap:10
}}
>
{(currentUser.interests || [
"Путешествия",
"Музыка",
"Спорт",
"Кино",
"Фото"
]).slice(0,5).map((item:string)=>(
<div
key={item}
style={{
padding:"7px 12px",
borderRadius:999,
background:"#EEF5FF",
color:"#4D8DFF",
fontSize:12,
fontWeight:500
}}
>
{item}
</div>
))}

<div
style={{
width:34,
height:34,
borderRadius:"50%",
display:"flex",
alignItems:"center",
justifyContent:"center",
background:"#EEF5FF",
color:"#4D8DFF"
}}
>
+
</div>
</div>

</div>

{/* overlays */}
{dragX>60 && (
<div
style={{
position:"absolute",
top:90,
right:35,
border:"3px solid #2F80FF",
color:"#2F80FF",
padding:"10px 18px",
borderRadius:14,
fontWeight:700,
transform:"rotate(12deg)"
}}
>
LIKE
</div>
)}

{dragX<-60 && (
<div
style={{
position:"absolute",
top:90,
left:35,
border:"3px solid #ff5b6b",
color:"#ff5b6b",
padding:"10px 18px",
borderRadius:14,
fontWeight:700,
transform:"rotate(-12deg)"
}}
>
NOPE
</div>
)}

</div>

{/* actions */}
<div
style={{
display:"flex",
justifyContent:"center",
alignItems:"center",
gap:26,
marginTop:18
}}
>
<button
onClick={handleSkip}
style={{
width:68,
height:68,
borderRadius:"50%",
border:"none",
background:"#fff",
fontSize:34,
color:"#A8ADB7",
boxShadow:"0 8px 20px rgba(0,0,0,.06)"
}}
>
✕
</button>

<button
onClick={handleLike}
style={{
width:84,
height:84,
borderRadius:"50%",
border:"none",
background:
"linear-gradient(135deg,#3D8BFF 0%,#0A6CFF 100%)",
fontSize:34,
color:"#fff",
boxShadow:
"0 10px 30px rgba(32,111,255,.35)"
}}
>
♥
</button>

<button
style={{
width:68,
height:68,
borderRadius:"50%",
border:"none",
background:"#fff",
fontSize:30,
color:"#A8ADB7",
boxShadow:"0 8px 20px rgba(0,0,0,.06)"
}}
>
★
</button>

</div>
</>
):(
<div style={{paddingTop:80}}>
Нет пользователей
</div>
)}

<BottomNav />

</div>
  );
}