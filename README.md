# maz3

[![ko-fi](https://storage.ko-fi.com/cdn/generated/zfskfgqnf/rest-75d8f6dcf7190e6ce18ef8cb8db10b50-bfx01uo6.jpg)](https://ko-fi.com/crqch)

## Fun game with a **VERY** simple leaderboard system based on cache.

In this project I explored a fun way to manipulate player's movement, including interacting with DOM elements from player's perspective.

This project can be expanded in a way more complex system, possibly utilizing websockets for cooperation between agents

# How to run it?

1. Install Bun (if you haven't already): https://bun.sh/
2. Clone the repo
3. Run `bun install`
4. Run `bun run build`
5. Run `bun run start`
6. Profit, the website is listening on 3000


### The maze array
Ah yes this masterpiece...
```js
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
```
It has been supplied by our wonderful Claude AI. If you plan on changing it, it needs to be 12 columns and 50 rows in size, otherwise make some changes in code.