import { useState, useEffect } from "react"
import callAPI from "../api/callAPI"
import LobbyCategoryContainer from "./LobbyCategoryContainer"
import styles from "../../styles/main.module.css"

export default function CreateLobby(props: any) {
	const [loadedQueues, setQueues] = useState(null)

	useEffect(() => {
		document.title = "BetterLeague - Create Lobby"
		if (loadedQueues == null) {
			const fetchQueues = async () => {
				//let isInLobby = await props.isInLobby();
				let isInLobby = props.isInLobby
				if (isInLobby) {
					props.changeNav("lobby")
					return
					//console.log("props.isInLobby() = " + props.isInLobby())
				}
				let queues: any = []
				let gamemodes: any = {}
				let count = 0
				let queuesResponse = await callAPI("queues", "GET", {})
				queuesResponse.payload.forEach((queue: any) => {
					if (queue.queueAvailability == "Available") {
						if (gamemodes[queue.gameMode] == undefined) {
							gamemodes[queue.gameMode] = count++
							queues.push({ type: queue.gameMode, queues: [] })
						}
						let queueData = {
							id: queue.id,
							category: queue.category,
							description: queue.description,
							detailedDescription: queue.detailedDescription,
							minLevel: queue.minLevel,
							gameMode: queue.gameMode,
							type: queue.type,
						}
						queues[gamemodes[queue.gameMode]].queues.push(queueData)
					}
				})
				setQueues(queues)
			}
			fetchQueues()
		}
	})

	return (
		<main>
			{loadedQueues == null ? (
				"Loading..."
			) : (
				<LobbyCategoryContainer queues={loadedQueues} />
			)}
		</main>
	)
}
