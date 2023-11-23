import { resolve } from "path/posix";
import LobbyData from "./interfaces/LobbyData";
import MapData from "./interfaces/MapData";
import QueueData, { QueueAvailability } from "./interfaces/QueueData";
import { resolveAny } from "dns";
import AuthPack from "./interfaces/AuthPack";
import UserData from "./interfaces/UserData";

export async function callAPI(
  endpoint: string,
  method: string,
  headers: any,
  postData: any = null
): Promise<ApiRawResponse> {
  try {
    if (method == "POST" || postData != null) {
      const res = await fetch(`http://localhost:3080/api/` + endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(postData)
      });
      const response = await res.json();
      let res2: ApiRawResponse = {
        response: {
          code: response.response.code,
          message: response.response.message
        },
        payload: response.payload
      }
      return res2;
    } else {
      const res = await fetch(`http://localhost:3080/api/` + endpoint, {
        method: method,
        headers: headers
      });
      const response = await res.json();
      //console.log(response);
      let res2: ApiRawResponse = {
        response: {
          code: response.response.code,
          message: response.response.message
        },
        payload: response.payload
      }
      return res2;
    }
  } catch (err) {
    console.log(
      "An error has ocurred while communicating with the backend: " + err
    );
    let res2: ApiRawResponse = {
      response: {
        code: 500,
        message: "An error has ocurred while communicating with the backend: " + err
      },
      payload: null
    }
    return res2;
  }
}
export async function callAPI__Raw(
  endpoint: string,
  method: string,
  headers: any,
  postData: any = null
): Promise<Response> {
  try {
    if (method == "POST" || postData != null) {
      const res = await fetch(`http://localhost:3080/api/` + endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(postData)
      });
      //const response = await res;
      return res;
    } else {
      const res = await fetch(`http://localhost:3080/api/` + endpoint, {
        method: method,
        headers: headers
      });
      //const response = await res;
      
      //console.log(response);
      return res;
    }
  } catch (err) {
    console.log(
      "An error has ocurred while communicating with the backend: " + err
    );
    return new Promise<Response>((resolve) => {});
  }
}
export interface ApiRawResponse{
  response: {
    code: number,
    message: String,
  },
  payload: any
}

export default abstract class BL__API{
  public static async ReadyCheckAccept(): Promise<boolean>{
    let result = await callAPI("accept-ready-check", "POST", {}, {})
    return result.response.code == 200 ? true : false;
  }
  public static async ReadyCheckDecline(): Promise<boolean>{
    let result = await callAPI("decline-ready-check", "POST", {}, {})
    return result.response.code == 200 ? true : false;
  }

  public static async GetMapData(mapId: number): Promise<MapData>{
    let mapRes = await callAPI("get-map", "POST", {}, { mapID: mapId })
		let map = mapRes.payload
    let mapIcon = "gamemodeAssets/" + map.mapStringId + "/iconAnimatedActive.webm"
		let mapBackgroundLobby =
			"gamemodeAssets/" + map.mapStringId + "/lobby_background.jpg"
    let mapData: MapData = {
      mapSlug: map.mapStringId,
      name: map.name,
      iconURL: mapIcon,
      lobbyBgURL: mapBackgroundLobby
    }; 
    return mapData;
  }

  public static async GetLobbyData(): Promise<LobbyData>{
    let dataRes: ApiRawResponse = await callAPI("lobby", "GET", {})
		let data = dataRes.payload
    let members: any = []
		data.members.forEach((member: any) => {
			//if (member.summonerId != data.localMember.summonerId) {
			members.push(member)
			//}
		})
    let ava = data.gameConfig.queueData.queueAvailability;
    let queueData: QueueData = {
      id: data.gameConfig.queueId,
      name: data.gameConfig.queueData.name,
      areFreeChampionsAllowed: data.gameConfig.queueData.areFreeChampionsAllowed,
      championsRequiredToPlay: data.gameConfig.queueData.championsRequiredToPlay,
      description: data.gameConfig.queueData.description,
      detailedDescription: data.gameConfig.queueData.detailedDescription,
      numPlayersPerTeam: data.gameConfig.queueData.numPlayersPerTeam,
      playerVersusPlayerLabel: data.gameConfig.queueData.numPlayersPerTeam + "v" + data.gameConfig.queueData.numPlayersPerTeam,
      isRanked: data.gameConfig.queueData.isRanked,
      minLevel: data.gameConfig.queueData.minLevel,
      showPositionSelector: data.gameConfig.queueData.showPositionSelector,
      type: data.gameConfig.queueData.type,
      category: data.gameConfig.queueData.category,
      gameMode: data.gameConfig.queueData.gameMode,
      queueAvailability: ava == "Available" ? QueueAvailability.Available : ava == "PlatformDisabled" ? QueueAvailability.PlatformDisabled : ava == "DoesntMeetRequirements" ? QueueAvailability.DoesntMeetRequirements : QueueAvailability.PlatformDisabled
    }
    let mapData: MapData = await BL__API.GetMapData(data.gameConfig.mapId)
    let lobbyData: LobbyData = {
			mapId: data.gameConfig.mapId,
			ableToStart: data.canStartActivity,
			queueId: data.gameConfig.queueId,
			partyType: data.partyType,
			localMember: data.localMember,
			members: members,
			queueData: queueData,
      mapData: mapData,
			maxTeamSize: data.gameConfig.maxTeamSize,
			showPositionSelector: data.gameConfig.showPositionSelector,
		}
    return lobbyData
  }
  public static ExitLobby(): void{
    callAPI("exit-lobby", "POST", {}, {})
  }

