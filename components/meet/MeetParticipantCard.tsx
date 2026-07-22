"use client";

import {
    User,
    MessageCircle,
    MapPin,
    Crown,
    UserMinus,
} from "lucide-react";

import { motion } from "motion/react";

type Props = {
    user: any;
    organizer?: boolean;
    isCurrentUser?: boolean;
    onProfile?: () => void;
    onChat?: () => void;
    onRemove?: () => void;
    canRemove?: boolean;
};

export default function MeetParticipantCard({
    user,
    organizer = false,
    isCurrentUser = false,
    onProfile,
    onChat,
    onRemove,
    canRemove = false,
}: Props) {
    return (
       <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    whileTap={{ scale: 0.985 }}
    transition={{
        duration: .18
    }}
    style={{
    marginTop: 8,
    background: "#fff",
    borderRadius: 18,
    padding: 14,
    border: "1px solid rgba(15,23,42,.05)",
    boxShadow: "0 4px 12px rgba(15,23,42,.04)",
}}
>
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                }}
            >
                {/* Avatar */}

                <div
                    style={{
                        position: "relative",
                        width: 56,
                        height: 56,
                        flexShrink: 0,
                    }}
                >
                    <img
                        src={user.avatar_url || "/avatar-placeholder.png"}
                        alt={user.name}
                        style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            objectFit: "cover",
                            background: "#F3F4F6",
                        }}
                    />

                    <div
                        style={{
                            position: "absolute",
                            right: 1,
                            bottom: 1,
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: "#22C55E",
                           border:"2px solid white"
                        }}
                    />
                </div>

                {/* Info */}

                <div
                    style={{
                        flex: 1,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                        }}
                    >
                        <div
    style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
    }}
>
    <div
        style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#111827",
            lineHeight: 1.1,
        }}
    >
        {user.name}
        {user.age ? `, ${user.age}` : ""}
    </div>

    {isCurrentUser && (
        <div
            style={{
                padding: "3px 8px",
                borderRadius: 999,
                background: "#E8F1FF",
                color: "#2F80FF",
                fontSize: 11,
                fontWeight: 700,
            }}
        >
            Вы
        </div>
    )}
</div>

                        {organizer && (
    <div
        style={{
            marginTop: 6,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "3px 8px",
            borderRadius: 999,
            background: "#FFF6DD",
            color: "#D89A00",
            fontSize: 11,
            fontWeight: 600,
        }}
    >
        <Crown size={12} />
        Организатор
    </div>
)}
                    </div>

                    <div
    style={{
        marginTop: 12,
        display: "flex",
        alignItems: "center",
        gap: 8,
        color: "#6B7280",
        fontSize: 13,
    }}
>
    <MapPin size={14} />
    {user.city || "Не указан"}
</div>

                    {user.bio && (
                        <div
                            style={{
                                marginTop: 8,
                                color: "#4B5563",
                                fontSize: 13,
                                lineHeight: 1.5,
                            }}
                        >
                            {user.bio}
                        </div>
                    )}
                </div>
            </div>

            <div
                style={{
                    marginTop: 14,
                    borderTop: "1px solid #EEF2F7",
                    paddingTop: 14,
                    display: "flex",
                    justifyContent: "center",
                    gap: 12,
                }}
            >
                <motion.button
    onClick={onProfile}
    whileHover={{ scale: 1.06 }}
    whileTap={{ scale: 0.92 }}
    transition={{ duration: 0.15 }}
    style={{
        width: 42,
        height: 42,
        borderRadius: "50%",
        border: "1px solid #E7EAF0",
        background: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
    }}
>
    <User size={18} />
</motion.button>

                {!isCurrentUser && (
    <motion.button
        onClick={onChat}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        transition={{ duration: 0.15 }}
        style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            border: "none",
            background: "#2F80FF",
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
        }}
    >
        <MessageCircle size={18} />
    </motion.button>
)}

                {canRemove && (
    <motion.button
        onClick={onRemove}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        transition={{ duration: 0.15 }}
        style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            border: "none",
            background: "#FFF1F2",
            color: "#EF4444",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
        }}
    >
        <UserMinus size={17} />
    </motion.button>
)}
            </div>
        </motion.div>
    );
}