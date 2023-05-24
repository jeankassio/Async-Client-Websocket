# Async Client Websocket
Async Client Websocket is an asynchronous Websocket Client built with the aim of making your connection lighter and more functional.

Simple to use and has only the "send" and "disconnect" functions as synchronous.

## Access file

Import the AsyncClientWebSocket.js file to your server, or use the CDN:

https://cdn.jsdelivr.net/gh/jeankassio/Async-Client-Websocket@main/src/AsyncClientWebSocket.min.js

## How to use

```javascript
const Server = new WebSocketClient('wss://your_wss.com');

Server.onOpen = (event) => {
		
  /*
    Your actions on opening
  */
		
};

Server.onClose = (event) => {
		
  /*
    Your actions on opening
    Connect again is an example
  */
    
  wsConnect();
		
};

Server.onMessage = (message) => {
		
  /*
    Your actions on opening
    FilterMessage is an example
  */
  
  filterMessage(message);
		
};

Server.onError = (error) => {
		
		/*
    Your actions on Error
    */
		
};
	
function wsSend(message) {
  Server.send(message);
}

function wsClose() {
  Server.disconnect();
}
	
async function wsConnect(){
	 
  try{
    
    await Server.connect();
		
  }catch(error){
		
    console.error('Error while connecting WebSocket:', error);
		
  }
		
}
```
