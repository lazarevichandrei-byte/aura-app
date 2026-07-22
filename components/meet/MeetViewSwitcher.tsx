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
                marginBottom: 16,
            }}
        >

            <div
                style={{
                    display: "flex",
                    background: "#fff",
                    borderRadius: 14,
                    padding: 4,
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
                        width: 42,
                        height: 42,
                        borderRadius: 10,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "pointer",
                        background:
                            view === "list"
                                ? "#2AABEE"
                                : "transparent",
                    }}
                >

                    <RowVertical
                        size="20"
                        color={
                            view === "list"
                                ? "#fff"
                                : "#5F6675"
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
                        width: 42,
                        height: 42,
                        borderRadius: 10,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "pointer",
                        background:
                            view === "grid"
                                ? "#2AABEE"
                                : "transparent",
                    }}
                >

                    <Element3
                        size="20"
                        color={
                            view === "grid"
                                ? "#fff"
                                : "#5F6675"
                        }
                        variant="Outline"
                    />

                </motion.div>

            </div>

        </div>

    );

}