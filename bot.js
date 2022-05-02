
require('dotenv').config();
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]});
const utils = require('./utils.js');



client.on("ready", () => {
    console.log("Loggend in as "+ client.user.tag + "!");
});

//Event: create message
client.on("messageCreate", (message) => {

    //Check if the message is a command
    if (!message.content.startsWith(process.env.PREFIX)){

        //Get the option of the message
        let option = message.content.split(" ")[1];

        //Check if the option is a command
        switch(option){
            case "ping":
                message.channel.send("Pong!");
                break;
            case "purge":
                utils.purgeChat(message);
                break;
            case "play":
                utils.musicPlayer(message);
                break;
            case "help":
                message.channel.send("This is a help message");
                break;
        }
    }
});


//TODO: Get the user who deleted the message and send a message to the channel
//Event: delete message
/*client.on("messageDelete", async (message) => {
    
    //Get Logs
    var messageDeleteLog = await message.guild.fetchAuditLogs().then(logs => logs.entries.filter(e => e.action === 'MESSAGE_DELETE').sort((a, b) => b.createdAt - a.createdAt).first());

    let user = ""
    if (messageDeleteLog.extra.channel.id === message.channel.id && (messageDeleteLog.target.id === message.author.id) && (messageDeleteLog.createdTimestamp > (Date.now() - 5000)) && (messageDeleteLog.extra.count >= 1)) {
        user = messageDeleteLog.executor.username
    }else { 
        user = message.author.username
    }
    
    message.channel.send("This dickhead (" + messageDeleteLog.executor.tag + ") deleted the following message: " + message.content);      
});*/

client.login(process.env.BOT_TOKEN);