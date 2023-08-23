export default class Info {

    constructor() {
        this.messageBox = document.getElementById('message-box');
        this.queue = [];
    }

    showMessage(message, type) {
        // 将消息加入队列
        this.queue.push({
            message,
            type
        });

        // 如果消息框没有显示,直接显示下一条
        if (!this.messageBox.classList.contains('show')) {
            this.showNextMessage();
        }
    }

    showNextMessage() {
        if (this.queue.length > 0) {
            const {
                message,
                type
            } = this.queue.shift();

            // 显示消息
            this.messageBox.style.opacity = 1;
            this.messageBox.style.transform = 'scale(1)';
            this.messageBox.style.animation = 'zoomOpen 0.35s ease forwards';

            let msg = document.createElement('div');
            msg.classList.add('message-text');
            msg.classList.add('message', type);
            msg.innerHTML = message;

            this.messageBox.innerText = ''
            this.messageBox.appendChild(msg);
            this.messageBox.classList.add('show');

            setTimeout(() => {
                this.messageBox.style.transform = 'scale(0)';
                this.messageBox.style.animation = 'zoomClose 0.4s ease forwards';

                this.messageBox.addEventListener('animationend', () => {
                    this.messageBox.classList.remove('show');
                    this.showNextMessage();
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