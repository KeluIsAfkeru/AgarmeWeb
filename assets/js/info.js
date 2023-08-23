export default class Info {

    constructor() {
        this.messageContainer = document.getElementById('message-container');
        this.queue = [];
    }

    showMessage(message, type) {
        // 将消息加入队列
        this.queue.push({
            message,
            type
        });

        // 显示下一条消息
        this.showNextMessage();
    }

    showNextMessage() {
        if (this.queue.length > 0) {
            const {
                message,
                type
            } = this.queue.shift();

            // 创建新的消息框
            let messageBox = document.createElement('div');
            messageBox.classList.add('message-box');

            // 显示消息
            messageBox.style.opacity = 1;
            messageBox.style.transform = 'scale(1)';
            messageBox.style.animation = 'zoomOpen 0.55s ease forwards';

            let msg = document.createElement('div');
            msg.classList.add('message-text');
            msg.classList.add('message', type);
            msg.innerHTML = message;

            messageBox.appendChild(msg);
            this.messageContainer.appendChild(messageBox);

            setTimeout(() => {
                messageBox.style.transform = 'scale(0)';
                messageBox.style.animation = 'zoomClose 0.5s ease forwards';

                messageBox.addEventListener('animationend', () => {
                    this.messageContainer.removeChild(messageBox);
                    // 不再呼叫 showNextMessage
                }, {
                    once: true
                });
            }, 3000);
        }
    }

    connectionError(name) {
        this.showMessage(`连接服务器[${name}]失败,请检查网络配置是否正确`, 'error');
    }

    connectionSuccess(name) {
        this.showMessage(`成功连接到[${name}]`, 'success');
    }

    processSettingSuccess() {
        this.showMessage('读取加载配置成功，准备第一次连接服务器......', 'success');
    }

    saveSettingSuccess() {
        this.showMessage('保存配置成功', 'success');
    }

    waiting() {
        this.showMessage('正在等待响应...', 'info');
    }

}