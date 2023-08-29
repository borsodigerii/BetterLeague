import LobbyMember from './LobbyMember'

export default function LobbyContainer(props: any){
    let members = props.lobby.members
    
    let display: any[] = []
    let count = 0;
    members.forEach((member: any) => {
        display.push(
            <LobbyMember member={member}/>
        )
        count++
    })
    if(count < 4){
        for(let i = count; i < 4;i++ ){
            display.push(
                <LobbyMember member={null}/>
            )
        }
    }
    /*return (
        <div>{JSON.stringify(props.lobby)}</div>
    )*/
    return(
        <div>{display}</div>
    )
}