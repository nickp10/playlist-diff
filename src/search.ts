import { mkdir, readFile } from "fs/promises";
import * as os from "os";
import readline from 'readline/promises';
import { IDiffPlaylist, ISearchPlaylist } from "./interfaces";

export default class Search {
    playlists!: IDiffPlaylist[];

    async initialize(): Promise<void> {
        try {
            const contents = await readFile(await this.getDBPath(), "utf-8");
            const jsonObj = JSON.parse(contents);
            this.playlists = Array.isArray(jsonObj) ? jsonObj : [];
        } catch (error) {
            this.playlists = [];
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

    async run(rl: readline.Interface) {
        await this.initialize();
        let keepRunning = true;

        while (keepRunning) {
            const query = await rl.question('Enter search terms (or type "exit" to quit): ');

            // Skip empty inputs
            if (!query.trim()) {
                continue;
            }

            // Check if user wants to quit
            if (query.trim().toLowerCase() === 'exit') {
                keepRunning = false;
                continue;
            }

            const searchResults = await this.searchPlaylists(query);

            // Output results
            if (searchResults.length === 0) {
                console.log("No tracks found matching those criteria.\n");
            } else {
                this.displayPlaylistTable(searchResults);
            }
        }
    }

    async searchPlaylists(query: string) {
        const searchTerms = query.toLowerCase().trim().split(/\s+/);
        const results = [];

        for (const playlist of this.playlists) {
            if (!playlist.tracks || playlist.name === 'Recents') continue; 

            const playlistResult: ISearchPlaylist = {
                name: playlist.name,
                tracks: []
            };
            for (const track of playlist.tracks) {
                const combinedText = `${track.title || ''} ${track.artist || ''} ${track.album || ''}`.toLowerCase();
                const isMatch = searchTerms.every(term => combinedText.includes(term));

                if (isMatch) {
                    playlistResult.tracks.push({
                        trackTitle: track.title,
                        trackArtist: track.artist,
                        trackAlbum: track.album
                    });
                }
            }
            if (playlistResult.tracks.length > 0) {
                results.push(playlistResult);
            }
        }

        return results;
    }

    displayPlaylistTable(playlists: ISearchPlaylist[]): void {
        const COL_WIDTH = 40;

        // Helper function to truncate or pad strings to exactly COL_WIDTH
        const formatCell = (text: string): string => {
            const cleanText = text.replace(/\n|\r/g, ' '); // remove newlines if any
            if (cleanText.length > COL_WIDTH) {
                return cleanText.substring(0, COL_WIDTH - 3) + '...';
            }
            return cleanText.padEnd(COL_WIDTH, ' ');
        };

        // Border definitions
        const separator = `+${'-'.repeat(COL_WIDTH + 2)}+${'-'.repeat(COL_WIDTH + 2)}+${'-'.repeat(COL_WIDTH + 2)}+`;

        // Print Header
        console.log(separator);

        // Print Rows Grouped by Playlist
        playlists.forEach(playlist => {
            // Section Header for each Playlist group
            const playlistLabel = ` Playlist: ${playlist.name} `.toUpperCase();
            const totalWidth = ((COL_WIDTH + 2)* 3) + 2; // Width of the internal space
            const leftPadding = Math.floor((totalWidth - playlistLabel.length) / 2);
            const rightPadding = totalWidth - playlistLabel.length - leftPadding;

            console.log(`|${' '.repeat(leftPadding)}${playlistLabel}${' '.repeat(rightPadding)}|`);
            console.log(separator);

            if (playlist.tracks.length === 0) {
                console.log(`| ${formatCell('(No tracks in playlist)')} | ${formatCell('')} | ${formatCell('')} |`);
                console.log(separator);
            } else {
                playlist.tracks.forEach(track => {
                    const title = formatCell(track.trackTitle);
                    const artist = formatCell(track.trackArtist);
                    const album = formatCell(track.trackAlbum);
                    console.log(`| ${title} | ${artist} | ${album} |`);
                });
                console.log(separator);
            }
        });
    }
}