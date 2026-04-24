"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, Search, Heart, User } from "lucide-react";

export default function BottomNav(){

const router = useRouter();
const pathname = usePathname();

const itemStyle = (active:boolean)=>({
display:"flex",
flexDirection:"column" as const,
alignItems:"center",
gap:6,
fontSize:11,
fontWeight:500,
color: active ? "#2F80FF" : "#A7ADB8",
cursor:"pointer"
});

return(

<div style={{
position:"fixed",
bottom:0,
left:0,
right:0,
height:82,
background:"#fff",
borderTop:"1px solid #ECECEC",
display:"flex",
justifyContent:"space-around",
alignItems:"center",
zIndex:999
}}>

<div
onClick={()=>router.push("/home")}
style={itemStyle(pathname==="/home")}
>
<Home size={28}/>
Главная
</div>


<div
onClick={()=>router.push("/discover")}
style={itemStyle(pathname==="/discover")}
>
<Search size={28}/>
Поиск
</div>


<div
onClick={()=>router.push("/chats")}
style={itemStyle(pathname==="/chats")}
>
<Heart size={28}/>
Чаты
</div>


<div
onClick={()=>router.push("/profile")}
style={itemStyle(pathname==="/profile")}
>
<User size={28}/>
Профиль
</div>

</div>

)

}