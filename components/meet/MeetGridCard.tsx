"use client";

import { motion } from "motion/react";
import {
    Location,
    Calendar,
} from "iconsax-react";
import type { MeetEvent } from "../../lib/meet/types";
import {useI18n} from "../I18nProvider";

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
    const {t}=useI18n();

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
                    color="var(--brand-primary)"
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
                    color="var(--brand-primary)"
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
                        {t("meet.manageShort")}
                    </button>

                ) : isParticipant ? (

                    <button
                        style={{
                            width: "100%",
                            height: 40,
                            borderRadius: 12,
                            border: "none",
                            background: "var(--success-soft)",
                            color: "#10B981",
                            fontWeight: 700,
                        }}
                    >
                        {t("meet.participating")}
                    </button>

                ) : requestStatus === "pending" ? (

                    <button disabled style={{width:"100%",height:40,borderRadius:12,border:"none",background:"var(--warning-soft)",color:"var(--warning)",fontWeight:700}}>⏳ {t("meet.pending")}</button>

                ) : isFull ? (

                    <button
                        style={{
                            width: "100%",
                            height: 40,
                            borderRadius: 12,
                            border: "none",
                            background: "var(--danger-soft)",
                            color: "#EF4444",
                            fontWeight: 700,
                        }}
                    >
                        {t("meet.full")}
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
                            background: "var(--brand-gradient)",
                            color: "var(--text-inverse)",
                            fontWeight: 700,
                            cursor: "pointer",
                        }}
                    >
                        {event.join_type === "approval" && requestStatus === "rejected" ? t("meet.repeat") : event.join_type === "approval" ? t("meet.requestShort") : t("meet.enter")}
                    </button>

                )}

            </div>

        </motion.div>

    );

}
