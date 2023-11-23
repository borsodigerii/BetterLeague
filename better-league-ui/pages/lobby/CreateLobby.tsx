import { useState, useEffect } from "react"
import callAPI from "../api/callAPI"
import LobbyCategoryContainer from "./LobbyCategoryContainer"
import styles from "../../styles/main.module.css"
import BL__API from "../api/callAPI"
import QueueData, { QueueAvailability } from "../api/interfaces/QueueData"

export default function CreateLobby(props: any) {
	const [loadedQueues, setQueues] = useState<[{type: String, queues: QueueData[]}] | null>(null)

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
				let queues: [{type: String, queues: QueueData[]}] = [] as unknown as [{type: String, queues: QueueData[]}];
				//let queuesResponse = await callAPI("queues", "GET", {})
				let queuesResponse = await BL__API.GetQueues()
				//queuesResponse.payload.forEach((queue: any) => {
				queuesResponse.forEach((queue: QueueData) => {
					/*if (queue.queueAvailability == QueueAvailability.Available) {
						if (gamemodes.get(queue.gameMode) == undefined) {
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
					}*/
					if(queue.queueAvailability == QueueAvailability.Available){
						let found = false
						queues.forEach(queueType => {
							if(queueType.type == queue.gameMode){
								queueType.queues.push(queue)
								found = true
							}
						})
						if(!found){
							queues.push({type: queue.gameMode, queues: [queue]})
						}
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
