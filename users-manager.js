const DiscordUser = require("./user.js");
const mongodb = require("./mongo-manager.js");

//List of all users from all guilds
let guilds = new Map();

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
    };
}

/**
 * List all users from the current server
 * @param {*} message 
 */
function listUsers(message) {
    //Get the guildUsers list
    const guildUsers = guilds.get(message.guild.id);

    //Print the list of users
    var list = "```ini\nUsers: \n" + `${guildUsers.map((user, index) => `${(index + 1)}-[${user.username}]`).join('\n')}` + "```";

    //Send the embed
    message.channel.send(list);
}

module.exports = {
    loadUsers,
    menu 
}