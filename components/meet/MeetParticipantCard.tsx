"use client";

import {
    User,
    MessageCircle,
    MapPin,
    Crown,
    UserMinus,
} from "lucide-react";

type Props = {
    user: any;
    organizer?: boolean;
    onProfile?: () => void;
    onChat?: () => void;
    onRemove?: () => void;
    canRemove?: boolean;
};

export default function MeetParticipantCard({
    user,
    organizer = false,
    onProfile,
    onChat,
    onRemove,
    canRemove = false,
}: Props) {
    return (
        <div
            style={{
                marginTop: 18,
                background: "#fff",
                borderRadius: 30,
                padding: 24,
                boxShadow: "0 10px 35px rgba(15,23,42,.08)",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 20,
                }}
            >
                {/* Avatar */}

                <div
                    style={{
                        position: "relative",
                        width: 84,
                        height: 84,
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
                            right: 4,
                            bottom: 4,
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            background: "#22C55E",
                            border: "3px solid white",
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
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                        }}
                    >
                        <div
                            style={{
                                fontSize: 26,
                                fontWeight: 700,
                                color: "#111827",
                                lineHeight: 1.2,
                            }}
                        >
                            {user.name}
                            {user.age ? `, ${user.age}` : ""}
                        </div>

                        {organizer && (
    <div
        style={{
            padding: "8px 16px",
            borderRadius: 999,
            background: "#FFF6DD",
            color: "#D89A00",
            fontWeight: 600,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 6,
            whiteSpace: "nowrap",
        }}
    >
        <Crown size={16} fill="#FACC15" color="#D89A00" />
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
        fontSize: 16,
    }}
>
    <MapPin size={17} />
    {user.city || "Не указан"}
</div>

                    {user.bio && (
                        <div
                            style={{
                                marginTop: 14,
                                color: "#4B5563",
                                fontSize: 16,
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
                    marginTop: 22,
                    borderTop: "1px solid #EEF2F7",
                    paddingTop: 22,
                    display: "flex",
                    justifyContent: "center",
                    gap: 24,
                }}
            >
                <button
                    onClick={onProfile}
                   style={{
    width: 56,
    height: 56,
    borderRadius: "50%",
    border: "1px solid #E7EAF0",
    background: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    transition: ".2s",
}}
                >
                    <User size={24} />
                </button>

                <button
                    onClick={onChat}
                    style={{
    width: 56,
    height: 56,
    borderRadius: "50%",
    border: "none",
    background: "#2F80FF",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    transition: ".2s",
}}
                >
                    <MessageCircle size={24} />
                </button>

                {!organizer && canRemove && (
                    <button
                        onClick={onRemove}
                       style={{
    width: 56,
    height: 56,
    borderRadius: "50%",
    border: "none",
    background: "#FFF1F2",
    color: "#EF4444",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    transition: ".2s",
}}
                    >
                        <UserMinus size={22} />
                    </button>
                )}
            </div>
        </div>
    );
}