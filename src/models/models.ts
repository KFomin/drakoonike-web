export interface GameData {
    gameId: string;
    lives: number;
    gold: number;
    score: number;
    level: number;
    turn: number;
}

export interface QuestModel {
    adId: string;
    message: string;
    reward: number;
    expiresIn: number;
    probability: string;
    encrypted: number | null;
}

export interface QuestSolveResponse {
    success: boolean;
    lives: number;
    gold: number;
    score: number;
    turn: number;
    message: string;
}

export interface ShopItem {
    id: string;
    name: string;
    cost: number;
}

export interface BuyAnItemResponse {
    shoppingSuccess: string;
    gold: number;
    lives: number;
    level: number;
    turn: number;
}

export interface GameEndData {
    score: number,
    turn: number,
    gold: number,
    level: number,
}

export function validateProbability(quest: QuestModel): QuestModel {
    if (quest.message.toLowerCase().includes('steal') || quest.message.toLowerCase().includes('infiltrate')) {
        quest.probability = 'better avoid'
        return quest;
    }
    return quest;
}
