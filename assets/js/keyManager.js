export default class KeyManager {
    constructor(buttons) {
        this.buttons = buttons; // 保存按钮的引用
        this.keybinds = {};

        // 从浏览器的 localStorage 中读取所有按键配置
        const storedKeybinds = localStorage.getItem('keybinds');
        if (storedKeybinds) {
            this.keybinds = JSON.parse(storedKeybinds);
        } else {
            // 如果没有存储的按键配置，就从当前的按键菜单中读取配置
            this.initializeKeybindsFromButtons();
        }

        this.updateButtonsFromKeybinds();
    }

    initializeKeybindsFromButtons() {
        this.buttons.forEach(button => {
            let keybindId = button.id;
            if (keybindId.startsWith('keybind-')) {
                keybindId = keybindId.substring('keybind-'.length);
                this.keybinds[keybindId] = button.textContent;
            }
        });
    }

    updateButtonsFromKeybinds() {
        this.buttons.forEach(button => {
            let keybindId = button.id;
            if (keybindId.startsWith('keybind-')) {
                keybindId = keybindId.substring('keybind-'.length);
                const keybind = this.getKeybind(keybindId);
                if (keybind) {
                    button.textContent = keybind.toUpperCase();
                }
            }
        });
    }

    // 添加或更新一个按键配置
    setKeybind(id, key) {
        this.keybinds[id] = key;
        this.updateButtonsFromKeybinds(); // 更新按钮的文本内容
    }

    // 获取一个按键配置
    getKeybind(id, defaultValue = '') {
        return this.keybinds[id] || defaultValue;
    }

    // 获取所有按键配置
    getAllKeybinds() {
        return this.keybinds;
    }

    // 保存所有按键配置到浏览器的 localStorage
    saveKeybinds() {
        localStorage.setItem('keybinds', JSON.stringify(this.keybinds));
    }
}