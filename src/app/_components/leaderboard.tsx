"use client";

import { api } from "@/lib/api";
import React, { useEffect, useState } from "react";
import { MdArrowDownward, MdArrowUpward } from "react-icons/md";

export default function Leaderboard() {
    const [page, setPage] = useState<number>(0);
    const [results, setResults] = useState<{
        results: { time: number, username: string }[],
        pageCount: number
    }>();

    const refresh = () => {
        api.maze.leaderboards.get({
            query: {
                page
            }
        }).then(res => {
            if (res.data) {
                setResults(res.data)
            }
        })
    }

    useEffect(() => {
        refresh()
    }, [page])

    return <div className="flex flex-col gap-y-4 items-center">
        {(results?.pageCount ?? 1) === 0 && <p className="text-black/80">Be first to appear on the leaderboard!</p>}
        {page > 0 && <MdArrowUpward className="cursor-pointer text-black/50" onClick={() => setPage(page - 1)} />}
        {results?.results.map(score => <div key={"score-" + score.username + score.time} className="flex w-full flex-row justify-between items-center p-2 bg-black text-white">
            <p className="font-bold">{score.time.toFixed(2)}</p>
            <p>{score.username}</p>
        </div>)}
        {page < ((results?.pageCount ?? 20) - 1) && <MdArrowDownward className="cursor-pointer text-black/50" onClick={() => setPage(page + 1)} />}
        <p onClick={refresh} className="text-black/80 cursor-pointer select-none">Refresh</p>
    </div>
}