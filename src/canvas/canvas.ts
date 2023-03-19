import { emitter } from "@/composables/useEmit";

interface User {
  id: string;
  x: number;
  y: number;
}

export function createCanvasApp(
  myPlayerId: string,
  users: User[],
  canvas: HTMLCanvasElement,
  canvasImage: string,
  characterImage: string
) {
  const ctx = canvas.getContext("2d")!;

  const worldImg = new Image();
  worldImg.src = canvasImage;

  const characterImg = new Image();
  characterImg.src = characterImage;

  let cameraX = 0;
  let cameraY = 0;

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const myPlayer = users.find((user) => user.id === myPlayerId);

    if (myPlayer) {
      cameraX = parseInt(myPlayer.x - canvas.width / 2);
      cameraY = parseInt(myPlayer.y - canvas.height / 2);
    }

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

    users.forEach((user) => {
      ctx.drawImage(
        characterImg,
        0,
        0,
        characterImg.width / 4,
        characterImg.height,
        user.x - cameraX - characterImg.width / 8,
        user.y - cameraY - characterImg.height / 8,
        characterImg.width / 4,
        characterImg.height
      );
    });

    requestAnimationFrame(animate);
  };

  animate();

  canvas.addEventListener("dblclick", (e: MouseEvent) => {
    const x = e.clientX + cameraX - 8;
    const y = e.clientY + cameraY - 25;

    emitter.emit("doubleClick", { x, y });
  });

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

    emitter.emit("rightClick", { mousePos, worldPos });

    e.preventDefault();
  });

  const inputs = {
    w: false,
    a: false,
    s: false,
    d: false,
  };

  let lastKey = "";

  window.addEventListener("keydown", (e: KeyboardEvent) => {
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

    emitter.emit("playerMove", inputs);
  });

  window.addEventListener("keyup", (e: KeyboardEvent) => {
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
    emitter.emit("playerMove", inputs);
  });
}
