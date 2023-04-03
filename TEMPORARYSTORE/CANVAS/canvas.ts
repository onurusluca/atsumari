import { emitter } from "@/composables/useEmit";
import canvasImage from "../images/world-image.png";

import type { User } from "@/types/general";

// Character images
import characterImageDown from "../images/char-down.png";
import characterImageLeft from "../images/char-left.png";
import characterImageRight from "../images/char-right.png";
import characterImageUp from "../images/char-up.png";

export function createCanvasApp(
  // Data from Space.vue
  users: User[],
  myPlayerId: string,
  speed: number,
  canvas: HTMLCanvasElement,
  canvasFrameRate: number
) {
  const ctx = canvas.getContext("2d")!;

  // Draw background image
  const worldImg = new Image();
  worldImg.src = canvasImage;

  let cameraX = 0;
  let cameraY = 0;

  // Fps related
  let lastTime = performance.now();
  let fps = 0;

  // Get my player(the current user)
  let myPlayer = {
    userName: "",
    x: 0,
    y: 0,
    facingTo: "down",
    isMoving: false,
  };

  // Keyboard inputs
  const inputs = {
    w: false,
    a: false,
    s: false,
    d: false,
  };
  let lastKey = "";

  const characterImgUp = new Image();
  characterImgUp.src = characterImageUp;
  const characterImgDown = new Image();
  characterImgDown.src = characterImageDown;
  const characterImgLeft = new Image();
  characterImgLeft.src = characterImageLeft;
  const characterImgRight = new Image();
  characterImgRight.src = characterImageRight;

  let characterImg = characterImgDown;
  let characterImgMyPlayer = characterImgDown;

  // Change character images based on keyboard inputs

  let frameX = 0;
  let maxFrame = 3;
  let elapsed = 0;

  // Animate canvass
  const animate = () => {
    // Request next frame
    setTimeout(() => {
      requestAnimationFrame(animate);
    }, canvasFrameRate);

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

    // Draw and animate other players except my player
    users.forEach((user) => {
      if (user.id === myPlayerId) return;

      // Prevent the players from colliding with each other:
      if (myPlayer.x + 20 > user.x - 20 && myPlayer.x - 20 < user.x + 20) {
        if (myPlayer.y + 20 > user.y - 20 && myPlayer.y - 20 < user.y + 20) {
          // If collision detected, don't move the player
          switch (lastKey) {
            case "w":
              myPlayer.y += speed;
              break;
            case "a":
              myPlayer.x += speed;
              break;
            case "s":
              myPlayer.y -= speed;
              break;
            case "d":
              myPlayer.x -= speed;
              break;
            default:
              break;
          }
        }
      }

      if (user.isMoving) {
        elapsed += 1;
        if (elapsed > 3) {
          elapsed = 0;
          if (frameX < maxFrame) frameX++;
          else frameX = 0;
        }
      } else {
        frameX = 0;
      }

      let img;
      switch (user.facingTo) {
        case "up":
          img = characterImgUp;
          break;
        case "down":
          img = characterImgDown;
          break;
        case "left":
          img = characterImgLeft;
          break;
        case "right":
          img = characterImgRight;
          break;
        default:
          img = characterImgDown;
      }

      ctx.drawImage(
        img,
        (frameX * characterImg.width) / 4,
        0,
        characterImg.width / 4,
        characterImg.height,
        user.x - cameraX - characterImg.width / 8,
        user.y - cameraY - characterImg.height / 8,
        characterImg.width / 4,
        characterImg.height
      );

      // Draw player name
      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      const userNameTextWidth = ctx.measureText(myPlayer.userName).width;
      ctx.fillText(
        user.userName,
        user.x - cameraX - userNameTextWidth / 2,
        user.y - cameraY - characterImg.height / 8 - 20
      );
    });

    // Animate my player
    if (myPlayer.isMoving) {
      elapsed += 1;
      if (elapsed > 3) {
        elapsed = 0;
        if (frameX < maxFrame) frameX++;
        else frameX = 0;
      }
    } else {
      frameX = 0;
    }

    // Draw my player
    ctx.drawImage(
      characterImgMyPlayer,
      (frameX * characterImgMyPlayer.width) / 4,
      0,
      characterImg.width / 4,
      characterImg.height,
      myPlayer.x - cameraX - characterImg.width / 8,
      myPlayer.y - cameraY - characterImg.height / 8,
      characterImg.width / 4,
      characterImg.height
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

    // Move my player
    if (inputs.w) {
      myPlayer.y -= speed;
      characterImgMyPlayer = characterImgUp;
      myPlayer.facingTo = "up";
    }
    if (inputs.a) {
      myPlayer.x -= speed;
      characterImgMyPlayer = characterImgLeft;
      myPlayer.facingTo = "left";
    }
    if (inputs.s) {
      myPlayer.y += speed;
      characterImgMyPlayer = characterImgDown;
      myPlayer.facingTo = "down";
    }
    if (inputs.d) {
      myPlayer.x += speed;
      characterImgMyPlayer = characterImgRight;
      myPlayer.facingTo = "right";
      ("right");
    }

    if (inputs.w || inputs.a || inputs.s || inputs.d) {
      myPlayer.isMoving = true;
    } else {
      myPlayer.isMoving = false;
    }
  };

  // Start drawing after users array is populated
  if (users.length > 0 && myPlayerId !== "" && speed !== 0 && canvasImage !== "") {
    animate();
  } else {
    // Check if users array is empty
    const checkUsers = setInterval(() => {
      if (users.length > 0) {
        animate();
        clearInterval(checkUsers);

        // Emit canvas loaded event
        emitter.emit("canvasLoaded");
      }
    }, 1000);
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
      myPlayer.isMoving = false;
      emitter.emit("playerMove", myPlayer);
    }
  });
}
