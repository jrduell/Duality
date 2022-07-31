import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getCurrentUserPlaylists, getPlaylistItems, getUserPlaylists, createPlaylist, addPlaylistItems } from '../spotify';
import { catchErrors } from '../utils';

function findOverlap(CurrentSongs, UserSongs) {
    let overlap = [];

    for (var i = 0; i < UserSongs.length; i++) {
        const index = CurrentSongs.indexOf(UserSongs[i]);
        if (index === -1) {
            //means song is unique and should be added to overlap
            overlap.push(CurrentSongs[index]);
        }
    }
    console.log("Overlap: " + overlap.length);
}

const CsongIDs = [];
const UsongIDs = [];
const Overlap = [];

export const Playlists = () => {
    const [CplaylistsData, CsetPlaylistsData] = useState(null);
    const [Cplaylists, CsetPlaylists] = useState(null);

    const [UplaylistsData, UsetPlaylistsData] = useState(null);
    const [Uplaylists, UsetPlaylists] = useState(null);

    const [Go, setGo] = useState(false);
    const [Merge, setMerge] = useState(false);
    const [Create, setCreate] = useState(false);

    const CPIDS = [];
    const UPIDS = [];

    useEffect(() =>  {
    const fetchData = async () => {
        const { data } = await getCurrentUserPlaylists();
        
        CsetPlaylists(Cplaylists => ([
        ...Cplaylists ? Cplaylists : [],
        ...data.items
        ]));
        
        CsetPlaylistsData(data);
    };
    catchErrors(fetchData());
    }, []);

    useEffect(() => {
        if (!CplaylistsData) {
            return;
        }

        // Playlist endpoint only returns 20 playlists at a time, so we need to
        // make sure we get ALL playlists by fetching the next set of playlists
        const FetchMoreCData = async () => {
            if (CplaylistsData.next) {
                //as long as there is more data to be retrieved
                const { data } = await axios.get(CplaylistsData.next);
                
                CsetPlaylists(Cplaylists => ([
                    ...Cplaylists ? Cplaylists : [],
                    ...data.items
                    ]));

                CsetPlaylistsData(data);
            } else {
            //when all urls are retrieved
            if(Cplaylists !== null) { 
                Object.entries(Cplaylists).forEach((key, value) => {
                    const PID = key[1]["id"];
                    if (!CPIDS.includes(PID)) { 
                        CPIDS.push(PID);
                    }
                });
                
                for (var PID in CPIDS) {
                    const id = CPIDS[PID];
                    
                    //data contains first 100 songs
                    let listData = await getPlaylistItems(id);
                    
                    Object.entries(listData.data.items).forEach((key, value) => {
                        const songID = key[1]["track"]["id"];
                        if (!CsongIDs.includes(songID) && songID !== null) { CsongIDs.push(songID); }
                    });

                    
                    //travel through "next" field of listData until end

                    while (listData.data.next) {
    
                        listData = await axios.get(listData.data.next);
                        
                        Object.entries(listData.data.items).forEach((key, value) => {
                            const songID = key[1]["track"]["id"];
                            //console.log("C Before push conditional: " + songID);
                            if (!CsongIDs.includes(songID) && songID !== null) { 
                                CsongIDs.push(songID); 
                                //console.log("C Push conditional: " + songID);
                            }
                        })
                        //UsongIDs.push(listData.data.items);
                    }
                }
            }
            console.log("go was set");
            console.log("C size: " + CsongIDs.length);
            setGo(true);
            }
        };
        
        //catchErrors(fetchMoreData());
    
        catchErrors(FetchMoreCData());

        //catchErrors(fetchMoreUdata(fetchMoreData()));
    }, [CplaylistsData]);
    
    useEffect(() =>  {
        const fetchData = async () => {
            if (Go !== false) {
                const { data } = await getUserPlaylists("lauravonbargen");
                
                UsetPlaylists(Uplaylists => ([
                ...Uplaylists ? Uplaylists : [],
                ...data.items
                ]));
                console.log("why is this called");
                UsetPlaylistsData(data);
            };
        }
        catchErrors(fetchData());
    }, [Go]);

    useEffect(() => {
        //prevents running on initial render
        if (!UplaylistsData) { return; }

        const fetchMoreUData = async () => {
            if (UplaylistsData.next) {
                //as long as there is more data to be retrieved
                const { data } = await axios.get(UplaylistsData.next);
                
                UsetPlaylists(playlists => ([
                    ...playlists ? playlists : [],
                    ...data.items
                    ]));
    
                UsetPlaylistsData(data);
            } else {
                //when all urls are retrieved
                if(Uplaylists !== null) { 
                    Object.entries(Uplaylists).forEach((key, value) => {
                        const PID = key[1]["id"];
                        //console.log(PID);
                        if (!UPIDS.includes(PID)) { 
                            UPIDS.push(PID);
                        }
                    });
                    
                    for (var PID in UPIDS) {
                        const id = UPIDS[PID];
                        
                        //data contains first 100 songs
                        let listData = await getPlaylistItems(id);
                        //console.log(listData);
                        

                        //handle first set of 100 songs
                        Object.entries(listData.data.items).forEach((key, value) => {
                            const songID = key[1]["track"]["id"];
                            if (!UsongIDs.includes(songID) && songID !== null) { UsongIDs.push(songID); }
                        });

                        //UsongIDs.push(listData.data.items);
                        
                        //iterate through next field, saving songs
                        while (listData.data.next) {
    
                            listData = await axios.get(listData.data.next);
                            
                            Object.entries(listData.data.items).forEach((key, value) => {
                                const songID = key[1]["track"]["id"];

                                if (!UsongIDs.includes(songID) && songID !== null) { 
                                    UsongIDs.push(songID); 
                                }
                            })
                        }
                    } 

                    console.log("C len: " + CsongIDs.length);
                    console.log("U len: " + UsongIDs.length);
                    
                    setMerge(true);
                }
            }
        }

        catchErrors(fetchMoreUData());
    }, [UplaylistsData]);
    
    useEffect(() => {
        if (Merge !== false) {
            for (var i = 0; i < UsongIDs.length; i++) {
                const index = CsongIDs.indexOf(UsongIDs.at(i));

                if (index !== -1) {
                    //means song is unique and should be added to overlap
                    Overlap.push(UsongIDs.at(i));
                    //console.log("Pushed: " + CsongIDs[index]);
                    console.log(UsongIDs.at(i));
                    //console.log("Overlap size: " + Overlap.length);
                }
            }

            console.log("Overlapped:" + Overlap.length);
            console.log("C IDs: " + CsongIDs.length);
            console.log("U IDs: " + UsongIDs.length);
            console.log("1 Overlap: " + Overlap[0]);
            setCreate(true);
        }
    }, [Merge]);

    useEffect(() => {
        //create playlist api call

        if (Create !== false) {

            const fetchData = async () => {
                //create playlist
                const { data } = await createPlaylist("jrduell7");
                
                console.log("2 Overlap: " + Overlap[0]);
                let total = parseInt(Overlap.length / 100);
                console.log(Overlap.length);

                //process in batches of 100
                
                for (var i = 0; i < total; i++) {
                    let tracks = [];
                    console.log("batch 100");
                    for (var j = 0; j < 100; j++) {
                        let track = 'spotify:track:' + Overlap[j + (i*100)];
                        tracks.push(track);
                    }
                    console.log("after batch 100");
                    if ((tracks.length !== 0)){ 
                        console.log("don't print this please")
                        await addPlaylistItems(data.id, tracks); 
                    }
                }

                var last = Overlap.length - (total * 100);
                let tracksTwo = [];
                console.log("before last group");
                console.log("last: " + last);
                for (var k = 0; k < last; k++) {
                    let track = "spotify:track:" + Overlap[(total*100) + k];
                    tracksTwo.push(track);
                }
                console.log("after last group");
                
                if ((tracksTwo.length !== 0)){ 
                    console.log("don't print this either");
                    await addPlaylistItems(data.id, tracksTwo);
                 }
            } 

            catchErrors(fetchData());
        }
    }, [Create]);
    
};
