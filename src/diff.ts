import * as Args from "./args";
import chalk from "chalk";
import * as FileAsync from "lowdb/adapters/FileAsync";
import * as lowdb from "lowdb";
import * as mkdirp from "mkdirp";
import * as os from "os";
import PlayMusicCache, * as pmc from "./playMusicCache";

interface IDiffPlaylist {
    name: string;
    playlistId: string;
    tracks: IDiffTrack[];
}

interface IDiffTrack {
    album: string;
    artist: string;
    title: string;
    trackId: string;
}

export default class Shuffler {
    cache = new PlayMusicCache();
    db: lowdb.Lowdb<any, lowdb.AdapterAsync>;

    async initializeDB(): Promise<void> {
        this.db = await lowdb(new FileAsync(this.getDBPath()));
    }

    getDBPath(): string {
        const penv: any = process.env;
        let home = penv.LOCALAPPDATA;
        if (!home) {
            home = penv.APPDATA;
            if (!home) {
                home = os.homedir();
            }
        }
        const diffDir = `${home}/playlist-diff`;
        mkdirp.sync(diffDir);
        return `${diffDir}/diff.json`;
    }

    async run(): Promise<void> {
        await this.initializeDB();
        this.db.defaults({ playlists: [] }).write();
        this.cache.loginWithToken(Args.androidId, Args.token).then(() => {
            let playlistPromise: Promise<pm.PlaylistListItem[]>;
            if (Args.input.length === 0) {
                playlistPromise = this.cache.getAllPlaylists();
            } else {
                playlistPromise = this.cache.getPlaylistsByName(Args.input);
            }
            playlistPromise.then((playlists) => {
                this.cache.populatePlaylistTracks(playlists).then((newPlaylists) => {
                    newPlaylists.forEach((playlist) => {
                        this.performDiff(playlist);
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

    private performDiff(playlist: pmc.IPlaylistTrackContainer): void {
        console.log(`Playlist "${playlist.playlist.name}":`);
        const baseline = <IDiffPlaylist>this.db.get("playlists").find({playlistId: playlist.playlist.id}).value();
        const current = this.createSerializablePlaylist(playlist);
        if (baseline) {
            const baselineFlags = {}, currentFlags = {};
            baseline.tracks.forEach((baselineTrack) => {
                baselineFlags[baselineTrack.trackId] = baselineTrack;
            });
            current.tracks.forEach((currentTrack) => {
                if (baselineFlags[currentTrack.trackId]) {
                    delete baselineFlags[currentTrack.trackId];
                } else {
                    currentFlags[currentTrack.trackId] = currentTrack;
                }
            });

            // Display deleted tracks
            let firstBaseline = true;
            for (let baselineFlag in baselineFlags) {
                if (baselineFlags.hasOwnProperty(baselineFlag)) {
                    const track: IDiffTrack = baselineFlags[baselineFlag];
                    if (firstBaseline) {
                        console.log("  Deleted tracks:");
                        firstBaseline = false;
                    }
                    console.log(chalk.red(`  ${track.artist} "${track.title}" (from ${track.album})"`));
                }
            }

            // Display added tracks
            let firstCurrent = true;
            for (let currentFlag in currentFlags) {
                if (currentFlags.hasOwnProperty(currentFlag)) {
                    const track: IDiffTrack = currentFlags[currentFlag];
                    if (firstCurrent) {
                        console.log("  Added tracks:");
                        firstCurrent = false;
                    }
                    console.log(chalk.green(`  ${track.artist} "${track.title}" (from ${track.album})"`));
                }
            }

            if (firstBaseline && firstCurrent) {
                console.log(chalk.blue("  Nothing has changed since the last comparison."));
            }
            this.db.get("playlists").find({playlistId: playlist.playlist.id}).assign(current).write();
        } else {
            console.log(chalk.blue("  No baseline to compare against. A baseline has been created."));
            this.db.get("playlists").push(current).write();
        }
    }

    private createSerializablePlaylist(playlist: pmc.IPlaylistTrackContainer): IDiffPlaylist {
        return {
            name: playlist.playlist.name,
            playlistId: playlist.playlist.id,
            tracks: playlist.tracks.map((track) => this.createSerializableTrack(track))
        };
    }

    private createSerializableTrack(track: pm.PlaylistItem): IDiffTrack {
        return {
            album: track.track.album,
            artist: track.track.artist,
            title: track.track.title,
            trackId: track.trackId
        };
    }
}
