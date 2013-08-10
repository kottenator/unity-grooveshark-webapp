// ==UserScript==
// @name           unity-grooveshark-webapp
// @include        http://grooveshark.com/*
// @version        1.0
// @author         Rostyslav Bryzgunov <kottenator@gmail.com>
// @require        utils.js
// ==/UserScript==
;(function() {
    var Unity = external.getUnityObject(1.0);
    var Grooveshark, DB;
    var INIT_TIMEOUT = 15000;

    Unity.init({
        name: 'Grooveshark',
        iconUrl: 'icon://grooveshark-logo',
        onInit: wrapCallback(function() {
            Unity.addAction('/About', newTab('http://github.com/kottenator/unity-grooveshark-webapp'));
            Unity.Launcher.addAction("Loading player ...", function() {});

            // waiting for player to load (I haven't found better way than polling for maximum 15 sec)
            var startDate = new Date();
            var _t = setInterval(wrapCallback(function() {
                if (unsafeWindow.Grooveshark) {
                    clearInterval(_t);

                    Grooveshark = unsafeWindow.Grooveshark;
                    DB = unsafeWindow.GS.Models;

                    Unity.Launcher.removeActions();
                    Unity.Launcher.addAction("Play", wrapCallback(play));
                    Unity.Launcher.addAction("Pause", wrapCallback(pause));
                    Unity.Launcher.addAction("Next song", wrapCallback(next));
                    Unity.Launcher.addAction("Prev song", wrapCallback(previous));
                } else if (new Date() - startDate > INIT_TIMEOUT) {
                    clearInterval(_t);

                    Unity.Launcher.removeActions();
                    Unity.Notification.showNotification("Grooveshark", "Failed to init, sorry :(", null);
                }
            }), 500);
        })
    });

    function newTab(link) {
        return function() {
            window.open(link);
        }
    }

    function play() {
        return Grooveshark.play();
    }

    function pause() {
        return Grooveshark.pause();
    }

    function next() {
        return Grooveshark.next();
    }

    function previous() {
        return Grooveshark.previous();
    }
})();
