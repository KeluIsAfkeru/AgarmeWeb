import ChatManager from './chatManager.js';
import LeaderBoard from './leaderBoard.js';
import KeyManager from './keyManager.js';
import WebSocketClient from './webSocket.js';
import Cell from './cell.js';
import Info from './info.js';
import {
    Draw
} from './draw.js';
import StatusMessage from './info.js';

import {
    saveSettings,
    updateControls,
    loadSettings,
} from './settingsManager.js';

const status = new Info();
const serverIp = "http://127.0.0.1:5500";
let currentServer = null;
let defaultServers = [{
        name: '本地1',
        ip: 'ws://localhost:8080/Chat'
    },
    {
        name: '本地2',
        ip: 'ws://localhost:6666/'
    },
    {
        name: '本地3',
        ip: 'ws://localhost:443/'
    },
    {
        name: '本地4',
        ip: 'ws://localhost:5555/'
    },
    {
        name: '本地5',
        ip: '127.0.0.1:6666'
    },
    {
        name: '本地6',
        ip: '127.0.0.1:6666'
    },
    {
        name: '本地7',
        ip: '127.0.0.1:6666'
    }
    // ...更多服务器
];
let servers;
let lastWidth = window.innerWidth;
let lastHeight = window.innerHeight;

/* 初始化pixiJS */
let app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    transparent: true,
});
let renderer = new Draw(app);
renderer._isDrawStars = true;
const client = new WebSocketClient(renderer);
document.getElementById('pixi-container').appendChild(app.view);

var canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var ctx = canvas.getContext('2d');

var gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
gradient.addColorStop(0, '#000428');
gradient.addColorStop(1, '#000c1a');

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, canvas.width, canvas.height);

var texture = PIXI.Texture.from(canvas);
var sprite = new PIXI.Sprite(texture);

sprite.width = app.renderer.width;
sprite.height = app.renderer.height;

app.stage.addChild(sprite);

window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    if (newWidth !== lastWidth || newHeight !== lastHeight) {
        canvas.width = newWidth;
        canvas.height = newHeight;

        gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, '#000428');
        gradient.addColorStop(1, '#000c1a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, newWidth, newHeight);

        if (texture) {
            texture.update();
        }

        if (sprite) {
            sprite.width = app.renderer.width;
            sprite.height = app.renderer.height;
        }

        app.renderer.resize(newWidth, newHeight);

        lastWidth = newWidth;
        lastHeight = newHeight;
    }
});

renderer.isDrawStars = true;

/* 初始化服务器列表配置 */
try {
    servers = JSON.parse(localStorage.getItem('servers'));
} catch (error) {
    console.error('Error reading servers from LocalStorage', error);
}

if (!servers) {
    servers = defaultServers;
}

function saveServersToLocalStorage(servers) {
    try {
        localStorage.setItem('servers', JSON.stringify(servers));
    } catch (error) {
        console.error('Error saving servers to LocalStorage', error);
    }
}

saveServersToLocalStorage();

/* 初始化加载按键配置 */
const keyManager = new KeyManager(Array.from(document.querySelectorAll('#keybind-panel button[id^="keybind-"]')));

/* 初始化加载游戏配置 */
function initSettings() {
    const cached = loadSettings();
    updateControls(cached);
    if (cached !== null) { // 如果有缓存配置
        return;
    }

    // 生成默认配置
    const defaults = {
        showNames: true,
        showMass: true,
        showMapBorder: true,
        showMapGrid: true,
        showSkin: true,
        showFood: true,
        showLine: true,
        showMiniMap: true,
        showCellBorder: true,
        autoZoom: false
    };
    saveSettings(defaults); // 保存默认配置到缓存中
    updateControls(defaults);
}
initSettings();
status.processSettingSuccess();

document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});

/* stars */

/* 阻止某些案件行为 */
window.addEventListener('wheel', function (e) {
    if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
    }
}, {
    passive: false
});

document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});

/**服务器面板右键菜单 */
var contextMenu = document.getElementById('context-menu');
var serverPanel = document.getElementById('server-panel');

let targetServer = null;
renderServerList();


// currentServer.name = servers[0].name;
// currentServer.ip = servers[0].ip;

