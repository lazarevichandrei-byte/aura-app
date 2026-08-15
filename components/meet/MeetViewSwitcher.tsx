"use client";

import { motion } from "motion/react";
import {
    RowVertical,
    Element3,
} from "iconsax-react";

type Props = {
    view: "list" | "grid";
    onChange: (
        view: "list" | "grid"
    ) => void;
};

export default function MeetViewSwitcher({
    view,
    onChange,
}: Props) {

    return (

        <div
            style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 8,
            }}
        >

            <div
                style={{
                    display: "flex",
                    background: "var(--surface-secondary)",
                    borderRadius: 12,
                    padding: 1,
                    boxShadow:
                        "0 6px 18px rgba(0,0,0,.06)",
                }}
            >

                <motion.div
                    whileTap={{
                        scale: .95,
                    }}
                    onClick={() =>
                        onChange("list")
                    }
                    style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8
                    ,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "pointer",
                        background:
                            view === "list"
                                ? "var(--brand-primary)"
                                : "transparent",
                    }}
                >

                    <RowVertical
                        size="16"
                        color={
                            view === "list"
                                ? "var(--text-inverse)"
                                : "var(--text-secondary)"
                        }
                        variant="Outline"
                    />

                </motion.div>

                <motion.div
                    whileTap={{
                        scale: .95,
                    }}
                    onClick={() =>
                        onChange("grid")
                    }
                   style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "pointer",
                        background:
                            view === "grid"
                                ? "var(--brand-primary)"
                                : "transparent",
                    }}
                >

                    <Element3
                        size="16"
                        color={
                            view === "grid"
                                ? "var(--text-inverse)"
                                : "var(--text-secondary)"
                        }
                        variant="Outline"
                    />

                </motion.div>

            </div>

        </div>

    );

}
