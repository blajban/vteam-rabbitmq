#!/usr/bin/env node

const amqp = require('amqplib/callback_api');
const mqHost = "amqp://localhost";

const { MongoClient } = require('mongodb');


amqp.connect(mqHost, function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }

        const queue = 'bikes';

        channel.assertQueue(queue, {
            durable: false
        });

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

        channel.consume(queue, function(msg) {
            console.log(" [x] Received %s", msg.content);
            add_log_msg(msg.content.toJSON()).catch(console.error);
        }, {
            noAck: true
        });
    });
});


const uri = "mongodb://root:example@localhost:27017/";

async function add_log_msg(message){
    const client = new MongoClient(uri);

    try {
        await client.connect();
        await addBike(client, message);
        await countItems(client);

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function countItems(client) {
    const count = await client.db("bikes").collection("log").count()
    console.log(`Number of logs in db: ${count}`)
}

async function addBike(client, newLog){
    const result = await client.db("bikes").collection("log").insertOne(newLog);
    console.log(`New log entry with id: ${result.insertedId}`);
}

