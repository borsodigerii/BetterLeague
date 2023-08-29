export default function LobbyMember(props: any){
    return(
        <div>{props.member == null ? "null" : JSON.stringify(props.member)}</div>
    )
}