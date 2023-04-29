type CharacterAnimation = {
  [key: string]: number[][];
};

export const characterAnimations: CharacterAnimation = {
  "walk-down": [
    [16, 16],
    [64, 16],
    [112, 16],
    [160, 16],
  ],
  "walk-up": [
    [16, 64],
    [64, 64],
    [112, 64],
    [160, 64],
  ],
  "walk-left": [
    [16, 112],
    [64, 112],
    [112, 112],
    [160, 112],
  ],
  "walk-right": [
    [16, 160],
    [64, 160],
    [112, 160],
    [160, 160],
  ],
};

function updateAnimationFrameIfMoving(
  animationState: string,
  animationFrame: number,
  animationTick: number
): [number, number] {
  animationTick++;

  if (animationTick >= 7) {
    animationFrame++;
    if (animationFrame >= characterAnimations[animationState].length) {
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
    return [1, animationTick];
  }
}
