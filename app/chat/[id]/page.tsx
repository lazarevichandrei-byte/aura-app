"use client";

import { useRouter } from "next/navigation";

export default function ChatPage(){
const router = useRouter();

return(
<div style={{
height:"100vh",
background:"#fff",
display:"flex",
flexDirection:"column",
fontFamily:"-apple-system, Inter, sans-serif"
}}>

{/* HEADER */}
<div style={{
height:82,
display:"flex",
alignItems:"center",
justifyContent:"space-between",
padding:"0 18px",
borderBottom:"1px solid #eef1f5"
}}>

<div style={{
display:"flex",
alignItems:"center",
gap:14
}}>
<div
onClick={()=>router.back()}
style={{
fontSize:30,
cursor:"pointer"
}}
>
←
</div>

<div style={{position:"relative"}}>
<img
src="/girl1.jpg"
style={{
width:48,
height:48,
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
borderRadius:"50%",
background:"#32D74B",
border:"2px solid white"
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
typing...
</div>
</div>
</div>

<div style={{
fontSize:24
}}>
📞
</div>

</div>



{/* CHAT */}
<div style={{
flex:1,
overflowY:"auto",
padding:"28px 16px",
background:"linear-gradient(to bottom,#fff,#fafcff)"
}}>

<div style={{
textAlign:"center",
fontSize:13,
color:"#A0A5AF",
marginBottom:28
}}>
Сегодня
</div>


<div style={{marginBottom:18}}>
<div style={{
display:"inline-block",
background:"#F2F4F8",
padding:"14px 18px",
borderRadius:"24px 24px 24px 8px",
fontSize:17,
maxWidth:"76%"
}}>
Привет 😊 Как проходит вечер?
</div>
</div>


<div
style={{
display:"flex",
justifyContent:"flex-end",
marginBottom:18
}}
>
<div>
<div style={{
background:
"linear-gradient(135deg,#57A7FF,#1D74FF)",
color:"#fff",
padding:"14px 18px",
borderRadius:"24px 24px 8px 24px",
fontSize:17
}}>
Очень хорошо, а у тебя?
</div>

<div style={{
fontSize:12,
marginTop:6,
textAlign:"right",
color:"#94A0B4"
}}>
Seen ✓✓
</div>

</div>
</div>



<div style={{marginBottom:18}}>
<div style={{
display:"inline-block",
background:"#F2F4F8",
padding:"14px 18px",
borderRadius:"24px 24px 24px 8px"
}}>
Смотри фото 👇
</div>
</div>


<img
src="/girl2.jpg"
style={{
width:220,
borderRadius:22,
marginBottom:22,
display:"block"
}}
/>



<div
style={{
display:"flex",
justifyContent:"flex-end",
marginBottom:24
}}
>
<div style={{
background:"#EDF5FF",
padding:"14px 20px",
borderRadius:30,
display:"flex",
alignItems:"center",
gap:12
}}>
▶️

<div style={{
width:100,
height:4,
background:"#BCD8FF",
borderRadius:20
}}/>

0:14
</div>
</div>


{/* typing dots */}
<div style={{
display:"inline-flex",
gap:7,
background:"#F2F4F8",
padding:"14px 18px",
borderRadius:25
}}>
<div>●</div>
<div>●</div>
<div>●</div>
</div>


</div>



{/* INPUT */}
<div style={{
padding:"14px 14px 24px",
borderTop:"1px solid #eef1f5"
}}>
<div style={{
height:56,
borderRadius:30,
background:"#F3F5F9",
display:"flex",
alignItems:"center",
justifyContent:"space-between",
padding:"0 18px"
}}>

<div style={{
display:"flex",
gap:12,
color:"#9CA3AF"
}}>
📷 🎤
</div>

<div style={{
color:"#9CA3AF",
fontSize:17
}}>
Сообщение...
</div>

<div style={{
width:40,
height:40,
borderRadius:"50%",
background:"#2F80FF",
display:"flex",
alignItems:"center",
justifyContent:"center",
color:"#fff"
}}>
➤
</div>

</div>
</div>

</div>
)
}