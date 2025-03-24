<script setup>
import {ref, onMounted} from 'vue';
import {GET_QUEST_BOARD, GET_SHOP_ITEMS, POST_BUY_AN_ITEM, POST_SOLVE_THE_QUEST} from '@/resource/api.js';
import {QuestModel, ShopItem} from "@/models/models.js";
import {sortByQuestDifficultyAndReward} from "@/service/game.js";
import Quest from "@/components/Quest.vue";
import {decode, decodeROT13, deleteLocalStorageGameData, setLocalStorageGameData} from "@/service/utils.js";

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

const gameData = ref({
  gameId: props.gameData.gameId,
  lives: props.gameData.lives,
  level: props.gameData.level,
  gold: props.gameData.gold,
  score: props.gameData.score,
  turn: props.gameData.turn
});

const questBoard = ref([]);
const shopItems = ref([]);
const suggestedQuest = ref(null);
const suggestedShopItem = ref('');
const loadingQuests = ref(true);

let listView = ref('quests');
const toggleListView = (view) => {
  listView.value = view;
};

const fetchQuests = async () => {
  try {
    loadingQuests.value = true;
    const questBoardResponse = await GET_QUEST_BOARD(props.gameData.gameId);
    let quests = questBoardResponse.map(item => new QuestModel(
        item.adId,
        item.message,
        item.reward,
        item.expiresIn,
        item.probability,
        item.encrypted
    ));
    quests = quests.map((quest) => {
      if (quest.encrypted === 1) {
        quest.adId = decode(quest.adId);
        quest.message = decode(quest.message);
        quest.probability = decode(quest.probability);
      }
      if (quest.encrypted === 2) {
        quests.adId = decodeROT13(quest.adId);
        quests.message = decodeROT13(quest.message);
        quests.probability = decodeROT13(quest.probability);
      }
      return quest;
    });
    questBoard.value = sortByQuestDifficultyAndReward(quests);
    suggestedQuest.value = questBoard.value[0];
  } catch (error) {
    console.error(error);
  } finally {
    loadingQuests.value = false;
  }
}

const fetchShopItems = async () => {
  try {
    const shopDataResponse = await GET_SHOP_ITEMS(props.gameData.gameId);
    shopItems.value = shopDataResponse.map(item => new ShopItem(
        item.id,
        item.name,
        item.cost
    ))
  } catch (error) {
    console.error(error);
  }
}

const canBuyThisItem = (itemId) => {
  let itemToBuy = shopItems.value.find(item => item.id === itemId);
  if (itemToBuy) {
    return itemToBuy.cost < gameData.value.gold;
  }
  return false;
}

const onSolveClick = async (quest) => {
  try {
    loadingQuests.value = true;
    const solveQuestResponse = await POST_SOLVE_THE_QUEST(props.gameData.gameId, quest.adId);
    if (solveQuestResponse.message.toLowerCase().includes('defeated')) {
      props.onGameEnd({
        score: solveQuestResponse.score,
        turn: solveQuestResponse.turn,
        gold: solveQuestResponse.gold,
        level: gameData.value.level,
      });
      deleteLocalStorageGameData();
      return;
    }
    gameData.value = {
      ...gameData.value,
      ...solveQuestResponse
    };

    setLocalStorageGameData(gameData.value);

    let suggestedToBuy = suggestAnItemToBuy(suggestedShopItem.value, gameData);
    if (suggestedToBuy !== '') {
      suggestedShopItem.value = suggestAnItemToBuy(suggestedShopItem.value, gameData);
    }

    await fetchQuests();
  } catch (error) {
    console.error(error);
  } finally {
    loadingQuests.value = false;
  }
}

const suggestAnItemToBuy = (lastSuggestedItem, gameData) => {
  if (gameData.value.gold < 50) {
    return '';
  }

  if (gameData.value.lives < 3) {
    return "hpot";
  }

  if (gameData.value.gold > 300) {
    switch (lastSuggestedItem) {
      case "ch":
        return "rf";
      case "rf":
        return "iron";
      case "iron":
        return "mtrix";
      case "mtrix":
        return "wingpotmax";
      default:
        return "ch";
    }
  }

  if (gameData.value.turn < 30 && gameData.value.gold > 100) {
    switch (lastSuggestedItem) {
      case "cs":
        return "gas";
      case "gas":
        return "wax";
      case "wax":
        return "tricks";
      case "tricks":
        return "wingpot";
      default:
        return "cs";
    }
  }

  return '';
}

