import {
	AssetType,
	getAssetUrlById,
	getAssetUrlBySplashPath,
} from "./api/getAsset"
import { useState, useEffect } from "react"
import styles from "styles/main.module.css"
import AuthPack from "./api/interfaces/AuthPack"
import UserData from "./api/interfaces/UserData"
import Skin from "./api/interfaces/Skin"

export default function MainFront(props: {auth: AuthPack, user: UserData | null, changeNav: any}) {
	let backgroundSplashPath = ""
	props.user!.skins.forEach((skin: Skin) => {
		if (skin.id == props.user!.backgroundSkinId) {
			backgroundSplashPath = skin.splashPath
		}
	})
	const [backgroungSplash, setBackgroundSplash] = useState("empty")
	const [profileIcon, setProfileIcon] = useState("empty")
	const [testicon, setTestIcon] = useState("empty")
	useEffect(() => {
		if (backgroungSplash == "empty") {
			const getSplash = async () => {
				let backgroundSplash = await getAssetUrlBySplashPath(
					AssetType.SkinSplash,
					backgroundSplashPath
				)
				if (typeof backgroundSplash == "string") {
					setBackgroundSplash(backgroundSplash)
				}
				let profileIcon = await getAssetUrlById(
					AssetType.ProfileIcon,
					props.user!.profileIconId
				)
				if (typeof profileIcon == "string") {
					setProfileIcon(profileIcon)
				}
				let testPath =
					"/lol-game-data/assets/ASSETS/SplashScreens/lol_icon.png"
				let testIcon = await getAssetUrlBySplashPath(
					AssetType.SkinSplash,
					testPath
				)
				if (typeof testIcon == "string") {
					setTestIcon(testIcon)
				}
			}
			getSplash()
		}
	}, [])

	return (
		<main
			style={{
				backgroundImage: "url('" + backgroungSplash + "')",
				backgroundRepeat: "no-repeat",
				backgroundSize: "cover",
				backgroundPosition: "center center",
			}}
			className={styles.frontMain}
		>
			<div className={styles.userDetails}>
				<div className={styles.userDetailsContainer}>
					<img
						className={styles.profileIcon}
						src={profileIcon}
						alt=""
					/>
					<div>
						<div className={styles.userName}>
							{props.user!.displayName}
							<span className={styles.userRegion}>#EUNE</span>
						</div>
						<div className={styles.userLevel}>
							Lvl.{props.user!.summonerLevel}
						</div>
					</div>
				</div>

				{
					//<img src={testicon} alt="" />
				}
			</div>
		</main>
	)
}
