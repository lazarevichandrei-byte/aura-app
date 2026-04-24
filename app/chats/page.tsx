"use client";

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
name:"Екатерина",
msg:"Ты был прав, фильм супер! 🎬",
time:"14:20",
unread:1,
avatar:"/girl3.jpg"
}
];

const matches=[
"/girl1.jpg",
"/girl2.jpg",
"/girl3.jpg",
"/girl4.jpg"
];

export default function Chats(){

return(
<div
style={{
minHeight:"100vh",
background:"#fff",
padding:"34px 22px 120px"
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
<h1 style={{
margin:0,
fontSize:42,
fontWeight:700,
letterSpacing:"-.5px"
}}>
Чаты
</h1>

<div style={{
display:"flex",
gap:14
}}>
<div style={circleBtn}>≡</div>
<div style={circleBtn}>＋</div>
</div>

</div>



{/* SEARCH */}
<div style={{
marginTop:30,
height:58,
borderRadius:22,
background:"#F4F6FA",
display:"flex",
alignItems:"center",
padding:"0 22px",
fontSize:19,
color:"#A2A5B0"
}}>
🔍 Поиск
</div>




{/* MATCH STORIES */}
<div
style={{
display:"flex",
gap:22,
overflowX:"auto",
marginTop:34,
paddingBottom:14
}}
>

<div style={{textAlign:"center"}}>
<div style={{
width:82,
height:82,
borderRadius:"50%",
background:"#EEF4FF",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:32
}}>
💙
</div>

<div style={{
marginTop:10,
fontSize:14,
fontWeight:500
}}>
Мои пары
</div>
</div>


{matches.map((img,i)=>(
<div key={i} style={{textAlign:"center"}}>

<div style={{
width:82,
height:82,
borderRadius:"50%",
padding:3,
border:"2px solid #2F80FF"
}}>
<img
src={img}
style={{
width:"100%",
height:"100%",
borderRadius:"50%",
objectFit:"cover"
}}
/>
</div>

<div style={{
marginTop:10,
fontSize:14,
fontWeight:500
}}>
{["Алина","Мария","Екатерина","Полина"][i]}
</div>

</div>
))}

</div>




{/* CHAT LIST */}
<div style={{marginTop:36}}>

{chats.map((chat)=>(
<div
key={chat.name}
style={{
display:"flex",
alignItems:"center",
padding:"24px 0",
borderBottom:"1px solid #F2F2F5"
}}
>

<img
src={chat.avatar}
style={{
width:74,
height:74,
borderRadius:"50%",
objectFit:"cover"
}}
/>


<div style={{
flex:1,
marginLeft:18
}}>

<div style={{
fontSize:22,
fontWeight:600
}}>
{chat.name}
</div>

<div style={{
marginTop:7,
fontSize:16,
lineHeight:1.4,
color:"#7B7E88"
}}>
{chat.msg}
</div>

</div>



<div style={{
display:"flex",
flexDirection:"column",
alignItems:"flex-end",
gap:12
}}>

<div style={{
fontSize:14,
color:"#9AA0AE"
}}>
{chat.time}
</div>


{chat.unread && (
<div style={{
width:28,
height:28,
borderRadius:"50%",
background:"#2F80FF",
color:"#fff",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:13,
fontWeight:700
}}>
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
width:50,
height:50,
borderRadius:"50%",
background:"#F5F6FA",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:22
}