function addServer(name, ip) {
    servers.push({
        name: name,
        ip: ip
    });
    saveServersToLocalStorage(servers);
    renderServerList();
}

function editServer(index, name, ip) {
    servers[index] = {
        name: name,
        ip: ip
    };
    saveServersToLocalStorage(servers);
    renderServerList();
}

function deleteServer(index) {
    var deletedServer = servers[index];

    servers.splice(index, 1);

    // 如果删除的是当前服务器，更新currentServer
    if (deletedServer.ip === currentServer.ip && deletedServer.name === currentServer.name) {
        if (servers.length > 0) {
            currentServer = servers[0]; // 更新为列表中的第一个服务器
        } else {
            currentServer = null; // 如果列表为空，则设为null
        }
    }
    saveServersToLocalStorage(servers);

    renderServerList();
}

function renderServerList() {
    var serverList = document.getElementById('server-list').children[0];
    serverList.innerHTML = '';

    // 生成 li 元素
    for (let i = 0; i < servers.length; i++) {
        let li = document.createElement('li');
        li.textContent = servers[i].name;
        li.setAttribute('data-ip', servers[i].ip);
        li.setAttribute('data-index', i);

        // 如果 currentServer 对应当前的 li 元素，选中它
        if (currentServer && servers[i].ip === currentServer.ip && servers[i].name === currentServer.name) {
            li.classList.add('selected');
        }

        serverList.appendChild(li);
    }

    // 如果 currentServer 是空的或未定义，选择第一个
    if (!currentServer && serverList.children.length > 0) {
        currentServer = servers[0]; // 更新 currentServer
        serverList.children[0].classList.add('selected');
    }

    // 绑定点击事件
    addServerListClickHandlers();
}

function addServerListClickHandlers() {

    let items = document.querySelectorAll('#server-list li');

    items.forEach(item => {
        item.addEventListener('click', () => {
            // 更新 currentServer 的引用，而不是它的属性
            currentServer = servers[item.dataset.index];

            // 先删除其他的 selected  
            items.forEach(item => {
                item.classList.remove('selected');
            });

            // 添加到当前点击的
            item.classList.add('selected');

            tryClose();
            tryConnect();
        });
    });
}

function getCurrentServer() {
    return currentServer;
}

// 在页面加载时渲染初始服务器列表
renderServerList();

// 只监听服务器面板的右键点击事件
serverPanel.addEventListener('contextmenu', function (e) {
    // 阻止默认的右键菜单显示
    e.preventDefault();

    targetServer = e.target.closest('li');

    // 显示我们自定义的右键菜单
    contextMenu.style.display = 'block';
    contextMenu.style.left = e.pageX + 'px';
    contextMenu.style.top = e.pageY + 'px';
});

// 当点击其他地方时，隐藏我们的右键菜单
window.addEventListener('click', function (e) {
    // 如果点击的是菜单项，那么不关闭菜单
    if (e.target.closest("#context-menu")) return;

    contextMenu.style.display = 'none';
});

// 添加服务器
document.getElementById('add-server').addEventListener('click', function (e) {
    var serverName = window.prompt('请输入服务器名称');
    var serverAddress = window.prompt('请输入服务器地址');

    if (serverName && serverAddress) {
        console.log('添加服务器', serverName, serverAddress);

        addServer(serverName, serverAddress);
    }

    contextMenu.style.display = 'none';
});

// 编辑服务器
document.getElementById('edit-server').addEventListener('click', function (e) {
    if (targetServer) {
        var index = Number(targetServer.getAttribute('data-index'));
        var serverName = window.prompt('请输入新的服务器名称', servers[index].name);
        var serverAddress = window.prompt('请输入新的服务器地址', servers[index].ip);
        if (serverName && serverAddress) {
            editServer(index, serverName, serverAddress);
        }
    }

    contextMenu.style.display = 'none';
});

// 删除服务器
document.getElementById('delete-server').addEventListener('click', function (e) {
    if (targetServer) {
        var index = Number(targetServer.getAttribute('data-index'));
        var confirmDelete = window.confirm('您确定要删除服务器 ' + servers[index].name + ' 吗？');
        if (confirmDelete) {
            deleteServer(index);
        }
    }

    contextMenu.style.display = 'none';
});

