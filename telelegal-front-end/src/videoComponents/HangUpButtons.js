import { useDispatch, useSelector } from "react-redux"
import updateCallStatus from "../redux-elements/actions/updateCallStatus"

const HangupButton = ({smallFeedEl, largeFeedEl})=>{
    const dispatch = useDispatch()
    const callStatus = useSelector(state => state.callStatus)
    const streams = useSelector(state=>state.streams)

    const hangupCall = ()=>{
        dispatch(updateCallStatus('current', 'complete'))
        for (const s in streams) {
                let pc = streams[s].peerConnection
                if (pc) {
                    pc.close()
                    pc.onicecandidate = null
                    pc.onaddstream = null
                    streams[s].peerConnection = null
                }
        }
        smallFeedEl.current.srcObject = null
        largeFeedEl.current.srcObject = null
        dispatch(updateCallStatus('audio', 'off'))
        dispatch(updateCallStatus('video', 'off'))
    }

    if(callStatus.current === "complete"){
        return <></>
    }

    return(
        <button 
            onClick={hangupCall} 
            className="btn btn-danger hang-up"
        >Hang Up</button>
    )
}

export default HangupButton