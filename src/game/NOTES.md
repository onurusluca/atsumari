# NOTES

The TypeScript error about stuff being null is due to strict null checks in TypeScript configuration. Phaser is written in JavaScript, and when used it with TypeScript, TypeScript's static type checking cause issues with Phaser's JavaScript code. So we add '!', the non-null assertion operator, to tell TypeScript that we know what we're doing and that we're sure that the value is not null.

Phaser is typically synced to the refresh rate of the display it's running on

Object Layer finding:

```js
const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");
player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "atlas", "walk-down-0");


 this.scene.map.findObject("Doors", obj => {
            if ((this.y >= obj.y && this.y <= (obj.y + obj.height)) && (this.x >= obj.x && this.x <= (obj.x + obj.width))) {
                console.log('Player is by ' + obj.name);
                if (this.spacebar.isDown) {
                    console.log('Door is open!')
                }
            }
        });
```

## Tileset extrusion

<https://github.com/sporadic-labs/tile-extruder>

## Adding text

```js
    this.add
      .text(16 / camera.zoom, 16 / camera.zoom, "Arrow keys to scroll", {
        font: "18px monospace",
        color: "#ffffff",
        padding: { x: 20, y: 10 },
        backgroundColor: "#000000",
      })
      .setScrollFactor(0);
```

## Notes

### forEach() and Promises

JavaScript's Array.prototype.forEach() does not wait for promises. As a result, your users.forEach() block doesn't wait for the downloadCharacterSpriteSheets promise to resolve before moving on to the next user. This means that you're starting all of these asynchronous actions, but not waiting for them to complete before the next part of your code runs.

You may want to use Promise.all() to wait for all promises to be resolved before moving to the next part of your code. Here's a modification of your current approach:

```js
// Modify this block
await Promise.all(users.map(async (user) => {
  user.characterSprite = await downloadCharacterSpriteSheets(user.characterSpriteName);
  console.error("user.characterSprite", user);
}));

createGame({
  gameMapJson: gameMapJson.value!,
  gameMapTileset: gameMapTileset.value!,
  users: users,
});
```

In this block, Promise.all() takes an array of promises (which is what map() returns) and returns a promise that resolves when all of the input's promises have resolved. That way, the createGame() call won't happen until all the downloadCharacterSpriteSheets() calls have completed.

Note: Array.prototype.map() returns a new array, but since we don't need the new array here, we use Promise.all() just to wait for all the promises to resolve.

### Performance

drawDebug and debug:true will eat a lot for CPU power. Disable it in production.

In terms of analyzing performance issues in your Phaser game, there are a variety of aspects that could contribute to high CPU usage. I don't see any blatant issues in the code you've shared that would definitely lead to high CPU usage, but here are some potential points that could cause performance problems in general:

1. **Rendering:** Phaser uses either WebGL or Canvas for rendering, depending on what's available. If you're relying on Canvas and doing a lot of complex rendering, this can be a bit more CPU-intensive than WebGL. Also, your `render` options are set to `pixelArt: true` and `roundPixels: true`, which can potentially increase the rendering complexity.

2. **Physics:** You're using the Arcade physics system, which is generally pretty fast, but if you have a large number of objects that are checking for collisions, this can add up.

3. **Number of game objects:** The more objects you have in your game, the more potential there is for high CPU usage. If you're creating and destroying a lot of objects frequently, this can also lead to performance problems.

4. **Tilemaps:** Depending on the size and complexity of your tilemap, it might cause performance issues. You are scaling your layers with `MAP_SCALE_FACTOR`, and depending on its value, this could increase the complexity of the scene.

5. **Listeners and Events:** Depending on how often your events are fired, they could potentially slow down your game.

6. **Loading assets:** If your game is constantly loading new assets, it can impact performance.

To help narrow down the issue, you may want to consider the following:

- **Use Profiling Tools:** Most browsers have built-in developer tools that can help you profile and identify where your code might be causing performance issues.

- **Monitor Object Creation and Destruction:** Phaser includes a built-in debugger that can help you keep track of how many game objects are being created and destroyed, and if that's causing any issues.

- **Experiment with Different Settings:** Try changing some of your game's settings and see how that impacts performance. For example, you might try disabling physics, reducing the number of game objects, or simplifying your rendering settings to see if any of these things reduce CPU usage.

Remember, optimizing a game often involves a lot of trial and error, and it can be helpful to make one change at a time and then test to see how that change impacts performance. That way, you can identify exactly what's causing the issue.
