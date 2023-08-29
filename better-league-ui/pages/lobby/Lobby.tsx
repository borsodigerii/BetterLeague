import {useState, useEffect} from 'react'
import callAPI from '../api/callAPI';
import LobbyContainer from './LobbyContainer';

export default function Lobby(props: any){
    const [loadedLobby, setLoadedLobby] = useState(null);

    const exitLobby = async () => {
        let success = await callAPI("exit-lobby", "POST", {}, {});
    }

    useEffect(() => {
        document.title = "BetterLeague - Lobby";
        if(loadedLobby == null){
            const fetchLobby = async () => {
                let data = await callAPI("lobby", "GET", {});
                data = data.payload;
                let members: any = []
                data.members.forEach((member: any) => {
                    if(member.summonerId != data.localMember.summonerId){
                        members.push(member);
                    }
                })
                let lobbyData: any = {
                    mapId: data.gameConfig.mapId,
                    ableToStart: data.canStartActivity,
                    queueId: data.gameConfig.queueId,
                    partyType: data.partyType,
                    localMember: data.localMember,
                    members: members
                };
                
                

                setLoadedLobby(lobbyData);
            };
            fetchLobby()
        }
        
    });
    return (
        <main>
            <div>
                {loadedLobby == null ? "Loading.." : <LobbyContainer lobby={loadedLobby}/>}
                <button onClick={exitLobby}>Exit lobby</button>
            </div>
        </main>
        
    )
}