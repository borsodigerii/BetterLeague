import { useEffect, useState } from "react"
import style from "./breadCrumb.module.css"
import callAPI from "../api/callAPI"
import MapData from "../api/interfaces/MapData"
import QueueData from "../api/interfaces/QueueData"

export default function LobbyBreadCrumb(props: {mapData: MapData, queueData: QueueData, exitLobbyHandler: any}) {
	/*const [mapData, setMapData] = useState<any>(null)

        useEffect(() => {
            if (!mapData) {
                fetchMapData()
            }
        })
        const fetchMapData = async () => {
		let queueData = props.queueData

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
		let mapSlug = map.mapStringId
		let mapName = map.name

		let mapIcon = "gamemodeAssets/" + mapSlug + "/iconAnimatedActive.webm"

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
		}
		setMapData(mapData)
	}*/
	let mapData = props.mapData
	let queueData = props.queueData
	return (
		<div className={style.breadcrumbContainer}>
			<div className={style.backButton}>
				<img
					src="button-back-arrow.png"
					alt=""
					onClick={() => {
						props.exitLobbyHandler()
					}}
				/>
			</div>
			<div className={style.queueIcon}>
				<video autoPlay loop width="100" muted>
					<source src={mapData.iconURL} type="video/webm" />
				</video>
			</div>
			<div className={style.mapDataContainer}>
				<div className={style.mapName}>{mapData.name}</div>
				<div className={style.mapDetails}>
					<span className={style.mapDetail}>{queueData.name}</span>
					<span className={style.mapDetail}>{queueData.description}</span>
					<span className={style.mapDetail}>{queueData.playerVersusPlayerLabel}</span>
				</div>
			</div>
		</div>
	)
}
