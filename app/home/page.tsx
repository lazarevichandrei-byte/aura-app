"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import BottomNav from "../../components/BottomNav";
import { motion, useMotionValue, useTransform } from "framer-motion";

export default function Home() {
  const [users, setUsers] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);

  // не трогаем текущую логику
  const currentUserId = 123; // временно

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

  function nextUser() {
    setIndex((prev) => prev + 1);
    setPhotoIndex(0);
  }

  async function handleLike() {
    if (!currentUser) return;

    const likedUserId = currentUser.telegram_id;

    // like insert — не меняем
    await supabase.from("likes").insert({
      from_user: currentUserId,
      to_user: likedUserId,
    });

    // reciprocal like check
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
        await supabase.from("matches").insert({
          user1,
          user2,
        });

        console.log("MATCH!");
      }
    }

    nextUser();
  }

  function handleSkip() {
    nextUser();
  }

  // SWIPE
  const x = useMotionValue(0);

  const rotate = useTransform(
    x,
    [-250, 0, 250],
    [-6, 0, 6]
  );

  const likeOpacity = useTransform(
    x,
    [40, 140],
    [0, 1]
  );

  const nopeOpacity = useTransform(
    x,
    [-140, -40],
    [1, 0]
  );

  function nextPhoto(e: any) {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    const photos =
      currentUser?.photos?.length
        ? currentUser.photos
        : [currentUser?.avatar_url];

    if (clickX < rect.width / 2) {
      setPhotoIndex((prev) =>
        Math.max(prev - 1, 0)
      );
    } else {
      setPhotoIndex((prev) =>
        Math.min(prev + 1, photos.length - 1)
      );
    }
  }

  const photos =
    currentUser?.photos?.length
      ? currentUser.photos
      : [currentUser?.avatar_url];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F7F7F8",
        padding: "18px 18px 120px",
      }}
    >
      {/* TOP NAV */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
          marginTop: 10,
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
            fontSize:22
          }}
        >
          ⚙
        </button>
      </div>

      {currentUser ? (
        <>
          {/* CARD */}
          <motion.div
            drag="x"
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
            whileTap={{scale:.995}}
            onDragEnd={(e,info)=>{
              if(info.offset.x>120){
                handleLike();
              }
              else if(info.offset.x<-120){
                handleSkip();
              }
            }}
          >
            {/* LIKE */}
            <motion.div
             style={{
               opacity:likeOpacity,
               position:"absolute",
               top:80,
               right:30,
               zIndex:20,
               border:"3px solid #2F80FF",
               color:"#2F80FF",
               padding:"10px 18px",
               borderRadius:12,
               fontWeight:700,
               transform:"rotate(12deg)"
             }}
            >
             LIKE
            </motion.div>

            {/* NOPE */}
            <motion.div
             style={{
               opacity:nopeOpacity,
               position:"absolute",
               top:80,
               left:30,
               zIndex:20,
               border:"3px solid #ff5f6d",
               color:"#ff5f6d",
               padding:"10px 18px",
               borderRadius:12,
               fontWeight:700,
               transform:"rotate(-12deg)"
             }}
            >
             NOPE
            </motion.div>

            {/* PHOTO */}
            <div
             onClick={nextPhoto}
             style={{
               width:"100%",
               height:"100%",
               cursor:"pointer"
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

            {/* photo counter */}
            <div
             style={{
              position:"absolute",
              top:28,
              left:28,
              background:"rgba(70,70,70,.4)",
              backdropFilter:"blur(10px)",
              padding:"10px 18px",
              borderRadius:18,
              color:"#fff",
              zIndex:10
             }}
            >
             {photoIndex+1} / {photos.length}
            </div>

            {/* soft fade */}
            <div
             style={{
               position:"absolute",
               left:0,
               right:0,
               bottom:180,
               height:180,
               zIndex:2,
               background:
               "linear-gradient(to bottom,rgba(255,255,255,0) 0%,rgba(255,255,255,.75) 55%,#fff 100%)"
             }}
            />

            {/* NAME on photo */}
            <div
             style={{
              position:"absolute",
              left:30,
              bottom:210,
              zIndex:4
             }}
            >
              <div
               style={{
                 display:"flex",
                 gap:8,
                 alignItems:"center"
               }}
              >
               <h2
                style={{
                 margin:0,
                 fontSize:23,
                 fontWeight:600
                }}
               >
                {currentUser.name}, {currentUser.age}
               </h2>
              </div>

              <p
               style={{
                marginTop:6,
                color:"#7B7B87",
                fontSize:16
               }}
              >
               📍 {currentUser.city}, 2 км от вас
              </p>
            </div>

            {/* INFO */}
            <div
             style={{
              position:"absolute",
              bottom:0,
              left:0,
              right:0,
              background:"#fff",
              padding:"24px 26px 26px",
              borderTopLeftRadius:34,
              borderTopRightRadius:34,
              zIndex:3
             }}
            >
              <p
               style={{
                 margin:0,
                 lineHeight:1.45,
                 fontSize:16
               }}
              >
                {currentUser.bio ||
                "Люблю путешествия и новые впечатления ✈✨"}
              </p>

              <div
               style={{
                display:"flex",
                flexWrap:"wrap",
                gap:12,
                marginTop:18
               }}
              >
                {(currentUser.interests || []).map(
                  (tag:string)=>(
                   <motion.span
                    whileTap={{
                      scale:.96
                    }}
                    key={tag}
                    style={{
                      background:"#EEF5FF",
                      color:"#4D8DFF",
                      padding:"12px 18px",
                      borderRadius:9999,
                      fontSize:14
                    }}
                   >
                    {tag}
                   </motion.span>
                  )
                )}

                <span
                 style={{
                  width:36,
                  height:36,
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

          {/* ACTIONS */}
          <div
           style={{
             marginTop:26,
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
              color:"#9AA0AA",
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
              color:"#9AA0AA",
              fontSize:32,
              boxShadow:
              "0 8px 20px rgba(0,0,0,.08)"
             }}
            >
             ★
            </button>
          </div>
        </>
      ) : (
        <p style={{padding:50}}>
          Нет пользователей
        </p>
      )}

      {/* existing bottom nav untouched */}
      <BottomNav />
    </div>
  );
}