"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import BottomNav from "../../components/BottomNav";

export default function Home() {

const [users,setUsers]=useState<any[]>([]);
const [index,setIndex]=useState(0);

const currentUserId=123; // временно



/* ---------- SWIPE ---------- */

const [dragX,setDragX]=useState(0);
const [dragging,setDragging]=useState(false);
const [startX,setStartX]=useState<number | null>(null);

function nextUser(){
setIndex(prev=>prev+1);
}

function resetSwipe(){
setDragX(0);
setStartX(null);
setDragging(false);
}

function handleTouchStart(e:any){
setDragging(true);
setStartX(e.touches[0].clientX);
}

function handleTouchMove(e:any){
if(startX===null) return;
setDragX(
e.touches[0].clientX-startX
);
}

function handleTouchEnd(){

setDragging(false);

if(dragX > 120){
handleLike();
resetSwipe();
return;
}

if(dragX < -120){
handleSkip();
resetSwipe();
return;
}

resetSwipe();
}

function handleMouseDown(e:any){
setDragging(true);
setStartX(e.clientX);
}

function handleMouseMove(e:any){
if(!dragging || startX===null) return;
setDragX(
e.clientX-startX
);
}

function handleMouseUp(){
handleTouchEnd();
}


/* ---------- DATA ---------- */

useEffect(()=>{
loadUsers();
},[]);

async function loadUsers(){

const {data}=await supabase
.from("users")
.select("*")
.neq("telegram_id",currentUserId);

if(data) setUsers(data);

}

const currentUser=users[index];


/* ---------- LIKE ---------- */

async function handleLike(){

if(!currentUser) return;

const likedUserId=currentUser.telegram_id;

await supabase
.from("likes")
.insert({
from_user:currentUserId,
to_user:likedUserId
});


const {data:reverseLike}=await supabase
.from("likes")
.select("*")
.eq("from_user",likedUserId)
.eq("to_user",currentUserId)
.maybeSingle();


if(reverseLike){

const user1=Math.min(
currentUserId,
likedUserId
);

const user2=Math.max(
currentUserId,
likedUserId
);

const {data:existingMatch}=await supabase
.from("matches")
.select("*")
.eq("user1",user1)
.eq("user2",user2)
.maybeSingle();

if(!existingMatch){

await supabase
.from("matches")
.insert({
user1,
user2
});

console.log("MATCH");

}
}

nextUser();
}


function handleSkip(){
nextUser();
}



/* ---------- UI ---------- */

return(

<div
style={{
minHeight:"100vh",
background:"#F7F7F8",
padding:"18px 18px 120px",
overflow:"hidden" // экран больше НЕ двигается
}}
>

{currentUser ? (

<>

{/* TOP BUTTONS */}

<div
style={{
display:"flex",
justifyContent:"space-between",
marginBottom:18
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



{/* SWIPE CARD ONLY MOVES */}
<div

onTouchStart={handleTouchStart}
onTouchMove={handleTouchMove}
onTouchEnd={handleTouchEnd}

onMouseDown={handleMouseDown}
onMouseMove={handleMouseMove}
onMouseUp={handleMouseUp}
onMouseLeave={handleMouseUp}

style={{
transform:
`translateX(${dragX}px) rotate(${dragX/22}deg)`,

transition:
dragging
? "none"
: "transform .28s cubic-bezier(.2,.9,.2,1)",

touchAction:"none",
userSelect:"none",
position:"relative"
}}
>


<div
style={{
height:"66vh",
borderRadius:36,
overflow:"hidden",
background:"#fff",
boxShadow:
"0 10px 30px rgba(0,0,0,.06)",
position:"relative"
}}
>

<img
src={currentUser.avatar_url}
style={{
width:"100%",
height:"100%",
objectFit:"cover"
}}
/>



{/* photo counter */}

<div
style={{
position:"absolute",
top:24,
left:24,
background:"rgba(70,70,70,.35)",
backdropFilter:"blur(12px)",
padding:"10px 18px",
borderRadius:999,
color:"#fff",
fontSize:18,
zIndex:10
}}
>
1 / 8
</div>



{/* LIKE OVERLAY */}
{dragX > 15 && (

<div
style={{
position:"absolute",
top:110,
right:32,
border:"3px solid #2F80FF",
color:"#2F80FF",
padding:"8px 14px",
fontWeight:700,
borderRadius:10,
transform:"rotate(12deg)",
opacity:Math.min(dragX/70,1),
zIndex:12
}}
>
LIKE
</div>

)}



{/* NOPE OVERLAY */}
{dragX < -15 && (

<div
style={{
position:"absolute",
top:110,
left:32,
border:"3px solid #ff5d6d",
color:"#ff5d6d",
padding:"8px 14px",
fontWeight:700,
borderRadius:10,
transform:"rotate(-12deg)",
opacity:Math.min(Math.abs(dragX)/70,1),
zIndex:12
}}
>
NOPE
</div>

)}
{/* SUPER SOFT FADE */}
<div
style={{
position:"absolute",
left:0,
right:0,
bottom:160,
height:270,
zIndex:2,

background:`
linear-gradient(
to bottom,
rgba(255,255,255,0) 0%,
rgba(255,255,255,.10) 35%,
rgba(255,255,255,.45) 58%,
rgba(255,255,255,.85) 82%,
#ffffff 100%
)`,

filter:"blur(28px)",
transform:"scale(1.08)"
}}
/>



{/* PROFILE INFO */}
<div
style={{
position:"absolute",
left:28,
right:28,
bottom:34,
zIndex:5
}}
>

<div
style={{
fontSize:22,
fontWeight:600,
marginBottom:8,
letterSpacing:"-.2px"
}}
>
{currentUser.name}, {currentUser.age}
</div>


<div
style={{
fontSize:15,
color:"#7B7B87",
marginBottom:14
}}
>
📍 {currentUser.city}, 2 км от вас
</div>


<div
style={{
fontSize:15,
lineHeight:1.45,
marginBottom:14
}}
>
{currentUser.bio ||
"Люблю путешествия и новые впечатления ✈✨"}
</div>


<div
style={{
display:"flex",
flexWrap:"wrap",
gap:10
}}
>

{(
currentUser.interests?.length
? currentUser.interests
: [
"Путешествия",
"Музыка",
"Спорт",
"Кино",
"Фотография"
]
).map((tag:string)=>(
<div
key={tag}
style={{
padding:"9px 14px",
borderRadius:999,
background:"#EEF5FF",
color:"#4D8DFF",
fontSize:13
}}
>
{tag}
</div>
))}

<div
style={{
width:38,
height:38,
borderRadius:"50%",
background:"#EEF5FF",
display:"flex",
alignItems:"center",
justifyContent:"center",
color:"#4D8DFF"
}}
>
+
</div>

</div>
</div>
</div>
</div>



{/* ACTION BUTTONS */}

<div
style={{
marginTop:26,
display:"flex",
justifyContent:"center",
alignItems:"center",
gap:28
}}
>

<button
onClick={handleSkip}
style={{
width:72,
height:72,
borderRadius:"50%",
border:"none",
background:"#fff",
boxShadow:
"0 8px 20px rgba(0,0,0,.08)",
fontSize:34,
color:"#9AA0AA"
}}
>
✕
</button>


<button
onClick={handleLike}
style={{
width:90,
height:90,
borderRadius:"50%",
border:"none",
background:
"linear-gradient(135deg,#3D8BFF 0%,#0A6CFF 100%)",
color:"#fff",
fontSize:38,
boxShadow:
"0 10px 30px rgba(32,111,255,.35)"
}}
>
❤
</button>


<button
style={{
width:72,
height:72,
borderRadius:"50%",
border:"none",
background:"#fff",
boxShadow:
"0 8px 20px rgba(0,0,0,.08)",
fontSize:30,
color:"#9AA0AA"
}}
>
★
</button>

</div>

</>

):(

<p style={{padding:40}}>
Нет пользователей
</p>

)}

<BottomNav/>

</div>

);

}