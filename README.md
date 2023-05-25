# Th Chat

## Dependencies

Install yarn, node, mongodb through your platform's package manager.

## Available Scripts

### `yarn install`

Install dependencies.

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `node server.mjs`

Starts the websocket server at [http://localhost:4000](http://localhost:4000).

## Technical Overview

I focused on the three primary requirements.

# Client

There is a single default chat room. Client-side, there are two primary
data structures: a list of `messages`, and a map of `users`. These two
are related to each other through the `username` field. The client
picks a random username and color which is persisted server side once
a message is sent.

### Server

The server uses socket.io and mongodb to persist messages and user data.

### Events

There are four client and server events managed through a websocket:
* `init`: fetch of initial message and user data from the server
* `init.done`: initial data is returned and user data from the server
* `message.new`: new message is sent
* `message.ack`: new message and user data is broadcast to all clients

## Time Worked

10-12 hours
