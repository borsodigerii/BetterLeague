import { ReadyCheckState } from "./Lobby";
import style from "./readycheck.module.css";

export default function ReadyCheckPopup(props: {time: number, status: ReadyCheckState, handler: any}) {
  return (
    <div className={style.readyCheckBackdrop}>
      <div className={style.readyCheckContainer}>
        <div className={style.readyCheck}>
          <h2>Match found! {props.time}</h2>
          <button
            onClick={() => props.handler(ReadyCheckState.Accepted)}
            disabled={props.status != ReadyCheckState.Popup ? true : false}
          >
            Accept
          </button>
          <button
            onClick={() => props.handler(ReadyCheckState.Declined)}
            disabled={props.status != ReadyCheckState.Popup ? true : false}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
