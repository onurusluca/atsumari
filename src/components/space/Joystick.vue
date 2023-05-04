<script setup lang="ts">
import { emitter } from "@/composables/useEmit";

const positionX = ref(0);
const positionY = ref(0);
const initialTouchX = ref(0);
const initialTouchY = ref(0);

const handleTouchStart = (event: TouchEvent) => {
  event.preventDefault();
  const touch = event.touches[0];
  initialTouchX.value = touch.clientX;
  initialTouchY.value = touch.clientY;
};

const handleTouchMove = (event: TouchEvent) => {
  event.preventDefault();
  const touch = event.touches[0];
  const deltaX = touch.clientX - initialTouchX.value;
  const deltaY = touch.clientY - initialTouchY.value;

  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const maxRadius = 50;

  if (distance <= maxRadius) {
    positionX.value = deltaX;
    positionY.value = deltaY;
  } else {
    positionX.value = (deltaX / distance) * maxRadius;
    positionY.value = (deltaY / distance) * maxRadius;
  }

  let direction = "";

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    direction = deltaX > 0 ? "right" : "left";
  } else {
    direction = deltaY > 0 ? "down" : "up";
  }

  if (direction !== "") {
    emitter.emit("joystickMove", direction);
  }
};
const handleTouchEnd = (event: TouchEvent) => {
  event.preventDefault();
  positionX.value = 0;
  positionY.value = 0;

  emitter.emit("joystickMove", "none");
};
</script>

<template>
  <div
    class="joystick-container"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <div
      class="joystick-container__joystick"
      :style="{ top: positionY + 'px', left: positionX + 'px' }"
    ></div>
  </div>
</template>

<style scoped lang="scss">
.joystick-container {
  display: none;
  position: fixed;
  bottom: 10rem;
  left: 43%;
  transform: translateX(-50%);

  background-color: #f5f5f5;

  .joystick-container__joystick {
    position: absolute;
    width: 3rem;
    height: 3rem;
    background-color: #333;
    border-radius: 50%;
  }
  @include s-576 {
    display: block;
  }
}
</style>
