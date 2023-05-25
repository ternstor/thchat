// const express = require('express');
// const app = express();
// const http = require('http');
// const server = http.createServer(app);
// const { Server } = require("socket.io");
// const { MongoClient } = require("mongodb");

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { MongoClient } from 'mongodb';

const app = express();
const server = http.createServer(app);
const corsUrl = process.env.NODE_ENV === 'production' ? 'http://34.207.211.78:3000' : 'http://localhost:3000';
const io = new Server(server, {
  cors: {
    origin: corsUrl
  }
});

const client = new MongoClient('mongodb://127.0.0.1:27017/');
const db = client.db('default-room');
const usersCollection = db.collection('users');
const messagesCollection = db.collection('messages');

async function initializeData() {
    const usersCount = await usersCollection.countDocuments();
    if (usersCount === 0) {
      await usersCollection.insertMany([
        {username: "funky_fox", color: "#F9F5F6", initials: "FF"},
        {username: "blind_pig", color: "#F8E8EE", initials: "BP"},
        {username: "dancing_yak", color: "#FDCEDF", initials: "DY"},
      ]);
    }

    const messagesCount = await messagesCollection.countDocuments();
    if (messagesCount === 0) {    
      await messagesCollection.insertMany([
        {username: "funky_fox", timestamp: new Date(), content: "hello all!"},
        {username: "blind_pig", timestamp: new Date(), content: "welcome"},
        {username: "dancing_yak", timestamp: new Date(), content: "sup"},
      ]);
    }
}

async function getUsersMap(users) {
    let usersMap = {};
    for (const user of users) {
        usersMap[user.username] = {
            color: user.color,
            initials: user.initials,
        }
    }
    return usersMap;
}

async function run() {
    await initializeData();

    io.on("connection", (socket) => {
        socket.on('init', async (newUser) => {
            usersCollection.insertOne(newUser);
            const users = await usersCollection.find().toArray();
            const messages = await messagesCollection.find().toArray();
            const data = {users: await getUsersMap(users), messages: messages};
            socket.emit('init.done', data);
        });
        socket.on('message.new', async (newMessage) => {
            messagesCollection.insertOne(newMessage);
            const user = await usersCollection.findOne({username: newMessage.username});
            const data = {user: await getUsersMap([user]), message: newMessage};
            io.emit('message.ack', data);
        });
    });

    server.listen(4000);
}

run()