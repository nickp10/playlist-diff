import * as Args from "./args";
import chalk from "chalk";
import * as os from "os";
import readline from 'readline/promises';
import { mkdir, readFile, writeFile } from "fs/promises";
import { IDiffPlaylist, IDiffTrack } from "./interfaces";
import { IPlaylistDetail, IPlaylistSummary, ITrackDetail } from "youtube-music-ts-api/interfaces-supplementary";
import PlayMusicCache from "./playMusicCache";

export default class Diff {
    cache!: PlayMusicCache;
    playlists!: IDiffPlaylist[];

    async initialize(cookie: string): Promise<void> {
        this.cache = new PlayMusicCache(cookie);
        try {
            const contents = await readFile(await this.getDBPath(), "utf-8");
            const jsonObj = JSON.parse(contents);
            this.playlists = Array.isArray(jsonObj) ? jsonObj : [];
        } catch (error) {
            this.playlists = [];
        }
    }

    async savePlaylists(): Promise<void> {
        try {
            const contents = JSON.stringify(this.playlists, undefined, 2);
            await writeFile(await this.getDBPath(), contents, "utf-8");
        } catch (error) {
        }
    }

    async getDBPath(): Promise<string> {
        const penv: any = process.env;
        let home = penv.LOCALAPPDATA;
        if (!home) {
            home = penv.APPDATA;
            if (!home) {
                home = os.homedir();
            }
        }
        const diffDir = `${home}/playlist-diff`;
        await mkdir(diffDir, { recursive: true });
        return `${diffDir}/diff.json`;
    }

    async run(rl: readline.Interface): Promise<void> {
        try {
            const cookie = await rl.question('Enter cookie: ');
            await this.initialize(cookie);
            let playlists: IPlaylistSummary[];
            if (Args.input.length === 0) {
                playlists = await this.cache.getAllPlaylists();
            } else {
                playlists = await this.cache.getPlaylistsByName(Args.input);
            }
            const newPlaylists = await this.cache.populatePlaylistTracks(playlists);
            for (let i = 0; i < newPlaylists.length; i++) {
                const playlist = newPlaylists[i];
                await this.performDiff(playlist);
            }
        } catch (error) {
            console.error(error);
        }
    }

    private async performDiff(playlist: IPlaylistDetail): Promise<void> {
        console.log(`Playlist "${playlist.name}" (${playlist.tracks?.length ?? 0} tracks):`);
        const current = this.createSerializablePlaylist(playlist);

        // Find baseline by playlist ID first (in case the playlist was renamed)
        const baselineById = this.playlists.find(p => p.playlistId === playlist.id);
        if (baselineById) {
            this.performDiffAgainstBaseline(baselineById, current);
            this.playlists = this.playlists.map(p => {
                if (p === baselineById) {
                    return current;
                }
                return p;
            });
            await this.savePlaylists();
        } else {
            // Find baseline by playlist name second (in case a new playlist was created with the same name)
            const baselineByName = this.playlists.find(p => p.name === playlist.name);
            if (baselineByName) {
                this.performDiffAgainstBaseline(baselineByName, current);
                this.playlists = this.playlists.map(p => {
                    if (p === baselineByName) {
                        return current;
                    }
                    return p;
                });
                await this.savePlaylists();
            } else {
                // Could not find a baseline to compare with
                console.log(chalk.blue("  No baseline to compare against. A baseline has been created."));
                this.playlists.push(current);
                await this.savePlaylists();
            }
        }
    }

    private performDiffAgainstBaseline(baseline: IDiffPlaylist, current: IDiffPlaylist): void {
        const baselineFlags: { [key: string]: IDiffTrack } = {}, currentFlags: { [key: string]: IDiffTrack } = {};
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
                console.log(chalk.red(`  ${track.artist} "${track.title}" (from ${track.album})`));
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
                console.log(chalk.green(`  ${track.artist} "${track.title}" (from ${track.album})`));
            }
        }

        if (firstBaseline && firstCurrent) {
            console.log(chalk.blue("  Nothing has changed since the last comparison."));
        }
    }

    private createSerializablePlaylist(playlist: IPlaylistDetail): IDiffPlaylist {
        return {
            name: playlist.name ?? "",
            playlistId: playlist.id ?? "",
            tracks: (playlist.tracks ?? []).map((track) => this.createSerializableTrack(track))
        };
    }

    private createSerializableTrack(track: ITrackDetail): IDiffTrack {
        return {
            album: track.album?.name ?? "",
            artist: Array.isArray(track.artists) && track.artists.length > 0 ? track.artists[0].name ?? "" : "",
            title: track.title ?? "",
            trackId: track.id ?? ""
        };
    }
}
