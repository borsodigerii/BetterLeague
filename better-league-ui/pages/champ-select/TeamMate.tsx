import { useEffect, useState } from "react"
import style from "./champSelect.module.css"
import { AssetType, getAssetUrlById } from "../api/getAsset"
import callAPI from "../api/callAPI"

export default function TeamMate(props: any) {
	console.log("teammate render")
	const isPicking: boolean = props.isPicking
	const phase = props.phase // pick || ban
	const isLocal: boolean = props.isLocal
	const data = props.data

	const [championIcon, setChampionIcon] = useState(
		"champSelect/random-champion.png"
	)
	const [summonerName, setSummonerName] = useState("")

	useEffect(() => {
		fetchChampIcon()
		fetchSummonder()
	}, [data, isPicking, phase])
	const fetchChampIcon = async () => {
		console.log(
			"fetching champion pic.. championId: " + data.championId,
			", championPickIntent: " + data.championPickIntent
		)
		if (data.championId != 0 || data.championPickIntent != 0) {
			let url = await getAssetUrlById(
				AssetType.ChampionTile,
				data.championId != 0 ? data.championId : data.championPickIntent
			)
			if (typeof url == "string") {
				setChampionIcon(url)
			}
		} else {
			setChampionIcon("champSelect/random-champion.png")
		}
	}
	const fetchSummonder = async () => {
		let summoner = await callAPI(
			"get-summoner-by-id",
			"POST",
			{},
			{ summonerId: data.summonerId }
		)
		console.log("summoner display name: " + summoner.payload.displayName)
		setSummonerName(summoner.payload.displayName)
	}
	/*
    DATA:

    {
        "assignedPosition": "",
        "cellId": 0,
        "championId": 0,
        "championPickIntent": 0,
        "entitledFeatureType": "",
        "nameVisibilityType": "",
        "obfuscatedPuuid": "",
        "obfuscatedSummonerId": 0,
        "puuid": "",
        "selectedSkinId": 0,
        "spell1Id": 1,
        "spell2Id": 3,
        "summonerId": 64053626,
        "team": 1,
        "wardSkinId": -1
    }
    */

	return (
		<>
			<div
				className={
					style.teamMember +
					(isLocal ? " " + style.local : "") +
					(isPicking ? " " + style.picking : "")
				}
			>
				<div className={style.champIcon}>
					<img src={championIcon} alt="" />
				</div>
				<div className={style.memberData}>
					<span className={style.memberName}>{summonerName}</span>
					{isPicking ? (
						<span className={style.pickingLabel}>Picking...</span>
					) : (
						""
					)}
				</div>
			</div>
		</>
	)
}
