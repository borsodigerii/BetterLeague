import NavBarIconLink from './NavBarIconLink'
import NavBarLink from './NavBarLink'
import style from './style/style.module.css'



export interface NavBarLinkStruct{
    link: string,
    displayName: string,
    class: string[]
}
export interface NavBarIconLinkStruct{
    link: string,
    iconId: number,
    class: string[]
}
export default function NavBar(props: any){
    return(
        <nav className={style.nav}>
            <div className={style.navWrapper}>
                {
                    props.links.map((link: NavBarLinkStruct) => (
                        <NavBarLink key={link.displayName} to={link.link} name={link.displayName} classes={link.class} changeNav={props.changeNav} currentNav={props.currentNav}/>
                    ))
                }
            </div>
            <div className={style.navWrapper}>
                {
                    props.iconLinks.map((link: NavBarIconLinkStruct) => (
                        <NavBarIconLink key={link.iconId} to={link.link} icon={link.iconId} classes={link.class} changeNav={props.changeNav} currentNav={props.currentNav}/>
                    ))
                }
            </div>
            <div className={style.navWrapper}>
                <div className={style.navResources}>
                    <div className={style.miscContainer}>
                        <div className={style.misc + (props.currentNav == "settings" ? " " + style.active : "")} onClick={() => props.changeNav("settings")}>
                             <img src="settings_gray.png"/> Settings
                        </div>
                        <div className={style.misc}>
                            __
                        </div>
                        <div className={style.misc}>
                            <img src="close_gray.png" style={{filter: "brightness(70%)"}}/>
                        </div>
                    </div>
                    <div className={style.navResourcesContainer}>
                        <div className={style.resourceContainer}>
                            <img src="BE_icon.webp" alt=""/> {props.resources.blueEssence}
                        </div>
                        <div className={style.resourceContainer}>
                            <img src="RP_icon.webp" alt=""/> {props.resources.riotPoints}
                        </div>
                    </div>

                </div>
            </div>
        </nav>
    )
}
