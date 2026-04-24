
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

/* Aura Sync */
const [showMatch,setShowMatch]=useState(false);
const [matchedUser,setMatchedUser]=useState<any>(null);

/* button glow states */
const [skipPressed,setSkipPressed]=useState(false);
const [likePressed,setLikePressed]=useState(false);
const [boostPressed,setBoostPressed]=useState(false);

const startX=useRef(0);

const currentUserId=123; // временно


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
setIndex(prev=>prev+1);
}



/* LIKE + MATCH */
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

setMatchedUser(currentUser);
setShowMatch(true);

return;
}

}

nextUser();

}



function handleSkip(){
nextUser();
}



/* SWIPE */
function touchStart(e:any){
startX.current=e.touches[0].clientX;
setDragging(true);
}

function touchMove(e:any){

if(!dragging) return;

const move=
e.touches[0].clientX-startX.current;

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



/* PHOTO TAP */
function changePhoto(e:any){

if(!photos.length) return;

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
? 0
: p+1
);

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

boxShadow:
"0 10px 30px rgba(0,0,0,.06)",

transform:dragging
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

<div
style={{
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
}}
>
{photoIndex+1} / {photos.length}
</div>



<div
style={{
position:"absolute",
left:0,
right:0,
bottom:0,
height:"55%",
zIndex:4,
pointerEvents:"none",

background:`
linear-gradient(
to top,
#ffffff 0%,
rgba(255,255,255,.98) 18%,
rgba(255,255,255,.92) 35%,
rgba(255,255,255,.72) 55%,
rgba(255,255,255,.42) 72%,
rgba(255,255,255,.12) 88%,
rgba(255,255,255,0) 100%
)
`
}}
/>
<div
style={{
position:"absolute",
left:30,
right:30,
bottom:26,
zIndex:8
}}
>

<h2
style={{
margin:0,
fontSize:18,
fontWeight:600
}}
>
{currentUser.name}, {currentUser.age}
</h2>

<div
style={{
marginTop:4,
fontSize:13,
color:"#70717C"
}}
>
📍 {currentUser.city}, 2 км от вас
</div>

<p
style={{
marginTop:8,
marginBottom:10,
fontSize:14,
lineHeight:1.3,
maxWidth:"82%"
}}
>
{currentUser.bio || "Люблю путешествия и новые впечатления ✈✨"}
</p>

<div
style={{
display:"flex",
flexWrap:"wrap",
gap:8
}}
>
{(
currentUser.interests || [
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
? "linear-gradient(135deg,#FF8CB7,#FF5FA2)"
:"#fff",
transform:skipPressed
?"scale(1.08)"
:"scale(1)",
transition:"all .18s ease",
display:"flex",
justifyContent:"center",
alignItems:"center",
boxShadow:skipPressed
?"0 12px 30px rgba(255,95,162,.35)"
:"0 10px 30px rgba(0,0,0,.06)"
}}
>
<X
size={30}
color={skipPressed ? "white":"#98A0AE"}
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
? "linear-gradient(135deg,#FF5E73,#FF304F)"
: "linear-gradient(135deg,#4FACFE,#2979FF)",

transform:likePressed
?"scale(1.09)"
:"scale(1)",

transition:"all .18s ease",

display:"flex",
justifyContent:"center",
alignItems:"center",

boxShadow:likePressed
?"0 14px 34px rgba(255,64,100,.42)"
:"0 12px 28px rgba(41,121,255,.35)"
}}
>
<Heart
size={38}
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
? "linear-gradient(135deg,#FFD95A,#FFB800)"
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
color={boostPressed ? "white":"#98A0AE"}
strokeWidth={2.3}
/>
</button>

</div>



{showMatch && (
<div
style={{
position:"fixed",
inset:0,
zIndex:9999,
background:
"linear-gradient(180deg,#0E1734 0%,#122A66 100%)",
display:"flex",
justifyContent:"center",
alignItems:"center"
}}
>

<div
style={{
width:"100%",
maxWidth:420,
padding:"34px 28px",
textAlign:"center"
}}
>

<div
style={{
fontSize:42,
fontWeight:800,
color:"#fff",
marginBottom:12,
animation:"pulse 1.3s infinite"
}}
>
✨ Aura Sync
</div>


<div
style={{
color:"rgba(255,255,255,.85)",
fontSize:18,
marginBottom:44
}}
>
Ваши ауры совпали
</div>



<div
style={{
display:"flex",
justifyContent:"center",
alignItems:"center",
marginBottom:44
}}
>

<img
src={matchedUser?.avatar_url}
style={{
width:118,
height:118,
borderRadius:"50%",
objectFit:"cover",
border:"5px solid white",
boxShadow:"0 0 35px rgba(79,172,254,.45)"
}}
/>


<div
style={{
margin:"0 -22px",
width:62,
height:62,
borderRadius:"50%",
background:
"linear-gradient(135deg,#4FACFE,#2979FF)",
display:"flex",
justifyContent:"center",
alignItems:"center",
color:"#fff",
fontSize:30,
boxShadow:"0 0 35px rgba(79,172,254,.5)",
zIndex:2,
animation:"pulse 1.2s infinite"
}}
>
❤
</div>


<img
src={matchedUser?.avatar_url}
style={{
width:118,
height:118,
borderRadius:"50%",
objectFit:"cover",
border:"5px solid white",
boxShadow:"0 0 35px rgba(79,172,254,.45)"
}}
/>

</div>



<button
style={{
width:"100%",
height:64,
border:"none",
borderRadius:22,
background:
"linear-gradient(135deg,#4FACFE,#2979FF)",
color:"#fff",
fontSize:18,
fontWeight:700,
boxShadow:"0 14px 30px rgba(41,121,255,.35)"
}}
>
Начать диалог
</button>



<button
onClick={()=>{
setShowMatch(false);
nextUser();
}}
style={{
marginTop:14,
width:"100%",
height:64,
borderRadius:22,
background:"transparent",
border:"2px solid rgba(255,255,255,.75)",
color:"#fff",
fontWeight:700,
fontSize:18
}}
>
Продолжить поиск
</button>



<style jsx>{`
@keyframes pulse{
0%{transform:scale(1);}
50%{transform:scale(1.08);}
100%{transform:scale(1);}
}
`}</style>

</div>

</div>
)}

</>
)}

<BottomNav/>

</div>
);

}
