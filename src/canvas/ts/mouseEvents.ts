import type { User } from "@/types/general";
import { isColliding } from "./utilities";

function getUserCollision(
  users: User[],
  myPlayerId: string,
  worldX: number,
  worldY: number,
  playerWidth: number,
  playerHeight: number
): boolean {
  for (const user of users) {
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
      return true;
    }
  }
  return false;
}

function handleRightClick(
  e: MouseEvent,
  getCamera: () => { cameraX: number; cameraY: number; zoomFactor: number },
  users: User[],
  myPlayerId: string
): void {
  const { clientX: mouseX, clientY: mouseY } = e;
  const { cameraX, cameraY, zoomFactor } = getCamera();

  const worldX = mouseX + cameraX;
  const worldY = mouseY + cameraY;

  const mousePos = { mouseX, mouseY };
  const worldPos = { worldX, worldY };

  // Check if the right-click is on any user, if so, don't emit right click event
  const playerWidth = 64 * zoomFactor;
  const playerHeight = 64 * zoomFactor;

  const collision = getUserCollision(
    users,
    myPlayerId,
    worldX,
    worldY,
    playerWidth,
    playerHeight
  );

  if (!collision) {
    emitter.emit("rightClick", { mousePos, worldPos });
  }
  e.preventDefault();
}

export function rightClickEventListener(
  canvas: HTMLCanvasElement,
  getCamera: () => { cameraX: number; cameraY: number; zoomFactor: number },
  users: User[],
  myPlayerId: string
): void {
  canvas.addEventListener("contextmenu", (e) =>
    handleRightClick(e, getCamera, users, myPlayerId)
  );
}

// Override zoom and ctrl+scroll
function handleWheelEvent(e: WheelEvent, zoomFactor: number): void {
  if (e.ctrlKey) {
    e.preventDefault();
    const zoomSpeed = 0.1;
    zoomFactor += e.deltaY < 0 ? zoomSpeed : -zoomSpeed;
    zoomFactor = Math.min(Math.max(zoomFactor, 0.1), 5);

    console.log(zoomFactor);
  }
}
export function wheelEventListener(
  canvas: HTMLCanvasElement,
  getCamera: () => { cameraX: number; cameraY: number; zoomFactor: number }
): void {
  canvas.addEventListener("wheel", (e) => handleWheelEvent(e, getCamera().zoomFactor));
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
