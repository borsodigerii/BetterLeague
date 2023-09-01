import style from "./style/style.module.css"
import PlayButton from "./PlayButton"

export default function NavBarLink(props: any) {
	let classNames = style.navLinkLi
	props.classes.forEach((className: string) => {
		classNames = classNames + " " + className
	})
	return (
		<li className={classNames}>
			<button
				onClick={() => props.changeNav(props.to)}
				className={
					style.navLink +
					(props.to == props.currentNav &&
					!classNames.includes("playButton")
						? " " + style.active
						: "")
				}
				disabled={
					classNames.includes("playButton") &&
					(props.currentNav == "lobby" ||
						props.currentNav == "create_lobby")
						? true
						: false
				}
			>
				{classNames.includes("playButton") ? (
					<PlayButton
						name={props.name}
						currentNav={props.currentNav}
					/>
				) : (
					props.name
				)}
			</button>
		</li>
	)
}
