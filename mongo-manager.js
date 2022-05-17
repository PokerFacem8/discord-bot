require('dotenv').config();
const { MongoClient } = require('mongodb');

//MongoDB connection url
const url = process.env.MONGO_URL;


/**
 * Add a new server to the database
 * @param {*} id 
 */
function addServer(id, callback) {
    MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
            console.log(err);
            return;
        }
        const db = client.db('discord-data');
        const collection = db.collection('servers');
        collection.insertOne({ id: id, users: []}, (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log(`Server ${id} added`);
            client.close();
            callback();
        });
    });
}

/**
 * Get Server from the database
 * @param {*} id 
 * @param {*} callback 
 */
function getServer(id, callback) {
    MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
            console.log(err);
            return;
        }
        const db = client.db('discord-data');
        const collection = db.collection('servers');
        collection.findOne({ id: id }, (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            client.close();
            callback(result);
        });
    });
}

/**
 * Remove a server from the database
 * @param {*} id 
 * @param {*} callback 
 */
function removeServer(id, callback) {
    MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
            console.log(err);
            return;
        }
        const db = client.db('discord-data');
        const collection = db.collection('servers');
        collection.deleteOne({ id: id }, (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log(`Server ${id} removed`);
            client.close();
            callback();
        });
    });
}

/**
 * Clear the all the users from the server
 * @param {*} id 
 * @param {*} callback 
 */
function clearServerUsers(id, callback) {
    MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
            console.log(err);
            return;
        }
        const db = client.db('discord-data');
        const collection = db.collection('servers');
        collection.updateOne({ id: id }, { $set: { users: [] } }, (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            client.close();
            callback();
        });
    });
}

/**
 * Add a new user to a specific server in the database
 * @param {*} user 
 * @param {*} server 
 */
function addUser(user, server, callback) {
    MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
            console.log(err);
            return;
        }
        const db = client.db('discord-data');
        const collection = db.collection('servers');
        collection.updateOne({ id: server }, { $push: { users: user } }, (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log(`User ${user} added to server ${server}`);
            client.close();
            callback();
        });
    });
}

/**
 * Get a specific user from a specific server
 * @param {*} id 
 * @param {*} server 
 * @param {*} callback 
 */
function getUser(id, server, callback) {
    MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
            console.log(err);
            return;
        }
        const db = client.db('discord-data');
        const collection = db.collection('servers');
        collection.findOne({ id: server }, (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            client.close();
            callback(result.users.find(user => user.id === id));
        });
    });
}

function getUserByName(name, server, callback) {
    MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
            console.log(err);
            return;
        }
        const db = client.db('discord-data');
        const collection = db.collection('servers');
        collection.findOne({ id: server }, (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            client.close();
            callback(result.users.find(user => user.name === name));
        });
    });
}





/**
 * Update a user in a specific server
 * @param {*} user 
 * @param {*} server 
 */
function updateUser(user, server, callback) {
    MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
            console.log(err);
            return;
        }
        const db = client.db('discord-data');
        const collection = db.collection('servers');
        collection.updateOne({ id: server }, { $set: { users: user } }, (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log(`User ${user} updated in server ${server}`);
            client.close(); 
            callback();
        });
    });
}

/**
 * Remove a user from a specific server
 * @param {*} user 
 * @param {*} server 
 * @param {*} callback 
 */
function removeUser(user, server, callback) {
    MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
            console.log(err);
            return;
        }
        const db = client.db('discord-data');
        const collection = db.collection('servers');
        collection.updateOne({ id: server }, { $pull: { users: { id: user } } }, (err, result) => {
            if (err) {
                console.log(err);
                return;
            }  
            console.log(`User ${user} removed from server ${server}`);
            client.close();
            callback();
        });
    });
}
            
module.exports = {
    addServer,
    getServer,
    removeServer,
    clearServerUsers,
    addUser,
    getUser,
    updateUser,
    removeUser
}