"use client";

import { motion } from "motion/react";
import {
    Location,
    Calendar,
} from "iconsax-react";
import type { MeetEvent } from "../../lib/meet/types";

type Props = {
    event: MeetEvent;
    isCreator: boolean;
    isParticipant: boolean;
    isFull: boolean;
    onClick: () => void;
    onJoin: () => void;
    requestStatus?: "pending" | "approved" | "rejected" | null;
};

export default function MeetGridCard({
    event,
    isCreator,
    isParticipant,
    isFull,
    onClick,
    onJoin,
    requestStatus,
}: Props) {

    return (

        <motion.div

layout

layoutId={event.id}

            whileTap={{
                scale: .98,
            }}

            initial={{
                opacity: 0,
                scale: .96,
            }}

            animate={{
                opacity: 1,
                scale: 1,
            }}

            transition={{
                duration: .22,
            }}

            onClick={onClick}

            style={{
                background: "var(--surface)",
                color:"var(--text-primary)",
                border:"1px solid var(--border-subtle)",
                borderRadius: 22,
                padding: 16,
                boxShadow:
                    "0 8px 22px rgba(0,0,0,.05)",
                cursor: "pointer",
            }}
        >

            <img
                src={
                    event.users?.avatar_url ||
                    "/avatar.png"
                }
                alt=""
                style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    objectFit: "cover",
                }}
            />

            <div
                style={{
                    marginTop: 14,
                    fontWeight: 700,
                    fontSize: 17,
                    lineHeight: 1.25,
                }}
            >
                {event.title}
            </div>

            <div
                style={{
                    marginTop: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "var(--text-secondary)",
                    fontSize: 13,
                }}
            >
                <Location
                    size="16"
                    color="#2AABEE"
                />

                {event.place}
            </div>

            <div
                style={{
                    marginTop: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "var(--text-secondary)",
                    fontSize: 13,
                }}
            >
                <Calendar
                    size="16"
                    color="#2AABEE"
                />

                {new Date(
                    event.starts_at
                ).toLocaleDateString()}
            </div>

            <div
                style={{
                    marginTop: 18,
                }}
            >

                {isCreator ? (

                    <button
                        style={{
                            width: "100%",
                            height: 40,
                            borderRadius: 12,
                            border: "none",
                            background: "var(--primary-soft)",
                            color: "var(--primary)",
                            fontWeight: 700,
                        }}
                    >
                        Управление
                    </button>

                ) : isParticipant ? (

                    <button
                        style={{
                            width: "100%",
                            height: 40,
                            borderRadius: 12,
                            border: "none",
                            background: "#ECFDF5",
                            color: "#10B981",
                            fontWeight: 700,
                        }}
                    >
                        Участвую
                    </button>

                ) : requestStatus === "pending" ? (

                    <button disabled style={{width:"100%",height:40,borderRadius:12,border:"none",background:"#FFF7ED",color:"#D97706",fontWeight:700}}>⏳ Рассмотрение</button>

                ) : isFull ? (

                    <button
                        style={{
                            width: "100%",
                            height: 40,
                            borderRadius: 12,
                            border: "none",
                            background: "#FEF2F2",
                            color: "#EF4444",
                            fontWeight: 700,
                        }}
                    >
                        Нет мест
                    </button>

                ) : (

                    <button

                        onClick={(e) => {

                            e.stopPropagation();

                            onJoin();

                        }}

                        style={{
                            width: "100%",
                            height: 40,
                            borderRadius: 12,
                            border: "none",
                            background: "var(--primary)",
                            color: "var(--text-inverse)",
                            fontWeight: 700,
                            cursor: "pointer",
                        }}
                    >
                        {event.join_type === "approval" && requestStatus === "rejected" ? "Повторить" : event.join_type === "approval" ? "Заявка" : "Вступить"}
                    </button>

                )}

            </div>

        </motion.div>

    );

}
