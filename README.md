# playlist-diff

Description
----
This script will track differences in YouTube Music playlists over time. The first time this script is run, the list of tracks in the playlist will be stored as the baseline for the next comparison. The second time this script is run, the list of tracks in the playlist currently will be compared to the baseline. This script will then display the list of differences (tracks that only appear in the baseline and tracks that only appear in the current playlist).

Developer Setup
----
1. Use `git clone` to clone the GitHub repository
1. In the root directory of the module, run: `npm install`

End-User Usage
----
_Note: I do not plan on making this end-user friendly with a GUI._

1. Install Node.js
    * Manual install: http://www.nodejs.org
    * Chocolatey (for Windows): `choco install nodejs.install`
1. In the root directory of the module, run: `npm install`
1. Run the script `node build/index.js -c <COOKIE-STRING> -i <PLAYLIST>`

Script Options
----
**-c / --cookie**

_Required._ Specifies the COOKIE string request header from a valid authenticated YouTube Music request. 


**-i / --input**

_Optional._ If no input playlists are specified, then all the playlists on the account will be considered. Otherwise, this will be the names of the playlists to perform the difference script with. Multiple playlists require multiple options defined: `-i "Playlist 1" -i "Playlist 2"`

Attribution
----
Thanks to the [youtube-music-ts-api](https://github.com/nickp10/youtube-music-ts-api) node module for making this script possible.
