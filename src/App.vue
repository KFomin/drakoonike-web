<script lang="ts" setup>
import {onBeforeMount, reactive} from 'vue';
import StartTheGame from './components/StartTheGame.vue';
import {GET_QUEST_BOARD, POST_START_GAME} from './resource/api.js';
import Game from "./components/Game.vue";
import {getLocalStorageGameData} from "./service/utils.ts";
import {GameData, GameEndData} from 'models/models.js'


interface AppState {
  gameData: GameData;
  gameEndData: GameEndData;
  loading: boolean;
}

const state: AppState = reactive({
  gameData: null,
  gameEndData: null,
  loading: true,
});

const onGameStartClicked = async () => {
  state.loading = true;
  try {
    POST_START_GAME().then((gameData) => {
      state.gameData = gameData;
      state.loading = false;
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
      const localStorageGameData = storedGameData;

      //check if game session still alive.
      //successfully gettings quest means that game session with our gameId exists.
      GET_QUEST_BOARD(localStorageGameData.gameId).then((quests) => {
        if (quests[0]) {
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
      <StartTheGame v-if="!state.gameData || state.gameEndData"
                    :start-game="onGameStartClicked"
                    :game-end-data="state.gameEndData"/>
      <Game v-if="state.gameData && !state.gameEndData"
            :game-data="state.gameData"
            :on-game-end="onGameEnd"/>
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
  margin-top: 10%;
}


@media (max-width: 900px) {
  .loader {
    margin-top: 30%;
  }
}

</style>
