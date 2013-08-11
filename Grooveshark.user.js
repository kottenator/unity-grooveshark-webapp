// ==UserScript==
// @name           unity-grooveshark-webapp
// @include        http://grooveshark.com/*
// @version        1.0
// @author         Rostyslav Bryzgunov <kottenator@gmail.com>
// @require        utils.js
// ==/UserScript==
function _initGroovesharkWebApp() {
    var GroovesharkIntegration = {
        Unity: null,

        WEBAPP_TITLE: 'Grooveshark WebApp',
        INIT_TIMEOUT: 10000,

        // different actions
        LOADING_PLAYER_ACTION: "Loading player ...",
        LOADING_SONG_ACTION: "Loading song ...",
        PLAY_ACTION: "▶ Play",
        PAUSE_ACTION: "■ Pause",
        NEXT_SONG_ACTION: "» Next song",
        PREVIOUS_SONG_ACTION: "« Previous song",
        COLLECT_SONG_ACTION: "✔ Collect song",
        FAVOURITE_SONG_ACTION: "❤ Favourite song",
        DEQUEUE_SONG_ACTION: "✕ Dequeue song",

        init: function() {
            var Unity = this.Unity = external.getUnityObject(1.0);
            var self = this;

            Unity.init({
                name: self.WEBAPP_TITLE,
                iconUrl: 'icon://grooveshark-logo',
                onInit: function() {
                    // initial functionality
                    Unity.addAction('/About', self.newTab('http://github.com/kottenator/unity-grooveshark-webapp'));
                    Unity.Launcher.addAction(self.LOADING_PLAYER_ACTION, function() {
                    });

                    // complete functionality
                    // waiting for player to load (I haven't found better way than polling for maximum 30 sec)
                    var startDate = new Date();
                    var _t = setInterval(function() {
                        if (window.Grooveshark) {
                            clearInterval(_t);
                            Unity.Launcher.removeActions();
                            self._initCompleteFunctionality();
                        } else if (new Date() - startDate > self.INIT_TIMEOUT) {
                            clearInterval(_t);
                            Unity.Launcher.removeActions();
                            Unity.Notification.showNotification(self.WEBAPP_TITLE, "Failed to initialize, sorry :(", null);
                        }
                    }, 1000);
                }
            });
        },

        _initCompleteFunctionality: function() {
            var Unity = this.Unity;
            var self = this;

            window.Grooveshark.setSongStatusCallback(
                /*
                 * @param song {Object|null} Song record:
                 *
                 *     {
                 *         songID: int,
                 *         songName: String,
                 *         artistID: int,
                 *         artistName: String,
                 *         albumID: int,
                 *         albumName: String,
                 *         trackNum: int,
                 *         estimateDuration: Number (in milliseconds),
                 *         artURL: String,
                 *         calculatedDuration: Number (in milliseconds),
                 *         position: Number (in milliseconds),
                 *         vote: int (1 = Smile, -1 = Frown, 0 = No vote)
                 *    }
                 *
                 * @param status {String} Status name (one of: "none", "loading", "playing", "paused", "buffering", "failed", "completed")
                 */
                function(res) {
                    var song = res.song,
                        status = res.status;

                    Unity.Launcher.removeActions();

                    switch (status) {
                        case 'loading':
                            Unity.Launcher.addAction(self.LOADING_SONG_ACTION, function() {});
                            break;
                        case 'playing':
                            Unity.Launcher.addAction(self.PAUSE_ACTION, self.pause);
                            clearTimeout(self._notificationTimeout);
                            self._notificationTimeout = setTimeout(function() {
                                Unity.Notification.showNotification(
                                    song.songName,
                                    "by " + song.artistName + " on " + song.albumName,
                                    song.artURL
                                );
                            }, 500);
                            break;
                        case 'paused':
                            Unity.Launcher.addAction(self.PLAY_ACTION, self.play);
                            break;
                    }

                    Unity.Launcher.addAction(self.COLLECT_SONG_ACTION, self.collect);
                    Unity.Launcher.addAction(self.FAVOURITE_SONG_ACTION, self.favourite);
//                    Unity.Launcher.addAction(self.DEQUEUE_SONG_ACTION, self.dequeue);
//                    if (window.Grooveshark.getPreviousSong())
                    Unity.Launcher.addAction(self.PREVIOUS_SONG_ACTION, self.previous);
//                    if (window.Grooveshark.getNextSong())
                    Unity.Launcher.addAction(self.NEXT_SONG_ACTION, self.next);
                }
            );
        },

        newTab: function(link) {
            return function() {
                window.open(link);
            }
        },

        play: function() {
            window.Grooveshark.play();
        },

        pause: function() {
            window.Grooveshark.pause();
        },

        next: function() {
            window.Grooveshark.next();
        },

        previous: function() {
            window.Grooveshark.previous();
        },

        collect: function() {
            window.Grooveshark.addCurrentSongToLibrary();
        },

        favourite: function() {
            window.Grooveshark.favoriteCurrentSong();
        },

        dequeue: function() {
            window.Grooveshark.removeCurrentSongFromQueue();
        }
    };

    GroovesharkIntegration.init();
}

function evalInPageContext(func) {
    var script = document.createElement('script');
    script.appendChild(document.createTextNode('(' + func.toSource() + ')();'));
    (document.body || document.head || document.documentElement).appendChild(script);
}

evalInPageContext(_initGroovesharkWebApp);
