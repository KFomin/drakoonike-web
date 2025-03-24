<script lang="ts" setup>

interface GameEndData {
  score: number;
  level: number;
  turn: number;
  gold: number;
}

const props = defineProps<{
  startGame: () => void;
  gameEndData?: GameEndData;
}>();

</script>

<template>
  <div class="greetings">
    <template v-if="props.gameEndData">
      <h1>This is the end.</h1>
      <p>
        Your journey as a dragon tamer has come to an end,
        A path of trials and victories, where legends blend.
        Though you fought battles and the sky burned with fire,
        Your name remains, a spark of hope for many.

        In the kingdom's tales, your story will live on,
        Echoed in the voices of those you inspired.
        Though it's time to rest and say goodbye,
        Your legacy will endure, rising high in the sky.
      </p>
      <div class="final-result">
        <div class="final-result__item">
          <img src="@/assets/score.png" alt="score">
          <p>{{ props.gameEndData.score }}</p>
        </div>
        <div class="final-result__item">
          <img src="@/assets/level.png" alt="level">
          <p>{{ props.gameEndData.level }}</p>
        </div>
        <div class="final-result__item">
          <img src="@/assets/calendar.png" alt="turn">
          <p>{{ props.gameEndData.turn }}</p>
        </div>
        <div class="final-result__item">
          <img src="@/assets/gold.png" alt="gold">
          <p>{{ props.gameEndData.gold }}</p>
        </div>
      </div>
    </template>
    <template v-else>
      <h1>Greetings, dragon tamer!</h1>
      <p>
        This is the very beginning of your journey!
        To become successful and famous, you will need to work a little.
        The city tavern always has a fresh list of tasks, the completion of which is generously paid by the inhabitants
        of
        our kingdom or the kingdom itself.
        Not all of them look like work for a real dragon tamer, but we all once started with something like this.
        The main thing is to remain an honest person and live this life with inner harmony.
        So, are you ready to begin the adventure?
      </p>
    </template>

    <button class="start" v-on:click="props.startGame">
      start
    </button>
  </div>
</template>

<style scoped>
.final-result {
  display: flex;
  flex-direction: column;
}

.final-result__item {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
}

.final-result__item img {
  width: 32px;
  height: 32px;
}

h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
}

p, .start {
  font-size: 1.2rem;
  font-weight: 400;
}

.start {
  padding: 0.5rem 1.5rem;
  color: white;
  border-radius: 0.25rem;
  border: none;
  background-color: rgba(14, 128, 2, 0.92);
}

.greetings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  place-items: center;
  text-align: center;
}


</style>
