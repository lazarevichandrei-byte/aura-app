"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import BottomNav from "../../components/BottomNav";

export default function Home() {

const [users,setUsers]=useState<any[]>([]);
const [index,setIndex]=useState(0);
const [photoIndex,setPhotoIndex]=useState(0);

const [dragX,setDragX]=useState(0);
const [dragging,setDragging]=useState(false);

const [expanded,setExpanded]=useState(false);

const startX=useRef<number|null>(null);

const currentUserId=123;



useEffect(()=>{
 loadUsers();
},[]);



async function loadUsers(){

 const {data}=await supabase
 .from("users")
 .select("*")
 .neq("telegram_id",currentUserId);

 if(data){
  setUsers(data);
 }

}


const currentUser=users[index];


function getPhotos(user:any){
 if(!user) return [];

 if(
 Array.isArray(user.photos)
 && user.photos.length
 ){
   return user.photos;
 }

 if(user.avatar_url){
   return [user.avatar_url];
 }

 return [];
}


const photos=getPhotos(currentUser);



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

 }

}


animateOut(420);

}



function skipUser(){
 animateOut(-420);
}



function animateOut(value:number){

 setDragX(value);

 setTimeout(()=>{
  setPhotoIndex(0);
  setExpanded(false);
  setIndex(prev=>prev+1);
  setDragX(0);
 },260);

}




function onStart(clientX:number){
 startX.current=clientX;
 setDragging(true);
}



function onMove(clientX:number){

 if(startX.current===null) return;

 const distance=
 clientX-startX.current;

 setDragX(distance);

}



function onEnd(){

 setDragging(false);

 if(dragX>120){
   handleLike();
   return;
 }

 if(dragX<-120){
   skipUser();
   return;
 }

 setDragX(0);
 startX.current=null;

}



function nextPhoto(e:any){

 if(!photos.length) return;

 const rect=
 e.currentTarget.getBoundingClientRect();

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

}



const rotate=dragX/18;



return(

<div
style={{
background:"#F7F7F8",
minHeight:"100vh",
padding:"18px 18px 110px",
fontFamily:"-apple-system, SF Pro Display"
}}
>


{/* top */}
<div
style={{
display:"flex",
justifyContent:"space-between",
marginTop:8,
marginBottom:18
}}
>

<button
style={{
width:48,
height:48,
border:"none",
borderRadius:"50%",
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
border:"none",
borderRadius:"50%",
background:"#fff",
boxShadow:
"0 4px 12px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04)"
}}
>
⚙
</button>

</div>



{currentUser && (

<>
<div

onMouseDown={(e)=>onStart(e.clientX)}
onMouseMove={(e)=>dragging&&onMove(e.clientX)}
onMouseUp={onEnd}
onMouseLeave={()=>dragging&&onEnd()}

onTouchStart={(e)=>
onStart(e.touches[0].clientX)
}

onTouchMove={(e)=>
onMove(e.touches[0].clientX)
}

onTouchEnd={onEnd}


style={{
height: expanded ? "84vh":"74vh",
background:"#fff",
borderRadius:36,
overflow:"hidden",
position:"relative",
boxShadow:
"0 10px 30px rgba(0,0,0,.06)",

transform:
`translateX(${dragX}px)
 rotate(${rotate}deg)`,

transition:
dragging
?"none"
:"all .28s cubic-bezier(.2,.9,.2,1)"
}}
>


{/* PHOTO */}
<div
onClick={nextPhoto}
style={{
height:"72%",
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
fontSize:18
}}
>
{photoIndex+1}/{photos.length||1}
</div>



{/* BIG SOFT FADE */}
<div
style={{
position:"absolute",
left:0,
right:0,
bottom:-25,
height:280,
background:`
linear-gradient(
to bottom,
rgba(255,255,255,0) 0%,
rgba(255,255,255,.05) 30%,
rgba(255,255,255,.35) 55%,
rgba(255,255,255,.78) 80%,
rgba(255,255,255,.96) 93%,
#fff 100%
)`,
filter:"blur(30px)",
transform:"scale(1.1)"
}}
/>

</div>



{/* INFO */}
<div
style={{
position:"absolute",
left:30,
right:30,
bottom:42,
zIndex:5
}}
>

<div
style={{
fontSize:22,
fontWeight:600,
marginBottom:10
}}
>
{currentUser.name}, {currentUser.age}
</div>


<div
style={{
fontSize:16,
color:"#7B7B87",
marginBottom:12
}}
>
📍 {currentUser.city}, 2 км от вас
</div>


<div
style={{
fontSize:15,
lineHeight:1.45,
marginBottom:16
}}
>
{currentUser.bio ||
"Люблю путешествия и новые впечатления ✈️✨"}
</div>


<div
style={{
display:"flex",
gap:10,
flexWrap:"wrap"
}}
>
{(currentUser.interests || [
"Путешествия",
"Музыка",
"Спорт",
"Кино",
"Фото"
]).slice(
0,
expanded ? 15 : 5
).map((item:string)=>(

<div
key={item}
style={{
padding:"10px 15px",
borderRadius:999,
background:"#EEF5FF",
color:"#4D8DFF",
fontSize:13
}}
>
{item}
</div>

))}
</div>


{expanded && (
<div
style={{
marginTop:18,
fontSize:14,
lineHeight:1.6,
color:"#333"
}}
>
{currentUser.about ||
"Здесь раскрытая анкета, дополнительные поля и полный профиль."}
</div>
)}

</div>




{/* overlays show immediately */}
{dragX>12 && (
<div
style={{
position:"absolute",
top:95,
right:30,
opacity:Math.min(dragX/60,1),
border:"3px solid #2F80FF",
color:"#2F80FF",
padding:"8px 16px",
fontWeight:700,
borderRadius:12,
transform:"rotate(12deg)"
}}
>
LIKE
</div>
)}

{dragX<-12 && (
<div
style={{
position:"absolute",
top:95,
left:30,
opacity:Math.min(Math.abs(dragX)/60,1),
border:"3px solid #ff5b6b",
color:"#ff5b6b",
padding:"8px 16px",
fontWeight:700,
borderRadius:12,
transform:"rotate(-12deg)"
}}
>
NOPE
</div>
)}

</div>



{/* OUTSIDE SWIPE — buttons do not move */}
<div
style={{
display:"flex",
justifyContent:"center",
alignItems:"center",
gap:26,
marginTop:20
}}
>

{/* expand profile */}
<button
onClick={()=>setExpanded(
!expanded
)}
style={{
width:72,
height:72,
borderRadius:"50%",
border:"none",
background:"#fff",
fontSize:38,
color:"#A9ADB7",
boxShadow:
"0 8px 20px rgba(0,0,0,.06)"
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
fontSize:34,
boxShadow:
"0 10px 30px rgba(32,111,255,.35)"
}}
>
♥
</button>


<button
style={{
width:72,
height:72,
borderRadius:"50%",
border:"none",
background:"#fff",
fontSize:30,
color:"#A9ADB7",
boxShadow:
"0 8px 20px rgba(0,0,0,.06)"
}}
>
★
</button>


</div>

</>
)}

<BottomNav/>

</div>

)

}