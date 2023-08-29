import { getLolSplashIcon } from "@/pages/api/getAsset"
import { useState, useEffect } from "react"
import style from './style/playbutton.module.css'

export default function PlayButton(props: any){

    const [splashIcon, setSplashIcon] = useState("")
    useEffect(() => {
        if(splashIcon == "")
            retrieveSplash();
    });

    async function retrieveSplash(){
        const url = await getLolSplashIcon()
        if(url)
            setSplashIcon(url)
    }
    return (
        <div className={style.playButtonContainer}>
            <img className={style.playButtonIcon} src={splashIcon} alt=""/>
            <span className={style.playButton}>{props.name}</span>
        </div>
    )
}   