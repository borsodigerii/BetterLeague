export default interface QueueData{
    id: number,
    name: String, // pl. Normal
    areFreeChampionsAllowed: boolean,
    championsRequiredToPlay: number,
    description: String, // pl. "Draft Pick"
    detailedDescription: String,
    numPlayersPerTeam: number,
    playerVersusPlayerLabel: String,
    isRanked: boolean,
    minLevel: number,
    showPositionSelector: boolean,
    type: String // pl. NORMAL,
    category: String,
    gameMode: String,
    queueAvailability: QueueAvailability
}

export enum QueueAvailability{
    Available,
    PlatformDisabled,
    DoesntMeetRequirements
}