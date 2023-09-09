import TeamMate from "./TeamMate"
import style from "./champSelect.module.css"

export default function TeamContainer(props: any) {
	console.log("team container render")
	const actions = props.actions
	const phase = props.phase
	const team = props.team
	const localPlayerCellId = props.localPlayerCellId

	let finalDisplay: any[] = []

	team.forEach((member: any) => {
		let isPicking = false
		let phase = ""
		actions.forEach((action: any) => {
			action.forEach((actionArr: any) => {
				if (
					actionArr.actorCellId == member.cellId &&
					actionArr.isInProgress
				) {
					// member is picking, should anim
					isPicking = true
					phase = actionArr.type
				}
			})
		})
		let isLocal = localPlayerCellId == member.cellId ? true : false
		finalDisplay.push(
			<TeamMate
				data={member}
				isPicking={isPicking}
				phase={phase}
				isLocal={isLocal}
			/>
		)
	})

	return <div className={style.teamContainer}>{finalDisplay}</div>
}
