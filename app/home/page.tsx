"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import BottomNav from "../../components/BottomNav";
import { X, Heart, Sparkles } from "lucide-react";

export default function Home() {

const [users,setUsers]=useState<any[]>([]);
const [index,setIndex]=useState(0);
const [photoIndex,setPhotoIndex]=useState(0);

const [dragX,setDragX]=useState(0);
const [dragging,setDragging]=useState(false);

const [skipPressed,setSkipPressed]=useState(false);
const [boostPressed,setBoostPressed]=useState(false);
const [likePressed,setLikePressed]=useState(false);

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
: currentUser?.avatar_url
? [currentUser.avatar_url]
: [];

function nextUser(){
 setPhotoIndex(0);
 setDragX(0);
 setIndex(p=>p+1);
}

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

function touchStart(e:any){
startX.current=e.touches[0].clientX;
setDragging(true);
}

function touchMove(e:any){
if(!dragging) return;

const move=e.touches[0].clientX-startX.current;
setDragX(move);
}

function touchEnd(){
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

function changePhoto(e:any){
if(!photos.length) return;

const rect=e.currentTarget.getBoundingClientRect();
const x=e.clientX-rect.left;

if(x<rect.width/2){
 setPhotoIndex(p=>(
  p===0
  ? photos.length-1
  : p-1
 ));
}else{
 setPhotoIndex(p=>(
  p===photos.length-1
  ?0
  :p+1
 ));
}
}

return(
<div
style={{
height:"100vh",
overflow:"hidden",
background:"#F6F7FB",
padding:"18px 18px 118px"
}}
>

{currentUser && (
<>
<div
onTouchStart={touchStart}
onTouchMove={touchMove}
onTouchEnd={touchEnd}
style={{
position:"relative",
height:"66vh",
borderRadius:36,
overflow:"hidden",
background:"#fff",
boxShadow:"0 10px 30px rgba(0,0,0,.06)",

transform: dragging
?`translateX(${dragX}px) rotate(${dragX/24}deg)`
:`translateX(${dragX}px)`,

transition:dragging
?"none"
:"all .28s cubic-bezier(.2,.8,.2,1)"
}}
>

{dragX>35 &&(
<div style={{
position:"absolute",
top:85,
right:35,
zIndex:20,
border:"3px solid #2F80FF",
color:"#2F80FF",
padding:"10px 18px",
borderRadius:14,
fontWeight:700,
transform:"rotate(12deg)"
}}>
LIKE
</div>
)}

{dragX<-35 &&(
<div style={{
position:"absolute",
top:85,
left:35,
zIndex:20,
border:"3px solid #ff6a6a",
color:"#ff6a6a",
padding:"10px 18px",
borderRadius:14,
fontWeight:700,
transform:"rotate(-12deg)"
}}>
NOPE
</div>
)}

<img
src={photos[photoIndex]}
alt=""
style={{
width:"100%",
height:"100%",
objectFit:"cover"
}}
/>

<div
onClick={changePhoto}
style={{
position:"absolute",
inset:0,
zIndex:4
}}
/>

<div style={{
position:"absolute",
top:26,
left:26,
zIndex:12,
background:"rgba(80,80,80,.45)",
backdropFilter:"blur(10px)",
padding:"12px 18px",
borderRadius:18,
color:"#fff",
fontSize:18
}}>
{photoIndex+1} / {photos.length}
</div>

<div style={{
position:"absolute",
left:0,
right:0,
bottom:0,
height:"45%",
zIndex:5,
pointerEvents:"none",
background:
"linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,.98) 20%, rgba(255,255,255,.90) 42%, rgba(255,255,255,.55) 66%, rgba(255,255,255,.15) 85%, rgba(255,255,255,0) 100%)",
filter:"blur(20px)"
}}/>

<div style={{
position:"absolute",
left:30,
right:30,
bottom:26,
zIndex:8
}}>
<h2 style={{
margin:0,
fontSize:18,
fontWeight:600
}}>
{currentUser.name}, {currentUser.age}
</h2>

<div style={{
marginTop:4,
fontSize:13,
color:"#70717C"
}}>
📍 {currentUser.city}, 2 км от вас
</div>

<p style={{
marginTop:8,
marginBottom:10,
fontSize:14,
lineHeight:1.3,
maxWidth:"82%"
}}>
{currentUser.bio || "Люблю путешествия и новые впечатления ✈✨"}
</p>

<div style={{
display:"flex",
flexWrap:"wrap",
gap:8
}}>
{(currentUser.interests||[
"Путешествия",
"Музыка",
"Спорт",
"Кино",
"Фото"
]).map((tag:string)=>(
<div
key={tag}
style={{
padding:"6px 11px",
borderRadius:999,
background:"#EEF5FF",
color:"#4D8DFF",
fontSize:11.5
}}
>
{tag}
</div>
))}
</div>

</div>
</div>
<div
style={{
marginTop:24,
display:"flex",
justifyContent:"center",
alignItems:"center",
gap:26
}}
>

<button
onClick={()=>{
setSkipPressed(true);

setTimeout(()=>{
 setSkipPressed(false);
 handleSkip();
},180);

}}
style={{
width:72,
height:72,
borderRadius:"50%",
border:"none",

background:skipPressed
?"linear-gradient(135deg,#FF7272,#FF3B30)"
:"#fff",

transform:skipPressed
?"scale(1.08)"
:"scale(1)",

transition:"all .18s ease",

display:"flex",
justifyContent:"center",
alignItems:"center",

boxShadow:skipPressed
?"0 12px 30px rgba(255,59,48,.35)"
:"0 10px 30px rgba(0,0,0,.06)"
}}
>
<X
size={30}
color={skipPressed?"white":"#98A0AE"}
strokeWidth={2.6}
/>
</button>


<button
onClick={()=>{
setLikePressed(true);

setTimeout(()=>{
 setLikePressed(false);
 handleLike();
},180);

}}
style={{
width:92,
height:92,
borderRadius:"50%",
border:"none",

background:likePressed
?"linear-gradient(135deg,#FF5E73,#FF304F)"
:"linear-gradient(135deg,#3D8BFF 0%,#0A6CFF 100%)",

transform:likePressed
?"scale(1.09)"
:"scale(1)",

transition:"all .18s ease",

display:"flex",
justifyContent:"center",
alignItems:"center",

boxShadow:likePressed
?"0 14px 34px rgba(255,64,100,.42)"
:"0 14px 34px rgba(32,111,255,.38)"
}}
>
<Heart
size={36}
fill="white"
stroke="white"
strokeWidth={2.5}
/>
</button>


<button
onClick={()=>{
setBoostPressed(true);

setTimeout(()=>{
 setBoostPressed(false);
},180);

}}
style={{
width:72,
height:72,
borderRadius:"50%",
border:"none",

background:boostPressed
?"linear-gradient(135deg,#FFD95A,#FFB800)"
:"#fff",

transform:boostPressed
?"scale(1.08)"
:"scale(1)",

transition:"all .18s ease",

display:"flex",
justifyContent:"center",
alignItems:"center",

boxShadow:boostPressed
?"0 12px 30px rgba(255,196,0,.35)"
:"0 10px 30px rgba(0,0,0,.06)"
}}
>
<Sparkles
size={28}
color={boostPressed?"white":"#98A0AE"}
strokeWidth={2.3}
/>
</button>

</div>

</>
)}

<BottomNav/>

</div>
);
}
