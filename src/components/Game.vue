<script setup>
import {reactive, onMounted} from 'vue';
import {
  GET_QUEST_BOARD,
  GET_SHOP_ITEMS,
  POST_BUY_AN_ITEM,
  POST_SOLVE_THE_QUEST
} from '@/resource/api.js';
import {QuestModel, ShopItem} from "@/models/models.js";
import {sortByQuestDifficultyAndReward, suggestAnItemToBuy} from "@/service/game.js";
import Quest from "@/components/Quest.vue";
import {
  decode,
  decodeROT13,
  deleteLocalStorageGameData,
  setLocalStorageGameData
} from "@/service/utils.js";

const props = defineProps({
  gameData: {
    type: Object,
    required: true,
  },
  onGameEnd: {
    type: Function,
    required: true,
  }
});

const state = reactive({
  game: {
    gameId: props.gameData.gameId,
    lives: props.gameData.lives,
    level: props.gameData.level,
    gold: props.gameData.gold,
    score: props.gameData.score,
    turn: props.gameData.turn
  },
  questBoard: [],
  shopItems: [],
  suggestedQuest: null,
  suggestedShopItem: '',
  loadingQuests: true,
  listView: 'quests',
});

const toggleListView = (view) => {
  state.listView = view;
};

const fetchQuests = async () => {
  try {
    state.loadingQuests = true;
    const questBoardResponse = await GET_QUEST_BOARD(props.gameData.gameId);
    const quests = questBoardResponse.map(item => new QuestModel(
        item.adId,
        item.message,
        item.reward,
        item.expiresIn,
        item.probability,
        item.encrypted
    ));

    quests.forEach((quest) => {
      if (quest.encrypted === 1) {
        quest.adId = decode(quest.adId);
        quest.message = decode(quest.message);
        quest.probability = decode(quest.probability);
      } else if (quest.encrypted === 2) {
        quest.adId = decodeROT13(quest.adId);
        quest.message = decodeROT13(quest.message);
        quest.probability = decodeROT13(quest.probability);
      }
    });

    state.questBoard = sortByQuestDifficultyAndReward(quests);
    console.log(state.questBoard);
    state.suggestedQuest = state.questBoard[0];
    console.log(state.questBoard);
  } catch (error) {
    console.error(error);
  } finally {
    state.loadingQuests = false;
  }
};

const fetchShopItems = async () => {
  try {
    const shopDataResponse = await GET_SHOP_ITEMS(props.gameData.gameId);
    state.shopItems = shopDataResponse.map(item => new ShopItem(
        item.id,
        item.name,
        item.cost
    ));
  } catch (error) {
    console.error(error);
  }
};

const canBuyThisItem = (itemId) => {
  const itemToBuy = state.shopItems.find(item => item.id === itemId);
  return itemToBuy ? itemToBuy.cost < state.game.gold : false;
};

const onSolveClick = async (quest) => {
  try {
    state.loadingQuests = true;
    const solveQuestResponse = await POST_SOLVE_THE_QUEST(props.gameData.gameId, quest.adId);

    if (solveQuestResponse.message.toLowerCase().includes('defeated')) {
      props.onGameEnd({
        score: solveQuestResponse.score,
        turn: solveQuestResponse.turn,
        gold: solveQuestResponse.gold,
        level: state.game.level,
      });
      deleteLocalStorageGameData();
      return;
    }

    Object.assign(state.game, solveQuestResponse);
    setLocalStorageGameData(state.game);

    const suggestedToBuy = suggestAnItemToBuy(state.suggestedShopItem, state.game);
    if (suggestedToBuy !== '') {
      state.suggestedShopItem = suggestedToBuy;
    }

    await fetchQuests();
  } catch (error) {
    console.error(error);
  } finally {
    state.loadingQuests = false;
  }
};

const onBuyClick = async (itemId) => {
  try {
    const buyItemResponse = await POST_BUY_AN_ITEM(props.gameData.gameId, itemId);
    Object.assign(state.game, buyItemResponse);

    const suggestedToBuy = suggestAnItemToBuy(state.suggestedShopItem, state.game);
    if (suggestedToBuy !== '') {
      state.suggestedShopItem = suggestedToBuy;
    }
    await fetchQuests();
  } catch (error) {
    console.error(error);
  }
};

