const ytdl = require("ytdl-core");
const ytdlInfo = require("ytdl-getinfo");
require("libsodium");
require("libsodium-wrappers");
const discordVoice = require("@discordjs/voice");

//Songs Queue
var songsQueue = new Map();

//Songs Queue Max Number
var songsQueueMaxNumber = 10;

//Create Audio Player
const player = discordVoice.createAudioPlayer();

/**
 * Music Command Handler
 * @param {*} message 
 */
function music(message){

    var option = message.content.split(" ")[2];

    switch(option){
        case "play":
            musicPlayer(message);
            break;
        case "stop":
            stopSong(message);
            break;
        case "skip":
            skipSong(message);
            break;
        case "list":
            listSongs(message);
            break;
        case "clear":
            clearQueue(message);
            break;
        case "shuffle":
            shuffleQueue(message);
            break;
    };
}

/**
 * Play a song from a youtube link
 * @param {*} message 
 * @returns 
 */
function musicPlayer(message){
    
    //Get the link
    const link = message.content.split(" ")[3];

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

                //Check if number of songs in the queue is less than the max number
                if(guildQueue.songs.length == songsQueueMaxNumber)
                    return message.channel.send("The queue is full!");

                guildQueue.songs.push(song);

                //Check if music is playing
                /*if(!player.state.status == "playing")
                    //Play the song
                    playSong(message.guild, queueContruct.songs[0]);*/
                
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

//Event: When the player state changes
player.on('stateChange', (oldState, newState) => {
    console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
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

/**
 * List the songs in the queue
 * @param {*} message 
 * @returns 
 */
function listSongs(message){

    //Get Voice Channel
    const voiceChannel = message.member.voice.channel;

    //Check if user is in a voice channel
    if(!voiceChannel)
        return message.channel.send("You need to be in a voice channel to use this command!");

    //Get the queue
    const queue = songsQueue.get(message.guild.id);

    //Check if the queue is undefined
    if(!queue)
        return message.channel.send("There are no songs in the queue!");

    var list = "```ini\nQueue: \n" + `${queue.songs.map((song, index) => `${(index + 1)}-[${song.title}]`).join('\n')}` + "```";

    //Send the embed
    message.channel.send(list);
}

/**
 * Clear the queue
 * @param {*} message 
 */
function clearQueue(message){
    
        //Get Voice Channel
        const voiceChannel = message.member.voice.channel;
    
        //Check if user is in a voice channel
        if(!voiceChannel)
            return message.channel.send("You need to be in a voice channel to use this command!");
    
        //Get the queue
        const queue = songsQueue.get(message.guild.id);

        //Check if the queue is undefined
        if(!queue)
            return message.channel.send("There are no songs in the queue!");

        //Clear the queue
        songsQueue.get(message.guild.id).songs = [];
        message.channel.send("The queue has been cleared!");
}

/**
 * Shuffle the queue
 * @param {*} message 
 * @returns 
 */
function shuffleQueue(message){

    //Get Voice Channel
    const voiceChannel = message.member.voice.channel;

    //Check if user is in a voice channel
    if(!voiceChannel)
        return message.channel.send("You need to be in a voice channel to use this command!");

    //Get the queue
    const queue = songsQueue.get(message.guild.id);

    //Check if the queue is undefined
    if(!queue)
        return message.channel.send("There are no songs in the queue!");

    //Get the first song
    const firstSong = queue.songs.shift();

    //Shuffle the queue
    queue.songs.sort(() => Math.random() - 0.5);

    //Add the first song back
    queue.songs.unshift(firstSong);

    message.channel.send("The queue has been shuffled!");
}

module.exports = {
    music 
}