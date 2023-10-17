import MapData from "./MapData";
import QueueData from "./QueueData";

export default interface LobbyData{
    mapId: number,
    ableToStart: boolean,
    queueId: number,
    partyType: String,
    localMember: any,
    members: any,
    queueData: QueueData,
    mapData: MapData,
    maxTeamSize: number,
    showPositionSelector: boolean,
}