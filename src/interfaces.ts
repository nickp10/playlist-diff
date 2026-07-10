export interface IDiffPlaylist {
    name: string;
    playlistId: string;
    tracks: IDiffTrack[];
}

export interface IDiffTrack {
    album: string;
    artist: string;
    title: string;
    trackId: string;
}

export interface ISearchPlaylist {
    name: string;
    tracks: ISearchTrack[];
}

export interface ISearchTrack {
    trackTitle: string;
    trackArtist: string;
    trackAlbum: string;
}