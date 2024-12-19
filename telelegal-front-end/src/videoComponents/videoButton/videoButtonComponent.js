import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import startLocalVideoStream from "./startLocalVideoStream"
import updateCallStatus from "../../redux-elements/actions/updateCallStatus"
import ActionButtonCaretDropdown from './actionCaretButtonDropdown'
import getDevices from "../../webRTCUtilities/getDevices"
import addStream from "../../redux-elements/actions/addStream"

const VideoButton = ({ smallFeedEl }) => {
    const [pendingUpdate, setPendingUpdate] = useState(false)
    const [caretOpen, setCaretOpen] = useState(false)
    const [videoDevicesList, setVideoDevicesList] = useState([])
    const callStatus = useSelector(state => state.callStatus)
    const streams = useSelector(state => state.streams)
    const dispatch = useDispatch()

    useEffect(() => {
        const getDevicesAsync = async () => {
        if (caretOpen) {
            const devices = await getDevices()
            setVideoDevicesList(devices.videoDevices)
        }
        }
        getDevicesAsync()
    }, [caretOpen])

    const changeVideoDevice = async(e)=>{
            const deviceId = e.target.value; 
            const newConstraints = {
                audio: callStatus.audioDevice === "default" ? true : {deviceId: {exact: callStatus.audioDevice}},
                video: {deviceId: {exact: deviceId}}
            }
            const stream = await navigator.mediaDevices.getUserMedia(newConstraints)
            dispatch(updateCallStatus('videoDevice',deviceId));
            dispatch(updateCallStatus('video','enabled'))
            smallFeedEl.current.srcObject = stream;
            dispatch(addStream('localStream',stream))
            const [videoTrack] = stream.getVideoTracks();
            for(const s in streams){
                if(s !== "localStream"){
                    const senders = streams[s].peerConnection.getSenders();
                    const sender = senders.find(s=>{
                        if(s.track){
                            return s.track.kind === videoTrack.kind
                        }else{
                            return false;
                        }
                    })
                    sender.replaceTrack(videoTrack)
                }
            }
    
    }

        const startStopVideo = ()=>{
        if(callStatus.video === "enabled"){
            dispatch(updateCallStatus('video',"disabled"));
            const tracks = streams.localStream.stream.getVideoTracks();
            tracks.forEach(t=>t.enabled = false);
        }else if(callStatus.video === "disabled"){
            dispatch(updateCallStatus('video',"enabled"));
            const tracks = streams.localStream.stream.getVideoTracks();
            tracks.forEach(t=>t.enabled = true);
        }else if(callStatus.haveMedia){
            smallFeedEl.current.srcObject = streams.localStream.stream
            startLocalVideoStream(streams, dispatch);
        }else{
            setPendingUpdate(true);
        }
    }

    useEffect(() => {
        if (pendingUpdate && callStatus.haveMedia) {
            setPendingUpdate(false)
            smallFeedEl.current.srcObject = streams.localStream.stream
            startLocalVideoStream(streams, dispatch)
        }
    }, [pendingUpdate, callStatus.haveMedia])
    

    return <div className="button-wrapper video-button d-inline-block">
        <i className="fa fa-caret-up choose-video" onClick={() => setCaretOpen(!caretOpen)}></i>
                    <div className="button camera" onClick={startStopVideo}>
                        <i className="fa fa-video"></i>
                        <div className="btn-text">{callStatus.video === "display" ? "Stop" : "Start"} Video</div>
        </div>
        {caretOpen ? <ActionButtonCaretDropdown
            defaultValue={callStatus.videoDevice}
            changeHandler={changeVideoDevice}
            devicesList={videoDevicesList}
            type="video"
            /> : <></>}
                </div>
}

export default VideoButton