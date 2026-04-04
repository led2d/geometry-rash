# Geometry Dash Webport (WIP)

This is an attempt to modify the [new browser version of Geometry Dash](https://geometrydash.com/game) by Robtop to function like the original Steam version, add missing logic and sprites, and include a converter for the web level format, so that real levels can be played in the web version. It's more like a web-backport, than a traditional webport. I don't intend to add support for levels beyond the Lite version.

Ported by [Stellite Games](https://discord.gg/aaB7bPXrPn)
Try Stellite now at <https://stellite.games>, or join the Discord server for more links!

![Stellite Logo](./stellite-logo.png)

Credit to Robtop for their work on Geometry Dash, both the web release and the Steam version.

## Does this use the same game engine as the original?

No, it's not a direct port of the Cocos2d source; rather, it uses Phaser 3.

## Where are the assets

If you want to try out this project:

1. Install <https://chromewebstore.google.com/detail/save-all-resources/abpdnfjocnmdomablahdcfnoggeeiedb>
2. Download <https://geometrydash.com/play>
3. Get the assets from Devtools
4. Put them at the root of this repository
5. Create an ENV var `GD_STEAM_RESOURCES` to a backup of the `resources` folder from the Steal installo

You're going to see the assets missing. They won't be included in the repository for legal reasons. You can figure out what to add yourself by reading the codebase. I will include instructions later when the project is more complete.

## What we know so far

- While the official browser version only has the first level, there exist references to sprites found in other early levels, more specifically, the ones for objects found in the Lite version. These could have been scrapped, possibly because Robtop didn't want the game ripped and stolen on game sites.
  - There exists a lot of unused logic for blocks, hazards, pads, rings, decorations, speed portals, and more. This further confirms my theory.
  - The mere fact that the filename is 1.txt further confirms that there were plans for more levels, and that the game was not meant to be a one-level demo.
  - The first level file, compared to the Steam version, is missing 13 objects.
- The music is hardcoded always to play `StereoMadness.mp3`.
- The source uses an obfuscation system with base64 encoding and character rotation in `index-game.js`.
  - A rotation array `_0x4491` found at position 2671286 contains base64-encoded strings.
  - A lookup function `_0x46a7` found at position 2600621 decodes strings via custom base64 with character rotation.
    - All string literals are replaced with calls to this lookup function.
- The source contains a rudimentary DRM check, ensuring that the game assets are only playable from Robtop's domains and localhost.
  - Found at position 2992851-2993213 in `index-game.js`: `const Ts=window[_0x6e411f(0xfa0)][_0x6e411f(0x1876)],bs=[0x67,0x65,0x6f,0x6d,0x65,0x74,0x72,0x79,0x64,0x61,0x73,0x68,0x2e,0x63,0x6f,0x6d]['map'](_0x1c1bb4=>String[_0x6e411f(0x370)](_0x1c1bb4))[_0x6e411f(0xb6b)]('');if(!(Ts===bs||Ts===_0x6e411f(0x7ec)+bs||Ts[_0x6e411f(0x696)]('.'+bs)||_0x6e411f(0x10b9)===Ts))throw document['body']['innerHTML']='',new Error('');`.

## What needs to be done (progress to Geometry Dash Lite compatibility)

- Finish implementing the missing objects.
  - Getting the deadcode logic to function.
