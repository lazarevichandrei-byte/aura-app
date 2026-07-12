"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { sendMatchNotification } from "../../lib/notifications/matches";
import AuraLoader from "../../components/AuraLoader";
export default function LikesPage(){

const router = useRouter();


const [myId,setMyId] = useState<string | null>(null);

useEffect(()=>{

  const init = async () => {

    const tgId =
      (window as any)
      ?.Telegram
      ?.WebApp
      ?.initDataUnsafe
      ?.user
      ?.id;

    if(!tgId) return;

    const { data:user } = await supabase
      .from("users")
      .select("id")
      .eq("telegram_id", tgId)
      .single();

    if(user){
      setMyId(user.id);
    }

  };

  init();

},[]);

const [people,setPeople] = useState<any[]>([]);
const [loading,setLoading] = useState(true);
const [match,setMatch] = useState<any>(null);
const [matchChatId,setMatchChatId] = useState<string | null>(null);


const touchStartX = useRef(0);


useEffect(() => {

  if (myId) {
    loadLikes(myId);
  }

}, [myId]);



async function loadLikes(userId:string){
  setLoading(true);

  const { data: likes, error } = await supabase
    .from("likes")
    .select("*")
    .eq("to_user_id", userId)
.eq("status","pending");

console.log("LIKES RAW:", likes);

  if(error){
    console.log("LOAD LIKES ERROR:", error);
    return;
  }

 if(!likes){

  setPeople([]);
  setLoading(false);

  return;

}

  const ids = likes.map(l => l.from_user_id);

  const { data: users } = await supabase
    .from("users")
    .select("*")
    .in("id", ids);

  const formatted = likes.map(like => ({
    ...like,
    users: users?.find(
      u => u.id === like.from_user_id
    )
  }));

  setPeople(formatted);
  
  setLoading(false);
}


function EmptyLikes() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px",
        textAlign: "center"
      }}
    >
      <div
        style={{
          fontSize: 30
        }}
      >
        ❤️
      </div>

      <div
        style={{
          marginTop: 10,
          fontSize: 16,
          fontWeight: 600,
          color: "#1F2937"
        }}
      >
        Пока тебя никто не лайкнул
      </div>

      <div
        style={{
          marginTop: 4,
          fontSize: 12,
          color: "#8A8F9B",
          lineHeight: 1.5
        }}
      >
        Заполни профиль —
        <br />
        так шансов будет больше.
      </div>

      <button
        onClick={() => router.push("/profile")}
        style={{
          marginTop: 16,
          height: 42,
          padding: "0 20px",
          border: "none",
          borderRadius: 999,
          background: "#2F80FF",
          color: "#fff",
          fontWeight: 600,
          cursor: "pointer"
        }}
      >
        Заполнить профиль
      </button>
    </div>
  );
}

if (loading) {

  return (

    <AuraLoader
      compact
      text="Загрузка лайков..."
    />

  );

}

