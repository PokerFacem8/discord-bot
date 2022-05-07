require('dotenv').config();
const { MongoClient } = require('mongodb');

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
function addUser(user, server) {
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
        });
    });
}

/**
 * Get a specific user from a specific server
 * @param {*} id 
 * @param {*} server 
 * @param {*} callback 
 */
function getUserFromServer(id, server, callback) {
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



module.exports = {
    addServer,
    getServer,
    clearServerUsers,
    addUser,
    getUserFromServer
}