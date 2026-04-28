"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LikesPage(){

const router = useRouter();

const [likes] = useState([
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
]);

return(
<div
style={{
minHeight:"100dvh",
background:"#FCFCFE",
padding:"10px 16px 120px",
maxWidth:"430px",
margin:"0 auto"
}}
>

{/* HEADER */}
<div
style={{
display:"flex",
alignItems:"center",
gap:12,
paddingTop:8
}}
>

<div
onClick={()=>router.back()}
style={{
fontSize:34,
color:"#2F80FF",
cursor:"pointer"
}}
>
‹
</div>

<div>
<div
style={{
fontSize:26,
fontWeight:700
}}
>
Тебя лайкнули
</div>

<div
style={{
fontSize:13,
color:"#8A8F9B",
marginTop:4
}}
>
Люди, которым ты понравился
</div>

</div>

</div>


{/* PREMIUM CARD */}
<div
style={{
marginTop:22,

padding:"18px",

borderRadius:24,

background:
"linear-gradient(135deg,#EDF4FF,#F8FAFF)",

boxShadow:
"0 6px 20px rgba(46,123,255,.08)"
}}
>

<div
style={{
fontSize:18,
fontWeight:700
}}
>
12 человек тебя лайкнули ❤️
</div>

<div
style={{
marginTop:8,
fontSize:14,
color:"#718096"
}}
>
Посмотри профили и ответь взаимностью
</div>

</div>


{/* USERS */}
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
position:"relative"
}}
>
<img
src={user.img}
style={{
width:78,
height:78,
borderRadius:"50%",
objectFit:"cover",
filter:"blur(8px)"
}}
/>

<div
style={{
position:"absolute",
inset:0,
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:28
}}
>
❤️
</div>

</div>


<div
style={{
flex:1,
marginLeft:16
}}
>

<div
style={{
fontSize:18,
fontWeight:700
}}
>
{user.name}, {user.age}
</div>

<div
style={{
fontSize:14,
color:"#8A8F9B",
marginTop:5
}}
>
{user.city}
</div>

<div
style={{
marginTop:8,
color:"#2F80FF",
fontWeight:600,
fontSize:14
}}
>
Посмотреть профиль →
</div>

</div>


<div
style={{
display:"flex",
gap:10
}}
>

<div
style={{
width:40,
height:40,
borderRadius:"50%",
background:"#F2F4F7",

display:"flex",
alignItems:"center",
justifyContent:"center"
}}
>
✕
</div>

<div
style={{
width:40,
height:40,
borderRadius:"50%",
background:"#2F80FF",
color:"#fff",

display:"flex",
alignItems:"center",
justifyContent:"center"
}}
>
♥
</div>

</div>

</div>

))}

</div>

</div>
)
}