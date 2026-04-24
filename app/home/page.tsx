"use client";

import { useEffect,useState,useRef } from "react";
import { supabase } from "../../lib/supabase";
import BottomNav from "../../components/BottomNav";

export default function Home(){

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



/* SWIPE ONLY CARD */
function onTouchStart(e:any){
startX.current=e.touches[0].clientX;
setDragging(true);
}

function onTouchMove(e:any){
if(!dragging) return;

const move=
e.touches[0].clientX-startX.current;

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


{/* LIKE LABEL */}
{dragX>35 &&(
<div style={{
position:"absolute",
top:84,
right:34,
zIndex:30,
padding:"10px 18px",
border:"3px solid #2F80FF",
color:"#2F80FF",
fontWeight:700,
borderRadius:14,
transform:"rotate(12deg)"
}}>
LIKE
</div>
)}


{/* NOPE LABEL */}
{dragX<-35 &&(
<div style={{
position:"absolute",
top:84,
left:34,
zIndex:30,
padding:"10px 18px",
border:"3px solid #FF6A6A",
color:"#FF6A6A",
fontWeight:700,
borderRadius:14,
transform:"rotate(-12deg)"
}}>
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



{/* PHOTO TAP LEFT RIGHT */}
<div
onClick={(e:any)=>{
const rect=e.currentTarget.getBoundingClientRect();
const x=e.clientX-rect.left;

if(x<rect.width/2){
setPhotoIndex(p=>
p===0
? photos.length-1
: p-1
);
}else{
setPhotoIndex(p=>
p===photos.length-1
?0
:p+1
);
}
}}
style={{
position:"absolute",
inset:0,
zIndex:4
}}
/>



{/* COUNTER */}
<div
style={{
position:"absolute",
top:26,
left:26,
zIndex:10,
background:"rgba(70,70,70,.45)",
backdropFilter:"blur(10px)",
padding:"12px 18px",
borderRadius:18,
color:"#fff",
fontSize:18
}}
>
{photoIndex+1} / {photos.length}
</div>
{/* TRUE TINDER FOG FROM BOTTOM */}
<div
style={{
position:"absolute",
left:0,
right:0,
bottom:0,
height:"30%",
zIndex:5,
pointerEvents:"none",
background:`
linear-gradient(
to top,
rgba(255,255,255,1) 0%,
rgba(255,255,255,.99) 18%,
rgba(255,255,255,.95) 34%,
rgba(255,255,255,.78) 54%,
rgba(255,255,255,.46) 72%,
rgba(255,255,255,.16) 88%,
rgba(255,255,255,0) 100%
)
`,
filter:"blur(22px)"
}}
/>



{/* TEXT LOW ON PHOTO */}
<div
style={{
position:"absolute",
left:32,
right:32,
bottom:22,
zIndex:12
}}
>

<h2 style={{
margin:0,
fontSize:18,
fontWeight:600,
letterSpacing:"-.2px",
lineHeight:1.1
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
lineHeight:1.32,
maxWidth:"82%"
}}>
{currentUser.bio ||
"Люблю путешествия и новые впечатления ✈✨"}
</p>


<div
style={{
display:"flex",
flexWrap:"wrap",
gap:8
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
padding:"6px 11px",
borderRadius:999,
background:"#EEF5FF",
color:"#4D8DFF",
fontSize:11.5,
fontWeight:500
}}
>
{tag}
</div>
))}
</div>

</div>

</div>



{/* ACTIONS */}
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
border:"none",
borderRadius:"50%",
background:"#fff",
fontSize:34,
color:"#A9AFB8",
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
border:"none",
borderRadius:"50%",
background:"#fff",
fontSize:30,
color:"#A9AFB8",
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
)
}