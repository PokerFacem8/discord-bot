const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]});

let starterRole = "@everyone";

/**
 * Role Manager Commnad Menu
 * @param {*} message 
 */
function menu(message) {

    var option = message.content.split(" ")[2];

    switch(option){
        case "list":
            listRoles(message);
            break;
        case "starter":
            setStarterRole(message);
            break;
    };
}

/**
 * List Roles
 * @param {*} message 
 */
function listRoles(message) {

    //Prepare Message
    var list = "```ini\nServer Roles: \n" + `${message.guild.roles.cache.map((role) => `[${role.name}]`).join('\n')}` + "```";

    //Send the embed
    message.channel.send(list);
}

/**
 * Set the Starter Role
 * @param {*} message 
 */
function setStarterRole(message) {

    var roleName = "";

    //Check if role name has spaces between words
    if (message.content.split(" ").length > 3) {
        roleName = message.content.split(" ").slice(3).join(" ");
    }else{
        roleName = message.content.split(" ")[3];
    }

    //Find the role
    var role = message.guild.roles.cache.find(role => role.name === roleName);

    console.log(roleName);

    //Check if the role exists
    if (role) {
        //Set the role
        starterRole = role.name;
        message.channel.send(`The starter role has been set to ${role.name}`);
    }else{
        message.channel.send(`The role ${roleName} does not exist`);
    }
}

/**
 * Get the Starter Role
 * @returns 
 */
function getStarterRole() {
    return starterRole;
}

/**Only Certain Roles should use bot*/


module.exports = {
    menu,
    getStarterRole
}