/* 按键处理 */
var mainPanel = document.getElementById('main-panel');
var serverPanel = document.getElementById('server-panel');
var isPanelVisible = true;
var isKeyDown = false; // 用来记录Esc键是否被按下

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !isKeyDown) { // 检查Esc键是否被按下
        if (isPanelVisible) {
            mainPanel.classList.remove('panel-visible');
            mainPanel.classList.add('panel-hidden');
            serverPanel.classList.remove('panel-visible');
            serverPanel.classList.add('panel-hidden');
        } else {
            mainPanel.classList.remove('panel-hidden');
            mainPanel.classList.add('panel-visible');
            serverPanel.classList.remove('panel-hidden');
            serverPanel.classList.add('panel-visible');
        }
        isPanelVisible = !isPanelVisible;
        isKeyDown = true; // 设置Esc键已经被按下
    }
});

document.addEventListener('keyup', function (e) {
    if (e.key === 'Escape') {
        isKeyDown = false;
    }
});


/* 按钮点击 */
let playerName;
let skinUrl;

document.getElementById('start-button').addEventListener('click', function () {
    playerName = document.getElementById('name').value;
    skinUrl = document.getElementById('skin').value;
    // 写按钮被单机的逻辑...
    //...
    mainPanel.classList.remove('panel-visible');
    mainPanel.classList.add('panel-hidden');
    serverPanel.classList.remove('panel-visible');
    serverPanel.classList.add('panel-hidden');
    isPanelVisible = false;
    isKeyDown = false;
});

document.getElementById('watch-button').addEventListener('click', function () {
    // 这里可以处理观战的逻辑...
    console.log('观战');
    mainPanel.classList.remove('panel-visible');
    mainPanel.classList.add('panel-hidden');
    serverPanel.classList.remove('panel-visible');
    serverPanel.classList.add('panel-hidden');
    isPanelVisible = false;
    isKeyDown = false;
});

/* 皮肤预览框事件 */
var skinInput = document.querySelector('#skin');
var skinPreview = document.querySelector('.skin-preview');
var presentSkin;

// 当输入框失去焦点时...
skinInput.addEventListener('blur', function () {
    // 获取输入框的值
    var skinUrl = skinInput.value;

    // 将这个设置为皮肤预览的背景图像
    skinPreview.style.backgroundImage = 'url(' + skinUrl + ')';
});

let isTransitioning = false;

skinPreview.addEventListener('click', function (event) {
    event.stopPropagation();

    const skinContainer = document.querySelector('#skin-container');

    skinContainer.style.transition = 'none';
    skinContainer.offsetHeight;
    skinContainer.style.transition = '';

    if (skinContainer.style.transform === 'scale(1)') {
        skinContainer.style.transform = 'scale(0)';
    } else {
        fetch(`${serverIp}/skins.json`)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(skins => {
                skinContainer.innerHTML = '';

                skins.forEach(skin => {
                    const img = document.createElement('img');
                    img.src = `${serverIp}/skins/${skin.name}.png`;
                    skinContainer.appendChild(img);

                    img.addEventListener('click', function () {
                        if (isTransitioning) return;
                        skinUrl = skinInput.value = this.src;
                        skinPreview.style.backgroundImage = 'url(' + skinUrl + ')';

                        isTransitioning = true;
                        skinContainer.style.transform = 'scale(0)';
                    });
                });

                skinContainer.style.display = 'grid';
                setTimeout(() => {
                    skinContainer.style.transform = 'scale(1)';
                    isTransitioning = false;
                }, 20);
            })
            .catch(error => console.error('Error fetching skins:', error));
    }
});

window.addEventListener('click', function (e) {
    const skinContainer = document.querySelector('#skin-container');

    if (e.target !== skinContainer && !skinContainer.contains(e.target)) {
        if (isTransitioning) return;

        isTransitioning = true;
        skinContainer.style.transform = 'scale(0)';
    }
});

document.querySelector('#skin-container').addEventListener('transitionend', function () {
    if (this.style.transform === 'scale(0)') {
        this.style.display = 'none';
    }

    isTransitioning = false;
});


/* 关于菜单 */
var modal = document.getElementById('about-modal');
var btn = document.getElementById('about-btn');
var span = document.getElementsByClassName('close-btn')[0];

