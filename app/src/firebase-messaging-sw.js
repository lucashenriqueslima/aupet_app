self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    let url = event.notification.data.click_action;
    if (clients.openWindow && url) {
        event.waitUntil(clients.openWindow(url));
    }
});
self.addEventListener("push", function (event) {
    var title = event.data.json().data.title
    var body = event.data.json().data.body;
    var icon = "https://app.aupetheinsten.com.br/assets/aupet/icon-96x96.png";
    var badge = "https://app.aupetheinsten.com.br/assets/aupet/icon-82x82.png";
    var click_action = event.data.json().data.url;
    event.waitUntil(
        self.registration.showNotification(title, {
            body: body,
            icon: icon,
            badge: badge,
            data: {
                click_action
            }
        })
    );
});
importScripts('https://www.gstatic.com/firebasejs/5.4.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.4.1/firebase-messaging.js');
firebase.initializeApp({ 'messagingSenderId': "19456155690" });
const messaging = firebase.messaging();