  public static async StopMatchMaking(): Promise<boolean>{
    let res = await callAPI("stop-matchmaking", "POST", {}, {})
		return res.response.code == 200 ? true : false
  }
  public static async StartMatchMaking(): Promise<boolean>{
    let res = await callAPI("start-matchmaking", "POST", {}, {})
		return res.response.code == 200 ? true : false
  }

  public static async GetQueues(): Promise<QueueData[]>{
    let queues = await callAPI("queues", "GET", {})
    let queueList: QueueData[] = []
    queues.payload.forEach((queue: any) => {
      let ava = queue.queueAvailability;
      let object: QueueData = {
        id: queue.id,
        name: queue.name,
        areFreeChampionsAllowed: queue.areFreeChampionsAllowed,
        championsRequiredToPlay: queue.championsRequiredToPlay,
        description: queue.description,
        detailedDescription: queue.detailedDescription,
        minLevel: queue.minLevel,
        type: queue.type,
        numPlayersPerTeam: queue.numPlayersPerTeam,
        playerVersusPlayerLabel: queue.numPlayersPerTeam + "v" + queue.numPlayersPerTeam,
        isRanked: queue.isRanked,
        showPositionSelector: queue.showPositionSelector,
        category: queue.category,
        gameMode: queue.gameMode,
        queueAvailability: ava == "Available" ? QueueAvailability.Available : ava == "PlatformDisabled" ? QueueAvailability.PlatformDisabled : ava == "DoesntMeetRequirements" ? QueueAvailability.DoesntMeetRequirements : QueueAvailability.PlatformDisabled
      }
      queueList.push(object)
    })
    return queueList
  }
  public static async CreateLobbyWithQueue(queueId: number): Promise<boolean>{
    let res = await callAPI("create-lobby", "POST", {}, {qId: queueId})
    return res.response.code == 200 ? true : false
  }

  public static async isInLobby(): Promise<boolean>{
    let data = await callAPI("isInLobby", "GET", {})
		return data.payload
  }
  public static async GetAuthPack(): Promise<AuthPack>{
    let response = await callAPI("get-auth-info", "GET", {})
    let authPack: AuthPack = {
      port: response.payload.port,
      password: response.payload.password
    }
    return authPack
  }
  public static async GetUserData(): Promise<UserData>{
    let userdataRes = await callAPI("user-info", "GET", {})
    let userData: UserData = {
      accountId: userdataRes.payload.accountId,
      displayName: userdataRes.payload.displayName,
      internalName: userdataRes.payload.internalName,
      nameChangeFlag: userdataRes.payload.nameChangeFlag,
      percentCompleteForNextLevel: userdataRes.payload.percentCompleteForNextLevel,
      privacy: userdataRes.payload.privacy,
      profileIconId: userdataRes.payload.profileIconId,
      puuid: userdataRes.payload.puuid,
      rerollPoints: {
          currentPoints: userdataRes.payload.currentPoints,
          maxRolls: userdataRes.payload.maxRolls,
          numberOfRolls: userdataRes.payload.numberOfRolls,
          pointsCostToRoll: userdataRes.payload.pointsCostToRoll,
          pointsToReroll: userdataRes.payload.pointsToReroll
      },
      summonerId: userdataRes.payload.summonerId,
      summonerLevel: userdataRes.payload.summonerLevel,
      unnamed: userdataRes.payload.unnamed,
      xpSinceLastLevel: userdataRes.payload.xpSinceLastLevel,
      xpUntilNextLevel: userdataRes.payload.xpUntilNextLevel,
      backgroundSkinId: userdataRes.payload.backgroundSkinId,
      skins: userdataRes.payload.skins
    }
    return userData
  }

  public static CloseApp(): void{
    callAPI("stop-application", "POST", {}, {})
  }
}