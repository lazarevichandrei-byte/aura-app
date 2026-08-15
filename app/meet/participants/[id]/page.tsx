"use client";

import { useEffect, useState } from "react";
import { ArrowLeft2 } from "iconsax-react";
import { motion } from "motion/react";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import PageWrapper from "../../../../components/PageWrapper";
import BottomSheet from "../../../../components/BottomSheet";
import { ListSkeleton } from "../../../../components/AppSkeletons";
import { useCurrentUser } from "../../../../lib/useCurrentUser";

import {
    getMeetEvent,
    getMeetParticipants,
    removeMeetParticipant,
} from "../../../../lib/meet/api";
import MeetParticipantCard from "../../../../components/meet/MeetParticipantCard";
import { createChatIfNotExists } from "../../../../lib/chat/api";
import {useI18n} from "../../../../components/I18nProvider";

export default function MeetParticipantsPage() {
    const {t}=useI18n();

    const { id } = useParams();

    const router = useRouter();

const searchParams = useSearchParams();
    const { user: currentUser } = useCurrentUser();
    const [loading, setLoading] = useState(true);

    const [event, setEvent] = useState<any>(null);

    const [participants, setParticipants] = useState<any[]>([]);
    const [removeUser, setRemoveUser] = useState<any>(null);

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
    user: any
) {

    if (!currentUser) return;

    if (currentUser.id !== event.creator_id) {
        return;
    }

    setRemoveUser(user);

}

if (loading) {
    return <ListSkeleton rows={6} />;

}

    return (

    <PageWrapper>

    <main
        style={{
            minHeight: "100vh",
            background: "var(--app-bg)",
            color:"var(--text-primary)",
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
   <motion.div
    onClick={() => {

  const tab =
    searchParams.get("tab") ?? "feed";

  router.push(`/meet?tab=${tab}`);

}}
    whileTap={{ scale: 0.92 }}
    transition={{ duration: 0.15 }}
    style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingRight: 10,
        cursor: "pointer",
        flexShrink: 0,
    }}
>
    <ArrowLeft2
        size="28"
        color="var(--brand-primary)"
        variant="Outline"
    />
</motion.div>

    <div style={{ flex: 1 }}>
        <div
            style={{
                fontSize: 21,
                fontWeight: 700,
                color: "var(--text-primary)",
                lineHeight: 1.1,
            }}
        >
            {t("meet.participantsTitle")}
        </div>

        <div
            style={{
                marginTop: 3,
                fontSize: 13,
                color: "var(--text-secondary)",
            }}
        >
            {t("meet.spotsSummary",{count:participants.filter((participant:any)=>participant.users.id!==event?.creator_id).length,max:event?.max_people??0,free:Math.max(0,(event?.max_people??0)-participants.filter((participant:any)=>participant.users.id!==event?.creator_id).length)})}
        </div>
    </div>
</motion.div>

{event?.users && (
    <MeetParticipantCard
    user={event.users}
    organizer
    isCurrentUser={
    currentUser?.id === event.users.id
}
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
    isCurrentUser={
        currentUser?.id === participant.users.id
    }

    canRemove={
        currentUser?.id === event.creator_id
    }

    onRemove={() =>
    handleRemoveParticipant(
        participant.users
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

        <BottomSheet
            open={!!removeUser}
            onClose={() => setRemoveUser(null)}
        >
            <div
    style={{
        padding: 20,
        textAlign: "center",
    }}
>
    {removeUser && (
        <>
            <motion.div
                initial={{ scale: .9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: .18 }}
            >
                <img
                    src={
                        removeUser.avatar_url ||
                        "/avatar-placeholder.png"
                    }
                    alt={removeUser.name}
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        objectFit: "cover",
                        margin: "0 auto",
                        border: "2px solid var(--border)",
                    }}
                />
            </motion.div>

            <div
                style={{
                    marginTop: 14,
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                }}
            >
                {removeUser.name}
            </div>

            <div
                style={{
                    marginTop: 8,
                    fontSize: 14,
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                }}
            >
                {t("meet.removeTitle")}
            </div>

            <motion.button
                whileTap={{ scale: .97 }}
                transition={{ duration: .15 }}
                onClick={async () => {

                    await removeMeetParticipant(
                        event.id,
                        removeUser.id
                    );

                    setRemoveUser(null);

                    await load();

                }}
                style={{
                    marginTop: 22,
                    width: "100%",
                    height: 48,
                    border: "none",
                    borderRadius: 14,
                    background: "#EF4444",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: "pointer",
                }}
            >
                {t("meet.remove")}
            </motion.button>

            <motion.button
                whileTap={{ scale: .97 }}
                transition={{ duration: .15 }}
                onClick={() => setRemoveUser(null)}
                style={{
                    marginTop: 10,
                    width: "100%",
                    height: 48,
                    borderRadius: 14,
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: "pointer",
                }}
            >
                {t("common.cancel")}
            </motion.button>
        </>
    )}
</div>
        </BottomSheet>

    </main>

    </PageWrapper>

);

}
