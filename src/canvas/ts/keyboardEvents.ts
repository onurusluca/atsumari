import { emitter } from "@/composables/useEmit";
import type { User } from "@/types/general";

export function keyDownEventListener(
  canvas: HTMLCanvasElement,
  pressedKeys: { [key: string]: boolean },
  keyPressOrder: string[]
): void {
  canvas.addEventListener("keydown", (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (["w", "a", "s", "d"].includes(key) && !pressedKeys[key]) {
      keyPressOrder.push(key);
    }

    // Listen to both lower and upper case
    switch (e.key.toLowerCase()) {
      case "w":
        pressedKeys.w = true;
        break;
      case "a":
        pressedKeys.a = true;
        break;
      case "s":
        pressedKeys.s = true;
        break;
      case "d":
        pressedKeys.d = true;
        break;
    }

    // TODO: In the close future, we may want to emit other users moving as well. For now, we only emit my player moving
    /*
    const validKeys = ["w", "a", "s", "d"];

     if (validKeys.includes(key)) {
      // Emit player move event
      emitter.emit("playerMove", myPlayer);
    } */

    emitter.emit("closeRightClickMenu");
  });
}

export function keyUpEventListener(
  canvas: HTMLCanvasElement,
  pressedKeys: { [key: string]: boolean },
  keyPressOrder: string[],
  myPlayer: User
): void {
  canvas.addEventListener("keyup", (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();

    switch (key) {
      case "w":
        pressedKeys.w = false;
        break;
      case "a":
        pressedKeys.a = false;
        break;
      case "s":
        pressedKeys.s = false;
        break;
      case "d":
        pressedKeys.d = false;
        break;
    }

    // Only emit if key is w,a,s,d or W,A,S,D and after user has stopped moving
    const validKeys = ["w", "a", "s", "d"];

    if (validKeys.includes(key)) {
      // Emit player move event
      emitter.emit("playerMove", myPlayer);
      console.log("EMITTED PLAYER MOVE", myPlayer);
    }

    keyPressOrder = keyPressOrder.filter((k) => k !== key);
  });
}
