import LobbyMember from "./LobbyMember"
import style from "./lobby.module.css"

export default function LobbyContainer(props: any) {
	console.log("rendered lobbycontainer")
	let lobbyData = props.lobby
	let members = lobbyData.members
	let localMemberId = lobbyData.localMember.summonerId
	let display: any[] = []
	let count = 0
	display.push(
		<img
			className={style.lobbyPlayersTableDividerTop}
			src="lobby/table-bottom-top.png"
			alt=""
		/>
	)
	members.forEach((member: any) => {
		display.push(
			<LobbyMember
				member={{ ...member }}
				localMember={localMemberId == member.summonerId ? true : false}
				showPositionSelector={props.showPositionSelector}
			/>
		)
		display.push(
			<LobbyMember
				member={{ ...member }}
				localMember={false}
				showPositionSelector={props.showPositionSelector}
			/>
		)
		count++
	})
	//if (count < lobbyData.maxTeamSize - 1) {
	if (count < lobbyData.maxTeamSize) {
		//for (let i = count; i < lobbyData.maxTeamSize - 1; i++) {
		for (let i = count; i < lobbyData.maxTeamSize; i++) {
			display.push(
				<LobbyMember
					member={null}
					localMember={false}
					showPositionSelector={props.showPositionSelector}
				/>
			)
		}
	}
	display.push(
		<img
			className={style.lobbyPlayersTableDividerTop}
			src="lobby/table-bottom-top.png"
			alt=""
		/>
	)
	/*return (
        <div>{JSON.stringify(props.lobby)}</div>
    )*/
	return <div className={style.lobbyContainerPlayers}>{display}</div>
}
