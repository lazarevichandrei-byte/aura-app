"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useParams, useRouter } from "next/navigation";
import { useCurrentUser } from "../../../../lib/useCurrentUser";

import {
    getMeetEvent,
    getMeetParticipants,
    removeMeetParticipant,
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


    async function handleRemoveParticipant(
    userId: string
) {

    if (!currentUser) return;

    if (currentUser.id !== event.creator_id) {
        return;
    }

    const confirmed = window.confirm(
        "Удалить участника из встречи?"
    );

    if (!confirmed) {
        return;
    }

    await removeMeetParticipant(
        event.id,
        userId
    );

    await load();

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
                padding: "12px 20px 40px",
            }}
        >

            <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.22 }}
    style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        marginBottom: 18,
    }}
>
   <motion.button
    onClick={() => router.back()}
    whileTap={{ scale: 0.92 }}
    whileHover={{ scale: 1.03 }}
    transition={{ duration: 0.15 }}
    style={{
        width: 42,
        height: 42,
        borderRadius: "50%",
        border: "1px solid #EEF2F7",
        background: "#fff",
        boxShadow: "0 6px 16px rgba(15,23,42,.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "#111827",
        flexShrink: 0,
    }}
>
    <ArrowLeft size={20} strokeWidth={2.4} />
</motion.button>

    <div style={{ flex: 1 }}>
        <div
            style={{
                fontSize: 21,
                fontWeight: 700,
                color: "#111827",
                lineHeight: 1.1,
            }}
        >
            Участники встречи
        </div>

        <div
            style={{
                marginTop: 3,
                fontSize: 13,
                color: "#7B8595",
            }}
        >
            {participants.length} из {event.max_people} участников • Свободно{" "}
            {event.max_people - participants.length}
        </div>
    </div>
</motion.div>

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

    canRemove={
        currentUser?.id === event.creator_id
    }

    onRemove={() =>
        handleRemoveParticipant(
            participant.users.id
        )
    }

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