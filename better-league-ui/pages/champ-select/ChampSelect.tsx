import { useEffect, useState } from "react"
import style from "./champSelect.module.css"
import TeamContainer from "./TeamContainer"
import { NumberLiteralType } from "typescript"


/*

PHASES
----
BAN_PICK

FINALIZATION

*/

export default function ChampSelect(props: any) {
	const [initialized, setInitialized] = useState(false)

	const [actions, setActions] = useState<any>(null)
	const [localPlayerCellId, setLocalPlayerCellId] = useState(-1)
	const [myTeam, setMyTeam] = useState<any>(null)
	const [theirTeam, setTheirTeam] = useState<any>(null)
	const [phase, setPhase] = useState("")

	const [phaseTimer, setPhaseTimer] = useState<number>(-1)
	
	/*const setupTimer = (time: number) => {
		if(phaseTimer == -1){
			setPhaseTimer(Math.floor(time / 1000))
			window.setInterval(() => {
				setPhaseTimer(prevTime => prevTime - 1); // <-- Change this line!
			}, 1000);
		}
	}*/
	const socket = props.socket
	useEffect(() => {
		socket.on("updatedChampSelect", (data: any) => {
			loadData(data)
		})
		const timer = window.setTimeout(() => {
			if(phaseTimer >= 0){
				setPhaseTimer(prevTime => prevTime - 1); // <-- Change this line!
			}
		  }, 1000);
		
		/*let json =
			'{"actions":[[{"actorCellId":0,"championId":0,"completed":false,"id":1,"isAllyAction":true,"isInProgress":true,"pickTurn":1,"type":"pick"}]],"allowBattleBoost":false,"allowDuplicatePicks":false,"allowLockedEvents":false,"allowRerolling":false,"allowSkinSelection":true,"bans":{"myTeamBans":[],"numBans":0,"theirTeamBans":[]},"benchChampions":[],"benchEnabled":false,"boostableSkinCount":1,"chatDetails":{"mucJwtDto":{"channelClaim":"","domain":"","jwt":"","targetRegion":""},"multiUserChatId":"c1~532ce07b9b0fd662ce769354c926ee30dbb7e79b","multiUserChatPassword":"HMLDbW8LsJIC3mU1"},"counter":-1,"entitledFeatureState":{"additionalRerolls":0,"unlockedSkinIds":[]},"gameId":0,"hasSimultaneousBans":false,"hasSimultaneousPicks":true,"isCustomGame":true,"isSpectating":false,"localPlayerCellId":0,"lockedEventIndex":-1,"myTeam":[{"assignedPosition":"","cellId":0,"championId":0,"championPickIntent":0,"entitledFeatureType":"","nameVisibilityType":"","obfuscatedPuuid":"","obfuscatedSummonerId":0,"puuid":"","selectedSkinId":0,"spell1Id":1,"spell2Id":3,"summonerId":64053626,"team":1,"wardSkinId":-1},{"assignedPosition":"","cellId":1,"championId":68,"championPickIntent":0,"entitledFeatureType":"","nameVisibilityType":"","obfuscatedPuuid":"","obfuscatedSummonerId":0,"puuid":"","selectedSkinId":0,"spell1Id":1,"spell2Id":3,"summonerId":64053627,"team":1,"wardSkinId":-1},{"assignedPosition":"","cellId":2,"championId":104,"championPickIntent":0,"entitledFeatureType":"","nameVisibilityType":"","obfuscatedPuuid":"","obfuscatedSummonerId":0,"puuid":"","selectedSkinId":0,"spell1Id":1,"spell2Id":3,"summonerId":64053636,"team":1,"wardSkinId":-1},{"assignedPosition":"","cellId":3,"championId":117,"championPickIntent":0,"entitledFeatureType":"","nameVisibilityType":"","obfuscatedPuuid":"","obfuscatedSummonerId":0,"puuid":"","selectedSkinId":0,"spell1Id":1,"spell2Id":3,"summonerId":64053646,"team":1,"wardSkinId":-1},{"assignedPosition":"","cellId":4,"championId":0,"championPickIntent":0,"entitledFeatureType":"","nameVisibilityType":"","obfuscatedPuuid":"","obfuscatedSummonerId":0,"puuid":"","selectedSkinId":0,"spell1Id":1,"spell2Id":3,"summonerId":64053656,"team":1,"wardSkinId":-1}],"pickOrderSwaps":[],"recoveryCounter":0,"rerollsRemaining":0,"skipChampionSelect":false,"theirTeam":[],"timer":{"adjustedTimeLeftInPhase":89744,"internalNowInEpochMs":1694206846156,"isInfinite":false,"phase":"BAN_PICK","totalTimeInPhase":92744},"trades":[]}'
		loadData(JSON.parse(json))*/
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
		//setupTimer(data.timer.adjustedTimeLeftInPhase)
		setPhaseTimer(Math.floor(data.timer.adjustedTimeLeftInPhase / 1000))
		
		setInitialized(true)
	}
	//TODO: kommentelteket visszarakni, tobbit torolni, loadDataban SPREAD operatort beallitani ([...data])
	return (
		<>
			<div className={style.phaseContainer}>
				<h2>{phase}</h2>
				<span>{phaseTimer}s</span>
			</div>
			<div
				className={style.champSelect}
				style={{
					backgroundImage:
						"linear-gradient( rgba(0, 0, 0, 0.40), rgba(0, 0, 0, 0.40) ), url(gamemodeAssets/SR/map-south.png)",
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
						reversed={false}
					/>
					
				) : (
					"Loading.."
				)}
				{initialized ? (
					<TeamContainer
						team={myTeam}
						actions={actions}
						localPlayerCellId={localPlayerCellId}
						phase={phase}
						reversed={true}
					/>
					
				) : (
					"Loading.."
				)}
			</div>
		</>
	)
}
