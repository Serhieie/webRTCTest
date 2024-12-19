import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import ActionButtonCaretDropdown from "../videoButton/actionCaretButtonDropdown";
import getDevices from "../../webRTCUtilities/getDevices";
import updateCallStatus from "../../redux-elements/actions/updateCallStatus";
import addStream from "../../redux-elements/actions/addStream";
import startAudioStream from "./startAudioStream";


const AudioButton = ({smallFeedEl}) => {
    const callStatus = useSelector(state => state.callStatus)
    const [caretOpen, setCaretOpen] = useState(false)
    const [audioDevicesList, setAudioDevicesList] = useState([])
    const streams = useSelector(state => state.streams)
    const dispatch = useDispatch()

    let micText;
    if(callStatus.audio === "off"){
        micText = "Join Audio"
    }else if(callStatus.audio === "enabled"){
        micText = "Mute"
    }else{
        micText = "Unmute"
    }

    useEffect(() => {
        const getDevicesAsync = async () => {
        if (caretOpen) {
            const devices = await getDevices()
            console.log(devices)
            setAudioDevicesList(devices.audioOutputDevices?.concat(devices.audioInputDevices))
        }
        }
        getDevicesAsync()
    }, [caretOpen])

    const changeAudioDevice = async(event) => {
        const deviceId = event.target.value.slice(5)
        const audioType = event.target.value.slice(0,5)
        if (audioType === 'output') {
            smallFeedEl.current.setSinkId(deviceId)
        } else if (audioType === 'input') {
            const newConstraints = {
            audio: {deviceId: {exact: deviceId}} ,
            video: callStatus.videoDevice === "default" ? true : {deviceId: {exact: callStatus.videoDevice}}
            }
            const stream = await navigator.mediaDevices.getUserMedia(newConstraints)
            dispatch(updateCallStatus('audioDevice',deviceId));
            dispatch(updateCallStatus('audio','enabled'))
            dispatch(addStream('localStream', stream))
            
            const [audioTrack] = stream.getAudioTracks();
            for(const s in streams){
                if(s !== "localStream"){
                    const senders = streams[s].peerConnection.getSenders();
                    const sender = senders.find(s=>{
                        if(s.track){
                            return s.track.kind === audioTrack.kind
                        }else{
                            return false;
                        }
                    })
                    sender.replaceTrack(audioTrack)
                }
            }
        }
        // setAudioDevicesList()
    }


    const startStopAudio = async () => {
        if (callStatus.audio === 'enabled') {
            dispatch(updateCallStatus('audio', "disabled"));
            const audioTracks = streams.localStream.stream.getAudioTracks()
            audioTracks.forEach(track => {
            track.enabled = false;
        })

        } else if (callStatus.audio === 'disabled') { 
            dispatch(updateCallStatus('audio', "enabled"));
            const audioTracks = streams.localStream.stream.getAudioTracks()
            audioTracks.forEach(track => {
                track.enabled = true;
            })
        } else {
            changeAudioDevice({ target: { value: "inputdefault" } })
            startAudioStream(streams)
        }
    }
    
    return <div className="button-wrapper d-inline-block">
                    <i className="fa fa-caret-up choose-audio" onClick={() => setCaretOpen(!caretOpen)}></i>
                    <div className="button mic" onClick={startStopAudio}>
                        <i className="fa fa-microphone"></i>
                        <div className="btn-text">{micText}</div>
        </div>
            {caretOpen ? <ActionButtonCaretDropdown
            defaultValue={callStatus.audioDevice}
            changeHandler={changeAudioDevice}
            devicesList={audioDevicesList}
            type="audio"
            /> : <></>}
                </div>
}

export default AudioButton
