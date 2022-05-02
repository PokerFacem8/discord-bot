const ytdl = require("ytdl-core");
require("libsodium");
require("libsodium-wrappers");
const discordVoice = require("@discordjs/voice");

var songsQueue = new Map();

/**
 * Purge a number of messages from a channel
 * @param {*} message 
 * @returns 
 */
function purgeChat(message){

    //Get the amount of messages to delete
    var numberOfMessages = message.content.split(" ")[2];
    //Check if the number of messages is a number
    if(numberOfMessages != undefined && !isNaN(numberOfMessages) && numberOfMessages > 0 && numberOfMessages <= 100){
        message.channel.bulkDelete(numberOfMessages);
    }else{
        message.channel.send("Stop being a dick and give me a number of messages to delete!");
    }

    return;
}

/**
 * Play a song from a youtube link
 * @param {*} message 
 * @returns 
 */
async function musicPlayer(message){
    
    //Get the link
    const link = message.content.split(" ")[2];

    //Get Voice Channel
    const voiceChannel = message.member.voice.channel;

    //Check if bot has permission to join the voice channel
    if(!message.guild.me.permissionsIn(message.channel).has("CONNECT") || !message.guild.me.permissionsIn(message.channel).has("SPEAK"))
        return message.channel.send("I don't have permission to join the voice channel!");

    //Check if the user is in a voice channel
    if(!voiceChannel)
        return message.channel.send("You need to be in a voice channel to use this command!");

    //Check if the link is valid
    if(link == undefined || !link.includes("youtube.com"))
        return message.channel.send("Please give me a valid youtube link!");
    
    const song = {
        source: link,
    };

    //Get server queue
    const guildQueue = songsQueue.get(message.guild.id);

    //Check if the server queue is empty
    if (!guildQueue) {

        //Create a new queue
        const queueContruct = {
          textChannel: message.channel,
          voiceChannel: voiceChannel,
          connection: null,
          songs: [],
          volume: 5,
          playing: true
        };
    
        songsQueue.set(message.guild.id, queueContruct);

        queueContruct.songs.push(song);

        try {
            
            const connection = await discordVoice.joinVoiceChannel(
            {
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator
            });

            queueContruct.connection = connection;

            //Play the song
            playSong(message.guild, queueContruct.songs[0]);

        } catch (err) {
            console.log(err);
            songsQueue.delete(message.guild.id);
            return message.channel.send(err);
        }
    } else {
        guildQueue.songs.push(song);
        return message.channel.send(`${song.title} has been added to the queue!`);
    }
}

/**
 * 
 * @param {*} guild 
 * @param {*} song 
 * @returns 
 */
async function playSong(guild, song){
    var guildQueue = songsQueue.get(guild.id);
    if (!song) {
        guildQueue.voiceChannel.leave();
        songsQueue.delete(guild.id);
        return;
    }
    
    const stream = ytdl(song.source, { filter: 'audioonly' });
    const player = discordVoice.createAudioPlayer();
    const resource = discordVoice.createAudioResource(stream);
    const connection = guildQueue.connection;
    
    connection.subscribe(player);
    connection.on('stateChange', (oldState, newState) => {
	    console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
    });
    player.on('stateChange', (oldState, newState) => {
	    console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
    });

    await player.play(resource);



    player.on('error', (error) => console.error(error));
    player.on('finish', () => {
        guildQueue.songs.shift();
        playSong(guild, guildQueue.songs[0]);
    });
    guildQueue.textChannel.send(`Start playing: **${song.source}**`);
}

module.exports = {
    purgeChat,
    musicPlayer
}