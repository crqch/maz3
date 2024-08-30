"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MdRestartAlt } from "react-icons/md";
import Leaderboard from "./_components/leaderboard";
import { api } from "~/trpc/react";

// Hardcoded only because it needs to be fair for the leaderboards 😂
const maze = [
    0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1,
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1,
    0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1,
    0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1,
    0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1,
    1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0,
    1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0,
    1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0,
    1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0,
    1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0,
    0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0,
    0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0,
    0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0,
    0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0,
    0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0,
    0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0,
    0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0,
    0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0,
    0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0,
    0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1,
    0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1,
    0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1,
    0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1,
    1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1,
    1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1,
    1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1,
    1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1,
    1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1,
    1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1,
    1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1,
    0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1,
    0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1,
    0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1,
    0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1,
    0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1,
    0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1,
    0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1,
    0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
    0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
    0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
    0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0,
    0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0,
    0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0,
    0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0,
    0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0,
    0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0
];

const TILE_SIZE = 50;

export default function Game() {

    const [gameStarted, setGameStarted] = useState(false);
    const [playerPosition, setPlayerPosition] = useState({ x: 6, y: -5 });
    const [gameTime, setGameTime] = useState(0);
    const mazeRef = useRef(null);
    const [finished, setFinished] = useState(false);
    const [lastMove, setLastMove] = useState("");
    const timerRef = useRef<NodeJS.Timer>(null);
    const [nickname, setNickname] = useState<string>("");

    const mutation = api.post.putScore.useMutation({
        onSuccess: () => {
            setGameTime(-1)
        }
    })

    const submitScore = useCallback(() => {
        if (gameTime !== -1) {
            mutation.mutate({
                name: nickname,
                time: gameTime
            })
        }
    }, [nickname, gameTime, mutation]);

    const startGame = () => {
        setGameStarted(true);
        setGameTime(0);
        //@ts-expect-error because it is necessary
        timerRef.current = setInterval(() => {
            setGameTime(prevTime => prevTime + 0.01);
        }, 10);
    };

    const stopGame = () => {
        setGameStarted(false);
        //@ts-expect-error because it is necessary
        clearInterval(timerRef.current);
    };

    const finish = () => {
        setFinished(true)
    }

    const isValidMove = (x: number, y: number) => {
        if ((y > -1 && (x < 0 || x >= 12)) || y < -13 || y >= 70 || x < -4 || x > 14) return false;
        const tileIndex = y * 12 + x;
        return maze[tileIndex] === 0 || maze[tileIndex] === undefined || x > 12;
    };

    useEffect(() => {
        window.scrollTo({
            top: playerPosition.y * TILE_SIZE + TILE_SIZE * 4,
            behavior: 'smooth'
        })
    }, [playerPosition])

    const restart = () => {
        setPlayerPosition({ x: 6, y: -5 })
        setFinished(false)
    }

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            let newX = playerPosition.x;
            let newY = playerPosition.y;
            let key = e.key

            switch(key.toLowerCase()){
                case "a":
                    key = "ArrowLeft"
                    break;
                case "s":
                    key = "ArrowDown"
                    break;
                case "d":
                    key = "ArrowRight"
                    break;
                case "w":
                    key = "ArrowUp"
                    break;
            }

            switch (key) {
                case "ArrowUp":
                    newY--;
                    break;
                case "ArrowDown":
                    newY++;
                    break;
                case "ArrowLeft":
                    newX--;
                    break;
                case "ArrowRight":
                    newX++;
                    break;
                case "Enter":
                    if (playerPosition.y === 51 && ([0, 1, 2].includes(playerPosition.x))) restart()
                    return;
                default:
                    return;
            }
            preventDefault(e)
            if (isValidMove(newX, newY)) {
                if (newY === 0 && !gameStarted) {
                    startGame()
                } else if (newY < 0 && gameStarted) {
                    stopGame()
                }
                setPlayerPosition({ x: newX, y: newY });
                setLastMove(key.replace("Arrow", ""))
                setTimeout(() => {
                    setLastMove("")
                }, 250)
            }

            if (newX === 11 && newY === 49) {
                //@ts-expect-error because it is necessary
                clearInterval(timerRef.current);
                stopGame();
                if (newY === 49) {
                    finish();
                }
            }
        },
        [gameStarted, playerPosition]
    );

    const preventDefault = (e: Event) => {
        e.preventDefault()
    }

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('wheel', preventDefault);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('wheel', preventDefault);
        };
    }, [handleKeyDown]);

    return (
        <>
            {gameTime !== -1 && <p className="fixed text-2xl font-bold flex flex-row items-center justify-center bg-black text-white" style={{ zIndex: 20, left: TILE_SIZE, top: TILE_SIZE, width: TILE_SIZE * 2, height: TILE_SIZE }}>{gameTime.toFixed(2)}</p>}
            <div className="md:hidden min-h-screen flex flex-col items-center justify-center">
                <h1>The maze is not for mobile</h1>
                <p className="mb-8">Because of technical difficulties and technology used in making this game possible, it is impossible to prepare the game for mobile devices.</p>
                <a href="mailto:?subject=I want to try out maze&body=Found this game, it's a reminder to try it out when I'm on PC." draggable={false}>
                    <div className="py-2 px-4 bg-black text-white hover:bg-black/90 active:bg-blue-700 transition-colors">
                        <p>E-mail yourself the link</p>
                    </div>
                </a>
            </div>
            <main className="min-h-screen hidden md:flex flex-col items-center text-center">
                <div className="flex flex-row absolute top-0 left-0 w-full px-48 items-center justify-between py-4 text-black/50">
                    <p>Yes, this is a footer but on top.<br />Is it header or footer?</p>
                    <div className="flex flex-row gap-x-4">
                        <a href="https://github.com/crqch/maz3" target="blank">
                            Source code
                        </a>
                        <a href="https://ko-fi.com/crqch" target="blank">
                            Support me
                        </a>
                    </div>
                </div>
                <><div className="min-h-[80vh] flex gap-y-4 justify-center items-center flex-col">
                    <h1>Solve the maze</h1>
                    <p className="text-gray-400">{"by using →, ←, ↑, ↓"}</p>
                </div>
                    <div ref={mazeRef} className="w-full flex flex-col relative items-center bg-black">
                        <div className="grid grid-cols-12 relative">
                            {maze.map((m, i) => <div key={'tile-' + i} style={{ height: TILE_SIZE, width: TILE_SIZE }} className={`tile ${m === 0 ? "bg-white" : "bg-black"}`}>
                            </div>)}
                            <div
                                className="absolute select-none items-center justify-center flex flex-row text-white backdrop-invert z-20 text-4xl"
                                style={{
                                    width: TILE_SIZE,
                                    height: TILE_SIZE,
                                    left: `${playerPosition.x * TILE_SIZE + TILE_SIZE / 2 - 25}px`,
                                    top: `${playerPosition.y * TILE_SIZE + TILE_SIZE / 2 - 25}px`,
                                    transition: "all 0.1s linear",
                                }}
                            >
                                {playerPosition.y === 51 && ([0, 1, 2].includes(playerPosition.x)) ? "" : lastMove === "" ? "{}" : (() => {
                                    if (lastMove === "Up") return "↑"
                                    if (lastMove === "Down") return "↓"
                                    if (lastMove === "Left") return "←"
                                    if (lastMove === "Right") return "→"
                                })()}
                            </div>
                            {finished && <div style={{ marginTop: TILE_SIZE * 51, width: TILE_SIZE * 3, height: TILE_SIZE }} className={`absolute cursor-auto select-none items-center flex flex-row justify-center text-white gap-x-4 ${playerPosition.y === 51 && ([0, 1, 2].includes(playerPosition.x)) ? "bg-blue-700" : "bg-black"} transition-colors`}>
                                <MdRestartAlt />
                                <p>Restart</p>
                            </div>}
                        </div>
                    </div>
                    <div className="min-h-[80vh] flex flex-col">
                        {finished && <div style={{ marginTop: TILE_SIZE }} className="flex flex-col">
                            <h1>Congrats!</h1>
                            {gameTime !== -1 ? <>
                                <p className="text-gray-400 mb-12">Your time: {gameTime.toFixed(2)}</p>
                                <p>Input your name to appear on the leaderboard!</p>
                                <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Name or nickname" className="py-2 px-4 mt-4 bg-black/10 placeholder:text-black text-black hover:bg-black/10 active:bg-black/20 focus:bg-black/20 focus:outline-none transition-colors" />
                                <button onClick={submitScore} className="py-2 px-4 mb-8 bg-black/10 transition-colors hover:bg-black/20 active:bg-blue-700 active:text-white">Submit score</button>
                            </> : <div className="flex mb-8 flex-row justify-between items-center p-2 bg-black text-white">
                                <p>Successfully reported the score</p>
                            </div>}
                            <Leaderboard />
                        </div>}
                    </div>
                </>
            </main>
        </>
    );
}