const ytdl = require("ytdl-core");
const ytdlInfo = require("ytdl-getinfo");
require("libsodium");
require("libsodium-wrappers");
const discordVoice = require("@discordjs/voice");

//Songs Queue
var songsQueue = new Map();

//Create Audio Player
const player = discordVoice.createAudioPlayer();

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
function musicPlayer(message){
    
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

    //Check if there is a link
    if(link){

        //Check if the link is valid
        if(!link.includes("youtube.com") && !link.includes("youtu.be"))
            return message.channel.send("Please give me a valid youtube link!");
        
        //Get the info of the song
        ytdlInfo.getInfo(link).then(info => {

            //Create song object
            const song = {
                source: link,
                title: info.items[0].title
            };

            //Get server queue
            const guildQueue = songsQueue.get(message.guild.id);

            //Check if the server queue is undefined
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
                    
                    const connection = discordVoice.joinVoiceChannel(
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

                //Check if music is playing
                if(!player.state.status == "playing")
                    //Play the song
                    playSong(message.guild, queueContruct.songs[0]);
                
                return message.channel.send(`${song.title} has been added to the queue!`);
            }
        });
    }else{
        //Check if bot is already playing music
        if(message.guild.me.voice.channel)
            return message.channel.send("I'm already in a voice channel!");

        //Check if the server queue is undefined
        if (!songsQueue.get(message.guild.id))
            return message.channel.send("There are no songs in the queue!");

        try {
                
            const connection = discordVoice.joinVoiceChannel(
            {
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator
            });

            songsQueue.get(message.guild.id).connection = connection;

            //Play the first song in the queue
            playSong(message.guild, songsQueue.get(message.guild.id).songs[0]);

        } catch (err) {
            console.log(err);
            songsQueue.delete(message.guild.id);
            return message.channel.send(err);
        }
    }
}

/**
 * Play a song
 * @param {*} guild 
 * @param {*} song 
 * @returns 
 */
function playSong(guild, song){

    //Get Guild Queue
    var guildQueue = songsQueue.get(guild.id);
    
    //Check if song is undefined
    if (!song) {
        guildQueue.textChannel.send("There are no more songs in the queue!");
        guildQueue.voiceChannel.leave();
        songsQueue.delete(guild.id);
        return;
    }
    
    //Create Audio Stream
    const stream = ytdl(song.source, { filter: 'audioonly' });

    //Create Audio Resource
    const resource = discordVoice.createAudioResource(stream);

    //Subscribe to the player events
    guildQueue.connection.subscribe(player);

    //Play the song
    player.play(resource);

    guildQueue.textChannel.send(`Start playing: **${song.title}**`);

    //Debugging
    /*guildQueue.connection.on('stateChange', (oldState, newState) => {
	    console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
    });
    player.on('stateChange', (oldState, newState) => {
	    console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
    });*/
}

//Events: When there is an error
player.on('error', (error) => {
    console.error(error)
});

//Event: When the song ends
player.on('finish', () => {
    guildQueue.songs.shift();
    playSong(guild, guildQueue.songs[0]);
});

/**
 * Stop the music player
 * @param {*} message 
 * @returns 
 */
function stopSong(message){
    
    //Get Voice Channel
    const voiceChannel = message.member.voice.channel;

    //Check if user is in a voice channel
    if(!voiceChannel)
        return message.channel.send("You need to be in a voice channel to use this command!");

    //Check if bot is in a voice channel
    if(!message.guild.me.voice.channel)
        return message.channel.send("I'm not in a voice channel!");
    
    //Check if music is playing
    if(!player.state.status == "playing")
        return message.channel.send("There is no song playing!");
        
    //Stop the song
    player.stop();

    //Remove the song from the queue
    songsQueue.get(message.guild.id).songs.shift();

    //Leave the voice channel
    discordVoice.getVoiceConnection(message.guild.id).disconnect();
    songsQueue.get(message.guild.id).connection.destroy();
    songsQueue.get(message.guild.id).textChannel.send("The song has been stopped!");
}

/**
 * 
 * @param {*} message 
 * @returns 
 */
function skipSong(message){

    //Get Voice Channel
    const voiceChannel = message.member.voice.channel;

    //Check if user is in a voice channel
    if(!voiceChannel)
        return message.channel.send("You need to be in a voice channel to use this command!");

    //Check if bot is in a voice channel
    if(!message.guild.me.voice.channel)
        return message.channel.send("I'm not in a voice channel!");

    //Check if music is playing
    if(!player.state.status == "playing")
        return message.channel.send("There is no song playing!");

    //Remove the song from the queue
    songsQueue.get(message.guild.id).songs.shift();
    
    //Get next song
    const nextSong = songsQueue.get(message.guild.id).songs[0];

    //Check if there is a next song
    if(nextSong == undefined){
        return message.channel.send("There is no next song!");
    }else{
        //Skip the song
        playSong(message.guild, nextSong);
    }
}

module.exports = {
    purgeChat,
    musicPlayer,
    stopSong,
    skipSong
}


//TODO:
//Limite number of songs in the queue
//Add a shuffle queue
//Clear the queue
//List the queue