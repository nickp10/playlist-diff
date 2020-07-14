import YouTubeMusic from "youtube-music-ts-api";
import { IYouTubeMusicAuthenticated } from "youtube-music-ts-api/interfaces-primary";
import { IPlaylistDetail, IPlaylistSummary } from "youtube-music-ts-api/interfaces-supplementary";

export default class PlayMusicCache {
    cachedPlaylists: IPlaylistSummary[];
    cookiesStr: string;
    ytma: IYouTubeMusicAuthenticated;

    constructor(cookiesStr: string) {
        this.cookiesStr = cookiesStr;
    }

    /**
     * Retrieves an array of all the playlists.
     * 
     * @returns A promise that will resolve to an array of all the playlists.
     */
    async getAllPlaylists(): Promise<IPlaylistSummary[]> {
        if (this.cachedPlaylists) {
            return this.cachedPlaylists;
        }
        const ytma = await this.login();
        this.cachedPlaylists = await ytma.getLibraryPlaylists();
        return this.cachedPlaylists;
    }

    /**
     * Retrieves an array of all the playlists that match one of the specified names.
     * 
     * @param playlistNames The names of the playlists to retrieve.
     * @returns A promise that will resolve to an array of the matching playlists by name.
     */
    async getPlaylistsByName(playlistNames: string[]): Promise<IPlaylistSummary[]> {
        const allPlaylists = await this.getAllPlaylists();
        const playlists: IPlaylistSummary[] = [];
        let errorPlaylistName: string;
        for (let i = 0; i < playlistNames.length; i++) {
            const playlistName = playlistNames[i];
            let foundPlaylist: IPlaylistSummary;
            for (let j = 0; j < allPlaylists.length; j++) {
                const playlistItem = allPlaylists[j];
                if (playlistItem.name === playlistName) {
                    foundPlaylist = playlistItem;
                    break;
                }
            }
            if (foundPlaylist) {
                playlists.push(foundPlaylist);
            } else {
                errorPlaylistName = playlistName;
                break;
            }
        }
        if (errorPlaylistName) {
            throw new Error("Could not find the specified playlist: " + errorPlaylistName);
        } else {
            return playlists;
        }
    }

    /**
     * Populates each of the specified playlists with an array of all the tracks in that playlist.
     * 
     * @param playlists An array of the playlists to populate the tracks for. This will add a tracks
     * property to each playlists which will be an array of the tracks contained within it.
     * @returns A promise that will resolve when the playlists have been populated with their corresponding tracks.
     */
    async populatePlaylistTracks(playlists: IPlaylistSummary[]): Promise<IPlaylistDetail[]> {
        const ytma = await this.login();
        const playlistDetails: IPlaylistDetail[] = [];
        for (let i = 0; i < playlists.length; i++) {
            const playlist = playlists[i];
            const playlistDetail = await ytma.getPlaylist(playlist.id, 10);
            playlistDetails.push(playlistDetail);
        }
        return playlistDetails;
    }

    /**
     * Logs into the YouTube Music API. The playlists and associated tracks will
     * be correlated with the user that has logged in.
     * 
     * @returns A promise that will resolve when the user has logged in.
     */
    async login(): Promise<IYouTubeMusicAuthenticated> {
        if (this.ytma) {
            return this.ytma;
        }
        const ytm = new YouTubeMusic();
        return await ytm.authenticate(this.cookiesStr);
    }
}
