"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import BottomNav from "../../components/BottomNav";
import { X, Heart, Sparkles } from "lucide-react";

export default function Home(){

const [users,setUsers]=useState<any[]>([]);
const [index,setIndex]=useState(0);
const [photoIndex,setPhotoIndex]=useState(0);

const [dragX,setDragX]=useState(0);
const [dragging,setDragging]=useState(false);

const [showMatch,setShowMatch]=useState(false);
const [matchedUser,setMatchedUser]=useState<any>(null);

const [skipPressed,setSkipPressed]=useState(false);
const [likePressed,setLikePressed]=useState(false);
const [boostPressed,setBoostPressed]=useState(false);

const startX = useRef<number>(0);

const currentUserId=
typeof window!=="undefined" &&
(window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id
? Number(
(window as any).Telegram.WebApp.initDataUnsafe.user.id
)
:123;

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
:[];


function nextUser(){
setPhotoIndex(0);
setDragX(0);
setIndex(prev=>prev+1);
}


/* MATCH */
async function handleLike(){

if(!currentUser) return;

const likedUserId=currentUser.telegram_id;

await supabase
.from("likes")
.upsert(
{
from_user:currentUserId,
to_user:likedUserId
},
{
onConflict:"from_user,to_user"
}
);

const {data:reverseLike}=await supabase
.from("likes")
.select("*")
.eq("from_user",likedUserId)
.eq("to_user",currentUserId)
.maybeSingle();

if(reverseLike){

setMatchedUser(currentUser);
setShowMatch(true);
return;

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
setDragX(
e.touches[0].clientX-startX.current
);
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
setPhotoIndex(p=>
p===0
? photos.length-1
:p-1
);
}else{
setPhotoIndex(p=>
p===photos.length-1
?0
:p+1
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
"0 10px 30px rgba(0,0,0,.06)"
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

<div
onClick={changePhoto}
style={{
position:"absolute",
inset:0
}}
/>

<div
style={{
position:"absolute",
top:26,
left:26,
background:"rgba(80,80,80,.45)",
padding:"12px 18px",
borderRadius:18,
color:"#fff"
}}
>
{photoIndex+1}/{photos.length}
</div>

<div
style={{
position:"absolute",
left:0,
right:0,
bottom:0,
height:"55%",
background:`
linear-gradient(
to top,
#fff 0%,
rgba(255,255,255,.95) 30%,
rgba(255,255,255,.45) 70%,
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
bottom:26
}}
>
<h2>
{currentUser.name}, {currentUser.age}
</h2>

<p>
📍 {currentUser.city}
</p>

<p>
{currentUser.bio}
</p>
</div>

</div>
<div
style={{
marginTop:24,
display:"flex",
justifyContent:"center",
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
:"#fff"
}}
>
<X
size={30}
color={skipPressed ? "white" : "#98A0AE"}
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
:"linear-gradient(135deg,#4FACFE,#2979FF)"
}}
>
<Heart
size={38}
fill="white"
stroke="white"
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
:"#fff"
}}
>
<Sparkles
size={28}
color={boostPressed ? "white" : "#98A0AE"}
strokeWidth={2.3}
/>
</button>

</div>

</>
)}
{showMatch && (
<div
style={{
position:"fixed",
inset:0,
zIndex:9999,
background:"#fff",
display:"flex",
justifyContent:"center",
alignItems:"center"
}}
>
<div
style={{
width:"100%",
maxWidth:420,
padding:"34px 32px",
textAlign:"center"
}}
>

<h1>
Это мэтч! 💙
</h1>

<div
style={{
display:"flex",
justifyContent:"center",
alignItems:"center",
margin:"30px 0"
}}
>

<img
src="/me.jpg"
style={{
width:145,
height:145,
borderRadius:"50%"
}}
/>

<div
style={{
margin:"0 -18px",
width:70,
height:70,
borderRadius:"50%",
display:"flex",
justifyContent:"center",
alignItems:"center",
background:
"linear-gradient(135deg,#4FACFE,#2979FF)"
}}
>
<Heart
size={34}
fill="white"
stroke="white"
/>
</div>

<img
src={matchedUser?.avatar_url}
style={{
width:145,
height:145,
borderRadius:"50%"
}}
/>

</div>

<button>
✈ Написать сообщение
</button>

<button
onClick={()=>{
setShowMatch(false);
nextUser();
}}
>
Продолжить поиск
</button>

</div>
</div>
)}

<BottomNav/>

</div>
);

}