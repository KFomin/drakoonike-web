import axios from 'axios';
import {QuestModel, GameData, ShopItem, QuestSolveResponse, BuyAnItemResponse} from "../models/models";

export async function POST_START_GAME(): Promise<GameData> {
    const response = await axios.post<GameData>(
        'https://dragonsofmugloar.com/api/v2/game/start'
    );
    return response.data;
}

export async function GET_QUEST_BOARD(gameId: string): Promise<QuestModel[]> {
    const response = await axios.get<QuestModel[]>(
        `https://dragonsofmugloar.com/api/v2/${gameId}/messages`
    );
    return response.data;
}

export async function GET_SHOP_ITEMS(gameId: string): Promise<ShopItem[]> {
    const response = await axios.get<ShopItem[]>(
        `https://dragonsofmugloar.com/api/v2/${gameId}/shop`
    );
    return response.data;
}

export async function POST_SOLVE_THE_QUEST(gameId: string, questId: string): Promise<QuestSolveResponse> {
    const response = await axios.post<QuestSolveResponse>(
        `https://dragonsofmugloar.com/api/v2/${gameId}/solve/${questId}`,
        {}
    );
    return response.data;
}

export async function POST_BUY_AN_ITEM(gameId: string, itemId: string): Promise<BuyAnItemResponse> {
    const response = await axios.post<BuyAnItemResponse>(
        `https://dragonsofmugloar.com/api/v2/${gameId}/shop/buy/${itemId}`,
        {}
    );
    return response.data;
}
