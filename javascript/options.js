var $ = document.getElementById.bind(document);
var browser = (function () { return window.msBrowser || window.browser || window.chrome; })();

// Set labels
$('td_redirect').textContent =              browser.i18n.getMessage('options_redirect');
$('label_redirect_automatic').textContent = browser.i18n.getMessage('options_redirect_automatically');
$('label_redirect_manual').textContent =    browser.i18n.getMessage('options_redirect_manually');
$('td_notify').textContent =                browser.i18n.getMessage('options_notify');
$('label_notify').textContent =             browser.i18n.getMessage('options_notify_box');
$('save').textContent =                     browser.i18n.getMessage('options_save');

// Set options
browser.storage.local.get({
  redirect: true,
  notify:   true
}, function(items) {
  $('redirect_automatic').checked = items.redirect;
  $('redirect_manual').checked =    !items.redirect;
  $('notify').checked =             items.notify;
});

// Save button click
$('save').onclick = function() {
  browser.storage.local.set({
    redirect: $('redirect_automatic').checked,
    notify:   $('notify').checked
  }, function() {
    var page = browser.extension.getBackgroundPage();
    
    //page is empty in private browsing
    if( page )
      page.window.location.reload();

    window.close();
  });
};
