/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// These should match the config in src/config/firebase.ts
const firebaseConfig = {
    apiKey: "dummy-api-key",
    authDomain: "krishi-bazaar-nepal.firebaseapp.com",
    projectId: "krishi-bazaar-nepal",
    storageBucket: "krishi-bazaar-nepal.appspot.com",
    messagingSenderId: "000000000000",
    appId: "1:000000000000:web:000000000000"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.image || '/logo.png',
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
