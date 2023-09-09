import { useEffect, useState } from "react"
import style from "./champSelect.module.css"
import TeamContainer from "./TeamContainer"

export default function ChampSelect(props: any) {
	const [initialized, setInitialized] = useState(false)

	const [actions, setActions] = useState<any>(null)
	const [localPlayerCellId, setLocalPlayerCellId] = useState(-1)
	const [myTeam, setMyTeam] = useState<any>(null)
	const [theirTeam, setTheirTeam] = useState<any>(null)
	const [phase, setPhase] = useState("")

	const socket = props.socket
	useEffect(() => {
		/*socket.on("updatedChampSelect", (data: any) => {
			loadData(data)
		})*/
		let json =
			'{"actions":[[{"actorCellId":0,"championId":0,"completed":false,"id":1,"isAllyAction":true,"isInProgress":true,"pickTurn":1,"type":"pick"}]],"allowBattleBoost":false,"allowDuplicatePicks":false,"allowLockedEvents":false,"allowRerolling":false,"allowSkinSelection":true,"bans":{"myTeamBans":[],"numBans":0,"theirTeamBans":[]},"benchChampions":[],"benchEnabled":false,"boostableSkinCount":1,"chatDetails":{"mucJwtDto":{"channelClaim":"","domain":"","jwt":"","targetRegion":""},"multiUserChatId":"c1~532ce07b9b0fd662ce769354c926ee30dbb7e79b","multiUserChatPassword":"HMLDbW8LsJIC3mU1"},"counter":-1,"entitledFeatureState":{"additionalRerolls":0,"unlockedSkinIds":[]},"gameId":0,"hasSimultaneousBans":false,"hasSimultaneousPicks":true,"isCustomGame":true,"isSpectating":false,"localPlayerCellId":0,"lockedEventIndex":-1,"myTeam":[{"assignedPosition":"","cellId":0,"championId":0,"championPickIntent":0,"entitledFeatureType":"","nameVisibilityType":"","obfuscatedPuuid":"","obfuscatedSummonerId":0,"puuid":"","selectedSkinId":0,"spell1Id":1,"spell2Id":3,"summonerId":64053626,"team":1,"wardSkinId":-1},{"assignedPosition":"","cellId":1,"championId":68,"championPickIntent":0,"entitledFeatureType":"","nameVisibilityType":"","obfuscatedPuuid":"","obfuscatedSummonerId":0,"puuid":"","selectedSkinId":0,"spell1Id":1,"spell2Id":3,"summonerId":64053627,"team":1,"wardSkinId":-1},{"assignedPosition":"","cellId":2,"championId":104,"championPickIntent":0,"entitledFeatureType":"","nameVisibilityType":"","obfuscatedPuuid":"","obfuscatedSummonerId":0,"puuid":"","selectedSkinId":0,"spell1Id":1,"spell2Id":3,"summonerId":64053636,"team":1,"wardSkinId":-1},{"assignedPosition":"","cellId":3,"championId":117,"championPickIntent":0,"entitledFeatureType":"","nameVisibilityType":"","obfuscatedPuuid":"","obfuscatedSummonerId":0,"puuid":"","selectedSkinId":0,"spell1Id":1,"spell2Id":3,"summonerId":64053646,"team":1,"wardSkinId":-1},{"assignedPosition":"","cellId":4,"championId":0,"championPickIntent":0,"entitledFeatureType":"","nameVisibilityType":"","obfuscatedPuuid":"","obfuscatedSummonerId":0,"puuid":"","selectedSkinId":0,"spell1Id":1,"spell2Id":3,"summonerId":64053656,"team":1,"wardSkinId":-1}],"pickOrderSwaps":[],"recoveryCounter":0,"rerollsRemaining":0,"skipChampionSelect":false,"theirTeam":[],"timer":{"adjustedTimeLeftInPhase":89744,"internalNowInEpochMs":1694206846156,"isInfinite":false,"phase":"BAN_PICK","totalTimeInPhase":92744},"trades":[]}'
		loadData(JSON.parse(json))
	}, [])

	/*const loadData = (data: any) => {
		console.log("update received, updating..")
		setActions([...data.actions])
		setLocalPlayerCellId(data.localPlayerCellId)
		setMyTeam([...data.myTeam])
		setTheirTeam([...data.theirTeam])
		setPhase(data.timer.phase)
		setInitialized(true)
	}*/
	const loadData = (data: any) => {
		console.log("update received, updating..")
		setActions(data.actions)
		setLocalPlayerCellId(data.localPlayerCellId)
		setMyTeam(data.myTeam)
		setTheirTeam(data.theirTeam)
		setPhase(data.timer.phase)
		setInitialized(true)
	}
	//TODO: kommentelteket visszarakni, tobbit torolni, loadDataban SPREAD operatort beallitani ([...data])
	return (
		<div
			className={style.champSelect}
			style={{
				backgroundImage:
					"linear-gradient( rgba(0, 0, 0, 0.30), rgba(0, 0, 0, 0.30) ), url(gamemodeAssets/SR/map-south.png)",
				backgroundRepeat: "no-repeat",
				backgroundSize: "cover",
				backgroundPosition: "center center",
			}}
		>
			{initialized ? (
				<TeamContainer
					team={myTeam}
					actions={actions}
					localPlayerCellId={localPlayerCellId}
					phase={phase}
				/>
			) : (
				"Loading.."
			)}
		</div>
	)
}
