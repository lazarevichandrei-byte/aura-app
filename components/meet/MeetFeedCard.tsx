"use client";

import { motion } from "motion/react";
import {
    Location,
    Calendar,
    Clock,
    People,
} from "iconsax-react";
import type { MeetEvent } from "../../lib/meet/types";
import { MEET_CATEGORIES } from "../../lib/meet/categories";
type Props = {
    event: MeetEvent;
    isCreator: boolean;
    isParticipant: boolean;
    isFull: boolean;
    onClick: () => void;
    onJoin: () => void;
};

export default function MeetFeedCard({
    event,
    isCreator,
    isParticipant,
    isFull,
    onClick,
    onJoin,
}: Props) {

    return (

        <motion.div

layout

layoutId={event.id}

            initial={{
                opacity: 0,
                y: 25,
            }}

            animate={{
                opacity: 1,
                y: 0,
            }}

            whileTap={{
                scale: .985,
            }}

            transition={{
                duration: .22,
            }}

            onClick={onClick}

            style={{
                background: "#fff",
                borderRadius: 24,
                padding: 16,
                cursor: "pointer",
                boxShadow:
                    "0 10px 28px rgba(0,0,0,.05)",
            }}
        >

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                }}
            >

                <img
                    src={
                        event.users?.avatar_url ||
                        "/avatar.png"
                    }
                    alt=""
                    style={{
                        width: 52,
                        height: 52,
                        borderRadius: "50%",
                        objectFit: "cover",
                    }}
                />

                <div>

                    <div
                        style={{
                            fontWeight: 700,
                            fontSize: 16,
                        }}
                    >
                        {event.users?.name}
                    </div>

                    <div
    style={{
        marginTop: 6,
    }}
>

    <span
        style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            borderRadius: 999,
            background: "#EEF7FF",
            color: "#2AABEE",
            fontSize: 12,
            fontWeight: 700,
        }}
    >
        {
            MEET_CATEGORIES.find(
                c => c.id === event.category
            )?.icon
        }

        {
            MEET_CATEGORIES.find(
                c => c.id === event.category
            )?.name
        }
    </span>

</div>

                </div>

            </div>

            <div
                style={{
                    marginTop: 12,
                    fontSize: 20,
                    fontWeight: 700,
                }}
            >
                {event.title}
            </div>

            <div
    style={{
        marginTop: 10,
    }}
>

    <span
        style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 999,
            background: "#F4F8FC",
            color: "#556274",
            fontSize: 13,
            fontWeight: 600,
        }}
    >
        <Location
            size="16"
            color="#2AABEE"
        />

        {event.place}
    </span>

</div>

            <div
    style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        marginTop: 10,
        color: "#697586",
        flexWrap: "wrap",
    }}
>

    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
        }}
    >
        <Calendar
            size="18"
            color="#2AABEE"
        />

        {new Date(event.starts_at).toLocaleDateString(
            "ru-RU",
            {
                day: "numeric",
                month: "long",
            }
        )}
    </div>

    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
        }}
    >
        <Clock
            size="18"
            color="#2AABEE"
        />

        {new Date(event.starts_at).toLocaleTimeString(
            "ru-RU",
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        )}
    </div>

</div>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 16,
                }}
            >

                <div
    style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
    }}
>

    <div
        style={{
            display: "flex",
            alignItems: "center",
        }}
    >

        {(event.meet_participants ?? [])
            .slice(0, 4)
            .map((participant: any, index: number) => (

                <img
                    key={participant.users?.id ?? index}
                    src={
                        participant.users?.avatar_url ||
                        "/avatar.png"
                    }
                    alt=""
                    style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginLeft: index === 0 ? 0 : -8,
                        border: "2px solid #fff",
                        background: "#fff",
                    }}
                />

            ))}

    </div>

    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#5F6675",
            fontWeight: 600,
        }}
    >

        <People
            size="18"
            color="#2AABEE"
        />

        {event.meet_participants?.length ?? 0}
        /
        {event.max_people}

    </div>

</div>

                {isCreator ? (

                    <div
                        style={{
                            color: "#2AABEE",
                            fontWeight: 700,
                        }}
                    >
                        Управление
                    </div>

                ) : isParticipant ? (

                    <div
                        style={{
                            color: "#10B981",
                            fontWeight: 700,
                        }}
                    >
                        Вы участвуете
                    </div>

                ) : isFull ? (

                    <div
                        style={{
                            color: "#EF4444",
                            fontWeight: 700,
                        }}
                    >
                        Нет мест
                    </div>

                ) : (

                    <motion.button

                        whileTap={{
                            scale: .96,
                        }}

                        onClick={(e) => {

                            e.stopPropagation();

                            onJoin();

                        }}

                        style={{
                            border: "none",
                            height: 38,
                            padding: "0 18px",
                            borderRadius: 14,
                            background:
                                "#2AABEE",
                            color: "#fff",
                            cursor: "pointer",
                            fontWeight: 700,
                        }}
                    >
                      Вступить
                    </motion.button>

                )}

            </div>

        </motion.div>

    );

}