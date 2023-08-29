import style from './style/style.module.css'

export default function NavBarIconLink(props: any){
    let classNames = style.navLinkLi;
    props.classes.forEach((className: string) => {
        classNames = classNames + ' ' + className;
    })    
    return(
        <li className={classNames}>
            <button onClick={() => props.changeNav(props.to)} className={style.navLink}>{props.iconId}</button> 
        </li>
    )
}