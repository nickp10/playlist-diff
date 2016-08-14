/// <reference path="../typings/index.d.ts" />

import * as Args from "./args";
import PlayMusicCache from "./playMusicCache";
import * as Promise from "promise";

export default class Shuffler {
	cache = new PlayMusicCache();

	run(): void {
		this.cache.login(Args.email, Args.password).then(() => {
			let playlistPromise: Promise.IThenable<pm.PlaylistListItem[]>;
			if (Args.input.length === 0) {
				playlistPromise = this.cache.getAllPlaylists();
			} else {
				playlistPromise = this.cache.getPlaylistsByName(Args.input);
			}
			playlistPromise.then((playlists) => {
				this.cache.populatePlaylistTracks(playlists).then((newPlaylists) => {
					newPlaylists.forEach((playlist) => {
						playlist.tracks.forEach((playlistTrack) => {
							console.log(`${playlistTrack.track.artist} - "${playlistTrack.track.title}"`);
						});
					})
					process.exit();
				}, (error) => {
					console.error(error);
					process.exit();
				});
			}, (error) => {
				console.error(error);
				process.exit();
			});
		}, (error) => {
			console.error(error);
			process.exit();
		});
	}
}
