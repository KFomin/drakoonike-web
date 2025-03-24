import axios from 'axios';

export async function POST_START_GAME() {
    const response = await axios.post(
        'https://dragonsofmugloar.com/api/v2/game/start'
    );
    return response.data;
}


export async function GET_QUEST_BOARD(gameId) {
    const response = await axios.get(
        `https://dragonsofmugloar.com/api/v2/${gameId}/messages`
    );
    return response.data;
}


export async function GET_SHOP_ITEMS(gameId) {
    const response = await axios.get(
        `https://dragonsofmugloar.com/api/v2/${gameId}/shop`)
    ;
    return response.data;
}

export async function POST_SOLVE_THE_QUEST(gameId, questId) {
    const response = await axios.post(
        `https://dragonsofmugloar.com/api/v2/${gameId}/solve/${questId}`,
        {}
    );
    return response.data;
}

export async function POST_BUY_AN_ITEM(gameId, itemId) {
    const response = await axios.post(
        `https://dragonsofmugloar.com/api/v2/${gameId}/shop/buy/${itemId}`,
        {}
    );
    return response.data;
}
