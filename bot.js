require('dotenv').config();
const { Client, Intents, MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]});
const utils = require('./utils.js');
const roles = require('./roles-manager.js');
const users = require('./users-manager.js');
const mongodb = require('./mongo-manager.js');
const games = require('./games-manager.js');

//Load the bot
client.on("ready", () => {
    console.log("Loggend in as "+ client.user.tag + "!");
});

//Event: Join a server
client.on('guildCreate', function(guild) {
    //Message
    guild.systemChannel.send(`Hello, I'm ${client.user.tag}. Thanks for inviting me, here are a list of all my commands! :alien:`);
    //List commands
    listCommands(guild.systemChannel);

    //Check if the server is already in the database
    mongodb.getServer(guild.id, (server) => {
        if (server){
            //Clear the server
            mongodb.clearServerUsers(guild.id, () => {
                //Add the Users
                users.loadUsers(guild);
            });
        } else {
            //Add Server to the database and load all users
            mongodb.addServer(guild.id, ()=>{
                //Add the Users
                users.loadUsers(guild);
            });
        }
    });
});

//Event: create message
client.on("messageCreate", (message) => {

    //Check if the message is a command
    if (!message.content.startsWith(process.env.PREFIX)){

        //Get the option of the message
        let option = message.content.split(" ")[1];

        //Check if the option is a command
        switch(option){
            case "purge":
                utils.purgeChat(message);
                break;
            case "music":
                utils.music(message);
                break;
            case "roles":
                roles.menu(message);
                break;
            case "users":
                users.menu(message);
                break;
            case "games":
                games.menu(message, MessageEmbed);
                break;
            case "help":               
                listCommands(message);
                break;
        };
    }
});

//Event: When user joins the server
client.on('guildMemberAdd', member => {
    //Get Starter Role
    let roleName = roles.getStarterRole();

    //Add the starter role
    member.roles.add(member.guild.roles.cache.find(role => role.name === roleName));

    //Check if the user is in the database
    mongodb.getUser(member.id, member.guild.id, (user) => {
        //If the user is not in the database
        if (!user){
            //Add the user to the server
            mongodb.addUser(member.id, member.guild.id);
        }
    });
});

/**
 * List all commands
 * @param {*} message 
 */
function listCommands(message) {
    //Create the embed to specify each command
    var embed = new MessageEmbed()
        .setTitle("List of Commands")
        .setDescription("Here is a list of commands that you can use!")
        .addField("`purge`", "Purge the chat")
        .addField("`music`", "Play music in the voice channel")
        .addField("`roles`", "Manage roles")
        .addField("`users`", "Manage users")
        .addField("`games`", "Play games")
        .setColor("#0099ff")
        .setTimestamp();
    message.channel.send({embed});
}

client.login(process.env.BOT_TOKEN);