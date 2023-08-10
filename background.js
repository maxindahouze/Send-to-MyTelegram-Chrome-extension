// Initialize the form with the user's option settings
const restoreOptions = async () => {
    const data = await chrome.storage.sync.get('options');

    return {
        token: data.options.token || ''
    };
};

var open_options = function(msg) {
    // if(msg) {
    //     localStorage._options_msg = msg;
    // }
    // if (chrome.runtime.openOptionsPage) {
    //     return chrome.runtime.openOptionsPage();
    // }
    // return chrome.tabs.create({
    //     url: chrome.runtime.getURL('options.html')
    // });
},
combo_valid = function() {
    // var valid = localStorage.valid || '',
    //     token = localStorage.token || '',
    //     userkey = localStorage.userkey || '';
    //
    // if (!valid || valid !== token + userkey) {
    //     open_options('Please check your configuration!');
    //     return false;
    // }
    return true;
},
show_badge_text = function(color, text, timeout) {
    chrome.action.setBadgeBackgroundColor({
        'color': color
    });
    chrome.action.setBadgeText({
        'text': text
    });
    setTimeout(function() {
        chrome.action.setBadgeText({
            'text': ''
        });
    }, timeout * 1000);
},
push_message = async function(source, tab, selection, device) {
    console.log(source);
    console.log(tab);
    console.log(selection);

    if (!combo_valid()) {
        return false;
    }

    var options = await restoreOptions();
    var url =   'https://seethebeauty.pp.ua/in/bot/' +
                        options.token +
                        '/?text=' + encodeURIComponent(selection);
    try {
        const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, *cors, same-origin
            credentials: "same-origin", // include, *same-origin, omit
            headers: {
                "Content-Type": "application/json",
            },
            redirect: "follow", // manual, *follow, error
        });
        if (!response.ok) {
            throw new Error("Ответ сети " + response.statusText);
        }
        show_badge_text('#006400', 'OK', 5);
    }
    catch (error) {
        console.error("Ошибка:", error.message);
        show_badge_text('#ff0000', 'FAIL', 5);
    }

    return false;
};

// Add a listener to create the initial context menu items,
// context menu items only need to be created at runtime.onInstalled
chrome.runtime.onInstalled.addListener(async () => {
    var devices = ['Telegram Bot'],
        ctxs = ['page', 'link', 'image', 'selection'];
    chrome.contextMenus.removeAll();
    if (devices.length) {
        for(var j = 0; j < ctxs.length; j++) {
            for (var i = 0; i < devices.length; i++) {
                chrome.contextMenus.create({
                    title: 'Push this ' + ctxs[j] + ' to ' + devices[i],
                    contexts: [ctxs[j]],
                    id: 'ctx:' + ctxs[j] + ':' + devices[i]
                });
            }
        }
    }
});

// chrome.action.onClicked.addListener(function(tab) {
//     chrome.tabs.sendRequest(tab.id, {
//         method: 'selection'
//     }, function(text) {
//         push_message('badge', tab, text);
//     });
// });


chrome.contextMenus.onClicked.addListener(function(info, tab) {
    // var devices = get_menu_devices();
    var devices = ['Telegram Bot'];
    if (devices.length) {
        for (var i = 0; i < devices.length; i++) {
            if (info.menuItemId === 'ctx:page:' + devices[i]) {
                return push_message('menu', tab, '', devices[i]);
            } else if (info.menuItemId === 'ctx:link:' + devices[i]) {
                return push_message('menu', tab, info.linkUrl, devices[i]);
            } else if (info.menuItemId === 'ctx:image:' + devices[i]) {
                return push_message('menu', tab, info.srcUrl, devices[i]);
            } else if (info.menuItemId === 'ctx:selection:' + devices[i]) {
                return push_message('menu', tab, info.selectionText, devices[i]);
            }
        }
    }
});


// if (combo_valid()) {
//     setup_context_menus();
// }
