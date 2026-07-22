"use client";

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
                marginTop: 16,
                background: "#fff",
                borderRadius: 24,
                padding: 20,
                boxShadow: "0 8px 20px rgba(0,0,0,.05)",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                }}
            >
                <img
                    src={
                        user.avatar_url ||
                        "/avatar-placeholder.png"
                    }
                    alt={user.name}
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        objectFit: "cover",
                        background: "#F3F4F6",
                    }}
                />

                <div style={{ flex: 1 }}>
                    <div
                        style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: "#111827",
                        }}
                    >
                        {user.name}
                        {user.age ? `, ${user.age}` : ""}
                    </div>

                    <div
                        style={{
                            marginTop: 4,
                            color: "#6B7280",
                        }}
                    >
                        📍 {user.city || "Не указан"}
                    </div>

                    {organizer && (
                        <div
                            style={{
                                marginTop: 10,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "6px 12px",
                                borderRadius: 999,
                                background: "#FEF3C7",
                                color: "#B45309",
                                fontWeight: 600,
                                fontSize: 13,
                            }}
                        >
                            👑 Организатор
                        </div>
                    )}
                </div>
            </div>

            <div
                style={{
                    display: "flex",
                    gap: 12,
                    marginTop: 18,
                }}
            >
                <button
                onClick={onProfile}
                    style={{
                        flex: 1,
                        height: 46,
                        borderRadius: 14,
                        border: "1px solid #E5E7EB",
                        background: "#fff",
                        cursor: "pointer",
                        fontWeight: 600,
                    }}
                >
                    👤
                </button>

                <button
                onClick={onChat}
                    style={{
                        
                        flex: 1,
                        height: 46,
                        borderRadius: 14,
                        border: "none",
                        background: "#2AABEE",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 600,
                    }}
                >
                    💬
                </button>

                {!organizer && canRemove && (
                    <button
                    onClick={onRemove}
                        style={{
                            width: 46,
                            borderRadius: 14,
                            border: "none",
                            background: "#FEE2E2",
                            color: "#DC2626",
                            fontSize: 20,
                            cursor: "pointer",
                        }}
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
}