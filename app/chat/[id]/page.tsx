"use client";
export default function ChatPage() {
 return (
   <div style={{fontSize:60,padding:80,color:"red"}}>
      TEST 999
   </div>
 )
}
import { useRouter } from "next/navigation";

export default function ChatPage(){
const router = useRouter();

return(
<div style={{
height:"100vh",
background:"#fff",
display:"flex",
flexDirection:"column"
}}>

{/* header */}
<div style={{
height:78,
display:"flex",
alignItems:"center",
padding:"0 18px",
borderBottom:"1px solid #eee",
gap:14
}}>
<div
onClick={()=>router.back()}
style={{
fontSize:34,
cursor:"pointer"
}}
>
←
</div>

<img
src="/girl1.jpg"
style={{
width:44,
height:44,
borderRadius:"50%",
objectFit:"cover"
}}
/>

<div>
<div style={{
fontSize:20,
fontWeight:700
}}>
Алина
</div>

<div style={{
fontSize:13,
color:"#2F80FF"
}}>
в сети
</div>

</div>

</div>


{/* messages */}
<div style={{
flex:1,
padding:"30px 18px"
}}>

<div style={{
display:"flex",
justifyContent:"flex-start",
marginBottom:18
}}>
<div style={{
background:"#F2F4F8",
padding:"14px 18px",
borderRadius:24,
fontSize:18
}}>
Привет 😊
</div>
</div>

<div style={{
display:"flex",
justifyContent:"flex-end",
marginBottom:18
}}>
<div style={{
background:"#2F80FF",
color:"#fff",
padding:"14px 18px",
borderRadius:24,
fontSize:18
}}>
Привет, как дела?
</div>
</div>

</div>


{/* input */}
<div style={{
padding:"14px 16px 26px",
borderTop:"1px solid #eee"
}}>

<div style={{
height:54,
background:"#F3F4F8",
borderRadius:30,
display:"flex",
alignItems:"center",
padding:"0 20px",
justifyContent:"space-between"
}}>
<span style={{
color:"#9BA1AE",
fontSize:17
}}>
Сообщение...
</span>

<span style={{fontSize:24}}>
➤
</span>

</div>

</div>

</div>
)
}