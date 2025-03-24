<script setup>
import {onBeforeMount, reactive} from 'vue';
import StartTheGame from './components/StartTheGame.vue';
import {GET_QUEST_BOARD, POST_START_GAME} from '@/resource/api.js';
import {GameStartResponse, QuestModel} from '@/models/models.js';
import Game from "@/components/Game.vue";
import {getLocalStorageGameData} from "@/service/utils.js";

const state = reactive({
  gameData: null,
  gameEndData: null,
  loading: true,
});

const onGameStartClicked = async () => {
  try {
    POST_START_GAME().then((gameDataResponse) => {
      state.gameData = new GameStartResponse(
          gameDataResponse.gameId,
          gameDataResponse.lives,
          gameDataResponse.gold,
          gameDataResponse.score,
          gameDataResponse.level,
          gameDataResponse.turn,
      );
      state.gameEndData = null;
    });
  } catch (error) {
    console.error("Error: ", error);
  }
};

const onGameEnd = (endGameData) => {
  state.gameEndData = {
    score: endGameData.score,
    level: endGameData.level,
    gold: endGameData.gold,
    turn: endGameData.turn,
  };
};

onBeforeMount(async () => {
  const storedGameData = getLocalStorageGameData();
  if (storedGameData) {
    try {
      const localStorageGameData = new GameStartResponse(
          storedGameData.gameId,
          storedGameData.lives,
          storedGameData.gold,
          storedGameData.score,
          storedGameData.level,
          storedGameData.turn,
      );

      //check if game session still alive.
      GET_QUEST_BOARD(localStorageGameData.gameId).then((res) => {
        const quest = new QuestModel(
            res[0].adId,
            res[0].message,
            res[0].reward,
            res[0].expiresIn,
            res[0].probability,
            res[0].encrypted
        );

        //successfully gettings quest means that game session with our gameId exists.
        if (quest) {
          state.gameData = localStorageGameData;
        }
      });

    } catch (error) {
      console.error("Failed to set up game from localStorage", error);
    } finally {
      state.loading = false;
    }
  }
  state.loading = false;
});
</script>

<template>
  <div class="wrapper">
    <div v-if="state.loading" class="loader"></div>
    <template v-if="!state.loading">
      <StartTheGame v-if="!state.gameData || state.gameEndData" :start-game="onGameStartClicked"
                    :game-end-data="state.gameEndData"/>
      <Game v-if="state.gameData && !state.gameEndData" :game-data="state.gameData" :on-game-end="onGameEnd"/>
    </template>
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
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
