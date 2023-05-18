type CharacterAnimation = {
  [key: string]: number[][];
};

export const characterAnimations: CharacterAnimation = {
  "walk-down": [
    [0, 16],
    [0, 32],
    [0, 48],
    [0, 64],
  ],
  "walk-up": [
    [16, 16],
    [16, 32],
    [16, 48],
    [16, 64],
  ],
  "walk-left": [
    [32, 16],
    [32, 32],
    [32, 48],
    [32, 64],
  ],
  "walk-right": [
    [48, 16],
    [48, 32],
    [48, 48],
    [48, 64],
  ],
};

let animationSpeed = 6.5;

function updateAnimationFrameIfMoving(
  animationState: string,
  animationFrame: number,
  animationTick: number
): [number, number] {
  animationTick++;

  if (animationTick >= animationSpeed) {
    animationFrame++;
    if (animationFrame >= characterAnimations[animationState].length - 1) {
      animationFrame = 0;
    }
    animationTick = 0;
  }

  return [animationFrame, animationTick];
}

export function updateAnimationFrame(
  pressedKeys: { [key: string]: boolean },
  animationState: string,
  animationFrame: number,
  animationTick: number
): [number, number] {
  const isMoving = pressedKeys.w || pressedKeys.a || pressedKeys.s || pressedKeys.d;

  if (isMoving) {
    return updateAnimationFrameIfMoving(animationState, animationFrame, animationTick);
  } else {
    // When the player is not moving, show the first frame of the animation(idle)
    return [1, animationTick];
  }
}
