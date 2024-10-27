import { createElysia } from '@/server/api/elysia'
import { db } from '@/server/db'
import { error } from 'elysia';
import { t } from 'elysia';
import crypto from 'crypto';
import { Score } from '@prisma/client';
import profanity from '../profanity';

function localizeNumber(n: number) {
    const rem100 = n % 100;
    if ([11,12,13].includes(rem100)) {
        return 'th';
    }

    const rem10 = n % 10;
    if ( rem10 === 1 ) {
        return 'st';
    }
    if ( rem10 === 2 ) {
        return 'nd';
    }
    if ( rem10 === 3 ) {
        return 'rd';
    }

    return 'th';
};

const getDayId = () => {
    const date = new Date();
    return [date.getDate(), date.getMonth() + 1, date.getFullYear()].join(".")
}

export function generateMaze(rows: number, cols: number, seed: number): Buffer {
    let randomSeed = seed;
    const random = () => {
        randomSeed = (randomSeed * 1103515245 + 12345) & 0x7fffffff;
        return randomSeed / 0x7fffffff;
    };
    const maze: number[] = new Array<number>(rows * cols).fill(1);
    const isValid = (x: number, y: number) =>
        x >= 0 && x < rows && y >= 0 && y < cols && maze[x * cols + y] === 1;
    const setCell = (x: number, y: number, value: number) => {
        maze[x * cols + y] = value;
    };

    const carvePath = (x: number, y: number) => {
        setCell(x, y, 0);
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        for (let i = directions.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            // @ts-expect-error it is necessary
            [directions[i], directions[j]] = [directions[j], directions[i]];
        }

        for (const [dx, dy] of directions) {
            // @ts-expect-error it is necessary
            const nx = x + dx * 2, ny = y + dy * 2;
            if (isValid(nx, ny)) {
                // @ts-expect-error it is necessary
                setCell(x + dx, y + dy, 0);
                carvePath(nx, ny);
            }
        }
    };

    const startY = Math.floor(random() * (cols - 2)) + 1;
    setCell(0, startY, 0);
    carvePath(1, startY);
    let bottomRowExit = false;
    for (let y = 1; y < cols - 1; y++) {
        if (maze[(rows - 2) * cols + y] === 0) {
            setCell(rows - 1, y, 0);
            bottomRowExit = true;
            break;
        }
    }

    if (!bottomRowExit) {
        const exitY = Math.floor(random() * (cols - 2)) + 1;
        setCell(rows - 1, exitY, 0);
        let x = rows - 2;
        while (x >= 0 && maze[x * cols + exitY] === 1) {
            setCell(x, exitY, 0);
            x--;
        }
    }

    const buffer = Buffer.alloc(maze.length);

    for (let i = 0; i < maze.length; i++) {
        // @ts-expect-error it is necessary
        buffer[i] = maze[i];
    }

    return buffer;
}

const createMaze = async (database: typeof db) => {
    const data = {
        id: getDayId(),
        maze: generateMaze(50, 12, new Date().getTime())
    }

    await database.day.create({
        data
    })

    return data
}

function bufferToBits(buffer: Buffer) {
    const bits = [];

    for (const byte of buffer) {
        const binaryString = byte.toString(2).padStart(1, '0');

        for (const bit of binaryString) {
            bits.push(parseInt(bit, 10));
        }
    }

    return bits;
}

export default createElysia({ prefix: "maze" })
    .get('/getSession', async ({ user }) => {
        const { ip, ...lUser } = user        
        return lUser
    })
    .get('/maze', async ({ db }) => {
        let day = await db.day.findFirst({ where: { id: getDayId() } })
        if (!day) {
            day = await createMaze(db);
        }

        return bufferToBits(day.maze)
    })
    .post('/revertSession', async ({ db, body }) => {
        const user = await db.user.findFirst({ where: { wordPassword: body } })
        if (!user) return error(400, "No user found with matching phrase");
        return user as Omit<typeof user, "ip">
    }, {
        body: t.String()
    })
    .post('/score', async ({ db, body, user }) => {
        if(user.blockWarnings > 3) return [1, "You have been blacklisted"]
        const salt = Buffer.from(body.salt, 'base64');
        const iv = Buffer.from(body.iv, 'base64');
        const encryptedData = Buffer.from(body.encryptedData, 'base64');
        const key = crypto.pbkdf2Sync(user.id, salt, 100000, 32, 'sha256');
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        const authTag = encryptedData.slice(-16);
        const ciphertext = encryptedData.slice(0, -16);
        decipher.setAuthTag(authTag);

        // @ts-expect-error it is necessary
        let decryptedData = decipher.update(ciphertext, 'binary', 'utf-8');
        // @ts-expect-error it is necessary
        decryptedData += decipher.final('utf-8');

        const time = parseFloat(decryptedData);

        if (isNaN(time)) return [0, "Time is not a number!"]
        if (time < 7) return [1, "The solution was too fast!"]
        if (time > 600) return [1, "The solution was too long!"]
        if (user.lastSolve.getTime() + time > new Date().getTime()) return [1, "Timestamp mismatch!"]
        const score = await db.score.create({
            data: {
                time,
                user: { connect: { id: user.id } },
                day: { connect: { id: getDayId() } }
            }
        })
        await db.user.update({ where: { id: user.id }, data: {
            lastSolve: new Date()
        }})
        return [1, "This solve was " + score.id + localizeNumber(Number(score.id))]
    }, {
        body: t.Object({
            iv: t.String(),
            encryptedData: t.String(),
            salt: t.String()
        })
    })
    .post('/name', async ({ db, body, user }) => {
        if(user.blockWarnings > 3) return error(400, "You have been blacklisted!")
        if(profanity.includes(body.toLowerCase())) {
            await db.user.update({
                where: { id: user.id }, data: {
                    blockWarnings: user.blockWarnings + 1
                }
            })
            return error(400, "Name contains profanity")
        }
        await db.user.update({
            where: { id: user.id }, data: {
                name: body
            }
        })
        return error(200, "Changed username succesfully!")
    }, {
        body: t.String({
            minLength: 3,
            maxLength: 32
        })
    })
    .get('/leaderboards', async ({ db, query: { page } }) => {
    
        const results: ({
            user: {
                ip: string;
                id: string;
                name: string;
                blockWarnings: number;
                wordPassword: string;
                lastSolve: Date;
            };
        } & {
            dayId: string;
            id: bigint;
            time: number;
            userId: string;
        })[] = [];
        const dbQuery = (await db.score.findMany({ where: { dayId: getDayId() }, include: {
            user: true
        }})).sort((a, b) => a.time - b.time)
        dbQuery.forEach((d) => {
            if(!results.find(a => a.userId === d.userId)) results.push(d)
        })
        return {
            results: results.slice(page * 15, page + 15 * 15).map(a => ({
                time: a.time,
                username: a.user.name
            })),
            pageCount: Math.ceil(results.length / 15)
        }
    }, {
        query: t.Object({
            page: t.Number({
                minimum: 0, maximum: 200
            })
        })
    })