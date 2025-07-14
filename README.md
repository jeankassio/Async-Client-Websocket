# Async Client Websocket
Async Client Websocket is an asynchronous Websocket Client built with the aim of making your connection lighter and more functional.

## Access file

Import the AsyncClientWebSocket.js file to your server, or use the CDN:

https://cdn.jsdelivr.net/gh/jeankassio/Async-Client-Websocket@main/src/AsyncClientWebSocket.min.js

## How to use

```javascript
const Server = new WebSocketClient('wss://your_wss.com');

//Methods:
Server.connect(timeout = 5000);
Server.send(message);
Server.disconnect();
Server.destroy();
Server.isConnected();
Server.saveQueueOnLocalStorage(status);
Server.startKeepAlive(interval = 15000, ping); //"ping" is the word that your server will receive as a ping if you use a word other than "ping"
Server.stopKeepAlive();
Server.trackLatency(interval = 10000, ping, pong); //"ping" and "pong" is the word that your server will receive as a ping if you use a word other than "ping"/"pong"
Server.untrackLatency();
Server.getLatency();
Server.autoReconnect(interval = 3000, maxAttemps = infinity, callback = null);
Server.preventSpam(interval = 100); //"interval" is the minimum time allowed between one message and another message
Server.allowSpam();
Server.log(status = true);
Server.setOutgoingMiddleware(fn);
Server.setIncomingMiddleware(fn);


//Events
Server.onOpen = (event) => {
		
};

Server.onClose = (event) => {
  		
};

Server.onMessage = (message) => {
		
};

Server.onError = (error) => {
		
};


Server.onSpam = (message) => {
	
};

Server.onVerbose = (verboseMessage) => {

};

Server.onLatency = (latency) => {

};


function wsSend(message) {
  Server.send(message);
}

function wsClose() {
  Server.disconnect();
}
	
async function wsConnect(){
	 
  await Server.connect();
		
}
```
