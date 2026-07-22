"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
    getMeetEvent,
    getMeetParticipants,
} from "../../../../lib/meet/api";
import MeetParticipantCard from "../../../../components/meet/MeetParticipantCard";

export default function MeetParticipantsPage() {

    const { id } = useParams();

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

            <button
                onClick={() => history.back()}
                style={{
                    border: "none",
                    background: "transparent",
                    fontSize: 16,
                    cursor: "pointer",
                    marginBottom: 18,
                    color: "#374151",
                    fontWeight: 600,
                }}
            >
                ← Назад
            </button>

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
        />
    ))}



        </div>


    </main>

);

}