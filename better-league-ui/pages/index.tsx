import Head from "next/head"
import Image from "next/image"
import { Anybody, Inter } from "@next/font/google"
import styles from "@/styles/Home.module.css"
import { useState, useEffect } from "react"
import callAPI from "./api/callAPI"
import LoadingScreen__Login from "./LoadingScreen__Login"

import MainFront from "./MainFront"
import CreateLobby from "./lobby/CreateLobby"
import Lobby from "./lobby/Lobby"
import { NavBarIconLinkStruct, NavBarLinkStruct } from "@/navbar/NavBar"
import NavBar from "@/navbar/NavBar"

import { socket } from "./socket-io"
import Settings from "./Settings"
import { BL_Settings, Setting } from "@/settings/BL_Settings"
import ChampSelect from "./champ-select/ChampSelect"

const inter = Inter({ subsets: ["latin"] })
const sc = socket.connect()
export default function Home() {
	const [port, setPort] = useState(0)
	const [password, setPassword] = useState("")
	const [authPack, setAuthPack] = useState({ port: null, pass: null })
	const [initialized, setInitialized] = useState(false)
	const [userData, setUserData] = useState({ payload: null })
	const [startedInit, setStartedInit] = useState(false)
	const [blueEssence, setBlueEssence] = useState(0)
	const [riotPoints, setRiotPoints] = useState(0)
	const [currentQueue, setCurrentQueue] = useState(null)
	const [isCurrentlyInLobby, setIsInLobby] = useState(false)
	//SETTINGS
	/*const [setting_autoReadyCheck, setSetting_autoReadyCheck] = useState(false)

	const settingsList: Setting[] = [
		{
			name: "Automatically accept ready check",
			identifier: "setting_autoReadyCheck",
			value: setting_autoReadyCheck,
			stateHandler: setSetting_autoReadyCheck,
		},
	]*/

	//-------
	/*function setSetting(identifier: string, value: boolean) {
		settingsList.map((setting: Setting) => {
			if (setting.identifier == identifier) {
				localStorage.setItem(setting.identifier, value.toString())
				setting.stateHandler(value)
			}
		})
	}
	function initSettings() {
		const stored_setting_autoReadyCheck = localStorage.getItem(
			"setting_autoReadyCheck"
		)
		if (stored_setting_autoReadyCheck) {
			setSetting_autoReadyCheck(JSON.parse(stored_setting_autoReadyCheck))
		} else {
			localStorage.setItem(
				"setting_autoReadyCheck",
				setting_autoReadyCheck.toString()
			)
		}
	}*/
	//SETTINGS

	const [navigation, setNavigation] = useState("home")
	async function isInLobby() {
		let data = await callAPI("isInLobby", "GET", {})
		return data.payload
	}
	const initApp = async () => {
		console.log("[INIT] Init started..")
		if (!startedInit) {
			setStartedInit(true)
			let response = await callAPI("get-auth-info", "GET", {})
			setPort(response.payload.port)
			setPassword(response.payload.password)
			let authPack = {
				port: response.payload.port,
				pass: response.payload.password,
			}
			setAuthPack(authPack)
			let userdata = await callAPI("user-info", "GET", {})
			setUserData(userdata)
			if (typeof window !== "undefined") {
				//initSettings()
				BL_Settings.init()
			}

			let _isInLobby: boolean = await isInLobby()
			setIsInLobby(_isInLobby)

			setInitialized(true)
		}
		console.log("[INIT] Init finished")
	}
	if (!startedInit) initApp()

	useEffect(() => {
		socket.on("connect", () => {
			console.log("connected")
		})
		socket.on("createdLobby", (data: any) => {
			setNavigation("lobby")
			setIsInLobby(true)
		})
		socket.on("exitedLobby", () => {
			setNavigation("home")
			setIsInLobby(false)
		})
		socket.on("createdChampSelect", () => {
			setNavigation("champ-select")
		})
	}, [])
	function changeNavigation(slug: string) {
		setNavigation(slug)
	}

	let finalResult = []
	let links: NavBarLinkStruct[] = [
		{
			link: "create_lobby",
			displayName: isCurrentlyInLobby ? "Party" : "Play",
			class: [
				"playButton",
				isCurrentlyInLobby ? "party" : "",
				navigation == "lobby" || navigation == "create_lobby"
					? "grayscale"
					: "",
			],
		},
		{
			link: "home",
			displayName: "Home",
			class: [],
		},
	]
	let iconLinks: NavBarIconLinkStruct[] = [
		{
			link: "collection",
			iconId: 0,
			class: [],
		},
	]
	let resources = {
		blueEssence: 0,
		riotPoints: 0,
	}
	finalResult.push(
		<Head>
			<title>BetterLeague</title>
			<meta name="description" content="Generated by create next app" />
			<meta
				name="viewport"
				content="width=device-width, initial-scale=1"
			/>
			<link rel="icon" href="/favicon.ico" />
		</Head>
	)
	//TODO: kivenni az && utani reszt
	if (navigation != "champ-select" && navigation != "home") {
		finalResult.push(
			<NavBar
				links={links}
				iconLinks={iconLinks}
				resources={resources}
				changeNav={changeNavigation}
				currentNav={navigation}
			/>
		)
	}

	switch (navigation) {
		case "home":
			//TODO: a kikommentelt reszt visszarakni, az alatta levot torolni
			/*finalResult.push(
				<>
					{initialized == true ? (
						<MainFront
							auth={authPack}
							user={userData.payload}
							changeNav={changeNavigation}
						/>
					) : (
						<LoadingScreen__Login />
					)}
				</>
			)*/
			finalResult.push(
				<>
					<ChampSelect socket={socket} />
				</>
			)
			break

		case "create_lobby":
			finalResult.push(
				<>
					<CreateLobby
						isInLobby={isCurrentlyInLobby}
						changeNav={changeNavigation}
					/>
				</>
			)
			break

		case "lobby":
			finalResult.push(
				<>
					<Lobby socket={socket} />
				</>
			)
			break

		case "settings":
			finalResult.push(
				<>
					<Settings />
				</>
			)
			break

		case "champ-select":
			finalResult.push(
				<>
					<ChampSelect socket={socket} />
				</>
			)
	}

	return finalResult
}
