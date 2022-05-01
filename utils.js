const ytdl = require("ytdl-core");

var musicList = {};


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
function playMusic(message){
    
    //Get the link
    const link = message.content.split(" ")[2];

    //Get Voice Channel
    const voiceChannel = message.member.voice.channel;

    //Curret Song
    const currentSong = undefined;

    //Check if bot has permission to join the voice channel
    if(!message.member.voice.channel.permissionsFor(message.guild.me).has("CONNECT") || !message.member.voice.channel.permissionsFor(message.guild.me).has("SPEAK"))
        return message.channel.send("I don't have permission to join that voice channel!");

    //Check if the user is in a voice channel
    if(!voiceChannel)
        return message.channel.send("You need to be in a voice channel to use this command!");

    //Check if the link is valid
    if(link == undefined || !link.includes("youtube.com"))
        return message.channel.send("Please give me a valid youtube link!");

    //Check if the song is already in the list
    if(musicList[link]!= undefined)
        return message.channel.send("This song is already in the queue!");
    
    const songInfo = ytdl.getInfo(link);
    const song = {
        title: songInfo.title,
        source: link,
    };

    //Join the voice channel
    voiceChannel.join().then(connection => {
        //Play the song
        playSong(message, song, connection);
    


    

    

        //Check if user is in a voice channel
        if(message.member.voice.channel!= undefined){
            
            //Check if bot has permission to join the voice channel
               
                    //Check if the bot is already in a voice channel
                    if(message.guild.voice.channel == undefined){
                        //Join the voice channel
                        message.member.voice.channel.join().then(connection => {
                            //Play the song
                            playSong(message, link, connection);
                        }
                        );
                    }else{
                        //Play the song
                        playSong(message, link, message.guild.voice.connection);
                    }
            }
        
        
        }
        

    

    }else{
        message.channel.send("Stop being a dick and give me a valid link!");
    }




    return;
}

function playSong(message, song, connection){
    //Play the song
    var stream = ytdl(link, { filter: "audioonly" });
    var dispatcher = connection.play(stream);
    dispatcher.on("end", () => {
        //Disconnect from the voice channel
        connection.disconnect();
    });
    return;
}

module.exports = {
    purgeChat,
    playMusic
}