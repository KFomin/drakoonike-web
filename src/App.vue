<script setup>
import {onBeforeMount, onMounted, ref} from 'vue';
import StartTheGame from './components/StartTheGame.vue';
import {GET_QUEST_BOARD, POST_START_GAME,} from '@/resource/api.js';
import {GameStartResponse, QuestModel} from '@/models/models.js';
import Game from "@/components/Game.vue";
import {getLocalStorageGameData} from "@/service/utils.js"

const gameData = ref(null);
const gameEndData = ref(null);
const loading = ref(true);

const startGame = async () => {
  try {
    const gameDataResponse = await POST_START_GAME();
    gameData.value = new GameStartResponse(
        gameDataResponse.gameId,
        gameDataResponse.lives,
        gameDataResponse.gold,
        gameDataResponse.score,
        gameDataResponse.level,
        gameDataResponse.turn,
    )
    gameEndData.value = null;
  } catch (error) {
    console.error("Error : ", error);
  }
};

const onGameEnd = (endGameData) => {
  gameEndData.value = {
    score: endGameData.score,
    level: endGameData.level,
    gold: endGameData.gold,
    turn: endGameData.turn
  };
}

onBeforeMount(() => {
  const storedGameData = getLocalStorageGameData();
  if (storedGameData) {
    try {
      let localStorageGameData = new GameStartResponse(
          storedGameData.gameId,
          storedGameData.lives,
          storedGameData.gold,
          storedGameData.score,
          storedGameData.level,
          storedGameData.turn,
      );

      GET_QUEST_BOARD(localStorageGameData.gameId).then((res) => {
        let quest = new QuestModel(
            res.adId,
            res.message,
            res.reward,
            res.expiresIn,
            res.probability,
            res.encrypted
        );
        if (!quest) {
          loading.value = false;
          return;
        }
        gameData.value = localStorageGameData;
        loading.value = false;
      });
    } catch (error) {
      console.log("Failed to set up game from localStorage", error);
    }
  }

  loading.value = false;
});

</script>

<template>
  <div class="wrapper">
    <div v-if="loading" class="loader"></div>
    <template v-if="!loading">
      <StartTheGame v-if="!gameData || gameEndData" :start-game="startGame" :game-end-data="gameEndData"/>
      <Game v-if="gameData && !gameEndData" :game-data="gameData" :on-game-end="onGameEnd"/>
    </template>
  </div>
</template>

<style scoped>

.wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  place-items: center;
  width: 100%;
}

.loader {
  width: 32px;
  height: 32px;
  border: 5px solid #FFF;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
