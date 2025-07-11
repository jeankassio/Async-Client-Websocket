/*!
 * Async Client Websocket v1.2.5
 * by Jean Kássio
 *
 * More info:
 * https://jeankassio.dev
 *
 * Copyright Jean Kássio
 * Released under the MIT license
 * https://github.com/jeankassio/Async-Client-Websocket/blob/main/LICENSE
 *
 * @preserve
 */

class WebSocketClient{
	
	constructor(url){
		
		this.url = url;
		this.socket = null;
		this.onOpen = null;
		this.onClose = null;
		this.onMessage = null;
		this.onError = null;
		this.onSpam = null;
		this.onVerbose = null;
		this.onLatency = null;
		this._autoReconnect = false;
		this.reconnectAttemps = 0;
		this.messageQueue = [];
		this.keepAliveInterval = null;
		this.recordLatency = false;
		this.ping = "ping";
		this.pong = "pong";
		this.verbose = false;
		this.spamTime = null;
		this.lastSendTime = 0;
		this.outgoingMiddleware = null;
		this.incomingMiddleware = null;

	}

	connect(timeout = 5000){
		
		return new Promise((resolve, reject) => {
			
			const timer = setTimeout(() => {
				
				this._log("Connection Timeout");
				reject(new Error("Connection timeout"));
				
			}, timeout);
			
			this.socket = new WebSocket(this.url);

			this.socket.onopen = (event) => {
				
				if(timer){
					clearTimeout(timer);
				}
				
				if(this.onOpen){
					this.onOpen(event);
				}
				
				if(this.queueLocalStorage){
					loadQueue();
				}
				
				while(this.messageQueue.length > 0){
					
					const msgQueue = this.messageQueue.shift();
					
					this._log("Sending queue message:", msgQueue);
					this.socket.send(msgQueue);
					
				}
				
				resolve();
				
			};

			this.socket.onmessage = (event) => {
				
				let message = event.data;
				
				this._log("Received Message:", message);
				
				if(this.incomingMiddleware){
					message = this.incomingMiddleware(message);
					this._log("Incoming Middleware return:", message);
				}
				
				if(this.onMessage){
					
					if(this.recordLatency && message === this.pong){
						
						this.latencyTimestamp = Date.now();
						this.latency = this.latencyTimestamp - this.lastPingTimestamp;
						
						if(this.onLatency){
							this.onLatency(this.latency);
						}
						
						this._log("Calculated latency:", this.latency);
						
					}else{
						this.onMessage(message);
					}
					
				}
				
			};

			this.socket.onerror = (error) => {
				
				if(this.onError){
					this.onError(error);
				}
				
				this._log("Error found:", error);
				
				reject();
				
			};

			this.socket.onclose = (event) => {
				
				if(this.onClose){
					this.onClose(event);
				}
				
				this._log("Connection closed");
				
				this._attemptReconnect();
				
			};
			
		});
		
	}

	send(message){
		
		if(this.outgoingMiddleware){
			message = this.outgoingMiddleware(message);
		}
		
		if(this.socket && this.socket.readyState === WebSocket.OPEN){
			
			if(this.spamTime){
				
				const now = Date.now();
				
				if((now - this.lastSendTime) > this.spamTime){
					
					this.socket.send(message);
					this._log("Send message:", message);
					this.lastSendTime = now;
					
				}else{
					
					if(this.onSpam){
						this.onSpam(message);
					}
					
					this._log("Message detected has Spam:", message);
					
				}
				
			}else{
				this.socket.send(message);
				this._log("Send message:", message);
			}
			
		}else{
			this.messageQueue.push(message);
			
			if(this.queueLocalStorage){
				saveQueue(this.messageQueue);
			}
			
			this._log("Websocket is not open! Putting message in queue");
		}
		
	}

	disconnect(){
		
		if(this.socket){
			this.socket.close();
			this._log("Websocket disconnected");
		}
		
	}
	
	destroy(){
		
		this._autoReconnect = false;
		this.disconnect();
		this.stopKeepAlive();
		this.socket = null;
		
		this._log("Websocket destroyed");
		
	}
	
