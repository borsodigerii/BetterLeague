import style from './style/style.module.css'
import PlayButton from './PlayButton'

export default function NavBarLink(props: any){
    let classNames = style.navLinkLi;
    props.classes.forEach((className: string) => {
        classNames = classNames + ' ' + className;
        
    })    
    return(
        <li className={classNames}>
            <button onClick={() => props.changeNav(props.to)} className={style.navLink + (props.to == props.currentNav ? " " + style.active : "")}>
                {classNames.includes("playButton") ? <PlayButton name={props.name}/> : props.name}
            </button> 
        </li>
    )
}