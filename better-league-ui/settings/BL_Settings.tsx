import settingsData from "./settings.json"

export interface Setting {
	label: string
	slug: string
	default: any
	value?: any
}

export abstract class BL_Settings {
	public static init(): void {
		settingsData.forEach((settingsObject: Setting) => {
			const settingValue = localStorage.getItem(
				"bl_setting_" + settingsObject.slug
			)
			if (settingValue) {
				settingsObject.value = JSON.parse(settingValue)
			} else {
				localStorage.setItem(
					"bl_setting_" + settingsObject.slug,
					JSON.stringify(settingsObject.default)
				)
				settingsObject.value = settingsObject.default
			}
		})
	}

	public static getSetting(slug: string): Setting | null {
		settingsData.forEach((setting: Setting) => {
			if (setting.slug === slug) return { ...setting }
		})
		return null
	}
	public static setSetting(slug: string, value: any): boolean {
		settingsData.forEach((setting: Setting) => {
			if (setting.slug === slug) {
				try {
					localStorage.setItem(
						"bl_setting_" + setting.slug,
						JSON.stringify(value)
					)
					setting.value = value
				} catch (e) {
					return false
				} finally {
					return true
				}
			}
		})
		return false
	}
	public static getAllSettings(): Setting[] {
		return [...settingsData]
	}
}
