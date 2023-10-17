import BL__API from "../api/callAPI"
import callAPI from "../api/callAPI"
import QueueData from "../api/interfaces/QueueData"

export default function LobbyCategoryContainer(props: {queues: [{type: String, queues: QueueData[]}]}) {
	const result: any[] = []

	props.queues.forEach((mainQueue) => {
		let modes: any[] = []
		mainQueue.queues.forEach((queue: QueueData) => {
			modes.push(
				<button onClick={() => createLobbyWithQueue(queue.id)}>
					{queue.description} - {queue.id}
				</button>
			)
		})

		result.push(
			<div>
				<h2>{mainQueue.type}</h2>

				{modes}
			</div>
		)
	})

	const createLobbyWithQueue = async (queueId: number) => {
		if(!await BL__API.CreateLobbyWithQueue(queueId)){
			// invalid queueid specified
		}
	}
	return <div>{result}</div>
}
