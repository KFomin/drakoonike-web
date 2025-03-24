export class GameStartResponse {
    constructor(gameId, lives, gold, score, level, turn) {
        this._gameId = gameId;
        this._lives = lives;
        this._gold = gold;
        this._score = score;
        this._level = level;
        this._turn = turn;
    }

    get score() {
        return this._score;
    }

    get gold() {
        return this._gold;
    }

    get lives() {
        return this._lives;
    }

    get gameId() {
        return this._gameId;
    }

    get level() {
        return this._level;
    }

    get turn() {
        return this._turn
    }
}


export class QuestModel {
    constructor(adId, message, reward, expiresIn, probability, encrypted) {
        this._adId = adId;
        this._message = message;
        this._reward = reward;
        this._expiresIn = expiresIn;
        this._probability = probability;
        this._encrypted = encrypted;
    }

    get probability() {
        if (this._message.toLowerCase().includes('steal')
            || this._message.toLowerCase().includes('infiltrate')) {
            return 'better avoid';
        }
        return this._probability;
    }

    set probability(value) {
        this._probability = value;
    }

    get encrypted() {
        return this._encrypted;
    }

    get expiresIn() {
        return this._expiresIn;
    }

    get reward() {
        return this._reward;
    }

    get message() {
        return this._message;
    }

    set message(value) {
        this._message = value;
    }

    get adId() {
        return this._adId;
    }

    set adId(value) {
        this._adId = value;
    }
}


export class ShopItem {
    constructor(id, name, cost) {
        this._id = id;
        this._name = name;
        this._cost = cost;
    }

    get cost() {
        return this._cost;
    }

    get name() {
        return this._name;
    }

    get id() {
        return this._id;
    }
}
