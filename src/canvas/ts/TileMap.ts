import { emitter } from "@/composables/useEmit";
import type { User } from "@/types/general";

export function createCanvasApp(
  // Data from Space.vue
  users: User[],
  myPlayerId: string,
  speed: number,
  canvas: HTMLCanvasElement,
  canvasFrameRate: number,
  spaceMap: string,
  myCharacterSprite: string
) {
  const ctx = canvas.getContext("2d")!;

  // Draw background image
  console.log("spaceMap: ", spaceMap);

  const worldImg = new Image();
  worldImg.src = spaceMap;

  let cameraX = 0;
  let cameraY = 0;

  // Get my player(the current user)
  let myPlayer = {
    userName: "",
    x: 0,
    y: 0,
  };

  // Keyboard inputs
  const inputs = {
    w: false,
    a: false,
    s: false,
    d: false,
  };
  let lastKey = "";

  // Character images
  const characterImg = new Image();
  characterImg.src = myCharacterSprite;
  const characterImgMyPlayer = new Image();
  characterImgMyPlayer.src = myCharacterSprite;

  // 72x96 sprite sheet(3 rows, 4 columns)
  const characterAnimations = {
    "walk-down": [
      [0, 0],
      [24, 0],
      [48, 0],
      [72, 0],
    ],
    "walk-left": [
      [0, 24],
      [24, 24],
      [48, 24],
      [72, 24],
    ],
    "walk-right": [
      [0, 48],

      [24, 48],
      [48, 48],
      [72, 48],
    ],
    "walk-up": [
      [0, 72],
      [24, 72],
      [48, 72],

      [72, 72],
    ],
  } as const;

  // Fps related
  let lastTime = performance.now();
  let fps = 0;

  // Animation loop
  const animate = () => {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get my player
    myPlayer = users.find((user) => user.id === myPlayerId)!;
    // Center camera on player
    cameraX = myPlayer.x - canvas.width / 2;
    cameraY = myPlayer.y - canvas.height / 2;

    // Draw background so it covers all canvas and moves with camera
    ctx.drawImage(
      worldImg,
      0,
      0,
      worldImg.width,
      worldImg.height,
      -cameraX - worldImg.height / 3.1,
      -cameraY - worldImg.width / 3.6,
      worldImg.width,
      worldImg.height
    );

    // Move my player
    if (inputs.w) {
      myPlayer.y -= speed;
    }
    if (inputs.a) {
      myPlayer.x -= speed;
    }
    if (inputs.s) {
      myPlayer.y += speed;
    }
    if (inputs.d) {
      myPlayer.x += speed;
    }

    ctx.drawImage(
      characterImgMyPlayer,
      0,
      0,
      24,
      24,
      myPlayer.x - cameraX - 8,
      myPlayer.y - cameraY - 8,
      64,
      64
    );

    // Draw my player name and center the text based on the length of the name
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    const userNameTextWidth = ctx.measureText(myPlayer.userName).width;
    ctx.fillText(
      myPlayer.userName,
      myPlayer.x - cameraX - userNameTextWidth / 2,
      myPlayer.y - cameraY - characterImg.height / 8 - 20
    );

    // Calculate elapsed time since last frame
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // Update frame count and FPS value
    fps = Math.round(1000 / deltaTime);

    // Draw FPS value
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.fillText(`FPS: ${fps}`, 10, 20);
  };

  // Start drawing after users array is populated
  if (users.length > 0 && myPlayerId !== "" && speed !== 0 && spaceMap !== "") {
    setInterval(animate, 1000 / canvasFrameRate);
  } else {
    // Check if users array is empty
    const checkUsers = setInterval(() => {
      if (users.length > 0) {
        setInterval(animate, 1000 / canvasFrameRate);
        clearInterval(checkUsers);

        // Emit canvas loaded event
        emitter.emit("canvasLoaded");
      }
    }, 0);
  }

  /******************
   * Mouse events *
   ******************/
  // Listen to double click
  /*   canvas.addEventListener("dblclick", (e: MouseEvent) => {
    const x = e.clientX + cameraX - 8;
    const y = e.clientY + cameraY - 25;

    // Emit double click event
    emitter.emit("doubleClick", { x, y });

    myPlayer.x = x;
    myPlayer.y = y;
  }); */

  // Listen to right click
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

    // Emit right click event
    emitter.emit("rightClick", { mousePos, worldPos });

    e.preventDefault();
  });

  // Get right click move position confirmation
  emitter.on("rightClickPlayerMoveConfirmed", async (user) => {
    myPlayer.x = user.x;
    myPlayer.y = user.y;
  });

  /******************
   * Keyboard inputs *
   ******************/

  canvas.addEventListener("keydown", (e: KeyboardEvent) => {
    // Listen to both lower and upper case
    switch (e.key.toLowerCase()) {
      case "w":
        inputs.w = true;
        lastKey = "w";
        break;
      case "a":
        inputs.a = true;
        lastKey = "a";
        break;
      case "s":
        inputs.s = true;
        lastKey = "s";
        break;
      case "d":
        inputs.d = true;
        lastKey = "d";
        break;
    }

    // Only emit if key is w,a,s,d or W,A,S,D and after user has stopped moving
    const validKeys = ["w", "a", "s", "d"];

    // FIXME: Decide if we need to emit player move event on keydown. This will eat a lot of bandwidth
    // Send player move event. This will show other players that I am moving and to you other players will look like they are moving
    /*   if (validKeys.includes(e.key.toLocaleLowerCase())) {
      // Emit player move event
      emitter.emit("playerMove", myPlayer);
    } */
  });

  canvas.addEventListener("keyup", (e: KeyboardEvent) => {
    switch (e.key.toLowerCase()) {
      case "w":
        inputs.w = false;
        break;
      case "a":
        inputs.a = false;
        break;
      case "s":
        inputs.s = false;
        break;
      case "d":
        inputs.d = false;
        break;
    }

    // Only emit if key is w,a,s,d or W,A,S,D and after user has stopped moving
    const validKeys = ["w", "a", "s", "d"];

    if (validKeys.includes(e.key.toLocaleLowerCase())) {
      // Emit player move event
      emitter.emit("playerMove", myPlayer);
    }
  });
}
