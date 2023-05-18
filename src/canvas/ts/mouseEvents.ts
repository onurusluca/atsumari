import type { User } from "@/types/general";
import type { Camera } from "@/types/canvasTypes";
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
  camera: Camera,
  users: User[],
  myPlayerId: string
): void {
  const { clientX: mouseX, clientY: mouseY } = e;

  const worldX = mouseX / camera.zoomFactor + camera.cameraX;
  const worldY = mouseY / camera.zoomFactor + camera.cameraY;

  const mousePos = { mouseX, mouseY };
  const worldPos = { worldX, worldY };

  const playerWidth = (18 * camera.zoomFactor) / 3;
  const playerHeight = (22 * camera.zoomFactor) / 3;

  // Check if the right-click is on any user, if so, don't emit right click event
  const collision = getUserCollision(
    users,
    myPlayerId,
    worldX,
    worldY,
    playerWidth,
    playerHeight
  );

  if (!collision) {
    // Emit right click event to Space.vue
    emitter.emit("rightClick", { mousePos, worldPos });
  }
  e.preventDefault();
}

export function rightClickEventListener(
  canvas: HTMLCanvasElement,
  camera: Camera,
  users: User[],
  myPlayerId: string
): void {
  canvas.addEventListener("contextmenu", (e) =>
    handleRightClick(e, camera, users, myPlayerId)
  );
}

// Override zoom and ctrl+scroll
function handleWheelEvent(
  e: WheelEvent,
  camera: { cameraX: number; cameraY: number; zoomFactor: number }
): void {
  if (e.ctrlKey) {
    e.preventDefault();
    const zoomSpeed = 0.1;
    const zoomIncrement = e.deltaY < 0 ? +zoomSpeed : -zoomSpeed;
    // Limit zoom to 2 - 5
    camera.zoomFactor = clampZoom(camera.zoomFactor + zoomIncrement, 2, 5);

    console.log(camera.zoomFactor);
    // Save zoom factor to localStorage
    localStorage.setItem("zoomFactor", camera.zoomFactor.toString());
  }
}

export function wheelEventListener(
  canvas: HTMLCanvasElement,
  camera: { cameraX: number; cameraY: number; zoomFactor: number }
): void {
  canvas.addEventListener("wheel", (e) => handleWheelEvent(e, camera));
}

// For limiting zoom
function clampZoom(zoomFactor: number, minZoom: number, maxZoom: number): number {
  return Math.min(Math.max(zoomFactor, minZoom), maxZoom);
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
