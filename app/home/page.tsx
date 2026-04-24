"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import BottomNav from "../../components/BottomNav";

export default function Home() {
const [users,setUsers]=useState<any[]>([]);
const [index,setIndex]=useState(0);

const [dragX,setDragX]=useState(0);
const [dragging,setDragging]=useState(false);

const startX=useRef(0);

const currentUserId=123; // временно

useEffect(()=>{
loadUsers();

document.body.style.overflow="hidden";
document.documentElement.style.overflow="hidden";

return ()=>{
document.body.style.overflow="auto";
document.documentElement.style.overflow="auto";
};

},[]);

async function loadUsers(){
const {data}=await supabase
.from("users")
.select("*")
.neq("telegram_id",currentUserId);

if(data) setUsers(data);
}

const currentUser=users[index];

async function handleLike(){
if(!currentUser) return;

const likedUserId=currentUser.telegram_id;

await supabase.from("likes").insert({
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

const user1=Math.min(currentUserId,likedUserId);
const user2=Math.max(currentUserId,likedUserId);

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
}
}

nextUser();
}

function handleSkip(){
nextUser();
}

function nextUser(){
setDragX(0);
setIndex(prev=>prev+1);
}

function swipeLeft(){
setDragX(-500);
setTimeout(()=>handleSkip(),250);
}

function swipeRight(){
setDragX(500);
setTimeout(()=>handleLike(),250);
}

function onTouchStart(e:any){
startX.current=e.touches[0].clientX;
setDragging(true);
}

function onTouchMove(e:any){
if(!dragging) return;

const delta=e.touches[0].clientX-startX.current;
setDragX(delta);
}

function onTouchEnd(){

setDragging(false);

if(dragX>120){
swipeRight();
return;
}

if(dragX<-120){
swipeLeft();
return;
}

setDragX(0);
}

return(
<div
style={{
height:"100vh",
overflow:"hidden",
background:"#F7F7F8",
padding:"18px 18px 120px",
touchAction:"none"
}}
>

{currentUser && (
<>

{/* TOP */}
<div
style={{
display:"flex",
justifyContent:"space-between",
marginBottom:16
}}
>

<button
style={{
width:48,
height:48,
borderRadius:"50%",
background:"#fff",
border:"none",
boxShadow:"0 4px 12px rgba(0,0,0,.06)"
}}
>
←
</button>

<button
style={{
width:48,
height:48,
borderRadius:"50%",
background:"#fff",
border:"none",
boxShadow:"0 4px 12px rgba(0,0,0,.06)"
}}
>
⚙
</button>

</div>


{/* CARD */}
<div
onTouchStart={onTouchStart}
onTouchMove={onTouchMove}
onTouchEnd={onTouchEnd}
style={{
position:"relative",
height:"64vh",
borderRadius:36,
overflow:"hidden",
background:"#fff",
boxShadow:"0 10px 30px rgba(0,0,0,.06)",

transform:
`translateX(${dragX}px)
rotate(${dragX/25}deg)`,

transition:
dragging
? "none"
: "all .28s cubic-bezier(.2,.8,.2,1)"
}}
>

{/* LIKE/DISLIKE LABELS */}
{dragX>30 && (
<div
style={{
position:"absolute",
top:70,
right:40,
zIndex:30,
padding:"12px 20px",
border:"3px solid #27C96F",
color:"#27C96F",
fontWeight:700,
borderRadius:14,
transform:"rotate(14deg)"
}}
>
LIKE
</div>
)}

{dragX<-30 && (
<div
style={{
position:"absolute",
top:70,
left:40,
zIndex:30,
padding:"12px 20px",
border:"3px solid #ff5b73",
color:"#ff5b73",
fontWeight:700,
borderRadius:14,
transform:"rotate(-14deg)"
}}
>
NOPE
</div>
)}


<img
src={currentUser.avatar_url}
style={{
width:"100%",
height:"100%",
objectFit:"cover"
}}
/>

<div
style={{
position:"absolute",
top:26,
left:26,
padding:"12px 18px",
borderRadius:20,
background:"rgba(70,70,70,.45)",
backdropFilter:"blur(10px)",
color:"#fff",
fontSize:18
}}
>
1 / 8
</div>


{/* blur white fade */}
<div
style={{
position:"absolute",
left:0,
right:0,
bottom:0,
height:125,
background:
"linear-gradient(to top,#fff 0%,rgba(255,255,255,.96) 28%,rgba(255,255,255,.55) 62%,rgba(255,255,255,0) 100%)",
filter:"blur(10px)",
zIndex:2
}}
/>
{/* profile info */}
<div
style={{
position:"absolute",
left:30,
right:30,
bottom:18,
zIndex:5
}}
>

<h2
style={{
margin:0,
fontSize:18,
fontWeight:600,
letterSpacing:"-.2px"
}}
>
{currentUser.name}, {currentUser.age}
</h2>

<div
style={{
marginTop:4,
fontSize:13,
opacity:.82,
color:"#707784"
}}
>
📍 {currentUser.city}, 2 км от вас
</div>

<div
style={{
marginTop:8,
fontSize:14,
lineHeight:1.35,
maxWidth:"82%"
}}
>
{currentUser.bio || "Люблю путешествия и новые впечатления ✈✨"}
</div>


<div
style={{
display:"flex",
flexWrap:"wrap",
gap:8,
marginTop:10
}}
>

{(
currentUser.interests ||
[
"Путешествия",
"Музыка",
"Спорт",
"Кино",
"Фото"
]
).map((tag:string)=>(
<div
key={tag}
style={{
padding:"7px 12px",
fontSize:12,
fontWeight:500,
borderRadius:999,
background:"#EEF5FF",
color:"#4D8DFF",
whiteSpace:"nowrap"
}}
>
{tag}
</div>
))}

</div>

</div>

</div>


{/* ACTION BUTTONS */}
<div
style={{
marginTop:18,
display:"flex",
justifyContent:"center",
alignItems:"center",
gap:28
}}
>

<button
onClick={swipeLeft}
style={{
width:72,
height:72,
borderRadius:"50%",
border:"none",
background:"#fff",
fontSize:34,
color:"#A6ADB8",
boxShadow:"0 8px 22px rgba(0,0,0,.08)"
}}
>
✕
</button>

<button
onClick={swipeRight}
style={{
width:92,
height:92,
borderRadius:"50%",
border:"none",
background:
"linear-gradient(135deg,#3D8BFF 0%,#0A6CFF 100%)",
fontSize:40,
color:"#fff",
boxShadow:
"0 10px 30px rgba(32,111,255,.35)"
}}
>
♡
</button>

<button
style={{
width:72,
height:72,
borderRadius:"50%",
border:"none",
background:"#fff",
fontSize:30,
color:"#A6ADB8",
boxShadow:"0 8px 22px rgba(0,0,0,.08)"
}}
>
✦
</button>

</div>

</>
)}

<BottomNav/>

</div>
)
}