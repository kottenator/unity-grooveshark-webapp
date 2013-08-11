Unity Grooveshark web-app
=========================

Ubuntu Unity web-app for new Grooveshark.

Intro
-----
Few words for people who are not familiar with Ubuntu Unity.

Since Ubuntu 12.10 there is a great opportunity to integrate your website's might & magic with Ubuntu Unity interface.
This gives you chance to:
- show your web-app in Unity Launcher (left side-bar) and Dash (apps search popup):
- show specific context actions (right-click on Launcher icon):
- integrate your website with Unity Messages menu:
- integrate your website with Unity Sound menu:

Features
--------
Integration with Sound menu:

![image](http://i.imgur.com/7yVW9b6.png)

Launcher context actions:

![image](http://i.imgur.com/uNVvMdP.png)

Sound menu integration and Launcher context actions are related to current player state.

**It will work only after you will start playback on Grooveshark website**, sorry for inconvenience.

Probably I need to implement "Play your station" context menu, when you just opened Grooveshark.

Install
-------

    sudo mkdir /usr/share/unity-webapps/userscripts/Grooveshark/
    sudo cp Grooveshark.user.js manifest.json /usr/share/unity-webapps/userscripts/Grooveshark/
    sudo cp grooveshark-logo.svg /usr/share/icons/hicolor/scalable/apps/

Reason
------
Why have I created this web-app?

There is an official [Grooveshark web-app](https://launchpad.net/ubuntu/+source/unity-webapps-grooveshark) but it is broken from long time ago.

Ubuntu is my favourite OS, I love Grooveshark and use it every day - that's the reason why I've created my own Unity web-app for Grooveshark.