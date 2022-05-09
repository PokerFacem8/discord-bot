//Class Discord User
class DiscordUser {
    constructor(id, username, isBot, createdAt) {
        this.id = id;
        this.username = username;
        this.bot = isBot; 
        this.created_at = createdAt;
        this.currrency = 50.00;
    }

    //Get the user's currency
    getCurrency() {
        return this.currrency;
    }

    //Set the user's currency
    setCurrency(amount) {
        this.currrency = amount;
    }
}

module.exports = DiscordUser;