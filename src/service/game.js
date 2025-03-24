export const getQuestDifficulty = (quest) => {
    switch (quest.probability.toLowerCase()) {
        case 'walk in the park':
            return 'easy';
        case 'piece of cake':
            return 'easy';
        case 'quite likely':
            return 'easy';
        case 'sure thing':
            return 'easy';
        case 'hmmm....':
            return 'medium';
        case 'risky':
            return 'medium';
        case 'gamble':
            return 'medium';
        case 'rather detrimental':
            return 'hard';
        case 'playing with fire':
            return 'hard';
        case 'suicide mission':
            return 'hard';
        case 'impossible':
            return 'hard';
        case 'better avoid':
            return 'hard';
        default:
            return 'hard';
    }
}

export const sortByQuestDifficultyAndReward = (quests) => {
    const sortedByDifficulty = quests.sort((a, b) => {
        return toDifficultyNo(a.probability) - toDifficultyNo(b.probability)
    })
    const splitIntoGroups = sortedByDifficulty.reduce((acc, current) => {
        const difficulty = toDifficultyNo(current.probability);

        if (!acc[difficulty]) {
            acc[difficulty] = [];
        }

        acc[difficulty].push(current);
        acc[difficulty].sort((a, b) => {
            typeof a.reward
            return a.reward - b.reward
        });

        return acc;
    }, [])

    return splitIntoGroups.flatMap(group => {
        return group.sort((a, b) => {
            return b.reward - a.reward;
        })
    });

}

const toDifficultyNo = (probability) => {
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
