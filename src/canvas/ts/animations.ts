type CharacterAnimation = {
  [key: string]: number[][];
};

export const characterAnimations: CharacterAnimation = {
  "walk-down": [
    [0, 0],
    [24, 1],
    [48, 0],
  ],
  "walk-left": [
    [0, 24],
    [24, 25],
    [48, 24],
  ],
  "walk-right": [
    [0, 48],
    [24, 49],
    [48, 48],
  ],
  "walk-up": [
    [0, 72],
    [24, 73],
    [48, 72],
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
