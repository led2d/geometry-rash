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
2. Download <https://geometrydash.com/game/index.html>
3. Get the assets from Devtools
4. Put them at the root of this repository
5. Create an ENV var `GD_STEAM_RESOURCES` to a backup of the `resources` folder from the Steam install
