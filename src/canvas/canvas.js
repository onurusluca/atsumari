export async function createCanvasApp(
  myPlayerId,
  users,
  canvas,
  canvasImage,
  characterImage
) {
  // Check for canvas support
  if (!canvas.getContext) {
    throw new Error("Canvas not supported");
  }

  const ctx = canvas.getContext("2d");

  // Set width and height of canvas
  canvas.width = 1024;
  canvas.height = 768;

  const worldImg = new Image();
  worldImg.onerror = handleImageError;
  worldImg.src = canvasImage;

  const characterImg = new Image();
  characterImg.onerror = handleImageError;
  characterImg.src = characterImage;

  function handleImageError(event) {
    console.error(`Error loading image: ${event.target.src}`);
  }

  function animate() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let myPlayer = null;

    myPlayer = users.find((user) => user.id === myPlayerId);

    // Center camera on player
    let cameraX = 0;
    let cameraY = 0;

    if (myPlayer) {
      cameraX = Math.round(myPlayer.x - canvas.width / 2);
      cameraY = Math.round(myPlayer.y - canvas.height / 2);
    }

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

    // Draw users on center
    users.forEach((user) => {
      // Draw character
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

    // Request next frame
    requestAnimationFrame(animate);
  }

  animate();
}
