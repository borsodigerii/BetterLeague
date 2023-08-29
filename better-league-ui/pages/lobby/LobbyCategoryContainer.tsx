import callAPI from "../api/callAPI";

export default function LobbyCategoryContainer(props: any){
    const result: any[] = []

    props.queues.forEach((mainQueue: any) => {
        let modes: any[] = [];
        mainQueue.queues.forEach((queue: any) => {
            modes.push(
                <button onClick={() => createLobbyWithQueue(queue.id)}>{queue.description} - {queue.id}</button>
            )
        })

        result.push(
            <div>
                <h2>{mainQueue.type}</h2>

                {modes}
            </div>
        )
    })

    const createLobbyWithQueue = async (queueId: BigInteger) => {
        let success = await callAPI("create-lobby", "POST", {}, {"qId": queueId});
        if(success.response.code == 400){
            // The provided queueId is invalid. / no queueId provided

        }
    }
    return(
        <div>{result}</div>
    )
}