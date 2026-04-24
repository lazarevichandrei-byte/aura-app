"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import BottomNav from "../../components/BottomNav";
import { X, Heart, Sparkles } from "lucide-react";

import { useRouter } from "next/navigation";

export default function Home() {
const router = useRouter();  

const [users,setUsers]=useState<any[]>([]);
const [index,setIndex]=useState(0);
const [photoIndex,setPhotoIndex]=useState(0);
const [myProfile,setMyProfile]=useState<any>(null);

const [dragX,setDragX]=useState(0);
const [dragging,setDragging]=useState(false);


const [showMatch,setShowMatch]=useState(false);
const [matchedUser,setMatchedUser]=useState<any>(null);

const [skipPressed,setSkipPressed]=useState(false);
const [likePressed,setLikePressed]=useState(false);
const [boostPressed,setBoostPressed]=useState(false);

const startX=useRef(0);


const currentUserId =

typeof window !== "undefined" &&
(window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id
? Number(
(window as any).Telegram.WebApp.initDataUnsafe.user.id
)
: 123;

useEffect(()=>{
 loadUsers();
},[]);


async function loadUsers(){

const {data}=await supabase
.from("users")
.select("*");

if(data){

setUsers(
data.filter(
u=>u.telegram_id!==currentUserId
)
);

setMyProfile(
data.find(
u=>u.telegram_id===currentUserId
)
);

}

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

async function handleLike(){

if(!currentUser) return;

const likedUserId=currentUser.telegram_id;

if(!likedUserId){
nextUser();
return;
}

/* сохраняем лайк */
await supabase
.from("likes")
.upsert(
{
from_user: currentUserId,
to_user: likedUserId
},
{
onConflict:"from_user,to_user"
}
);


/* ищем ответный лайк */
const {data:rows}=await supabase
.from("likes")
.select("id")
.eq("from_user",likedUserId)
.eq("to_user",currentUserId);


/* MATCH */
if(rows && rows.length>0){

setMatchedUser(currentUser);
setShowMatch(true);




/* мой лайк -> его */
await supabase
.from("likes")
.delete()
.eq("from_user",currentUserId)
.eq("to_user",likedUserId);


/* его лайк -> мой */
await supabase
.from("likes")
.delete()
.eq("from_user",likedUserId)
.eq("to_user",currentUserId);


/* OPTIONAL: удалить старый match если нужен одноразовый мэтч */
await supabase
.from("matches")
.delete()
.or(
`user1.eq.${Math.min(currentUserId,likedUserId)},user2.eq.${Math.max(currentUserId,likedUserId)}`
);

return;
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
function changePhoto(e:any){

if(!photos.length) return;

const rect=e.currentTarget.getBoundingClientRect();
const x=e.clientX-rect.left;

if(x<rect.width/2){
setPhotoIndex(p=>p===0 ? photos.length-1 : p-1);
}else{
setPhotoIndex(p=>p===photos.length-1 ? 0 : p+1);
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
transform:dragging
?`translateX(${dragX}px) rotate(${dragX/24}deg)`
:`translateX(${dragX}px)`,
transition:dragging
?"none"
:"all .28s cubic-bezier(.2,.8,.2,1)"
}}
>

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
color:"#fff"
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

<h2 style={{margin:0,fontSize:18,fontWeight:600}}>
{currentUser.name}, {currentUser.age}
</h2>

<div style={{
marginTop:4,
fontSize:13,
color:"#70717C"
}}>
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
"Путешествия","Музыка","Спорт","Кино","Фото"
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
transform:skipPressed?"scale(1.08)":"scale(1)",
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
:"linear-gradient(135deg,#4FACFE,#2979FF)",
transform:likePressed?"scale(1.09)":"scale(1)",
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
setTimeout(()=>setBoostPressed(false),180);
}}
style={{
width:72,
height:72,
borderRadius:"50%",
border:"none",
background:boostPressed
? "linear-gradient(135deg,#FFD95A,#FFB800)"
:"#fff",
transform:boostPressed?"scale(1.08)":"scale(1)",
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
zIndex:99999,
background:
"linear-gradient(180deg, rgba(255,255,255,.16) 0%, rgba(255,255,255,.28) 100%)",
backdropFilter:"blur(34px)",
WebkitBackdropFilter:"blur(34px)",
display:"flex",
justifyContent:"center",
alignItems:"center",
animation:"fadeIn .35s ease"
}}
>


<style>{`
@keyframes fadeIn{
from{opacity:0}
to{opacity:1}
}

@keyframes avatarsMeet{
0%{
transform:translateX(-55px) scale(.8);
opacity:0;
}
100%{
transform:translateX(0) scale(1);
opacity:1;
}
}

@keyframes avatarsMeet2{
0%{
transform:translateX(55px) scale(.8);
opacity:0;
}
100%{
transform:translateX(0) scale(1);
opacity:1;
}
}

@keyframes pulseHeart{
0%{transform:scale(.7)}
50%{transform:scale(1.12)}
100%{transform:scale(1)}
}
`}</style>


<div
style={{
width:"100%",
maxWidth:430,
padding:"40px 28px",
textAlign:"center"
}}
>

<div
style={{
fontSize:44,
fontWeight:700,
marginBottom:42
}}
>
Это матч! 💙
</div>




{/* avatars */}
<div
style={{
display:"flex",
justifyContent:"center",
alignItems:"center",
marginBottom:42
}}
>

<div
style={{
animation:"avatarsMeet .5s ease",
marginRight:-30,
zIndex:2
}}
>
<img
src={myProfile?.avatar_url || "/me.jpg"}
style={{
width:145,
height:145,
borderRadius:"50%",
objectFit:"cover",
border:"5px solid white",
boxShadow:"0 0 0 3px #2F80FF,0 18px 40px rgba(47,128,255,.25)"
}}
/>
</div>


<div
style={{
width:68,
height:68,
borderRadius:"50%",
background:"linear-gradient(135deg,#4FACFE,#2979FF)",
display:"flex",
alignItems:"center",
justifyContent:"center",
zIndex:5,
animation:"pulseHeart .8s ease",
boxShadow:"0 10px 28px rgba(41,121,255,.30)"
}}
>
<Heart
size={30}
fill="white"
stroke="white"
/>
</div>


<div
style={{
animation:"avatarsMeet2 .5s ease",
marginLeft:-30,
zIndex:2
}}
>
<img
src={matchedUser?.avatar_url}
style={{
width:145,
height:145,
borderRadius:"50%",
objectFit:"cover",
border:"5px solid white",
boxShadow:"0 0 0 3px #2F80FF,0 18px 40px rgba(47,128,255,.25)"
}}
/>
</div>

</div>


<div
style={{
fontSize:21,
lineHeight:1.45,
color:"#4C4F5D",
marginBottom:38
}}
>
Вы и {matchedUser?.name}
<br/>
понравились друг другу
</div>


<button
onClick={()=>{
setShowMatch(false);
router.push("/chats");
}}
style={{
width:"78%",
height:58,
border:"none",
borderRadius:20,
background:"linear-gradient(135deg,#4FACFE,#2979FF)",
color:"#fff",
fontSize:18,
fontWeight:600
}}
>
Написать сообщение
</button>


<button
onClick={()=>{
setShowMatch(false);
nextUser();
}}
style={{
marginTop:16,
width:"78%",
height:54,
borderRadius:16,
border:"2px solid #64A8FF",
background:"#fff",
color:"#2F80FF",
fontSize:18,
fontWeight:500
}}
>
Продолжить поиск
</button>


</div>
</div>
)}
</>
)}

<BottomNav/>

</div>
);

}