const API_SITES = "https://www.hetzinkstuk.nl/API/affiliates";

var tabs = [];
var browser = (function () { return window.msBrowser || window.browser || window.chrome; })();

function update() {
    fetch(API_SITES).then(function(response) {
        return response.json();
    }).then(function(data) {
        browser.storage.local.set({
            urls: data
        });
    });
}

function navigateTo(tabId, domain, url, target, notify) {
    tabs[tabId] = domain;

    //go to website via sponsor link
    browser.tabs.update(tabId, {url: target.link}, function(tab) {
        
        var listener = function(tabId, changeInfo) {
            if (tabId == tab.id && changeInfo.status === 'loading') {
                chrome.tabs.onUpdated.removeListener(listener);
                browser.tabs.update(tabId, {url});
            }
        }
        
        //go to the page the user was visiting
        chrome.tabs.onUpdated.addListener(listener);
    });

    if ( notify )
        browser.notifications.create({
            type: 'basic',
            iconUrl: browser.extension.getURL('images/icon-48.png'),
            title: browser.i18n.getMessage("bannerTitle"),
            message: browser.i18n.getMessage("bannerContent", target.commission)
        });
}

function redirectListener(request) {
    const tabId = request.tabId;
    const url = request.url;
    const domain = getDomain(url);

    browser.storage.local.get({
        urls: [],
        redirect: true,
        notify: true
    }, function(items) {
        const target = items.urls[domain];

        //if this is not an affiliate, then stop
        if ( !target )
            return;

        //otherwise enable icon...
        browser.pageAction.show(tabId);

        //...and make it clickable if we are not redirected yet
        if ( tabs[tabId] !== domain )
        {
            browser.pageAction.onClicked.addListener(function(tab) {
                if( tabId === tab.id )
                    navigateTo(tabId, domain, url, target, items.notify);
            });

            //if the user selected 'automatically redirect' in the options, then perform this action
            //otherwise show a notification
            if ( items.redirect )
                navigateTo(tabId, domain, url, target, items.notify);
            else
                browser.notifications.create({
                    type: 'basic',
                    iconUrl: browser.extension.getURL('images/icon-48.png'),
                    title: browser.i18n.getMessage("notificationTitle", target.name),
                    message: browser.i18n.getMessage("notificationContent", domain)
                }, function(notificationId) {
                    browser.notifications.onClicked.addListener(function(id) {
                        if( id == notificationId )
                            navigateTo(tabId, domain, url, target, items.notify);
                    });

                    browser.tabs.onRemoved.addListener(function() {
                        browser.notifications.clear(notificationId);
                    });
                });
        }
    });
}

function getDomain(url) {
    var hostname = (url.indexOf("//") > -1) ? url.split('/')[2] : url.split('/')[0];
    
    hostname = hostname.split(':')[0]; //find & remove port number
    hostname = hostname.split('?')[0]; //find & remove "?"
    return hostname.replace(/^(www\.)/,"");
}