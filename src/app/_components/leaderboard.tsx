"use client";

import React from "react";
import { api } from "~/trpc/react";

export default function Leaderboard() {
    const query = api.get.getLeaderboard.useQuery()
   
    return <div className="flex flex-col gap-y-4">
        {query.data?.length === 0 && <p className="text-black/80">Be first to appear on the leaderboard!</p>}
        {query.data?.map(score => <div key={"score-" + score.name + score.time} className="flex flex-row justify-between items-center p-2 bg-black text-white">
            <p className="font-bold">{score.time.toFixed(2)}</p>
            <p>{score.name}</p>
        </div>)}
        <p onClick={() => query.refetch()} className="text-black/80 cursor-pointer">Refresh</p>
    </div>
}