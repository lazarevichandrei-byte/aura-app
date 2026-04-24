"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import BottomNav from "../../components/BottomNav";

export default function Home() {
  const [users, setUsers] = useState<any[]>([]);
  const [index, setIndex] = useState(0);

  const [photoIndex, setPhotoIndex] = useState(0);

  const [expanded, setExpanded] = useState(false);

  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const startX = useRef<number | null>(null);

  // оставить как было
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

  function getPhotos(user: any) {
    if (!user) return [];
    if (Array.isArray(user.photos) && user.photos.length) return user.photos;
    if (user.avatar_url) return [user.avatar_url];
    return [];
  }

  const photos = getPhotos(currentUser);

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
        await supabase.from("matches").insert({
          user1,
          user2,
        });
      }
    }

    animateOut(420);
  }

  function handleSkip() {
    animateOut(-420);
  }

  function animateOut(v: number) {
    setDragX(v);

    setTimeout(() => {
      setExpanded(false);
      setPhotoIndex(0);
      setIndex((p) => p + 1);
      setDragX(0);
    }, 280);
  }

  function onStart(x: number) {
    startX.current = x;
    setDragging(true);
  }

  function onMove(x: number) {
    if (!startX.current || expanded) return;
    setDragX(x - startX.current);
  }

  function onEnd() {
    setDragging(false);

    if (expanded) return;

    if (dragX > 120) {
      handleLike();
      return;
    }

    if (dragX < -120) {
      handleSkip();
      return;
    }

    setDragX(0);
  }

  function tapPhoto(e: any) {
    if (!photos.length) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;

    if (x < rect.width / 2) {
      setPhotoIndex((p) => (p === 0 ? photos.length - 1 : p - 1));
    } else {
      setPhotoIndex((p) => (p === photos.length - 1 ? 0 : p + 1));
    }
  }

  const rotation = dragX / 28;

  return (
    <div
      style={{
        background: "#F7F7F8",
        minHeight: "100vh",
        padding: "18px 18px 110px",
        fontFamily:
          "-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif",
      }}
    >
      {/* top */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <button
          style={topBtn}
        >
          ←
        </button>

        <button
          style={topBtn}
        >
          ⚙
        </button>
      </div>

      {currentUser && (
        <>
          <div
            onMouseDown={(e) => onStart(e.clientX)}
            onMouseMove={(e) => dragging && onMove(e.clientX)}
            onMouseUp={onEnd}
            onMouseLeave={() => dragging && onEnd()}
            onTouchStart={(e) => onStart(e.touches[0].clientX)}
            onTouchMove={(e) => onMove(e.touches[0].clientX)}
            onTouchEnd={onEnd}
            style={{
              position: "relative",
              height: expanded ? "86vh" : "72vh",
              borderRadius: 36,
              overflow: "hidden",
              background: "#fff",
              boxShadow: "0 10px 30px rgba(0,0,0,.06)",
              transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
              transition:
                "all .35s cubic-bezier(.2,.9,.2,1)",
            }}
          >
            {/* PHOTO */}
            <div
              onClick={tapPhoto}
              style={{
                height: "68%",
                position: "relative",
              }}
            >
              <img
                src={photos[photoIndex]}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  top: 22,
                  left: 22,
                  background: "rgba(90,90,90,.38)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 30,
                  padding: "10px 18px",
                  color: "#fff",
                  fontSize: 18,
                }}
              >
                {photoIndex + 1} / {photos.length || 1}
              </div>

              {/* dreamy white fade */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: -10,
                  height: 240,
                  background: `
linear-gradient(
to bottom,
rgba(255,255,255,0) 0%,
rgba(255,255,255,.08) 35%,
rgba(255,255,255,.38) 58%,
rgba(255,255,255,.72) 78%,
rgba(255,255,255,.94) 92%,
#fff 100%
)`,
                  filter: "blur(24px)",
                  transform: "scale(1.08)",
                }}
              />
            </div>

            {/* info overlay on fade */}
            <div
              style={{
                position: "absolute",
                left: 28,
                right: 28,
                bottom: expanded ? 150 : 170,
                zIndex: 5,
              }}
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  marginBottom: 10,
                }}
              >
                {currentUser.name}, {currentUser.age}
              </div>

              <div
                style={{
                  fontSize: 16,
                  color: "#7B7B87",
                  marginBottom: 14,
                }}
              >
                📍 {currentUser.city || "Москва"}, 2 км от вас
              </div>

              <div
                style={{
                  fontSize: 15,
                  lineHeight: 1.45,
                  marginBottom: 16,
                }}
              >
                {currentUser.bio ||
                  "Люблю путешествия и новые впечатления ✈️✨"}
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                {(currentUser.interests || [
                  "Путешествия",
                  "Музыка",
                  "Спорт",
                  "Кино",
                  "Фотография",
                ]).slice(0, 5).map((i: string) => (
                  <div
                    key={i}
                    style={chip}
                  >
                    {i}
                  </div>
                ))}

                <div
                  style={{
                    ...chip,
                    width: 40,
                    height: 40,
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  +
                </div>
              </div>
            </div>

            {/* expanded */}
            {expanded && (
              <div
                style={{
                  position: "absolute",
                  bottom: 28,
                  left: 28,
                  right: 28,
                  background:"#fff",
                  borderRadius:24,
                  padding:20,
                  boxShadow:"0 6px 18px rgba(0,0,0,.04)"
                }}
              >
                <div style={{fontWeight:600,marginBottom:10}}>
                  About me
                </div>

                <div style={{lineHeight:1.6,color:"#555"}}>
                  Больше информации о пользователе.
                  Здесь позже можно добавить
                  рост, цели знакомства,
                  язык, образование и другое.
                </div>
              </div>
            )}

            {dragX > 70 && (
              <div style={likeStamp}>
                LIKE
              </div>
            )}

            {dragX < -70 && (
              <div style={nopeStamp}>
                NOPE
              </div>
            )}
          </div>

          {/* actions */}
          <div
            style={{
              display:"flex",
              justifyContent:"center",
              gap:26,
              marginTop:20
            }}
          >
            <button
              onClick={()=>setExpanded(!expanded)}
              style={roundBtn}
            >
              ✕
            </button>

            <button
              onClick={handleLike}
              style={heartBtn}
            >
              ♥
            </button>

            <button style={roundBtn}>
              ★
            </button>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}


const topBtn:any={
width:48,
height:48,
borderRadius:"50%",
border:"none",
background:"#fff",
boxShadow:
"0 4px 12px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04)"
}

const chip:any={
padding:"11px 18px",
borderRadius:999,
background:"#EEF5FF",
color:"#4D8DFF",
fontSize:14,
fontWeight:500
}

const roundBtn:any={
width:72,
height:72,
borderRadius:"50%",
border:"none",
background:"#fff",
fontSize:34,
color:"#A8ADB7",
boxShadow:"0 8px 20px rgba(0,0,0,.06)"
}

const heartBtn:any={
width:90,
height:90,
borderRadius:"50%",
border:"none",
fontSize:36,
color:"#fff",
background:
"linear-gradient(135deg,#3D8BFF 0%,#0A6CFF 100%)",
boxShadow:
"0 10px 30px rgba(32,111,255,.35)"
}

const likeStamp:any={
position:"absolute",
top:90,
right:40,
padding:"10px 18px",
border:"3px solid #2F80FF",
color:"#2F80FF",
borderRadius:14,
fontWeight:700,
transform:"rotate(12deg)"
}

const nopeStamp:any={
position:"absolute",
top:90,
left:40,
padding:"10px 18px",
border:"3px solid #ff5b6b",
color:"#ff5b6b",
borderRadius:14,
fontWeight:700,
transform:"rotate(-12deg)"
}