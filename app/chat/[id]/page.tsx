"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, Video, Send } from "lucide-react";

export default function ChatPage() {
const router = useRouter();

return (
<div
style={{
height:"100vh",
background:"#FFFFFF",
display:"flex",
flexDirection:"column",
fontFamily:"-apple-system,BlinkMacSystemFont,Inter,sans-serif"
}}
>

{/* HEADER */}
<div
style={{
height:82,
padding:"0 18px",
display:"flex",
alignItems:"center",
justifyContent:"space-between",
borderBottom:"1px solid #F1F1F4",
background:"#fff",
flexShrink:0
}}
>

<div style={{
display:"flex",
alignItems:"center",
gap:14
}}>
<div
onClick={()=>router.back()}
style={{cursor:"pointer"}}
>
<ArrowLeft size={28}/>
</div>

<div style={{
position:"relative"
}}>
<img
src="/girl1.jpg"
style={{
width:46,
height:46,
borderRadius:"50%",
objectFit:"cover"
}}
/>

<div style={{
position:"absolute",
right:2,
bottom:2,
width:11,
height:11,
background:"#32D74B",
borderRadius:"50%",
border:"2px solid #fff"
}}/>
</div>

<div>
<div style={{
fontSize:19,
fontWeight:700
}}>
Алина
</div>

<div style={{
fontSize:13,
color:"#2F80FF"
}}>
online now
</div>
</div>
</div>


<div style={{
display:"flex",
gap:16
}}>
<Phone size={22}/>
<Video size={22}/>
</div>

</div>


{/* MESSAGES */}
<div
style={{
flex:1,
overflowY:"auto",
padding:"30px 16px 20px",
background:
"linear-gradient(to bottom,#ffffff,#fafcff)"
}}
>

<div style={{
textAlign:"center",
fontSize:13,
color:"#9CA3AF",
marginBottom:28
}}>
Сегодня 18:42
</div>


<div style={{
display:"flex",
marginBottom:18
}}>
<div
style={{
background:"#F2F4F8",
padding:"14px 18px",
borderRadius:"22px 22px 22px 8px",
maxWidth:"74%",
fontSize:17,
lineHeight:1.35
}}
>
Привет 😊 Как проходит вечер?
</div>
</div>



<div style={{
display:"flex",
justifyContent:"flex-end",
marginBottom:18
}}>
<div
style={{
background:
"linear-gradient(135deg,#57A7FF,#1D74FF)",
color:"#fff",
padding:"14px 18px",
borderRadius:"22px 22px 8px 22px",
maxWidth:"74%",
fontSize:17,
lineHeight:1.35,
boxShadow:"0 6px 16px rgba(47,128,255,.20)"
}}
>
Очень хорошо, а у тебя?
</div>
</div>



<div style={{
display:"flex",
marginBottom:18
}}>
<div
style={{
background:"#F2F4F8",
padding:"14px 18px",
borderRadius:"22px 22px 22px 8px",
maxWidth:"74%",
fontSize:17
}}
>
Может завтра кофе? ☕
</div>
</div>

</div>



{/* INPUT */}
<div
style={{
padding:"14px 14px 24px",
borderTop:"1px solid #F2F2F4",
background:"#fff"
}}
>

<div
style={{
height:56,
borderRadius:30,
background:"#F3F5F9",
display:"flex",
alignItems:"center",
justifyContent:"space-between",
padding:"0 8px 0 18px"
}}
>

<div style={{
color:"#A0A6B3",
fontSize:17
}}>
Сообщение...
</div>


<div
style={{
width:42,
height:42,
borderRadius:"50%",
background:
"linear-gradient(135deg,#57A7FF,#1D74FF)",
display:"flex",
alignItems:"center",
justifyContent:"center",
boxShadow:"0 4px 12px rgba(47,128,255,.25)"
}}
>
<Send
size={18}
color="white"
/>
</div>

</div>

</div>

</div>
);
}