# playlist-diff

Description
----
This script will track differences in Google Play playlists over time. The first time this script is run, the list of tracks in the playlist will be stored as the baseline for the next comparison. The second time this script is run, the list of tracks in the playlist currently will be compared to the baseline. This script will then display the list of differences (tracks that only appear in the baseline and tracks that only appear in the current playlist).

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
1. Compile the script by running: `npm run compile`
1. Run the script `node build/index.js -a <ANDROID-ID> -t <TOKEN> -i <PLAYLIST>`

Script Options
----
**-a / --androidId**

_Required._ Specifies the android ID to login with. 


**-t / --token**

_Required._ Specifies the token to login with.


**-i / --input**

_Optional._ If no input playlists are specified, then all the playlists on the account will be considered. Otherwise, this will be the names of the playlists to perform the difference script with. Multiple playlists require multiple options defined: `-i "Playlist 1" -i "Playlist 2"`

Attribution
----
Thanks to the [Node-JS Google Play Music API](https://github.com/jamon/playmusic) node module for making this script possible.
