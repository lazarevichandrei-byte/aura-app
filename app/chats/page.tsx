"use client";

import { useRouter } from "next/navigation";
import BottomNav from "../../components/BottomNav";

const chats = [
{
name:"Алина",
msg:"Привет! Как прошёл твой день? 😊",
time:"18:42",
unread:2,
avatar:"/girl1.jpg"
},
{
name:"Дмитрий",
msg:"Хочешь завтра на кофе? ☕",
time:"17:30",
unread:1,
avatar:"/guy1.jpg"
},
{
name:"Мария",
msg:"Спасибо за классный вечер! 💙",
time:"16:15",
avatar:"/girl2.jpg"
},
{
name:"Алексей",
msg:"Отправил тебе фото",
time:"15:02",
avatar:"/guy2.jpg"
},
{
name:"Екатерина",
msg:"Ты был прав, фильм супер! 🎬",
time:"14:20",
unread:1,
avatar:"/girl3.jpg"
},
{
name:"Иван",
msg:"Договорились!",
time:"Вчера",
avatar:"/guy3.jpg"
},
{
name:"Полина",
msg:"Посмотрим, что будет дальше 😉",
time:"Вчера",
avatar:"/girl4.jpg"
}
];

const matches = [
{img:"/girl1.jpg",name:"Алина"},
{img:"/girl2.jpg",name:"Мария"},
{img:"/girl3.jpg",name:"Екатерина"},
{img:"/girl4.jpg",name:"Полина"},
];

export default function Chats(){

const router = useRouter();

return(
<div
style={{
minHeight:"100vh",
background:"#FCFCFE",
padding:"18px 16px 110px",
maxWidth:430,
margin:"0 auto"
}}
>

{/* HEADER */}
<div
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center"
}}
>
<h1
style={{
margin:0,
fontSize:34,
fontWeight:700,
letterSpacing:"-.8px"
}}
>
Чаты
</h1>

<div style={{display:"flex",gap:12}}>
<div style={circleBtn}>≡</div>
<div style={circleBtn}>＋</div>
</div>

</div>



{/* SEARCH */}
<div
style={{
marginTop:20,
height:52,
borderRadius:18,
background:"#F4F4F8",
display:"flex",
alignItems:"center",
padding:"0 18px",
fontSize:18,
color:"#A3A8B3"
}}
>
🔍 Поиск
</div>



{/* STORIES */}
<div
style={{
display:"flex",
gap:14,
overflowX:"auto",
marginTop:26,
paddingBottom:8
}}
>

<div style={{textAlign:"center"}}>
<div
style={{
width:68,
height:68,
borderRadius:"50%",
background:"#EEF4FF",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:30
}}
>
💙
</div>

<div
style={{
marginTop:6,
fontSize:13
}}
>
Мои пары
</div>
</div>


{matches.map((item,i)=>(

<div
key={i}
style={{textAlign:"center"}}
>

<div
style={{
position:"relative",
width:68,
height:68,
borderRadius:"50%",
padding:2.5,
border:"2px solid #2F80FF"
}}
>
<img
src={item.img}
style={{
width:"100%",
height:"100%",
borderRadius:"50%",
objectFit:"cover"
}}
/>

{i<3 &&(
<div
style={{
position:"absolute",
right:-1,
bottom:4,
width:14,
height:14,
background:"#47C73B",
border:"2px solid white",
borderRadius:"50%"
}}
/>
)}

</div>

<div
style={{
fontSize:13,
marginTop:6
}}
>
{item.name}
</div>

</div>

))}

</div>



{/* CHAT LIST */}
<div style={{marginTop:24}}>

{chats.map((chat,i)=>(

<div
key={chat.name}
onClick={()=>router.push("/chat/"+i)}
style={{
display:"flex",
alignItems:"center",
padding:"15px 0",
borderBottom:"1px solid #F1F2F5",
cursor:"pointer"
}}
>

<img
src={chat.avatar}
style={{
width:60,
height:60,
borderRadius:"50%",
objectFit:"cover"
}}
/>

<div
style={{
flex:1,
marginLeft:14
}}
>

<div
style={{
fontSize:18,
fontWeight:600
}}
>
{chat.name}
</div>

<div
style={{
fontSize:15,
color:"#8A8F9B",
marginTop:4
}}
>
{chat.msg}
</div>

</div>


<div
style={{
display:"flex",
flexDirection:"column",
alignItems:"flex-end",
gap:10
}}
>

<div
style={{
fontSize:14,
color:"#A0A5B0"
}}
>
{chat.time}
</div>

{chat.unread &&(
<div
style={{
width:24,
height:24,
borderRadius:"50%",
background:"#2F80FF",
color:"#fff",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:12,
fontWeight:700
}}
>
{chat.unread}
</div>
)}

</div>

</div>

))}

</div>

<BottomNav/>

</div>
)
}

const circleBtn={
width:42,
height:42,
borderRadius:"50%",
background:"#F4F6FB",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:20
};