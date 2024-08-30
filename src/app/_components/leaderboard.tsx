"use client";

import React, { useState } from "react";
import { MdArrowDownward, MdArrowUpward } from "react-icons/md";
import { api } from "~/trpc/react";

export default function Leaderboard() {
    const [page, setPage] = useState<number>(0);

    const query = api.get.getLeaderboard.useQuery(page)
   
    return <div className="flex flex-col gap-y-4 items-center">
        {(query.data?.maxPage ?? 1) === 0 && <p className="text-black/80">Be first to appear on the leaderboard!</p>}
        {page > 0 && <MdArrowUpward className="cursor-pointer text-black/50" onClick={() => setPage(page - 1)} />}
        {query.data?.results.map(score => <div key={"score-" + score.name + score.time} className="flex w-full flex-row justify-between items-center p-2 bg-black text-white">
            <p className="font-bold">{score.time.toFixed(2)}</p>
            <p>{score.name}</p>
        </div>)}
        {page < ((query.data?.maxPage ?? 20) - 1) && <MdArrowDownward className="cursor-pointer text-black/50" onClick={() => setPage(page + 1)} />}
        <p onClick={() => query.refetch()} className="text-black/80 cursor-pointer">Refresh</p>
    </div>
}