<script setup lang="ts">
import {getQuestDifficulty} from '../service/game';
import {QuestModel} from "../models/models";

const props = defineProps<{
  quest: QuestModel;
  onSolveClick: (quest: QuestModel) => void;
  loading: boolean;
}>();

const questClass = () => {
  const difficulty = getQuestDifficulty(props.quest);
  return {
    quest__easy: difficulty === 'easy',
    quest__medium: difficulty === 'medium',
    quest__hard: difficulty === 'hard'
  };
};
</script>

<template>
  <div class="quest" :class="questClass()">
    <span class="solve-and-message">
    <button class="quest__solve"
            @click="onSolveClick(quest)"
            :disabled="loading">
      <img v-if="!loading" class="quest__solve__icon" src="@/assets/swords.png" alt="solve">
      <span v-if="loading" class="loader"></span>
    </button>
    <div class="quest__description">
      <p class="quest__message">{{ quest.message }}</p>
    </div>
    </span>
    <div class="quest__details">
      <div class="quest__details__row">
        <img src="@/assets/gold.png" alt="reward">
        {{ quest.reward }}
      </div>
      <div class="quest__details__row">
        <img src="@/assets/logo.png" alt="probability">
        {{ quest.probability }}
      </div>
      <div class="quest__details__row">
        <img src="@/assets/calendar.png" alt="expires in">
        {{ quest.expiresIn }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.quest {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  z-index: 0;
  min-width: 24rem;
  max-width: 32rem;
  width: 100%;
  height: 12rem;
  padding: 0.25rem;
  gap: 1.5rem;
  background: rgb(37, 63, 80);
  background: linear-gradient(0deg, rgba(37, 63, 80, 0.7) 0%, rgba(255, 255, 255, 0) 100%);
  border-bottom: 1px solid white;
  font-weight: 500;
  font-size: 1rem;
}


.solve-and-message {
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.quest__easy {
  background: rgb(9, 170, 3);
  background: linear-gradient(0deg, rgba(9, 170, 3, 0.7) 0%, rgba(255, 255, 255, 0) 100%);
}

.quest__medium {
  background: rgb(170, 167, 3);
  background: linear-gradient(0deg, rgba(170, 167, 3, 0.7) 0%, rgba(255, 255, 255, 0) 100%);
}

.quest__hard {
  background: rgb(170, 3, 3);
  background: linear-gradient(0deg, rgba(170, 3, 3, 0.7) 0%, rgba(255, 255, 255, 0) 100%);
}

.quest__solve {
  position: absolute;
  margin-left: 1rem;
  margin-top: 1rem;
  border: 1px solid white;
  color: white;
  border-radius: 0.25rem;
  width: 64px;
  height: 64px;
  background-color: rgba(0, 0, 0, 0.87);
  transition: background-color 0.2s ease;
}

.quest__solve.loading {
  background: linear-gradient(-45deg, rgba(193, 255, 109, 0.6), rgba(255, 255, 255, 0.6), rgb(103, 151, 255, 0.6), rgba(72, 250, 177, 0.6));
  background-size: 800% 800%;
  animation: gradient 8s ease infinite;
}

.quest__solve:hover {
  background-color: rgba(0, 108, 31, 0.87);
}

.quest__solve__icon {
  width: 48px;
  height: 48px;
}


.quest__description {
  max-width: 80%;
  height: 6rem;
  margin-left: auto;
  margin-top: 0.5rem;
  padding: 0 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quest__message {
  text-align: right;
  overflow: hidden;
  overflow-wrap: anywhere;
  text-overflow: ellipsis;
  margin-left: auto;
}

.quest__details {
  display: flex;
  justify-content: space-between;
  text-align: right;
  width: 20rem;
  flex-wrap: wrap;
  font-weight: bold;
}

.quest__details__row {
  display: flex;
  flex-direction: column;
  margin-left: 1.5rem;
  gap: 0.5rem;
  align-items: center;
}

.quest__details img {
  max-width: 32px;
}
</style>
