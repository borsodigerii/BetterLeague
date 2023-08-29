export default function DisplayBasicData(props: any){
    return (
        <div>
            <h1>User</h1>
            
            <div>
                display name: {props.data.displayName == "" ? "..." : props.data.displayName}
            </div>
            <div>
                level: {props.data.summonerLevel == 0 ? "..." : props.data.summonerLevel}
            </div>
        </div>
    );
}