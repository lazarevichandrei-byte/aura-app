"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { supabase } from "../../lib/supabase";
import BottomNav from "../../components/BottomNav";

export default function Home() {
  const [users, setUsers] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);

  const currentUserId = 123;

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const { data } = await supabase
      .from("users")
      .select("*")
      .neq("telegram_id", currentUserId);

    if (data) setUsers(data);
  }

  const currentUser = users[index];

  const photos =
    currentUser?.photos?.length
      ? currentUser.photos
      : [currentUser?.avatar_url];

  function nextUser() {
    setIndex((prev) => prev + 1);
    setPhotoIndex(0);
    x.set(0);
  }

  async function handleLike() {
    if (!currentUser) return;

    const likedUserId = currentUser.telegram_id;

    await supabase.from("likes").insert({
      from_user: currentUserId,
      to_user: likedUserId,
    });

    const { data: reverseLike } = await supabase
      .from("likes")
      .select("*")
      .eq("from_user", likedUserId)
      .eq("to_user", currentUserId)
      .maybeSingle();

    if (reverseLike) {
      const user1 = Math.min(currentUserId, likedUserId);
      const user2 = Math.max(currentUserId, likedUserId);

      const { data: existingMatch } = await supabase
        .from("matches")
        .select("*")
        .eq("user1", user1)
        .eq("user2", user2)
        .maybeSingle();

      if (!existingMatch) {
        await supabase
          .from("matches")
          .insert({
            user1,
            user2
          });

        console.log("MATCH!");
      }
    }

    nextUser();
  }

  function handleSkip() {
    nextUser();
  }

  const x = useMotionValue(0);

  const rotate = useTransform(
    x,
    [-250,0,250],
    [-6,0,6]
  );

  const likeOpacity = useTransform(
    x,
    [40,140],
    [0,1]
  );

  const nopeOpacity = useTransform(
    x,
    [-140,-40],
    [1,0]
  );

  function handlePhotoTap(e:any){
    const rect=e.currentTarget.getBoundingClientRect();
    const clickX=e.clientX-rect.left;

    if(clickX<rect.width/2){
      setPhotoIndex(prev=>
       Math.max(prev-1,0)
      );
    } else {
      setPhotoIndex(prev=>
       Math.min(
        prev+1,
        photos.length-1
       )
      );
    }
  }

  return (
   <div
    style={{
      minHeight:"100vh",
      background:"#F7F7F8",
      padding:"18px 18px 120px"
    }}
   >

    {/* top buttons */}
    <div
     style={{
      display:"flex",
      justifyContent:"space-between",
      marginTop:8,
      marginBottom:18
     }}
    >
      <button
       style={{
        width:48,
        height:48,
        borderRadius:"50%",
        border:"none",
        background:"#fff",
        boxShadow:
         "0 4px 12px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04)",
        fontSize:22
       }}
      >
       ←
      </button>

      <button
       style={{
        width:48,
        height:48,
        borderRadius:"50%",
        border:"none",
        background:"#fff",
        boxShadow:
         "0 4px 12px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04)",
        fontSize:20
       }}
      >
       ⚙
      </button>
    </div>

    {currentUser ? (
    <>
     <motion.div
      drag="x"
      dragElastic={0.08}
      dragMomentum
      dragConstraints={{
       left:0,
       right:0
      }}
      style={{
       x,
       rotate,
       position:"relative",
       height:"62vh",
       borderRadius:"36px",
       overflow:"hidden",
       background:"#fff",
       boxShadow:
       "0 10px 30px rgba(0,0,0,.06)"
      }}
      transition={{
       type:"spring",
       stiffness:650,
       damping:24
      }}
      whileTap={{
       scale:.995
      }}
      onDragEnd={(e,info)=>{
       if(info.offset.x>140){
         handleLike();
       }
       else if(info.offset.x<-140){
         handleSkip();
       }
      }}
     >

      {/* like */}
      <motion.div
       style={{
        opacity:likeOpacity,
        position:"absolute",
        top:76,
        right:30,
        zIndex:10,
        border:"3px solid #2F80FF",
        color:"#2F80FF",
        padding:"8px 18px",
        borderRadius:12,
        fontWeight:700,
        transform:"rotate(12deg)"
       }}
      >
       LIKE
      </motion.div>

      {/* nope */}
      <motion.div
       style={{
        opacity:nopeOpacity,
        position:"absolute",
        top:76,
        left:30,
        zIndex:10,
        border:"3px solid #ff6a6a",
        color:"#ff6a6a",
        padding:"8px 18px",
        borderRadius:12,
        fontWeight:700,
        transform:"rotate(-12deg)"
       }}
      >
       NOPE
      </motion.div>

      {/* photo */}
      <div
       onClick={handlePhotoTap}
       style={{
        width:"100%",
        height:"100%"
       }}
      >
       <img
        src={photos[photoIndex]}
        style={{
         width:"100%",
         height:"100%",
         objectFit:"cover"
        }}
       />
      </div>

      {/* photo count */}
      <div
       style={{
        position:"absolute",
        top:26,
        left:26,
        background:"rgba(70,70,70,.38)",
        backdropFilter:"blur(12px)",
        padding:"10px 18px",
        borderRadius:999,
        color:"#fff",
        fontSize:15,
        zIndex:5
       }}
      >
       {photoIndex+1} / {photos.length}
      </div>

      {/* NEW SOFT BLUR FADE */}
      <div
       style={{
        position:"absolute",
        left:0,
        right:0,
        bottom:150,
        height:190,
        zIndex:2,
        background:
        "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,.28) 35%, rgba(255,255,255,.68) 58%, rgba(255,255,255,.92) 82%, #fff 100%)",
        filter:"blur(10px)"
       }}
      />

      {/* name */}
      <div
       style={{
        position:"absolute",
        left:30,
        bottom:195,
        zIndex:4
       }}
      >
       <h2
        style={{
         margin:0,
         fontSize:20,
         fontWeight:600,
         letterSpacing:"-.35px",
         lineHeight:1.05,
         color:"#111"
        }}
       >
        {currentUser.name}, {currentUser.age}
       </h2>

       <p
        style={{
         marginTop:6,
         fontSize:15,
         opacity:.85,
         color:"#7B7B87"
        }}
       >
        📍 {currentUser.city}, 2 км от вас
       </p>
      </div>

      {/* smaller profile block */}
      <div
       style={{
        position:"absolute",
        bottom:0,
        left:0,
        right:0,
        background:"#fff",
        zIndex:3,
        padding:"18px 24px 18px",
        minHeight:130,
        borderTopLeftRadius:34,
        borderTopRightRadius:34
       }}
      >

       <p
        style={{
         margin:0,
         fontSize:15,
         lineHeight:1.35,
         maxWidth:"92%"
        }}
       >
        {currentUser.bio ||
        "Люблю путешествия и новые впечатления ✈️✨"}
       </p>

       <div
        style={{
         display:"flex",
         flexWrap:"wrap",
         gap:12,
         marginTop:16
        }}
       >
        {(currentUser.interests || []).map(
         (tag:string)=>(
          <motion.span
           key={tag}
           whileTap={{
            scale:.96
           }}
           style={{
            background:"#EEF5FF",
            color:"#4D8DFF",
            padding:"8px 14px",
            borderRadius:9999,
            fontSize:13
           }}
          >
           {tag}
          </motion.span>
         )
        )}

        <span
         style={{
          width:34,
          height:34,
          borderRadius:"50%",
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          background:"#EEF5FF",
          color:"#4D8DFF"
         }}
        >
         +
        </span>

       </div>
      </div>

     </motion.div>

     {/* actions */}
     <div
      style={{
       marginTop:24,
       display:"flex",
       justifyContent:"center",
       gap:30,
       alignItems:"center"
      }}
     >
      <button
       onClick={handleSkip}
       style={{
        width:72,
        height:72,
        borderRadius:"50%",
        border:"none",
        background:"#fff",
        color:"#8D8D99",
        fontSize:34,
        boxShadow:
        "0 8px 20px rgba(0,0,0,.08)"
       }}
      >
       ✕
      </button>

      <motion.button
       whileTap={{
        scale:[1,1.08,1]
       }}
       transition={{
        duration:.28
       }}
       onClick={handleLike}
       style={{
        width:90,
        height:90,
        borderRadius:"50%",
        border:"none",
        background:
        "linear-gradient(135deg,#3D8BFF 0%,#0A6CFF 100%)",
        color:"#fff",
        fontSize:38,
        boxShadow:
        "0 10px 30px rgba(32,111,255,.35)"
       }}
      >
       ❤
      </motion.button>

      <button
       style={{
        width:72,
        height:72,
        borderRadius:"50%",
        border:"none",
        background:"#fff",
        color:"#8D8D99",
        fontSize:30,
        boxShadow:
        "0 8px 20px rgba(0,0,0,.08)"
       }}
      >
       ★
      </button>
     </div>

    </>
    ) : (
      <p style={{padding:40}}>
       Нет пользователей
      </p>
    )}

    <BottomNav/>

   </div>
  );
}