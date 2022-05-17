const DiscordUser = require("./user.js");
const mongodb = require("./mongo-manager.js");

/**
 * Load all users from the server to the database
 * @param {*} guild 
 */
function loadUsers(guild) {
    //For each user, add them to the users list
    guild.members.cache.forEach(member => { 
        //Get the user
        const user = new DiscordUser(member.id, member.user.username, member.user.bot, member.user.createdAt);

        //Add the user to the database
        mongodb.addUser(user, guild.id);
    });
}

/**
 * Menu for the users manager
 * @param {*} message 
 */
function menu(message) {
    var option = message.content.split(" ")[2];

    switch(option){
        case "list":
            listUsers(message);
            break;
        case "kick":
            kickUser(message);
            break;
        case "ban":
            break;
        case "mute":
            break;
        case "unmute":
            break;
    };
}

/**
 * List all users from the current server
 * @param {*} message 
 */
function listUsers(message) {
    //Get the users from the database for the current server
    mongodb.getUsers(message.guild.id, (users) => {
        //Prepare the message
        var list = "```ini\nUsers: \n" + `${users.map((user) => `[${user.username}]`).join('\n')}` + "```";
    
        //Send the message
        message.channel.send(list);
    });
}

function kickUser(message) {
    //Get the user to kick
    var username = message.content.split(" ")[3];

    //Check if the user is in the list
    mongodb.getUser(user, message.guild.id, (user) => {

        //Check if the user exists
        if (user) {
            //Kick the user
            message.guild.members.cache.find(member => member.id === user.id).kick();
        }else{
            message.channel.send(`The user ${user} does not exist`);
        }




module.exports = {
    loadUsers,
    menu 
}