import type { User } from "@/types/general";
import { isColliding } from "./utilities";

export function rightClickEventListener(
  canvas: HTMLCanvasElement,
  cameraX: number,
  cameraY: number,
  zoomFactor: number,
  users: User[],
  myPlayerId: string
): void {
  canvas.addEventListener("contextmenu", (e: MouseEvent) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const worldX = e.clientX + cameraX;
    const worldY = e.clientY + cameraY;

    const mousePos = {
      mouseX,
      mouseY,
    };

    const worldPos = {
      worldX,
      worldY,
    };

    // Check if the right-click is on any user, if so, don't emit right click event
    const playerWidth = 64 * zoomFactor;
    const playerHeight = 64 * zoomFactor;
    let collision = false;
    for (const user of users) {
      // Check for collisions

      if (
        user.id !== myPlayerId &&
        isColliding(
          {
            x: worldX - 36,
            y: worldY - 64,
            width: playerWidth,
            height: playerHeight,
          },
          { x: user.x, y: user.y, width: playerWidth, height: playerHeight }
        )
      ) {
        collision = true;
        break;
      }
    }

    // Only update position if there is no collision
    if (!collision) {
      // Emit right click event
      emitter.emit("rightClick", { mousePos, worldPos });
    }
    e.preventDefault();
  });
}

// Override zoom and ctrl+scroll
export function wheelEventListener(
  canvas: HTMLCanvasElement,
  zoomFactor: number
): void {
  canvas.addEventListener("wheel", (e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const zoomSpeed = 0.1;
      if (e.deltaY < 0) {
        // Zoom in
        zoomFactor += zoomSpeed;
      } else {
        // Zoom out
        zoomFactor -= zoomSpeed;
      }
      zoomFactor = Math.min(Math.max(zoomFactor, 0.1), 5);
    }
  });
}

// Listen to double click
/*   canvas.addEventListener("dblclick", (e: MouseEvent) => {
    const x = e.clientX + cameraX - 8;
    const y = e.clientY + cameraY - 25;

    // Emit double click event
    emitter.emit("doubleClick", { x, y });

    myPlayer.x = x;
    myPlayer.y = y;
  }); */
