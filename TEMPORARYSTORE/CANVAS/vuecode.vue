<template>
  <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Game, Character } from '@/models'

const WorldImage = '' // replace with the path to your world image

@Component
export default class GameCanvas extends Vue {
  @Prop(Number) readonly canvasWidth!: number
  @Prop(Number) readonly canvasHeight!: number
  @Prop(Array) readonly users!: any[]

  private game!: Game

  mounted() {
    const canvas = this.$refs.canvas as HTMLCanvasElement

    const characters = this.users.map((user) => new Character(user.x, user.y))
    this.game = new Game(
      canvas,
      this.canvasWidth,
      this.canvasHeight,
      WorldImage,
      characters
    )
  }

  beforeDestroy() {
    this.game.stop()
  }
}
</script>
