export enum PlayerPosition {
	UTILITY,
	MIDDLE,
	BOTTOM,
	TOP,
	JUNGLE,
}

export function parsePlayerPosition(position: string): PlayerPosition {
	switch (position) {
		case "top":
			return PlayerPosition.TOP
		case "TOP":
			return PlayerPosition.TOP
		case "jg":
			return PlayerPosition.JUNGLE
		case "JG":
			return PlayerPosition.JUNGLE
		case "JUNGLE":
			return PlayerPosition.JUNGLE
		case "jungle":
			return PlayerPosition.JUNGLE
		case "mid":
			return PlayerPosition.MIDDLE
		case "MID":
			return PlayerPosition.MIDDLE
		case "MIDDLE":
			return PlayerPosition.MIDDLE
		case "middle":
			return PlayerPosition.MIDDLE
		case "bot":
			return PlayerPosition.BOTTOM
		case "BOT":
			return PlayerPosition.BOTTOM
		case "BOTTOM":
			return PlayerPosition.BOTTOM
		case "bottom":
			return PlayerPosition.BOTTOM
		case "sup":
			return PlayerPosition.UTILITY
		case "SUP":
			return PlayerPosition.UTILITY
		case "UTILITY":
			return PlayerPosition.UTILITY
		case "utility":
			return PlayerPosition.UTILITY
		case "SUPPORT":
			return PlayerPosition.UTILITY
		case "support":
			return PlayerPosition.UTILITY
	}
	return PlayerPosition.UTILITY
}
