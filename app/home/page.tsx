"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import BottomNav from "../../components/BottomNav";

export default function Home() {
const [users,setUsers]=useState<any[]>([]);
const [index,setIndex]=useState(0);

const [photoIndex,setPhotoIndex]=useState(0);

const [dragX,setDragX]=useState(0);
const [dragging,setDragging]=useState(false);

const startX=useRef(0);

const currentUserId=123;

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

const photos=
currentUser?.photos?.length
? currentUser.photos
: [currentUser?.avatar_url].filter(Boolean);


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
await supabase.from("matches").insert({
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
setPhotoIndex(0);
setDragX(0);
setIndex(prev=>prev+1);
}


/* swipe only card */
function onTouchStart(e:any){
startX.current=e.touches[0].clientX;
setDragging(true);
}

function onTouchMove(e:any){
if(!dragging) return;

const move=e.touches[0].clientX-startX.current;
setDragX(move);
}

function onTouchEnd(){
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
}


return(
<div
style={{
height:"100vh",
overflow:"hidden",
background:"#F6F7FB",
padding:"18px 18px 118px",
touchAction:"pan-y"
}}
>

{currentUser && (
<>
<div
onTouchStart={onTouchStart}
onTouchMove={onTouchMove}
onTouchEnd={onTouchEnd}
style={{
position:"relative",
height:"66vh",
borderRadius:36,
overflow:"hidden",
background:"#fff",
boxShadow:"0 10px 30px rgba(0,0,0,.06)",
transform:
dragging
? `translateX(${dragX}px) rotate(${dragX/24}deg)`
: `translateX(${dragX}px)`,
transition:
dragging
? "none"
: "all .28s cubic-bezier(.2,.8,.2,1)"
}}
>

{/* swipe label */}
{dragX>35 && (
<div
style={{
position:"absolute",
top:80,
right:35,
zIndex:20,
padding:"10px 18px",
border:"3px solid #2F80FF",
color:"#2F80FF",
fontWeight:700,
borderRadius:14,
transform:"rotate(12deg)"
}}
>
LIKE
</div>
)}

{dragX<-35 && (
<div
style={{
position:"absolute",
top:80,
left:35,
zIndex:20,
padding:"10px 18px",
border:"3px solid #ff6a6a",
color:"#ff6a6a",
fontWeight:700,
borderRadius:14,
transform:"rotate(-12deg)"
}}
>
NOPE
</div>
)}


<img
src={photos[photoIndex]}
style={{
width:"100%",
height:"100%",
objectFit:"cover"
}}
/>


{/* photo tap zones */}
<div
onClick={(e:any)=>{
const rect=e.currentTarget.getBoundingClientRect();
const x=e.clientX-rect.left;

if(x<rect.width/2){
setPhotoIndex(p=>
p===0
? photos.length-1
: p-1
)
}else{
setPhotoIndex(p=>
p===photos.length-1
? 0
: p+1
)
}
}}
style={{
position:"absolute",
inset:0,
zIndex:4
}}
/>


{/* count */}
<div
style={{
position:"absolute",
top:26,
left:26,
zIndex:6,
background:"rgba(80,80,80,.45)",
backdropFilter:"blur(10px)",
padding:"12px 18px",
borderRadius:18,
color:"#fff",
fontSize:18
}}
>
{photoIndex+1} / {photos.length}
</div>
{/* profile text lower */}
<div
style={{
position:"absolute",
left:34,
right:34,
bottom:38,
zIndex:8
}}
>

<h2 style={{
margin:0,
fontSize:18,
fontWeight:600,
letterSpacing:"-.2px"
}}>
{currentUser.name}, {currentUser.age}
</h2>

<div style={{
marginTop:5,
fontSize:13,
color:"#70717c"
}}>
📍 {currentUser.city}, 2 км от вас
</div>

<p style={{
marginTop:10,
fontSize:14,
lineHeight:1.35,
maxWidth:"82%"
}}>
{currentUser.bio || "Люблю путешествия и новые впечатления ✈✨"}
</p>

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
["Путешествия","Музыка","Спорт","Кино","Фото"]
).map((tag:string)=>(
<div
key={tag}
style={{
padding:"7px 12px",
borderRadius:999,
background:"#EEF5FF",
color:"#4D8DFF",
fontSize:12,
fontWeight:500
}}
>
{tag}
</div>
))}
</div>

</div>


{/* bottom white cloud blur */}
<div
style={{
position:"absolute",
left:0,
right:0,
bottom:0,
height:"34%",
zIndex:6,
pointerEvents:"none",
background:`
linear-gradient(
to top,
rgba(255,255,255,1) 0%,
rgba(255,255,255,.96) 22%,
rgba(255,255,255,.78) 45%,
rgba(255,255,255,.38) 70%,
rgba(255,255,255,.08) 88%,
rgba(255,255,255,0) 100%
)
`,
filter:"blur(16px)"
}}
/>

</div>


{/* action buttons */}
<div
style={{
display:"flex",
justifyContent:"center",
alignItems:"center",
gap:26,
marginTop:24
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
fontSize:34,
color:"#A8AFBB",
boxShadow:"0 8px 22px rgba(0,0,0,.07)"
}}
>
✕
</button>


<button
onClick={handleLike}
style={{
width:92,
height:92,
border:"none",
borderRadius:"50%",
background:
"linear-gradient(135deg,#3D8BFF,#0A6CFF)",
color:"#fff",
fontSize:42,
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
color:"#A8AFBB",
boxShadow:"0 8px 22px rgba(0,0,0,.07)"
}}
>
✦
</button>

</div>
</>
)}

<BottomNav/>

</div>
);
}