const onBuyClick = async (itemId) => {
  try {
    const buyItemResponse = await POST_BUY_AN_ITEM(props.gameData.gameId, itemId)
    gameData.value = {
      ...gameData.value,
      ...{
        gold: buyItemResponse.gold,
        lives: buyItemResponse.lives,
        level: buyItemResponse.level,
        turn: buyItemResponse.turn
      }
    }
    console.log(itemId);

    let suggestedToBuy = suggestAnItemToBuy(suggestedShopItem.value, gameData);
    if (suggestedToBuy !== '') {
      suggestedShopItem.value = suggestAnItemToBuy(suggestedShopItem.value, gameData);
    }
    await fetchQuests();
  } catch (error) {
    console.error(error);
  }
}


onMounted(fetchQuests(), fetchShopItems());

</script>

<template>
  <div class="game">
    <ul class="stats">
      <li class="stat-item">
        <img class="stat-icon" src="@/assets/live.png" alt="lives"/>
        <span>{{ gameData.lives }}</span>
      </li>
      <li class="stat-item">
        <img class="stat-icon" src="@/assets/level.png" alt="level"/>
        <span>{{ gameData.level }}</span>
      </li>
      <li class="stat-item">
        <img class="stat-icon" src="@/assets/gold.png" alt="gold"/>
        <span>{{ gameData.gold }}</span>
      </li>
      <li class="stat-item">
        <img class="stat-icon" src="@/assets/score.png" alt="score"/>
        <span>{{ gameData.score }}</span>
      </li>
      <li class="stat-item">
        <img class="stat-icon" src="@/assets/calendar.png" alt="score"/>
        <span>{{ gameData.turn }}</span>
      </li>
    </ul>

    <div class="top-actions">
      <span class="top-actions-group">
        <button class="top-actions-button"
                :class="{active: listView === 'quests'}"
                @click="toggleListView('quests')">Quests
        </button>
        <button class="top-actions-button"
                :class="{active: listView === 'shop',
                canBuy: gameData.gold > 50 && listView !== 'shop'
                }"
                @click=" toggleListView('shop')">Shop
        </button>
      </span>
      <span class="top-actions-group">
        <button class="top-actions-button autoaction"
                :class="{disabled: loadingQuests}"
                :disabled="loadingQuests"
                @click="onSolveClick(suggestedQuest)">
          Autorun
          <img src="@/assets/swords.png" alt="autorun"/>
        </button>
        <button class="top-actions-button autoaction"
                :class="{disabled: !canBuyThisItem(suggestedShopItem) ||  loadingQuests}"
                :disabled="!canBuyThisItem(suggestedShopItem)"
                @click="onBuyClick(suggestedShopItem)">
          Autobuy
          <img src="@/assets/gold.png" alt="autobuy"/>
        </button>
      </span>
    </div>

    <div class="list-view" :class="{loading: loadingQuests}" v-if="listView === 'quests'">
      <Quest v-for="quest in questBoard"
             :quest="quest"
             :on-solve-click="onSolveClick"
             :loading="loadingQuests">
      </Quest>
    </div>

    <div class="list-view" v-if="listView === 'shop'">
      <div v-for="item in shopItems" :key="item.id" class="shop-item" :class="{canBuy: item.cost < gameData.gold}">
        <button @click="onBuyClick(item.id)" class="item-buy-button" :class="{canBuy: item.cost < gameData.gold}">buy
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
  gap: 1.2rem;
  flex-direction: row;
  justify-content: space-between;
}

.top-actions-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  gap: 1rem;
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
  width: 100vw;
  list-style: none;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 10%;
  padding: 0.5rem;
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
  justify-content: center;
  display: flex;
  padding-top: 0.5rem;
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
