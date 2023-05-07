import { emitter } from "@/composables/useEmit";
import type { User } from "@/types/general";

const validKeys = ["w", "a", "s", "d"];

export function keyDownEventListener(
  canvas: HTMLCanvasElement,
  pressedKeys: { [key: string]: boolean },
  keyPressOrder: string[],
  getMyPlayer: () => User
): void {
  canvas.addEventListener("keydown", (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (validKeys.includes(key) && !pressedKeys[key]) {
      keyPressOrder.push(key);
    }

    if (validKeys.includes(key)) {
      pressedKeys[key] = true;
    }

    emitter.emit("closeRightClickMenu");
  });
}

export function keyUpEventListener(
  canvas: HTMLCanvasElement,
  pressedKeys: { [key: string]: boolean },
  keyPressOrder: string[],
  getMyPlayer: () => User
): void {
  canvas.addEventListener("keyup", (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();

    if (validKeys.includes(key)) {
      pressedKeys[key] = false;
    }

    const myPlayer = getMyPlayer();

    if (validKeys.includes(key)) {
      emitter.emit("playerMove", myPlayer);
      // console.log("EMITTED PLAYER MOVE", myPlayer);
    }

    const index = keyPressOrder.indexOf(key);
    if (index > -1) {
      keyPressOrder.splice(index, 1);
    }
  });
}
