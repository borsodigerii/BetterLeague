/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react"
import { PlayerPosition, parsePlayerPosition } from "../PlayerPositions"
import callAPI from "../api/callAPI"
import style from "./lobbyMember.module.css"
import { AssetType, getAssetUrlById } from "../api/getAsset"

export default function LobbyMember(props: any) {
	const [profileIcon, setProfileIcon] = useState("")
	const [name, setName] = useState("")
	const [summonerIconId, setSummonerIconId] = useState(0)
	const [summonerId, setSummonerId] = useState(-1)
	const [firstPosition, setFirstPosition] = useState<PlayerPosition>()
	const [secondPosition, setSecondPosition] = useState<PlayerPosition>()

	//let userData = callAPI("get-summoner-by-id", "POST", {}, {summonerId: member.summonerId})
	useEffect(() => {
		if (profileIcon == "" && props.member !== null) {
			const fetchIcon = async () => {
				let member = props.member

				setName(member.summonerName)
				setSummonerIconId(member.summonerIconId)
				setSummonerId(member.summonerId)
				setFirstPosition(
					parsePlayerPosition(member.firstPositionPreference)
				)
				setSecondPosition(
					parsePlayerPosition(member.secondPositionPreference)
				)
				let profIcon = await getAssetUrlById(
					AssetType.ProfileIcon,
					summonerIconId
				)
				if (typeof profIcon == "string") {
					setProfileIcon(profIcon)
				}
			}
			fetchIcon()
		}
	})

	return (
		<div
			className={
				style.lobbyPlayer +
				(summonerId == props.localMember ? " " + style.local : "")
			}
		>
			{props.member !== null ? (
				<>
					<div className={style.profileLEFT}>
						<div className={style.profileIcon}>
							<img
								className={style.frame}
								src="lobby/player-icon-frame.png"
								alt=""
							/>
							<img
								className={style.icon}
								src={profileIcon}
								alt=""
							/>
						</div>
						<div
							className={
								style.profileName +
								(summonerId == props.localMember
									? " " + style.local
									: "")
							}
						>
							{name}
						</div>
					</div>
					<div className={style.profileRIGHT}>
						{props.showPositionSelector == true ? (
							<>
								{firstPosition == PlayerPosition.TOP ? (
									<img
										src="lobby/icon-position-top.png"
										alt=""
										className={style.firstPosition}
									/>
								) : firstPosition == PlayerPosition.JUNGLE ? (
									<img
										src="lobby/icon-position-jungle.png"
										alt=""
										className={style.firstPosition}
									/>
								) : firstPosition == PlayerPosition.MIDDLE ? (
									<img
										src="lobby/icon-position-middle.png"
										alt=""
										className={style.firstPosition}
									/>
								) : firstPosition == PlayerPosition.BOTTOM ? (
									<img
										src="lobby/icon-position-bottom.png"
										alt=""
										className={style.firstPosition}
									/>
								) : (
									<img
										src="lobby/icon-position-utility.png"
										alt=""
										className={style.firstPosition}
									/>
								)}
								{secondPosition == PlayerPosition.TOP ? (
									<img
										src="lobby/icon-position-top-member.png"
										alt=""
										className={style.secondPosition}
									/>
								) : secondPosition == PlayerPosition.JUNGLE ? (
									<img
										src="lobby/icon-position-jungle-member.png"
										alt=""
										className={style.secondPosition}
									/>
								) : secondPosition == PlayerPosition.MIDDLE ? (
									<img
										src="lobby/icon-position-middle-member.png"
										alt=""
										className={style.secondPosition}
									/>
								) : secondPosition == PlayerPosition.BOTTOM ? (
									<img
										src="lobby/icon-position-bottom-member.png"
										alt=""
										className={style.secondPosition}
									/>
								) : (
									<img
										src="lobby/icon-position-utility-member.png"
										alt=""
										className={style.secondPosition}
									/>
								)}
							</>
						) : (
							<></>
						)}
					</div>
				</>
			) : (
				<>
					<div className={style.profileLEFT}>
						<div className={style.profileIcon}>
							{/*<img
								className={style.frame}
								src="lobby/player-icon-frame.png"
								alt=""
							/>
							<img
								className={style.icon}
								src={profileIcon}
								alt=""
                            />*/}
							<img
								src="lobby/player_empty.png"
								alt=""
								className={style.icon}
							/>
						</div>
						<div className={style.profileName}>-</div>
					</div>
					<div className={style.profileRIGHT}></div>
				</>
			)}
		</div>
	)
}
