// ==UserScript==
// @name           Grooveshark
// @include        http://grooveshark.com/*
// @version        1.0
// @author         Rostyslav Bryzgunov <kottenator@gmail.com>
// @require        utils.js
// @description    Ubuntu Unity web-app for new Grooveshark site
// ==/UserScript==

/*
 * Installer for Grooveshark Unity web-app
 *
 * We need to interact with Grooveshark API.
 * It's complex in userscript sandbox and we will do this in the website context.
 *
 * Useful links:
 * - UserScripts: http://wiki.greasespot.net/Main_Page
 * - Unity JS API: http://people.ubuntu.com/~mhall119/webapps-docs/unity-web-api-reference.html
 * - Grooveshark JS API: http://developers.grooveshark.com/docs/js_api/
 *
 * TODO: implement "dequeue" action using Grooveshark.removeCurrentSongFromQueue() (broken API on 2013-08-11)
 * TODO: implement check for next/previous buttons state in Launcher & MediaPlayer (probably we need polling)
 * TODO: implement "remove current song from library" & "remove current song from favourites" (not presented in API)
 */
function _installGroovesharkWebApplication() {
    var GroovesharkIntegration = {
        Unity: null,

        WEBAPP_TITLE: 'Grooveshark',
        INIT_TIMEOUT: 30000,

        // different actions
        LOADING_PLAYER_ACTION: "Loading player ...",
        LOADING_SONG_ACTION: "Loading song ...",
        PLAY_ACTION: "▶ Play",
        PAUSE_ACTION: "■ Pause",
        NEXT_SONG_ACTION: "» Next song",
        PREVIOUS_SONG_ACTION: "« Previous song",
        COLLECT_SONG_ACTION: "✔ Collect song",
        FAVOURITE_SONG_ACTION: "❤ Favourite song",

        init: function() {
            var Unity = this.Unity = external.getUnityObject(1.0);
            var self = this;

            Unity.init({
                name: self.WEBAPP_TITLE,
                iconUrl: 'icon://grooveshark-logo',
                onInit: function() {
                    // initial functionality
                    Unity.addAction('/About', self.newTab('http://github.com/kottenator/unity-grooveshark-webapp'));
                    Unity.Launcher.addAction(self.LOADING_PLAYER_ACTION, function() {});

                    // complete functionality
                    // waiting for player to load (I haven't found better way than polling for maximum 30 sec)
                    var startDate = new Date();
                    var _t = setInterval(function() {
                        if (window.Grooveshark) {
                            clearInterval(_t);
                            Unity.Launcher.removeActions();
                            self._initActions();
                        } else if (new Date() - startDate > self.INIT_TIMEOUT) {
                            clearInterval(_t);
                            Unity.Launcher.removeActions();
                            Unity.Notification.showNotification(self.WEBAPP_TITLE, "Failed to initialize, sorry :(", null);
                        }
                    }, 1000);
                }
            });
        },

        _initActions: function() {
            var Unity = this.Unity;
            var self = this;

            // Init mediaplayer
            Unity.MediaPlayer.init(this.WEBAPP_TITLE);
            Unity.MediaPlayer.onPlayPause(self.togglePlayPause);
            Unity.MediaPlayer.onPrevious(self.previous);
            Unity.MediaPlayer.onNext(self.next);

            window.Grooveshark.setSongStatusCallback(
                /*
                 * @param {Object} response:
                 *
                 * - song {Object|null} Song record:
                 *     - songID: int,
                 *     - songName: String,
                 *     - artistID: int,
                 *     - artistName: String,
                 *     - albumID: int,
                 *     - albumName: String,
                 *     - trackNum: int,
                 *     - estimateDuration: Number (in milliseconds),
                 *     - artURL: String,
                 *     - calculatedDuration: Number (in milliseconds),
                 *     - position: Number (in milliseconds),
                 *     - vote: int (1 = Smile, -1 = Frown, 0 = No vote)
                 * - status {String} Status name:
                 *     - one of: "none", "loading", "playing", "paused", "buffering", "failed", "completed"
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

                            // little hack for next song event, because Grooveshark JS API behaves strange:
                            // - "Song A: playing" event triggered
                            // - song plays and ends
                            // - "Song A: completed" event triggered
                            // - immediately: "Song A: playing" event triggered
                            // - immediately: "Song B: playing" event triggered
                            clearTimeout(self._nt);
                            self._nt = setTimeout(function() {
                                Unity.Notification.showNotification(
                                    song.songName,
                                    "by " + song.artistName + " on " + song.albumName,
                                    song.artURL
                                );

                                Unity.MediaPlayer.setTrack({
                                    title: song.songName,
                                    album: song.albumName,
                                    artist: song.artistName,
                                    artLocation: song.artURL
                                });

                                Unity.MediaPlayer.setPlaybackState(Unity.MediaPlayer.PlaybackState.PLAYING);
                            }, 300);
                            break;
                        case 'paused':
                            Unity.Launcher.addAction(self.PLAY_ACTION, self.play);
                            Unity.MediaPlayer.setPlaybackState(Unity.MediaPlayer.PlaybackState.PAUSED);
                            break;
                    }

                    Unity.Launcher.addAction(self.PREVIOUS_SONG_ACTION, self.previous);
                    Unity.Launcher.addAction(self.NEXT_SONG_ACTION, self.next);
                    Unity.Launcher.addAction(self.COLLECT_SONG_ACTION, self.collect);
                    Unity.Launcher.addAction(self.FAVOURITE_SONG_ACTION, self.favourite);
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

        togglePlayPause: function() {
            window.Grooveshark.togglePlayPause();
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
        }
    };

    GroovesharkIntegration.init();
}

function evalInPageContext(func) {
    var script = document.createElement('script');
    script.appendChild(document.createTextNode('(' + func.toSource() + ')();'));
    (document.body || document.head || document.documentElement).appendChild(script);
}

evalInPageContext(_installGroovesharkWebApplication);
