"use client";
import { useSession } from "@/lib/session"
import { useEffect, useState } from "react";
import { MdArrowUpward } from "react-icons/md";
import { motion } from 'framer-motion'
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(0, 0, 0, 0);

export default function Navbar() {
    const { user, refetch } = useSession();
    const [isPopupClosed, setIsPopupClosed] = useState<boolean>(false);
    const [isSidebarOpened, setIsSidebarOpened] = useState<boolean>(false);
    const [showCodes, setShowCodes] = useState<boolean>(false);
    const [newNick, setNewNick] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const router = useRouter()
    const [timeLeft, setTimeLeft] = useState<string>("");

    const updateTime = () => {
        const time = new Date(tomorrow.getTime() - new Date().getTime()).toLocaleTimeString("pl-PL", { timeZone: "Europe/Berlin" });
        setTimeLeft(time);
    }

    useEffect(() => {
        updateTime()
        const interval = setInterval(updateTime, 1000)
        return () => clearInterval(interval)
    }, [])

    const submitNewNick = () => {
        api.maze.name.post(newNick).then(res => {
            refetch()
            if (res.error) return setSuccess(res.error.message)
            setSuccess(res.data)
        })
    }

    return <>
        <p className="pt-4 text-center w-full text-black/60">Website made by <a className="underline text-black" href="https://crqch.vercel.app/">crqch</a></p>
        <div className="flex flex-row top-0 left-0 w-full px-[10%] items-center justify-between py-4 text-black/50">
            <p className="text-black font-bold text-2xl">maz3<br /><span className="font-mono text-black/50 text-sm font-light">New maz3 in {timeLeft}</span></p>
            <div className="flex flex-row gap-x-4 items-center">
                <a href="https://github.com/crqch/maz3" className="hidden md:block" target="blank">
                    Source code
                </a>
                <a href="https://ko-fi.com/crqch" className="hidden md:block" target="blank">
                    Support me
                </a>
                <div className="relative">
                    <button onClick={() => setIsSidebarOpened(true)} className="py-2 px-4 select-none bg-black text-white hover:bg-black/90 active:bg-blue-700 transition-colors">
                        <p>{user?.name}</p>
                    </button>
                    {!isPopupClosed && user?.name === "No name set" && <div className="hidden absolute md:flex flex-row gap-x-2 top-12 right-0 bg-black/10 text-black rounded-md p-2 line-clamp-2 w-[200%]">
                        <p>Click here to change your username<br /><span onClick={() => setIsPopupClosed(true)} className="cursor-pointer underline text-black/50">No thanks</span></p>
                        <MdArrowUpward />
                    </div>}
                </div>
            </div>
        </div>
        <div className="flex flex-row items-center md:hidden justify-evenly w-full py-4">
            <a href="https://github.com/crqch/maz3" target="blank">
                Source code
            </a>
            <a href="https://ko-fi.com/crqch" target="blank">
                Support me
            </a>
        </div>
        <motion.div initial={{ opacity: 0 }} onClick={() => setIsSidebarOpened(false)} className={`h-[100vh] w-[100vw] z-40 absolute top-0 left-0 ${isSidebarOpened ? "pointer-events-auto" : "pointer-events-none"} bg-black/40`} animate={isSidebarOpened ? { opacity: 1 } : { opacity: 0 }}>

        </motion.div>

        <motion.div initial={{ top: -600 }} animate={isSidebarOpened ? {
            top: 0
        } : { top: -600 }} className="flex flex-col w-[85%] md:w-[40%] lg:w-[30vw] p-4 md:p-8 m-8 rounded-2xl border-2 border-black/20 z-50 bg-white absolute top-0">
            <p className="font-bold text-2xl">{user?.name}</p>
            {(user?.blockWarnings || 0) > 0 && <p className="py-2 px-4 mb-4 bg-black text-white">Your block warnings: {user?.blockWarnings}<br /><span className="text-red-300">(3 or more will result in a blacklist from the leaderboards!)</span></p>}
            <p>New nick</p>
            <input className="py-2 px-4 focus:outline-none bg-black/10 text-black focus:bg-black/20 transition-colors" value={newNick} onChange={(e) => setNewNick(e.target.value)} />
            <button onClick={submitNewNick} className="py-2 px-4 select-none bg-black text-white hover:bg-black/90 active:bg-blue-700 transition-colors">
                <p>Change nick</p>
            </button>
            {success !== "" && <p className="text-black/80 mt-2">{success}</p>}
            {/* 
            Maybe someday

            <div className="flex flex-col mt-8 p-4 bg-black/10 rounded-md">
                <h3 className="mb-4">Authorization codes is a set of words that you can use to restore your account on other devices/browsers.</h3>
                {!showCodes ? <button onClick={() => setShowCodes(true)} className="py-2 px-4 select-none bg-black text-white hover:bg-black/90 active:bg-blue-700 transition-colors">
                    <p>Show codes</p>
                </button> :
                    <pre className="whitespace-pre-wrap">
                        {user?.wordPassword}
                    </pre>}
            </div> */}
        </motion.div>

    </>
}