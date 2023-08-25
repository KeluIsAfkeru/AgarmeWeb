import Cell from './cell.js';
import Map from './map.js';

const Protocol = {
    SendIP: 19,
    ReceiveInitial: 15, // 连接成功后接收到初始静态数据
};

export default class WebSocketClient {

    constructor(renderer) {
        this.socket = null;
        this.isConnected = false;
        this.renderer = renderer;
        this.ip = '';
        getUserIP()
            .then(ipAddress => this.ip = ipAddress)
            .catch(error => console.log('Error: ', error));
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

                    // 转换 IP 地址为字节数组
                    let encoder = new TextEncoder();
                    let ipBytes = encoder.encode(this.ip);

                    // 创建新的字节数组，第一个字节为19，后面跟着 IP 地址的字节
                    let dataBytes = new Uint8Array(1 + ipBytes.length);
                    dataBytes[0] = Protocol.SendIP;
                    dataBytes.set(ipBytes, 1);

                    // 发送字节数组到服务器
                    this.socket.send(dataBytes);

                    resolve();
                });

                this.socket.addEventListener('error', this.onError = (event) => {
                    if (this.isConnected) {
                        this.renderer.isDrawStars = true;
                        this.renderer.map = new Map(50, 50, 500, 500);
                    }
                    console.error('WebSocket error: ', event);
                    reject(new Error('WebSocket error'));
                });

                this.socket.addEventListener('message', this.onMessage = (event) => {
                    let bytes = new Uint8Array(event.data);
                    let header = bytes[0];

                    switch (header) {
                        case Protocol.ReceiveInitial:
                            let view = new DataView(bytes.buffer);
                            let playerId = view.getUint32(1, true); // 从偏移量1开始，读取4个字节
                            let mapLeft = view.getFloat64(5, true); // 从偏移量5开始（1 + 4），读取8个字节
                            let mapTop = view.getFloat64(13, true); // 从偏移量13开始（1 + 4 + 8），读取8个字节
                            let mapWidth = view.getFloat64(21, true); // 从偏移量21开始（1 + 4 + 8 + 8），读取8个字节
                            let mapHeight = view.getFloat64(29, true); // 从偏移量29开始（1 + 4 + 8 + 8 + 8

                            this.renderer.routerId = playerId;
                            this.renderer.map = new Map(mapLeft, mapTop, mapWidth, mapHeight);

                            break;
                        default:
                            console.log("undefined header")
                            break;
                    }

                    // // 使用MessagePack的decode函数进行反序列化
                    // var decodedData = MessagePack.decode(rawData);
                    // console.log(decodedData);
                });

                this.socket.addEventListener('close', this.onClose = (event) => {
                    if (this.isConnected) {
                        this.renderer.isDrawStars = true;
                        this.renderer.map = new Map(50, 50, 500, 500);
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
            this.socket.removeEventListener('message', this.onMessage);
            this.socket.removeEventListener('open', this.onMessage);
            this.socket.removeEventListener('error', this.onMessage);
            this.socket.removeEventListener('close', this.onMessage);

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

function arrayToCell(array) {
    return new Cell(array[0], array[1], array[2]);
}

function getUserIP() {
    return new Promise((resolve, reject) => {
        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => resolve(data.ip))
            .catch(error => reject(error));
    });
}