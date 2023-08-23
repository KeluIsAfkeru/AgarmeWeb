// 设置默认配置
let settings = {
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

// 保存配置
export function saveSettings(newSettings) {

    // 合并配置
    settings = {
        ...settings,
        ...newSettings
    };

    // 保存到本地缓存
    localStorage.setItem('settings', JSON.stringify(settings));

}

// 获取所有配置
export function getSettings() {
    return settings;
}

// 获取指定配置
export function getSetting(key) {
    return settings[key];
}

// 更新设置状态
export function updateSettings(settingsEls) {

    settingsEls.forEach(el => {
        if (el.type === 'checkbox') {
            settings[el.id] = el.checked;
        } else if (el.type === 'range') {
            settings[el.id] = Number(el.value);
        }
    });

}

export function updateControls() {

    document.getElementById('show-names').checked = settings.showNames;
    document.getElementById('show-mass').checked = settings.showMass;
    document.getElementById('show-borders').checked = settings.showMapBorder;
    document.getElementById('show-grid').checked = settings.showMapGrid;
    document.getElementById('show-skins').checked = settings.showSkin;
    document.getElementById('show-food').checked = settings.showFood;
    document.getElementById('show-lines').checked = settings.showLine;
    document.getElementById('show-minimap').checked = settings.showMiniMap;
    document.getElementById('show-cellBorders').checked = settings.showCellBorder;
    document.getElementById('auto-zoom').checked = settings.autoZoom;

}

// 加载配置
export function loadSettings() {
    const loaded = localStorage.getItem('settings');
    if (loaded) {
        settings = JSON.parse(loaded);
        return settings; // 返回加载的配置值
    }
    return null; // 如果没有缓存配置，则返回null
}