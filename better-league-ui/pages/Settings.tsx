/* eslint-disable react/jsx-key */
import style from 'styles/settings.module.css'
import ReactSwitch from 'react-switch';
import { Dispatch, SetStateAction } from 'react';

export interface Setting{
    name: string,
    identifier: string,    
    value: boolean,
    stateHandler: Dispatch<SetStateAction<boolean>>
}

export default function Settings(props: any){
    let settingsList = props.settings;
    return (
        <main className={style.main}>
            <h1 className={style.h1}>Settings</h1>
            <div className={style.settingsContainer}>
                <div className={style.settingsColumn}>
                    
                    {
                        settingsList.map((setting: Setting) => (
                            <div className={style.setting}>
                                <div className={style.settingLabel}>{setting.name}</div>
                                <div className={style.settingChange}>
                                    <ReactSwitch onChange={() => {props.setSetting(setting.identifier, !setting.value)}} checked={setting.value} className={style.settingsSwitch}/>
                                </div>
                            </div>
                        ))
                    }
                    
                </div>
            </div>
        </main>
    )
}
