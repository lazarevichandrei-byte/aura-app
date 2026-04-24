"use client";

import { ArrowLeft, Phone, Send, Image } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ChatPage() {

const router = useRouter();

const messages = [
{
from:"them",
text:"Привет 😊",
time:"18:41"
},
{
from:"them",
text:"Как прошёл твой день?",
time:"18:42"
},
{
from:"me",
text:"Очень хорошо, только освободился",
time:"18:43"
},
{
from:"me",
text:"А у тебя? ✨",
time:"18:43"
},
{
from:"them",
text:"Думаю куда сходить в выходные",
time:"18:45"
},
{
from:"them",
text:"Может кофе? ☕",
time:"18:46"
}
];

return(
<div
style={{
height:"100vh",
background:"#F6F8FC",
display:"flex",
flexDirection:"column",
maxWidth:430,
margin:"0 auto"
}}
>

{/* HEADER */}
<div
style={{
padding:"18px 18px 14px",
background:"#fff",
display:"flex",
alignItems:"center",
justifyContent:"space-between",
borderBottom:"1px solid #EEF1F6"
}}
>

<div
style={{
display:"flex",
alignItems:"center",
gap:12
}}
>

<div
onClick={()=>router.back()}
style={{
fontSize:28,
cursor:"pointer"
}}
>
<ArrowLeft size={28}/>
</div>

<img
src="/girl1.jpg"
style={{
width:48,
height:48,
borderRadius:"50%",
objectFit:"cover"
}}
/>

<div>
<div
style={{
fontSize:19,
fontWeight:700
}}
>
Алина
</div>

<div
style={{
fontSize:13,
color:"#2F80FF"
}}
>
● online
</div>
</div>

</div>


<div
style={{
width:44,
height:44,
borderRadius:"50%",
background:"#EEF4FF",
display:"flex",
alignItems:"center",
justifyContent:"center"
}}
>
<Phone size={20}/>
</div>

</div>



{/* MATCH BADGE */}
<div
style={{
display:"flex",
justifyContent:"center",
paddingTop:20
}}
>
<div
style={{
padding:"10px 18px",
background:"#EAF2FF",
borderRadius:30,
fontSize:14,
fontWeight:600,
color:"#2F80FF"
}}
>
💙 У вас матч
</div>
</div>




{/* MESSAGES */}
<div
style={{
flex:1,
overflowY:"auto",
padding:"26px 16px 120px"
}}
>

{messages.map((m,i)=>(

<div
key={i}
style={{
display:"flex",
justifyContent:
m.from==="me"
? "flex-end"
: "flex-start",
marginBottom:14
}}
>

<div
style={{
maxWidth:"74%",
padding:"14px 16px",
borderRadius:
m.from==="me"
? "22px 22px 6px 22px"
: "22px 22px 22px 6px",
background:
m.from==="me"
? "linear-gradient(135deg,#4DA3FF,#2F80FF)"
:"#fff",
color:
m.from==="me"
?"white"
:"#111",
fontSize:17,
lineHeight:1.35,
boxShadow:"0 4px 18px rgba(0,0,0,.05)"
}}
>
{m.text}

<div
style={{
marginTop:6,
fontSize:11,
opacity:.75,
textAlign:"right"
}}
>
{m.time}
</div>

</div>

</div>

))}

</div>



{/* INPUT */}
<div
style={{
position:"fixed",
bottom:0,
left:"50%",
transform:"translateX(-50%)",
width:"100%",
maxWidth:430,
background:"#fff",
padding:"14px 14px 26px",
borderTop:"1px solid #EEF1F6"
}}
>

<div
style={{
display:"flex",
alignItems:"center",
gap:10
}}
>

<div
style={{
width:42,
height:42,
borderRadius:"50%",
background:"#F2F5FB",
display:"flex",
alignItems:"center",
justifyContent:"center"
}}
>
<Image size={20}/>
</div>


<div
style={{
flex:1,
height:50,
background:"#F4F6FA",
borderRadius:30,
display:"flex",
alignItems:"center",
padding:"0 18px",
fontSize:16,
color:"#A1A8B3"
}}
>
Сообщение...
</div>


<div
style={{
width:50,
height:50,
borderRadius:"50%",
background:
"linear-gradient(135deg,#54A7FF,#2F80FF)",
display:"flex",
alignItems:"center",
justifyContent:"center",
boxShadow:"0 8px 20px rgba(47,128,255,.35)"
}}
>
<Send
size={20}
color="white"
/>
</div>

</div>

</div>

</div>
)

}