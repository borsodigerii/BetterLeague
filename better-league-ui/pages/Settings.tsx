/* eslint-disable react/jsx-key */
import style from "styles/settings.module.css"
import ReactSwitch from "react-switch"
import { useEffect, useState } from "react"
import { BL_Settings, Setting } from "@/settings/BL_Settings"

export default function Settings() {
	const [settings, setSettings] = useState<Setting[]>()
	useEffect(() => {
		setSettings(BL_Settings.getAllSettings())
	}, [])

	return (
		<main className={style.main}>
			<h1 className={style.h1}>Settings</h1>
			<div className={style.settingsContainer}>
				<div className={style.settingsColumn}>
					{settings ? (
						settings.map((setting: Setting) => (
							<div className={style.setting}>
								<div className={style.settingLabel}>
									{setting.label}
								</div>
								<div className={style.settingChange}>
									{typeof setting.value === "boolean" ? (
										<ReactSwitch
											onChange={() => {
												BL_Settings.setSetting(
													setting.slug,
													!setting.value
												)
												setSettings(
													BL_Settings.getAllSettings()
												)
											}}
											onColor="#c5a260"
											checked={setting.value}
											className={style.settingsSwitch}
										/>
									) : (
										<></>
									)}
								</div>
							</div>
						))
					) : (
						<></>
					)}
				</div>
			</div>
		</main>
	)
}
