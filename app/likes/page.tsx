"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
const likes = [
{
id:1,
name:"Анна",
age:24,
city:"Paris",
img:"/girl1.jpg"
},
{
id:2,
name:"София",
age:27,
city:"Lyon",
img:"/girl2.jpg"
},
{
id:3,
name:"Мария",
age:22,
city:"Nice",
img:"/girl3.jpg"
},
{
id:4,
name:"Полина",
age:26,
city:"Berlin",
img:"/girl4.jpg"
}
];

export default function LikesPage(){

const router = useRouter();
const touchStartX = useRef(0);

return(

<div

onTouchStart={(e)=>{
touchStartX.current =
e.touches[0].clientX;
}}

onTouchEnd={(e)=>{

const deltaX =
e.changedTouches[0].clientX -
touchStartX.current;

if(
touchStartX.current < 220 &&
deltaX > 100
){
router.back();
}

}}

style={{
height:"100dvh",

overflowY:"auto",
WebkitOverflowScrolling:"touch",

background:"#FCFCFE",

padding:"10px 16px 120px",

maxWidth:"430px",
margin:"0 auto",
paddingLeft:18,
paddingRight:18,
}}
>

{/* header */}
<div
style={{
display:"flex",
alignItems:"center",
minHeight:110,
gap:14,
paddingTop:8
}}
>

<div
onClick={()=>router.back()}
style={{
fontSize:52,
lineHeight:"38px",
color:"#2F80FF",
cursor:"pointer"
}}
>
‹
</div>

<div>
<div
style={{
fontSize:27,
fontWeight:700
}}
>
Тебя лайкнули
</div>

<div
style={{
fontSize:13,
marginTop:4,
color:"#8A8F9B"
}}
>
Люди которым ты понравился
</div>

</div>

</div>



{/* top card */}
<div
style={{
marginTop:22,

padding:"18px",

borderRadius:24,

background:
"linear-gradient(135deg,#EDF4FF,#F8FAFF)",

boxShadow:
"0 6px 18px rgba(46,123,255,.08)"
}}
>

<div
style={{
fontSize:19,
fontWeight:700
}}
>
12 человек тебя лайкнули ❤️
</div>

<div
style={{
marginTop:8,
fontSize:14,
color:"#7B8794"
}}
>
Посмотри кто проявил интерес
</div>

</div>



{/* likes list */}
<div style={{marginTop:22}}>

{likes.map(user=>(

<div
key={user.id}

onClick={()=>{
alert("Потом откроем профиль");
}}

style={{
background:"#fff",

borderRadius:26,

padding:"14px",

marginBottom:14,

display:"flex",
alignItems:"center",

boxShadow:
"0 2px 10px rgba(0,0,0,.04)",

cursor:"pointer"
}}
>

<div
style={{
position:"relative",

padding:2,
borderRadius:"50%",

border:"2px solid #2F80FF"
}}
>

<img
src={user.img}
style={{
width:78,
height:78,
borderRadius:"50%",
objectFit:"cover",
filter:"blur(14px)",
transform:"scale(1.08)"
}}
/>



</div>


<div
style={{
flex:1,
marginLeft:16,
marginRight:12,

display:"flex",
flexDirection:"column",
justifyContent:"center",
alignItems:"flex-start"
}}
>

<div
style={{
fontSize:18,
fontWeight:700,
lineHeight:"22px"
}}
>
{user.name}, {user.age}
</div>

<div
style={{
marginTop:4,
fontSize:14,
color:"#8A8F9B"
}}
>
{user.city}
</div>

<div
style={{
marginTop:12,
width:150,
height:34,

display:"flex",
alignItems:"center",
justifyContent:"center",

borderRadius:999,
border:"2px solid #5EA9FF",

background:"#fff",

fontSize:13,
fontWeight:600,
color:"#2F80FF"
}}
>
Смотреть профиль
</div>

</div>


<div
style={{
display:"flex",
flexDirection:"column",
justifyContent:"center",
alignItems:"center",
gap:10,
minWidth:42
}}
>

<div
style={{
width:40,
height:40,
borderRadius:"50%",
background:"#F7F8FB",
border:"1px solid #E8EDF5",

display:"flex",
alignItems:"center",
justifyContent:"center",

fontSize:17
}}
>
✕
</div>

<div
style={{
width:46,
height:46,
borderRadius:"50%",

background:"#fff",
border:"2px solid #5EA9FF",

display:"flex",
alignItems:"center",
justifyContent:"center",

boxSizing:"border-box"
}}
>
<span
style={{
fontSize:23,
lineHeight:"22px",
color:"#5EA9FF",
fontWeight:600,
transform:"scaleX(1.18)",
display:"inline-block"
}}
>
♡
</span>
</div>

</div>

</div>


))}

</div>

</div>

)

}