onMounted(async () => {
  await Promise.all([fetchQuests(), fetchShopItems()]);
});
</script>
<template>
  <div class="game">
    <ul class="stats">
      <li class="stat-item">
        <img class="stat-icon" src="@/assets/live.png" alt="lives"/>
        <span>{{ state.game.lives }}</span>
      </li>
      <li class="stat-item">
        <img class="stat-icon" src="@/assets/level.png" alt="level"/>
        <span>{{ state.game.level }}</span>
      </li>
      <li class="stat-item">
        <img class="stat-icon" src="@/assets/gold.png" alt="gold"/>
        <span>{{ state.game.gold }}</span>
      </li>
      <li class="stat-item">
        <img class="stat-icon" src="@/assets/score.png" alt="score"/>
        <span>{{ state.game.score }}</span>
      </li>
      <li class="stat-item">
        <img class="stat-icon" src="@/assets/calendar.png" alt="turn"/>
        <span>{{ state.game.turn }}</span>
      </li>
    </ul>
    <div class="top-actions">
      <button class="top-actions-button"
              :class="{active: state.listView === 'quests'}"
              @click="toggleListView('quests')">Quests
      </button>
      <button class="top-actions-button"
              :class="{active: state.listView === 'shop', canBuy: state.game.gold > 50 && state.listView !== 'shop'}"
              @click="toggleListView('shop')">Shop
      </button>
      <button class="top-actions-button autoaction"
              :class="{disabled: state.loadingQuests}"
              :disabled="state.loadingQuests"
              @click="onSolveClick(state.suggestedQuest)">
        Autorun
        <img src="@/assets/swords.png" alt="autorun"/>
      </button>
      <button class="top-actions-button autoaction"
              :class="{disabled: !canBuyThisItem(state.suggestedShopItem) || state.loadingQuests}"
              :disabled="!canBuyThisItem(state.suggestedShopItem)"
              @click="onBuyClick(state.suggestedShopItem)">
        Autobuy
        <img src="@/assets/gold.png" alt="autobuy"/>
      </button>
    </div>

    <div class="list-view" :class="{loading: state.loadingQuests}" v-if="state.listView === 'quests'">
      <Quest v-for="quest in state.questBoard"
             :key="quest.adId"
             :quest="quest"
             :on-solve-click="onSolveClick"
             :loading="state.loadingQuests"/>
    </div>

    <div class="list-view" v-if="state.listView === 'shop'">
      <div v-for="item in state.shopItems" :key="item.id" class="shop-item"
           :class="{canBuy: item.cost < state.game.gold}">
        <button @click="onBuyClick(item.id)" class="item-buy-button" :class="{canBuy: item.cost < state.game.gold}">
          Buy
        </button>
        <p class="shop-item__name">{{ item.name }}</p>
        <p class="shop-item__cost">
          {{ item.cost }}
          <img class="shop-item__cost-icon" src="@/assets/gold.png" alt="gold"/>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shop-item {
  display: flex;
  min-width: 20rem;
  max-width: 24rem;
  width: 100%;
  flex-direction: row;
  gap: 1rem;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 0.25rem;
  background-color: rgba(37, 63, 80, 0.88);
}

.shop-item__name {
  text-align: center;
  font-weight: 500;
  font-size: 1.2rem;
}

.shop-item__cost {
  display: flex;
  flex-direction: row;
  align-items: center;
  font-weight: 500;
  font-size: 1.2rem;
}

.shop-item__cost-icon {
  width: 48px;
}

.game {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 1.2rem;
  width: 80%;
}

@media (max-width: 900px) {
  .game {
    width: 100%;
  }
}

.top-actions {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  flex-direction: row;
}

.top-actions-button {
  padding: 0.75rem 0;
  width: auto;
  min-width: 8rem;
  font-weight: 500;
  font-size: 1.1rem;
  background: rgb(37, 63, 80);
  background: linear-gradient(0deg, rgba(37, 63, 80, 0.7) 0%, rgba(255, 255, 255, 0) 100%);
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
  color: white;
  border: none;
  border-bottom: 1px solid white;
}

.top-actions-button.autoaction {
  background: rgba(255, 215, 0);
  background: linear-gradient(0deg, rgba(255, 215, 0, 0.7) 0%, rgba(255, 255, 255, 0) 100%);
}

.top-actions-button.disabled {
  background: rgb(37, 63, 80);
  background: linear-gradient(0deg, rgba(37, 63, 80, 0.7) 0%, rgba(255, 255, 255, 0) 100%);
}

.top-actions-button img {
  width: 32px;
  height: 32px;
}

.top-actions-button.active {
  background: rgba(0, 108, 31);
  background: linear-gradient(0deg, rgba(0, 108, 31, 0.7) 0%, rgba(255, 255, 255, 0) 100%);
}

.top-actions-button.canBuy {
  background: rgba(255, 215, 0);
  background: linear-gradient(0deg, rgba(255, 215, 0, 0.7) 0%, rgba(255, 255, 255, 0) 100%);
}

.shop-item.canBuy {
  background-color: rgba(72, 111, 131, 0.88);
}

.item-buy-button {
  padding: 0.5rem 1rem;
  font-weight: 500;
  font-size: 1.1rem;
  border: 1px solid white;
  border-radius: 0.25rem;
}

.item-buy-button.canBuy {
  background-color: rgba(0, 108, 31, 0.87);
}

.stats {
  width: 100%;
  list-style: none;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 10%;
  padding: 0.5rem 0;
  flex-wrap: wrap;
  z-index: 1;
}

@media (prefers-color-scheme: dark) {
  .stats {
    background-color: #131313;
  }
}

@media (prefers-color-scheme: light) {
  .stats {
    background-color: #afafaf;
  }
}

.stat-item {
  text-align: center;
  display: flex;
  flex-direction: column;
  font-weight: 500;
  font-size: 1.2rem;
}

.stat-icon {
  width: auto;
  min-width: 24px;
  max-width: 32px;
}

.list-view {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
  width: 100%;
  max-width: 100%;
  transition: background-color 0.2s ease;
  padding-bottom: 2rem;
}

@keyframes gradient {
  0% {
    background-position: 0 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

.quest__details img {
  max-width: 32px;
}
</style>