btn.onclick = function () {
    modal.classList.add("show");
}

span.onclick = function () {
    modal.classList.remove("show");
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.classList.remove("show");
    }
}

/* 聊天框 */
const chatManager = new ChatManager();
// Add a new message
chatManager.addMessage("系统消息", "欢迎来到Agare,客户端版本号[1.0.0]");
chatManager.addMessage("系统消息", "按下回车键可以输入或发送消息，Escape键隐藏或打开主页面板。");


/// ........在这里写处理接收的聊天数据
document.addEventListener('keyup', (event) => {
    const chatInput = document.querySelector('#chat-input');
    const value = chatInput.value.trim();

    if (event.key === 'Enter') {
        if (document.activeElement !== chatInput) {
            chatInput.style.visibility = 'visible';
            chatInput.style.opacity = '1';
            chatInput.focus();
        } else {
            if (playerName !== undefined && playerName !== null) {
                playerName = playerName.trim();
            } else {
                playerName = 'Unnamed Cell';
            }

            if (value === '') {
                chatInput.value = '';
                chatInput.blur();
                chatInput.style.visibility = 'hidden';
                chatInput.style.opacity = '0';
                return;
            }

            chatManager.addMessage(playerName, value);
            chatInput.value = '';
            chatInput.blur();
            chatInput.style.visibility = 'hidden';
            chatInput.style.opacity = '0';
        }
    }

});


/* 排行榜 */
const leaderboard = new LeaderBoard(); // 显示前10个玩家
// 添加10个玩家进行测试
leaderboard.addPlayer(`1`, `类C`, Math.floor(Math.random() * (28001 - 100 + 1)) + 100);
leaderboard.addPlayer(`2`, `HK`, Math.floor(Math.random() * (28001 - 100 + 1)) + 100);
leaderboard.addPlayer(`3`, `SJZ`, Math.floor(Math.random() * (28001 - 100 + 1)) + 100);
leaderboard.addPlayer(`4`, `断指`, Math.floor(Math.random() * (28001 - 100 + 1)) + 100);
leaderboard.addPlayer(`5`, `清程`, Math.floor(Math.random() * (28001 - 100 + 1)) + 100);
leaderboard.addPlayer(`6`, `归零`, Math.floor(Math.random() * (28001 - 100 + 1)) + 100);
leaderboard.addPlayer(`7`, `松子`, Math.floor(Math.random() * (28001 - 100 + 1)) + 100);
leaderboard.addPlayer(`8`, `agare`, Math.floor(Math.random() * (28001 - 100 + 1)) + 100);
leaderboard.addPlayer(`9`, `AAA泰山铜线批发🐭`, Math.floor(Math.random() * (28001 - 100 + 1)) + 100);
leaderboard.addPlayer(`10`, `破破烂烂，缝缝补补`, Math.floor(Math.random() * (28001 - 100 + 1)) + 100);


// 更新排行榜显示
leaderboard.updateLeaderboardDisplay();

/* 设置菜单 */
document.getElementById('setting-icon').addEventListener('click', () => {
    document.getElementById('setting-menu').classList.add('menu-show');
});

document.getElementById('close-button').addEventListener('click', () => {
    document.getElementById('setting-menu').classList.remove('menu-show');
});

// 保存按钮点击
document.getElementById('save-btn').addEventListener('click', () => {
    const menu = document.getElementById('setting-menu');
    const newSettings = {
        showNames: document.getElementById('show-names').checked,
        showMass: document.getElementById('show-mass').checked,
        showMapBorder: document.getElementById('show-borders').checked,
        showMapGrid: document.getElementById('show-grid').checked,
        showSkin: document.getElementById('show-skins').checked,
        showFood: document.getElementById('show-food').checked,
        showLine: document.getElementById('show-lines').checked,
        showMiniMap: document.getElementById('show-minimap').checked,
        showCellBorder: document.getElementById('show-cellBorders').checked,
        autoZoom: document.getElementById('auto-zoom').checked
    };

    menu.classList.remove('menu-show');
    saveSettings(newSettings);
    status.saveSettingSuccess();
    console.log(newSettings);
});

// 加载配置
let setting = loadSettings();

