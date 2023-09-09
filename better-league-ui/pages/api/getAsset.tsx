import callAPI from "./callAPI"
import urlFromStream from "./urlFromStream"

export async function getAssetUrlById(
	type: AssetType,
	id: number,
	filetype: string = "jpg"
) {
	if (type === AssetType.SkinSplash) {
		let champId = id.toString().substring(0, id.toString().length - 3)
		let stream = await callAPI(
			"get-asset",
			"POST",
			{},
			{
				plugin: "lol-game-data",
				path:
					"/v1/champion-splashes/" +
					champId +
					"/" +
					id +
					"." +
					filetype,
			},
			false
		)
		return await urlFromStream(stream)
	} else if (type === AssetType.ChampionSplash) {
		let champId = id
		let stream = await callAPI(
			"get-asset",
			"POST",
			{},
			{
				plugin: "lol-game-data",
				path:
					"/v1/champion-splashes/" +
					champId +
					"/" +
					champId +
					"000." +
					filetype,
			},
			false
		)
		return await urlFromStream(stream)
	} else if (type === AssetType.ChampionTile) {
		let champId = id
		let stream = await callAPI(
			"get-asset",
			"POST",
			{},
			{
				plugin: "lol-game-data",
				path:
					"/v1/champion-tiles/" +
					champId +
					"/" +
					champId +
					"000." +
					filetype,
			},
			false
		)
		return await urlFromStream(stream)
	} else if (type == AssetType.ProfileIcon) {
		let stream = await callAPI(
			"get-asset",
			"POST",
			{},
			{
				plugin: "lol-game-data",
				path: "/v1/profile-icons/" + id + "." + filetype,
			},
			false
		)
		return await urlFromStream(stream)
	}
}
export async function getAssetUrlBySplashPath(
	type: AssetType,
	path: string,
	filetype: string = "jpg"
) {
	let tokens = path.split("/")
	let pathConst = ""
	let plugin = tokens[1]
	for (let i = 3; i < tokens.length; i++) {
		pathConst = pathConst + "/" + tokens[i]
	}
	if (type === AssetType.ChampionSplash || type === AssetType.SkinSplash) {
		let stream = await callAPI(
			"get-asset",
			"POST",
			{},
			{ plugin: plugin, path: pathConst },
			false
		)
		return await urlFromStream(stream)
	} else if (type == AssetType.ProfileIcon) {
		let stream = await callAPI(
			"get-asset",
			"POST",
			{},
			{ plugin: plugin, path: pathConst },
			false
		)
		return await urlFromStream(stream)
	}
}
export async function getLolSplashIcon() {
	let Path = "/lol-game-data/assets/ASSETS/SplashScreens/lol_icon.png"
	let Icon = await getAssetUrlBySplashPath(AssetType.SkinSplash, Path)
	return Icon
}
export enum AssetType {
	ChampionSplash,
	ChampionTile,
	SkinSplash,
	ProfileIcon,
}
