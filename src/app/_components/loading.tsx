"use client";

import { useSession } from "@/lib/session"
import {motion} from "framer-motion";

export default function LoadingScreen() {
    const { user } = useSession()

    return <motion.div initial={{ y: 0 }} animate={user === undefined ? { y: 0 }: { y: '-100%' }} transition={{
        type: 'spring',
        duration: 0.8
    }} className="w-full min-h-screen items-center justify-center flex flex-col gap-y-8 bg-black text-white absolute top-0 left-0" style={{ zIndex: 90 }}>
        <h1>maz3</h1>
        <p>Loading</p>
    </motion.div>
}