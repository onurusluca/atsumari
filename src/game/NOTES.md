The TypeScript error about stuff being null is due to strict null checks in TypeScript configuration. Phaser is written in JavaScript, and when used it with TypeScript, TypeScript's static type checking cause issues with Phaser's JavaScript code. So we add '!', the non-null assertion operator, to tell TypeScript that we know what we're doing and that we're sure that the value is not null.

Phaser is typically synced to the refresh rate of the display it's running on


Object Layer finding:

```ts
const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");
player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "atlas", "misa-front");
```
