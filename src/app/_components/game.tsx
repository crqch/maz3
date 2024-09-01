"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MdRestartAlt, MdArrowUpward, MdArrowBack, MdArrowForward, MdArrowDownward } from "react-icons/md";
import Leaderboard from "@/app/_components/leaderboard";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import Fireworks from "react-canvas-confetti/dist/presets/fireworks"
import { motion, useScroll } from "framer-motion"


export default function Game() {
    const [tileSize, setTileSize] = useState(50);
    const [gameStarted, setGameStarted] = useState(false);
    const [playerPosition, setPlayerPosition] = useState({ x: 6, y: -5 });
    const [gameTime, setGameTime] = useState(0);
    const mazeRef = useRef(null);
    const [finished, setFinished] = useState(false);
    const [lastMove, setLastMove] = useState("");
    const timerRef = useRef<NodeJS.Timer>(null);
    const [postResult, setPostResult] = useState<string>("");
    const { user } = useSession();
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [maze, setMaze] = useState<number[]>([]);

    async function encryptData(userId: string, time: number): Promise<{ encryptedData: string, iv: string, salt: string }> {
        const encoder = new TextEncoder()
        const userIdBuffer = encoder.encode(userId)

        // Generate a 256-bit key using PBKDF2
        const salt = new Uint8Array(16)
        crypto.getRandomValues(salt)
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            userIdBuffer,
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        )
        const key = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt']
        )

        const iv = crypto.getRandomValues(new Uint8Array(12))
        const timeBuffer = encoder.encode(time.toString())

        const encryptedBuffer = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            timeBuffer
        )
        

        // @ts-expect-error it is necessary
        const encryptedData = btoa(String.fromCharCode.apply(null, new Uint8Array(encryptedBuffer)))
        // @ts-expect-error it is necessary
        const ivString = btoa(String.fromCharCode.apply(null, iv))
        // @ts-expect-error it is necessary
        const saltString = btoa(String.fromCharCode.apply(null, salt))

        return {
            encryptedData,
            iv: ivString,
            salt: saltString
        }
    }
    useEffect(() => {
        setTileSize(window.innerWidth > 768 ? 50 : 25)
        api.maze.maze.get().then(res => {
            setMaze(res.data)
        })
    }, [])

    const submitScore = async () => {
        if (gameTime !== -1 && !submitting) {
            setSubmitting(true)
            // @ts-expect-error it is necessary
            const data = await encryptData(user.id, gameTime.toFixed(2))
            api.maze.score.post(data).then(res => {
                if (res.data) {
                    if (res.data[0] === 1) setGameTime(-1);
                    setPostResult(res.data[1])
                    setSubmitting(false)
                }
            })
        }
    };

    const startGame = () => {
        setGameStarted(true);
        setGameTime(0);
        setPostResult("")
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
            top: playerPosition.y * tileSize + tileSize * 4,
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

            // Do not react if the target element is input
            if (e.target !== undefined && (e.target as HTMLElement).tagName === "INPUT") return

            switch (key.toLowerCase()) {
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
                    setFinished(false);
                    setPostResult("")
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

            if (newY === Math.ceil(maze.length / 12)) {
                //@ts-expect-error because it is necessary
                clearInterval(timerRef.current);
                stopGame();
                finish();
            }
        },
        [gameStarted, playerPosition]
    );

    const preventDefault = (e: Event) => {
        e.preventDefault()
    }

    const ondrag = (e: DragEvent) => {
        console.log(e)
    }

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('wheel', preventDefault);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('wheel', preventDefault);
        };
    }, [handleKeyDown]);

    if (user === null || maze === undefined) return <div className="flex min-h-screen w-full items-center justify-center flex-col text-6xl font-bold">
        <p>Loading</p>
    </div>

    return (
        <>
            {gameTime !== -1 && <motion.p initial={{ top: -80 }} animate={gameTime > 0 ? {
                top: 0
            } : { top: -80 }} className="fixed hidden md:flex text-2xl font-bold flex-row items-center justify-center bg-black text-white" style={{ zIndex: 20, left: tileSize, top: tileSize, width: tileSize * 2, height: tileSize }}>{gameTime.toFixed(2)}</motion.p>}
            <main className="min-h-screen flex flex-col items-center text-center">
                <><div className="min-h-[80vh] flex gap-y-4 justify-center items-center flex-col">
                    <h1>Solve the maze</h1>
                    <p className="text-gray-400">{tileSize === 50 ? "by using →, ←, ↑, ↓" : "by using virtual keys"}</p>
                </div>
                <div className="fixed grid grid-cols-3 w-24 h-24 grid-rows-3 z-20 self-center top-[50%] right-20 bg-white rounded-full overflow-hidden md:hidden">
                    <div className="pointer-events-none"></div>
                    <div onClick={() => handleKeyDown({ key: "ArrowUp", preventDefault: () => {} })} className="items-center justify-center flex">
                        <MdArrowUpward size={30} />
                    </div>
                    <div className="pointer-events-none"></div>
                    <div onClick={() => handleKeyDown({ key: "ArrowLeft", preventDefault: () => {} })} className="items-center justify-center flex">
                        <MdArrowBack size={30} />
                    </div>
                    <div className="pointer-events-none"></div>
                    <div onClick={() => handleKeyDown({ key: "ArrowRight", preventDefault: () => {} })} className="items-center justify-center flex">
                        <MdArrowForward size={30} />
                    </div>
                    <div className="pointer-events-none"></div>
                    <div onClick={() => handleKeyDown({ key: "ArrowDown", preventDefault: () => {} })} className="items-center justify-center flex">
                        <MdArrowDownward size={30} />
                    </div>
                    <div className="pointer-events-none"></div>
                </div>
                    <div ref={mazeRef} className="w-full flex flex-col relative items-center bg-black">
                        <div className="grid grid-cols-12 relative">
                            {maze.map((m, i) => <div key={'tile-' + i} style={{ height: tileSize, width: tileSize }} className={`tile ${m === 0 ? "bg-white" : "bg-black"}`}>
                            </div>)}
                            <div
                                className="absolute select-none items-center justify-center flex flex-row text-white backdrop-invert z-20 text-4xl"
                                style={{
                                    width: tileSize,
                                    height: tileSize,
                                    left: `${playerPosition.x * tileSize + tileSize / 2 - (tileSize / 2)}px`,
                                    top: `${playerPosition.y * tileSize + tileSize / 2 - (tileSize / 2)}px`,
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
                            {finished && <div onClick={restart} style={{ marginTop: tileSize * 51, width: tileSize * 3, height: tileSize }} className={`absolute cursor-auto select-none items-center flex flex-row justify-center text-white gap-x-4 ${playerPosition.y === 51 && ([0, 1, 2].includes(playerPosition.x)) ? "bg-blue-700" : "bg-black"} transition-colors`}>
                                <MdRestartAlt />
                                <p>Restart</p>
                            </div>}
                        </div>
                    </div>
                    <div className="min-h-[80vh] flex flex-col">
                        {finished && <div style={{ marginTop: tileSize * 2 }} className="flex flex-col">
                            <Fireworks autorun={{ speed: 2, duration: 10000  }} />
                            <h1>Congrats!</h1>
                            {postResult !== "" && <div className="flex mb-8 flex-row justify-between items-center p-2 bg-black text-white">
                                <p>{postResult}</p>
                            </div>}
                            {gameTime !== -1 && <>
                                <p className="text-gray-400 mb-12">Your time: {gameTime.toFixed(2)}</p>
                                <p>Do you want to submit this score?</p>
                                <div className="flex w-full flex-row justify-between items-center p-2 bg-black text-white">
                                    <p className="font-bold">{gameTime.toFixed(2)}</p>
                                    <p>{user.name}</p>
                                </div>
                                <button onClick={submitScore} className="py-2 px-4 mb-8 bg-black/10 transition-colors hover:bg-black/20 active:bg-blue-700 active:text-white">Submit score</button>
                            </>}
                            <Leaderboard />
                        </div>}
                    </div>
                </>
            </main>
        </>
    );
}