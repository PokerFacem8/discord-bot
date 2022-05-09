const mongo = require("./mongo-manager.js");

var games = ["ttt", "closestnumber", "flipcoin"];

/**
 * Game Menu
 * @param {*} message 
 */
function menu(message, MessageEmbed){
    
    var option = message.content.split(" ")[2];

    switch(option){
        case "ttt":
            break;
        case "closestnumber":
            break;
        case "flipcoin":
            flipcoin(message);
            break;
        default:
            listGames(message, MessageEmbed);
            break;
    };
}

/**
 * List all games
 * @param {*} message 
 */
function listGames(message){
    //Print the list of games with embed
    var embed = new MessageEmbed()
        .setTitle("List of Games")
        .setDescription("Here is a list of games that you can play!")
        .addField("Tic-Tac-Toe", "`ttt`")
        .addField("Closest Number", "`closestnumber`")
        .addField("Flip Coin", "`flipcoin heads|tails`")
        .setColor("#0099ff")
        .setTimestamp()
        .setFooter("Games Manager");
    message.channel.send({embed});
}

/**
 * Flip Coin Game
 * @param {*} message 
 */
function flipcoin(message){

    //Get User Object by ID
    mongo.getUser(message.author.id, message.guild.id, (user) => {

        //Check if the user is in the database
        if(user){
            // Get the coin from the user
            var coin = message.content.split(" ")[3];

            
            //Check if the user has enough currency
            if(user.getCurrency() >= 1){

                //Get betted amount
                var betted = message.content.split(" ")[4];

                //Check if the user has enough currency to bet
                if(user.getCurrency() >= betted){
                    //Check if the coin is heads or tails
                    if(coin == "heads" || coin == "tails"){
                        //Get the coin
                        coin = coin.toLowerCase();

                        //Get the random coin
                        var randomCoin = Math.random() < 0.5 ? "heads" : "tails";

                        //Check if the coin is correct
                        if(coin == randomCoin){
                            //Add currency to the user
                            user.setCurrency(user.getCurrency() + value);
                            //Send the message
                            message.channel.send(`${message.author.username} flipped ${coin} and won!`);
                            //Update the user in the database
                            mongo.updateUser(user, message.guild.id);
                        } else {
                            //Remove currency from the user
                            user.setCurrency(user.getCurrency() - 1);
                            //Send the message
                            message.channel.send(`${message.author.username} flipped ${coin} and lost!`);
                            //Update the user in the database
                            mongo.updateUser(user, message.guild.id);
                        }
                    } else {
                        //Send the message
                        message.channel.send(`${message.author.username} please use heads or tails!`);
                    }
                }else{
                    //Send the message
                    message.channel.send(`${message.author.username} you don't have enough currency to make this bet!`);
                }
            } else {
                //Send the message
                message.channel.send(`${message.author.username} you are broke!`);
            }
        }
    });
}

module.exports = {
    menu
}
