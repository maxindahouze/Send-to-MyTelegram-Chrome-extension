// In-page cache of the user's options
const options = {};
// Initialize the form with the user's option settings
const restoreOptions = async () => {
    const data = await chrome.storage.sync.get('options');
    Object.assign(options, data.options);
    $('token').value = String(options.token || '');
    $('userkey').value = String(options.userkey || '');
};

var $ = function(id) {
    return document.getElementById(id);
},
show_message = function(message, hide_in_seconds) {
    $('message').innerHTML = message;
    if (hide_in_seconds) {
        setTimeout(() => { $('message').innerHTML = '&nbsp;';}, hide_in_seconds * 1000);
    }
},
validate = function() {
    var token = options.token || '',
        userkey = options.userkey || '';

    if (!userkey || !token) {
        show_message('Please fill both fields!', 2000);
        return;
    }

    var req = new XMLHttpRequest();
    var url = 'https://api.telegram.org/bot' + 
                     token + 
                    '/sendMessage';
    url += '?chat_id=' + encodeURIComponent(userkey);
    url += '&text=' + encodeURIComponent('Setting for "Send-to-Telegram" successfully.');
    req.open('GET', url, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.send();

    req.onreadystatechange = async function() {
        if (req.readyState === 4) {
            var response = JSON.parse(req.responseText);
            console.log(response);            
            if (req.status === 200) {
                options.valid = token + userkey;
                chrome.storage.sync.set({options});
            } else {
                options.valid = '';
                await chrome.storage.sync.set({options});
                if (response.errors) {
                    show_message('Error: ' + response.errors, 2);
                } else {
                    show_message('Something is fishy: ' + req.responseText, 2);
                }
            }
        }
    };
},
save = async function(event) {
    options.userkey = $('userkey').value;
    options.token = $('token').value;

    await chrome.storage.sync.set({options})
    show_message('Saved!', 1);
    validate();
    event.stopPropagation();
};

$('save').addEventListener('click', save);
document.addEventListener('DOMContentLoaded', restoreOptions);
