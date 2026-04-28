"use client";

import { useRouter } from "next/navigation";

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

return(

<div
style={{
height:"100dvh",

overflowY:"auto",
WebkitOverflowScrolling:"touch",

background:"#FCFCFE",

padding:"10px 16px 120px",

maxWidth:"430px",
margin:"0 auto"
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
display:"flex",
flexDirection:"column",
justifyContent:"center"
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
marginTop:5,
fontSize:14,
color:"#8A8F9B"
}}
>
{user.city}
</div>

<div
style={{
marginTop:12,

width:175,
height:40,

display:"flex",
alignItems:"center",
justifyContent:"center",

borderRadius:999,

background:"#fff",
border:"2px solid #5EA9FF",

color:"#2F80FF",

fontSize:14,
fontWeight:600,

whiteSpace:"nowrap"
}}
>
Смотреть профиль
</div>

</div>


<div
style={{
display:"flex",
alignItems:"center",
gap:14,
marginLeft:14
}}
>

<div
style={{
width:42,
height:42,
borderRadius:"50%",
background:"#FAFAFC",
border:"1px solid #ECEFF5",

display:"flex",
alignItems:"center",
justifyContent:"center",

fontSize:18
}}
>
✕
</div>

<div
style={{
width:42,
height:42,
borderRadius:"50%",

background:"#fff",
border:"2px solid #5EA9FF",

display:"flex",
alignItems:"center",
justifyContent:"center",

fontSize:18,
color:"#2F80FF"
}}
>
♡
</div>

</div>

</div>


))}

</div>

</div>

)

}