return(

<div

onTouchStart={(e)=>{
touchStartX.current =
e.touches[0].clientX;
}}

onTouchEnd={(e)=>{

const deltaX =
e.changedTouches[0].clientX -
touchStartX.current;

if(
touchStartX.current < 220 &&
deltaX > 100
){
router.back();
}

}}

style={{
height:"100dvh",

overflowY:"auto",
WebkitOverflowScrolling:"touch",

background:"#FCFCFE",

padding:"10px 16px 120px",

maxWidth:"430px",
margin:"0 auto",
paddingLeft:18,
paddingRight:18,
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



{people.length > 0 && (

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
{people.length} человек тебя лайкнули ❤️
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

)}



{/* likes list */}
<div style={{marginTop:22}}>

{people.length === 0 ? (

  <EmptyLikes />

) : (

people.map((user, index) => (

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

cursor:"pointer",

animation:
`likeAppear .28s ease ${index * 35}ms both`,
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
src={user.users?.avatar_url || "/placeholder.jpg"}
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
flex:1,
marginLeft:16,
marginRight:12,

display:"flex",
flexDirection:"column",
justifyContent:"center",
alignItems:"flex-start"
}}
>

<div
style={{
fontSize:18,
fontWeight:700,
lineHeight:"22px"
}}
>
{user.users?.name}, {user.users?.age}
</div>

<div
style={{
marginTop:4,
fontSize:14,
color:"#8A8F9B"
}}
>
{user.users?.city}
</div>

<div
onClick={(e)=>{
e.stopPropagation();

router.push(
`/profile/${user.users?.id}`
);

/* если профиля пока нет —
временно можно:
/chat/${user.id}
*/
}}

style={{
marginTop:12,
width:150,
height:34,

display:"flex",
alignItems:"center",
justifyContent:"center",

borderRadius:999,
border:"2px solid #5EA9FF",

background:"#fff",

fontSize:13,
fontWeight:600,
color:"#2F80FF",

cursor:"pointer"
}}
>
Смотреть профиль
</div>

</div>


<div
style={{
display:"flex",
flexDirection:"column",
justifyContent:"center",
alignItems:"center",
gap:10,
minWidth:42
}}
>

<div
onClick={async (e)=>{
  e.stopPropagation();

  await supabase
    .from("likes")
    .update({
      status:"dismissed"
    })
    .eq("from_user_id", user.from_user_id)
    .eq("to_user_id", myId);

  await loadLikes(myId!);
}}

style={{
width:40,
height:40,
borderRadius:"50%",
background:"#F7F8FB",
border:"1px solid #E8EDF5",

display:"flex",
alignItems:"center",
justifyContent:"center",

fontSize:17,
cursor:"pointer"
}}
>
✕
</div>

<div
onClick={async (e)=>{
  e.stopPropagation();

  if(!myId) return;


  console.log(
  "MATCH LIKE",
  myId,
  user.from_user_id
);

console.log(
  "MATCH CLICKED",
  myId,
  user.from_user_id
);

  const { data: chatId, error } =
await supabase.rpc("like_user", {
  from_id: myId,
  to_id: user.from_user_id
});

console.log("MATCH RESULT:", chatId);
console.log("MATCH ERROR:", error);

if(error){
  console.log(error);
  return;
}

// await loadLikes(myId);

if(chatId){

  await sendMatchNotification(user.from_user_id);

  setPeople(prev =>
    prev.filter(
      p => p.from_user_id !== user.from_user_id
    )
  );

  setMatch(user.users);
  setMatchChatId(chatId);

}
}}

style={{
width:46,
height:46,
borderRadius:"50%",

background:"#fff",
border:"2px solid #5EA9FF",

display:"flex",
alignItems:"center",
justifyContent:"center",

boxSizing:"border-box"
}}
>
<span
style={{
fontSize:23,
lineHeight:"22px",
color:"#5EA9FF",
fontWeight:600,
transform:"scaleX(1.18)",
display:"inline-block"
}}
>
♡
</span>
</div>

</div>

</div>


))

)}

</div>



{match && (
<div
onClick={()=>{
  setMatch(null);
  setMatchChatId(null);
}}
style={{
position:"fixed",
inset:0,

background:"rgba(0,0,0,.55)",

display:"flex",
justifyContent:"center",
alignItems:"center",

zIndex:9999,

animation:"fadeMatch .25s ease"
}}
>

<div
onClick={(e)=>e.stopPropagation()}
style={{
width:"90%",
maxWidth:360,

background:"#fff",

borderRadius:28,

padding:"32px 24px",

textAlign:"center",

animation:"matchCard .35s ease"
}}
>
<div
style={{
fontSize:42,

animation:
"heartPulse 1.5s ease infinite"
}}
>
💙
</div>

<div style={{
marginTop:12,
fontSize:28,
fontWeight:800
}}>
Это матч!
</div>

<div style={{
marginTop:10,
fontSize:16,
color:"#666"
}}>
Вы и {match?.name || "пользователь"} понравились друг другу
</div>

<img
src={match?.avatar_url || "/girl1.jpg"}
style={{
width:90,
height:90,
borderRadius:"50%",
objectFit:"cover",
marginTop:18,

animation:
"avatarAppear .45s ease"
}}
/>

<div
onClick={()=>{
  if(matchChatId){
    router.push(`/chat/${matchChatId}`);
  }
}}
style={{
marginTop:28,
height:50,
borderRadius:16,

background:"#2F80FF",

color:"#fff",

display:"flex",
alignItems:"center",
justifyContent:"center",

fontWeight:700,

cursor:"pointer",

animation:
"buttonAppear .55s ease"
}}
>
Написать сообщение
</div>

</div>

</div>

)}
<style jsx>{`

@keyframes likeAppear{

from{
opacity:0;
transform:translateY(16px);
}

to{
opacity:1;
transform:translateY(0);
}

}

@keyframes fadeMatch{

from{
opacity:0;
}

to{
opacity:1;
}

}

@keyframes matchCard{

from{
opacity:0;
transform:translateY(30px) scale(.94);
}

to{
opacity:1;
transform:translateY(0) scale(1);
}

}

@keyframes heartPulse{

0%{
transform:scale(1);
}

50%{
transform:scale(1.18);
}

100%{
transform:scale(1);
}

}

@keyframes avatarAppear{

from{
opacity:0;
transform:scale(.8);
}

to{
opacity:1;
transform:scale(1);
}

}

@keyframes buttonAppear{

from{
opacity:0;
transform:translateY(12px);
}

to{
opacity:1;
transform:translateY(0);
}

}

`}</style>

</div>





);

}