/* 键绑定面板 */
// 获取按键图标和面板
const keyIcon = document.querySelector('#key-icon');
const panel = document.querySelector('#keybind-panel');
const bg = document.querySelector('.modal-bg');
document.addEventListener('click', onDocumentClick);

// 点击按键图标时展开/收起面板
keyIcon.addEventListener('click', () => {

    // 切换面板的 show 类
    panel.classList.toggle('show');

    // 切换遮罩层的 show 类
    bg.classList.toggle('show');

    openPanel();
});

$(document).ready(function () {
    document.addEventListener('click', onDocumentClick);
});

function onDocumentClick(event) {
    const target = event.target;
    const panel = document.querySelector('#keybind-panel');

    // 判断点击的目标元素是否在按键设置面板之内
    if (!panel.contains(target) && !target.matches('#key-icon')) {
        // 关闭按键设置面板
        closePanel();
    }
}

// 展开面板
function openPanel() {
    panel.style.transform = 'scale(1)';
    panel.style.opacity = 1;

    // 使用 CSS 变量控制过渡时间
    panel.style.transition = `transform ${getComputedStyle(document.body).getPropertyValue('--transition-time')} ease`;
}

// 收起面板
function closePanel() {
    panel.style.transform = 'scale(0)';

    // 过渡结束后执行回调
    panel.addEventListener('transitionend', () => {
        panel.classList.add('hide');
    }, {
        once: true
    });
}

// 获取所有按键配置按钮
let activeButton = null;
const keybindButtons = document.querySelectorAll('.keybind-item button');

function removeGlowFromAllButtons() {
    keybindButtons.forEach(button => {
        button.classList.remove('glow');
    });
}

// 在点击按键配置按钮时，使按钮发光并等待用户输入按键
keybindButtons.forEach(button => {
    let previousText = '';
    button.addEventListener('click', () => {
        previousText = button.textContent;

        removeGlowFromAllButtons();

        button.classList.add('glow');
        button.textContent = '按下一个键...';

        activeButton = button;
    });

    // 在按钮失去焦点时，如果没有新的按键输入，就恢复为之前的按键
    button.addEventListener('blur', () => {
        if (button.textContent === '按下一个键...') {
            button.textContent = previousText;
            button.classList.remove('glow');

            // 清除当前活动的按钮
            activeButton = null;
        }
    });
});

// 获取保存按钮和键盘设置面板
const saveButton = document.getElementById('save-keybinds');
const keybindPanel = document.getElementById('keybind-panel');

// 在点击保存按钮时，更新配置并关闭键盘设置面板
saveButton.addEventListener('click', () => {
    keyManager.saveKeybinds();
    status.saveSettingSuccess();
    console.log('按键配置已保存:', keyManager.getAllKeybinds());
    closePanel();
});

window.addEventListener('keydown', (event) => {
    // 如果有活动的按钮，更新按钮文本并存储按键配置
    if (activeButton) {
        activeButton.textContent = event.key.toUpperCase();
        activeButton.classList.remove('glow');

        let keybindId = activeButton.id;
        if (keybindId.startsWith('keybind-')) {
            keybindId = keybindId.substring('keybind-'.length);
        }
        keyManager.setKeybind(keybindId, event.key);
        console.log(keyManager.getAllKeybinds());
        // 清除当前活动的按钮
        activeButton = null;
    }
});

/* 自动重连服务器 */
let isConnected = false; //是否连接成功，需要后期进行修改
tryConnect();
//address use currentServer.ip
async function tryConnect() {
    if (!client.isConnected) {
        try {
            await client.connect(currentServer.ip);
            if (client.isConnected) {
                isConnected = true;
                status.connectionSuccess(currentServer.name); // 连接成功后调用
            } else {
                isConnected = false;
                status.connectionError(currentServer.name); // 连接失败后调用
            }
        } catch (error) {
            isConnected = false;
            status.connectionError(currentServer.name); // 连接失败后调用
        }
    }
}

async function tryClose() {
    if (client.isConnected) {
        try {
            await client.close();
            status.showMessage("已和服务器断开连接！", "success");
        } catch (error) {
            status.showMessage("断开与服务器的连接失败！", "error");
        }
        isConnected = false;
    }
}

setInterval(tryConnect, 8500);