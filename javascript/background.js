browser.storage.local.get({
    redirect: true
}, function(items) {
    if ( items.redirect )
        browser.webNavigation.onBeforeNavigate.addListener(redirectListener);
    
    browser.webNavigation.onCompleted.addListener(redirectListener);
});

browser.tabs.onRemoved.addListener(function(tabId) {
    if ( tabs[tabId] )
        delete tabs[tabId];
});

browser.runtime.onInstalled.addListener(function() {
    update();
    
    browser.alarms.create("update", {
        delayInMinutes: 1440, //immediately check for updates
        periodInMinutes: 1440 //recheck every 24h after first alarm
    });
});

browser.alarms.onAlarm.addListener(function(alarm) {
    if ( alarm.name === "update" )
        update();
});

browser.notifications.onClicked.addListener(function(id) {
    browser.notifications.clear(id);
});