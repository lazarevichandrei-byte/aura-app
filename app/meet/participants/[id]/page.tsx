"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCurrentUser } from "../../../../lib/useCurrentUser";

import {
    getMeetEvent,
    getMeetParticipants,
} from "../../../../lib/meet/api";
import MeetParticipantCard from "../../../../components/meet/MeetParticipantCard";
import { createChatIfNotExists } from "../../../../lib/chat/api";

export default function MeetParticipantsPage() {

    const { id } = useParams();

    const router = useRouter();
    const { user: currentUser } = useCurrentUser();
    const [loading, setLoading] = useState(true);

    const [event, setEvent] = useState<any>(null);

    const [participants, setParticipants] = useState<any[]>([]);

    useEffect(() => {

        load();

    }, []);

    async function load() {

        try {

            const meet =
                await getMeetEvent(id as string);

            const people =
                await getMeetParticipants(id as string);

            setEvent(meet);

            setParticipants(people ?? []);

        } finally {

            setLoading(false);

        }

    }

    if (loading) {

        return (

            <main
    style={{
        minHeight: "100vh",
        background: "#F5F7FB",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#111827",
        fontSize: 18,
        fontWeight: 600,
    }}
>
    Загрузка...
</main>

        );

    }

    return (

    <main
        style={{
            minHeight: "100vh",
            background: "#F5F7FB",
        }}
    >

        <div
            style={{
                maxWidth: 560,
                margin: "0 auto",
                padding: "24px 20px 40px",
            }}
        >

            <div
    style={{
        display: "flex",
        alignItems: "center",
        marginBottom: 20,
    }}
>
    <button
        onClick={() => history.back()}
        style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            border: "none",
            background: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 22,
            color: "#111827",
        }}
    >
        ←
    </button>
</div>

            <div
                style={{
                    background: "#fff",
                    borderRadius: 24,
                    padding: 24,
                    boxShadow: "0 8px 20px rgba(0,0,0,.05)",
                }}
            >

                <div
                    style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: "#111827",
                    }}
                >
                    👥 Участники встречи
                </div>

                <div
                    style={{
                        marginTop: 10,
                        color: "#6B7280",
                        fontSize: 16,
                    }}
                >
                    {participants.length} из {event.max_people} участников
                </div>

                <div
                    style={{
                        marginTop: 6,
                        color: "#9CA3AF",
                        fontSize: 14,
                    }}
                >
                    Свободно мест: {event.max_people - participants.length}
                </div>

            </div>

                        {event?.users && (
    <MeetParticipantCard
    user={event.users}
    organizer
    onProfile={() => router.push(`/user/${event.users.id}`)}
    onChat={async () => {

        if (!currentUser) return;

        const chatId = await createChatIfNotExists(
            currentUser.id,
            event.users.id
        );

        if (chatId) {
            router.push(`/chat/${chatId}`);
        }

    }}
/>
)}

                        {participants
    .filter(
        (participant: any) =>
            participant.users.id !== event.users.id
    )
    .map((participant: any) => (
        <MeetParticipantCard
    key={participant.users.id}
    user={participant.users}

    onProfile={() =>
        router.push(`/user/${participant.users.id}`)
    }

    onChat={async () => {

        if (!currentUser) return;

        const chatId = await createChatIfNotExists(
            currentUser.id,
            participant.users.id
        );

        if (chatId) {
            router.push(`/chat/${chatId}`);
        }

    }}
/>
    ))}



        </div>


    </main>

);

}