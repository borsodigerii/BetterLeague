import {useState, useEffect} from 'react'
import callAPI from '../api/callAPI';
import LobbyContainer from './LobbyContainer';
import ReadyCheckPopup from './ReadyCheckPopup';
import style from './lobby.module.css'

export enum ReadyCheckState{
    Popup,
    Accepted,
    Declined
}

export default function Lobby(props: any){
    let socket = props.socket;
    const [loadedLobby, setLoadedLobby] = useState(null);
    const [matchMakingStarted, setMatchMakingStarted] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [timeEstimated, setTimeEstimated] = useState(0);
    const [readyCheckTime, setReadyCheckTime] = useState(0);
    const [readyCheckPopup, setReadyCheckPopup] = useState(false)
    const [readyCheckAccept, setReadyCheckAccept] = useState(ReadyCheckState.Popup)

    const exitLobby = async () => {
        let success = await callAPI("exit-lobby", "POST", {}, {});
    }
    const startMatchMaking = async () => {
        setReadyCheckAccept(ReadyCheckState.Popup)
        setTimeElapsed(0)
        setTimeEstimated(0)
        let success = await callAPI("start-matchmaking", "POST", {}, {});
        if(success.response.code == 200){
            setMatchMakingStarted(true)
        }
    }
    const stopMatchMaking = async () => {
        let success = await callAPI("stop-matchmaking", "POST", {}, {});
        if(success.response.code == 200){
            setMatchMakingStarted(false)
        }
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
        socket.on("updatedLobby", (data: any) => {
            setTimeElapsed(data.timeElapsed)
            setTimeEstimated(data.timeEstimated)
            setReadyCheckPopup(false)
        })
        socket.on("readyCheck", (data: any) => {
            setReadyCheckTime(data.timeLeft)
            setReadyCheckPopup(true)
        })
    });
    async function chooseReadyCheck(response: ReadyCheckState){
        setReadyCheckAccept(response)
        if(response == ReadyCheckState.Accepted){
            let success = await callAPI("accept-ready-check", "POST", {}, {});
            if(success.response.code == 200){
                
                setMatchMakingStarted(false)
            }
        }else if(response == ReadyCheckState.Declined){
            let success = await callAPI("decline-ready-check", "POST", {}, {});
            if(success.response.code == 200){
                setMatchMakingStarted(false)
            }
        }
    }
    return (
        <main>
            <div className={style.breadcrumbContainer}>
                
            </div>
            <div>
                {loadedLobby == null ? "Loading.." : <LobbyContainer lobby={loadedLobby}/>}
                <button onClick={exitLobby}>Exit lobby</button>
                {matchMakingStarted == false ? <button onClick={startMatchMaking}>Find Match</button> : <button onClick={stopMatchMaking}>Stop</button>}
                {matchMakingStarted == true ? <div><span>Time Elapsed: {timeElapsed}</span><br/><span>Time Estimated: {timeEstimated}</span></div> : <></>}

                {
                    (readyCheckPopup == true ? <ReadyCheckPopup time={readyCheckTime} status={readyCheckAccept} handler={chooseReadyCheck} /> : <></>)
                }
                { //<ReadyCheckPopup time={0} status={readyCheckAccept} handler={chooseReadyCheck}/> 
                }
            </div>
        </main>
        
    )
}