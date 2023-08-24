import Cell from './cell.js';
export default class WebSocketClient {

    constructor(renderer) {
        this.socket = null;
        this.isConnected = false;
        this.renderer = renderer;
    }

    async connect(url) {
        try {
            await new Promise((resolve, reject) => {
                this.socket = new WebSocket(url);
                this.socket.binaryType = 'arraybuffer';

                this.socket.addEventListener('open', this.onOpen = () => {
                    console.log('Connection open');
                    this.isConnected = true;
                    this.renderer.isDrawStars = false;
                    resolve();
                });

                this.socket.addEventListener('error', this.onError = (event) => {
                    console.error('WebSocket error: ', event);
                    reject(new Error('WebSocket error'));
                });

                this.socket.addEventListener('message', this.onMessage = (event) => {
                    // 获取原始的ArrayBuffer数据
                    var rawData = event.data;

                    // 使用MessagePack的decode函数进行反序列化
                    var decodedData = MessagePack.decode(rawData);
                });

                this.socket.addEventListener('close', this.onClose = (event) => {
                    if (this.isConnected) {
                        this.renderer.isDrawStars = true;
                    }
                    console.log('Connection closed');
                    this.isConnected = false;
                    this.cleanUp();
                    if (event.wasClean) {
                        resolve();
                    } else {
                        reject(new Error('WebSocket error: Connection closed unexpectedly'));
                    }
                });
            });
        } catch (error) {
            this.isConnected = false;
            console.error('Failed to connect: ', error);
        }
    }

    send(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(data);
        }
    }

    close() {
        return new Promise((resolve, reject) => {
            if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
                reject(new Error('Socket is not open'));
                return;
            }

            this.socket.addEventListener('close', this.onClose);
            this.socket.addEventListener('error', this.onError);

            this.socket.close();
        });
    }

    getState() {
        if (!this.socket) {
            return 'UNINITIALIZED';
        }

        switch (this.socket.readyState) {
            case WebSocket.CONNECTING:
                return 'CONNECTING';
            case WebSocket.OPEN:
                return 'OPEN';
            case WebSocket.CLOSING:
                return 'CLOSING';
            case WebSocket.CLOSED:
                return 'CLOSED';
            default:
                return 'UNKNOWN';
        }
    }

    cleanUp() {
        if (this.socket) {
            this.socket.removeEventListener('open', this.onOpen);
            this.socket.removeEventListener('error', this.onError);
            this.socket.removeEventListener('message', this.onMessage);
            this.socket.removeEventListener('close', this.onClose);
        }
    }
}

function ArrayToCell(array) {
    return new Cell(array[0], array[1], array[2]);
}