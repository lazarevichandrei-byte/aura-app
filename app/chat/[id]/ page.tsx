"use client";

import { useRouter } from "next/navigation";

const messages = [
{
from:"them",
text:"Привет 🙂"
},
{
from:"me",
text:"Привет! Как дела?"
},
{
from:"them",
text:"Может кофе завтра? ☕"
}
];

export default function ChatPage(){

const router = useRouter();

return(
<div style={{
height:"100vh",
background:"#F6F7FB",
display:"flex",
flexDirection:"column"
}}>

{/* HEADER */}
<div style={{
height:82,
background:"#fff",
display:"flex",
alignItems:"center",
padding:"0 18px",
borderBottom:"1px solid #ECECEC"
}}>

<button
onClick={()=>router.push("/chats")}
style={{
border:"none",
background:"transparent",
fontSize:28,
marginRight:12
}}
>
←
</button>

<img
src="/girl1.jpg"
style={{
width:44,
height:44,
borderRadius:"50%",
objectFit:"cover"
}}
/>

<div style={{marginLeft:12}}>
<div style={{
fontWeight:700,
fontSize:18
}}>
Алина
</div>

<div style={{
fontSize:13,
color:"#2F80FF"
}}>
online
</div>
</div>

</div>


{/* MESSAGES */}
<div style={{
flex:1,
padding:"22px 16px",
overflowY:"auto"
}}>
{messages.map((m,i)=>(
<div
key={i}
style={{
display:"flex",
justifyContent:
m.from==="me"
? "flex-end"
:"flex-start",
marginBottom:14
}}
>
<div
style={{
maxWidth:"72%",
padding:"13px 16px",
borderRadius:22,
fontSize:16,
background:
m.from==="me"
? "#2F80FF"
:"#fff",
color:
m.from==="me"
? "#fff"
:"#111",
boxShadow:"0 4px 12px rgba(0,0,0,.05)"
}}
>
{m.text}
</div>
</div>
))}
</div>


{/* INPUT */}
<div style={{
background:"#fff",
padding:"14px 14px 28px",
borderTop:"1px solid #ECECEC"
}}>
<div style={{
display:"flex",
gap:10
}}>
<input
placeholder="Сообщение..."
style={{
flex:1,
height:50,
border:"none",
outline:"none",
background:"#F3F5F8",
borderRadius:25,
padding:"0 18px",
fontSize:16
}}
/>

<button
style={{
width:52,
height:52,
borderRadius:"50%",
border:"none",
background:"#2F80FF",
color:"#fff",
fontSize:20
}}
>
➤
</button>

</div>
</div>

</div>
)

}