	isConnected(){
		
		const status = (this.socket && this.socket.readyState === WebSocket.OPEN);
		this._log("isConnected was called, result:", status);
		return status;
		
	}
	
	loadQueue(){
		
		const savedMessages = localStorage.getItem('wsclient-queue');
		
		if(savedMessages){
			this.messageQueue = JSON.parse(savedMessages);
		}
		
	}
	
	saveQueue(queue){
		
		localStorage.setItem('wsclient-queue', JSON.stringify(this.messageQueue));
		
	}
	
	saveQueueOnLocalStorage(status){
		
		this.queueLocalStorage = status;
		
	}
	
	startKeepAlive(interval = 15000, ping){
		
		if(ping){
			this.ping = ping;
			this._log("Set ping name:", ping);
		}
		
		if(this.keepAliveInterval){
			this._log("KeepAlive is already running, disabling");
			clearInterval(this.keepAliveInterval);
		}
		
		this.keepAliveInterval = setInterval(() => {
			
			this._log("Send ping to KeepAlive");
			
			if(this.isConnected()){
				this.send(this.ping);
				this._log("Ping to KeepAlive sended:", this.ping);
			}else{
				this._log("Websocket is not connected");
			}
			
		}, interval);
		
	}
	
	stopKeepAlive(){
		
		this._log("Stopping KeepAlive");
		
		if(this.keepAliveInterval){
			clearInterval(this.keepAliveInterval);
			this._log("KeepAlive stopped");
		}else{
			this._log("KeepAlive is not running");
		}
		
	}
	
	getLatency(){
		return this.latency;
	}
	
	untrackLatency(){
		
		this.recordLatency = false;
		
		this._log("Untracking latency");
		
		if(this.pingInterval){
			clearInterval(this.pingInterval);
			this._log("Track latency stopped");
		}else{
			this._log("Track latency is not running");
		}
		
	}
	
	trackLatency(ping, pong, interval = 10000){
		
		this._log("Starting track latency");
		
		this.recordLatency = true;
		
		this.lastPingTimestamp = Date.now();
		
		if(ping){
			this.ping = ping;
			this._log("Set ping name:", ping);
		}
		
		if(pong){
			this.pong = pong;
			this._log("Set pong name:", pong);
		}
		
		this.pingInterval = setInterval(() => {
			
			this.lastPingTimestamp = Date.now();
			this.send(this.ping);
			this._log("Send ping to latency:", this.ping);
			
		}, interval);
		
	}
	
	autoReconnect(interval = 3000, maxAttemps = Infinity, callback = null){
		
		this._autoReconnect = true;
		this.reconnectInterval = interval;
		this.maxReconnectAttemps = maxAttemps;
		this.reconnectCallback = callback;
		
		this._log("Auto reconnect activated");
		
	}
	
	allowSpam(){
		this.spamTime = null;
	}
	
	preventSpam(interval = 100){
		this.spamTime = interval;
	}
	
	log(status = true){
		this.verbose = status;
	}
	
	setOutgoingMiddleware(fn){
		this.outgoingMiddleware = fn;
	}

	setIncomingMiddleware(fn){
		this.incomingMiddleware = fn;
	}
	
	_log(...args){
		
		if(this.verbose){
			
			console.log("[WebSocketClient]", ...args);
			
			if(this.onVerbose){
				
				this.onVerbose(...args);
				
			}
			
		}
		
	}
	
	_attemptReconnect(){
		
		if(!this._autoReconnect || this.reconnectAttemps >= this.maxReconnectAttemps){
			return;
		}
		
		setTimeout(() => {
			
			this.connect().then(() => {
				
				this._log("Websocket reconnected successfully");
				
				this.reconnectAttemps = 0;
				
				if(this.reconnectCallback){
					this.reconnectCallback();
					this._log("Reconnect callback was called");
				}
				
			}).catch(() => {
				
				this._log("Error reconnecting Websocket");
				
				this.reconnectAttemps++;
				this._attemptReconnect();
				
			});
			
		}, this.reconnectInterval);
		
	}
	
}
