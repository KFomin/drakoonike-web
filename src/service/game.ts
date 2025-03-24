import {QuestModel, GameData} from '../models/models';

export const getQuestDifficulty = (quest: QuestModel): string => {
    switch (quest.probability.toLowerCase()) {
        case 'walk in the park':
        case 'piece of cake':
        case 'quite likely':
        case 'sure thing':
            return 'easy';
        case 'hmmm....':
        case 'risky':
        case 'gamble':
            return 'medium';
        case 'rather detrimental':
        case 'playing with fire':
        case 'suicide mission':
        case 'impossible':
        case 'better avoid':
            return 'hard';
        default:
            return 'hard';
    }
}

export const sortByQuestDifficultyAndReward = (quests: QuestModel[]): QuestModel[] => {
    const sortedByDifficulty: QuestModel[] = quests.sort((a, b) => {
        return toDifficultyNo(a.probability) - toDifficultyNo(b.probability);
    });

    const splitIntoGroups: { [key: number]: QuestModel[] } = sortedByDifficulty.reduce((acc: {
        [key: number]: QuestModel[]
    }, current) => {
        const difficulty = toDifficultyNo(current.probability);

        if (!acc[difficulty]) {
            acc[difficulty] = [];
        }

        acc[difficulty].push(current);
        acc[difficulty].sort((a, b) => a.reward - b.reward);

        return acc;
    }, {});

    return Object.values(splitIntoGroups).flatMap(group => {
        return group.sort((a, b) => b.reward - a.reward);
    });
}

const toDifficultyNo = (probability: string): number => {
    switch (probability.toLowerCase()) {
        case 'walk in the park':
            return 1;
        case 'piece of cake':
            return 2;
        case 'quite likely':
            return 3;
        case 'sure thing':
            return 4;
        case 'hmmm....':
            return 5;
        case 'risky':
            return 6;
        case 'gamble':
            return 7;
        case 'rather detrimental':
            return 8;
        case 'playing with fire':
            return 9;
        case 'suicide mission':
            return 10;
        case 'impossible':
            return 11;
        case 'better avoid':
            return 12;
        default:
            return 10;
    }
}

export const suggestAnItemToBuy = (lastSuggestedItem: string, gameData: GameData): string => {
    if (gameData.gold < 50) {
        return '';
    }

    if (gameData.lives < 3) {
        return 'hpot';
    }

    if (gameData.gold > 300) {
        switch (lastSuggestedItem) {
            case 'ch':
                return 'rf';
            case 'rf':
                return 'iron';
            case 'iron':
                return 'mtrix';
            case 'mtrix':
                return 'wingpotmax';
            default:
                return 'ch';
        }
    }

    if (gameData.turn < 30 && gameData.gold > 100) {
        switch (lastSuggestedItem) {
            case 'cs':
                return 'gas';
            case 'gas':
                return 'wax';
            case 'wax':
                return 'tricks';
            case 'tricks':
                return 'wingpot';
            default:
                return 'cs';
        }
    }

    return '';
}
