import { useState, useEffect } from "react"
import callAPI from "../api/callAPI"
import LobbyContainer from "./LobbyContainer"
import ReadyCheckPopup from "./ReadyCheckPopup"
import style from "./lobby.module.css"
import LobbyBreadCrumb from "./LobbyBreadCrumb"
import LobbyUser from "./LobbyUser"

export enum ReadyCheckState {
	Popup,
	Accepted,
	Declined,
}

export default function Lobby(props: any) {
	let socket = props.socket
	const [loadedLobby, setLoadedLobby] = useState<any>(null)
	const [matchMakingStarted, setMatchMakingStarted] = useState(false)
	const [timeElapsed, setTimeElapsed] = useState(0)
	const [timeEstimated, setTimeEstimated] = useState(0)
	const [readyCheckTime, setReadyCheckTime] = useState(0)
	const [readyCheckPopup, setReadyCheckPopup] = useState(false)
	const [readyCheckAccept, setReadyCheckAccept] = useState(
		ReadyCheckState.Popup
	)
	//const [currentQueueData, setCurrentQueueData] = useState(null)
	const [mapData, setMapData] = useState<any>(null)
	const [lobbyUpdating, setLobbyUpdating] = useState(false)
	const exitLobby = async () => {
		let success = await callAPI("exit-lobby", "POST", {}, {})
	}
	const startMatchMaking = async () => {
		setReadyCheckAccept(ReadyCheckState.Popup)
		setTimeElapsed(0)
		setTimeEstimated(0)
		let success = await callAPI("start-matchmaking", "POST", {}, {})
		if (success.response.code == 200) {
			setMatchMakingStarted(true)
		}
	}
	const stopMatchMaking = async () => {
		let success = await callAPI("stop-matchmaking", "POST", {}, {})
		if (success.response.code == 200) {
			setMatchMakingStarted(false)
		}
	}
	useEffect(() => {
		document.title = "BetterLeague - Lobby"
		//if (loadedLobby == null) {
		fetchLobby()
		//}
		socket.on("updatedLobbySearch", (data: any) => {
			setTimeElapsed(data.timeElapsed)
			setTimeEstimated(data.timeEstimated)
			setReadyCheckPopup(false)
		})
		socket.on("readyCheck", (data: any) => {
			setReadyCheckTime(data.timeLeft)
			setReadyCheckPopup(true)
		})
		socket.on("updatedLobby", () => {
			setLobbyUpdating(true)
			console.log("lobby update received")
			fetchLobby()
		})
	}, [])

	async function chooseReadyCheck(response: ReadyCheckState) {
		setReadyCheckAccept(response)
		if (response == ReadyCheckState.Accepted) {
			let success = await callAPI("accept-ready-check", "POST", {}, {})
			if (success.response.code == 200) {
				setMatchMakingStarted(false)
			}
		} else if (response == ReadyCheckState.Declined) {
			let success = await callAPI("decline-ready-check", "POST", {}, {})
			if (success.response.code == 200) {
				setMatchMakingStarted(false)
			}
		}
	}
	const fetchMapData = async (queueData: any) => {
		let _maxPlayers = queueData.numPlayersPerTeam
		let _playerVersusPlayer = _maxPlayers + "v" + _maxPlayers

		let _name = queueData.name // pl "Normal"
		let _showPositionSelector: boolean = queueData.showPositionSelector // true/false
		let _subType = queueData.description // pl "Draft Pick"

		let mapId = queueData.mapId
		let map = await callAPI("get-map", "POST", {}, { mapID: mapId })
		map = map.payload
		// type: pl NORMAL
		// Q_.. előjel: queue adat
		// M_.. elpjel: map adat
		let mapSlug = map.mapStringId // pl: SR
		let mapName = map.name // pl: "Summoner's Rift"

		let mapIcon = "gamemodeAssets/" + mapSlug + "/iconAnimatedActive.webm"
		let mapBackgroundLobby =
			"gamemodeAssets/" + mapSlug + "/lobby_background.jpg"
		let mapData = {
			Q_type: queueData.type,
			Q_subType: _subType,
			Q_name: _name,
			Q_showPositionSelector: _showPositionSelector,
			Q_maxTeamSize: _maxPlayers,
			Q_xVxText: _playerVersusPlayer,
			M_slug: mapSlug,
			M_name: mapName,
			M_icon: mapIcon,
			M_lobbyBg: mapBackgroundLobby,
		}
		setMapData(mapData)
	}
	const fetchLobby = async () => {
		let data = await callAPI("lobby", "GET", {})
		data = data.payload
		let members: any = []
		data.members.forEach((member: any) => {
			//if (member.summonerId != data.localMember.summonerId) {
			members.push(member)
			//}
		})
		let lobbyData: any = {
			mapId: data.gameConfig.mapId,
			ableToStart: data.canStartActivity,
			queueId: data.gameConfig.queueId,
			partyType: data.partyType,
			localMember: data.localMember,
			members: members,
			queueData: data.gameConfig.queueData,
			maxTeamSize: data.gameConfig.maxTeamSize,
			showPositionSelector: data.gameConfig.showPositionSelector,
		}
		//setCurrentQueueData(data.gameConfig.queueData)
		fetchMapData(data.gameConfig.queueData)
		setLoadedLobby(lobbyData)
	}
	return (
		<main
			style={
				mapData
					? {
							background:
								"linear-gradient( rgba(0, 40, 90, 0.55), rgba(0, 20, 50, 0.55) ), url(" +
								mapData.M_lobbyBg +
								")",
					  }
					: {}
			}
			className={style.main}
		>
			{mapData ? (
				<LobbyBreadCrumb
					mapData={mapData}
					exitLobbyHandler={exitLobby}
				/>
			) : (
				<></>
			)}
			<div className={style.lobbyContainer}>
				{loadedLobby == null ? (
					"Loading.."
				) : (
					<LobbyContainer
						lobby={loadedLobby}
						showPositionSelector={loadedLobby.showPositionSelector}
					/>
				)}

				<LobbyUser />
				{/*
          <button onClick={exitLobby}>Exit lobby</button>
				{matchMakingStarted == false ? (
					<button onClick={startMatchMaking}>Find Match</button>
				) : (
					<button onClick={stopMatchMaking}>Stop</button>
				)}
				{matchMakingStarted == true ? (
					<div>
						<span>Time Elapsed: {timeElapsed}</span>
						<br />
						<span>Time Estimated: {timeEstimated}</span>
					</div>
				) : (
					<></>
				)}
        */}

				{readyCheckPopup == true ? (
					<ReadyCheckPopup
						time={readyCheckTime}
						status={readyCheckAccept}
						handler={chooseReadyCheck}
					/>
				) : (
					<></>
				)}
				{
					//<ReadyCheckPopup time={0} status={readyCheckAccept} handler={chooseReadyCheck}/>
				}
			</div>
		</main>
	)
}
