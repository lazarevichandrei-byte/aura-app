"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
    getMeetEvent,
    getMeetParticipants,
} from "../../../../lib/meet/api";

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

            <main className="min-h-screen bg-black text-white flex items-center justify-center">

                Загрузка...

            </main>

        );

    }

    return (

        <main className="min-h-screen bg-black text-white">

            <div className="mx-auto max-w-lg px-5 py-6">

                <h1 className="text-2xl font-bold">

                    👥 Участники встречи

                </h1>

                <div className="mt-2 text-zinc-400">

                    {participants.length} из {event.max_people} участников

                </div>

            </div>

        </main>

    );

}