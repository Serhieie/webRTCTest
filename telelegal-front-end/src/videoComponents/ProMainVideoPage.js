import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom"
import axios from 'axios';
import './videoComponents.css';
import ChatWindow from "./ChatWindow";
import ActionButtons from "./ActionButtons";
import addStream from '../redux-elements/actions/addStream';
import { useDispatch, useSelector } from "react-redux";
import updateCallStatus from "../redux-elements/actions/updateCallStatus";
import createPeerConnection from "../webRTCUtilities/createPeerConnection";
import socketConnection from "../webRTCUtilities/socketConnection";
import { proVideoSocketListeners } from "../webRTCUtilities/proSocketListeners";

const ProMainVideoPage = ()=>{

    const dispatch = useDispatch();
    const callStatus = useSelector(state=>state.callStatus)
    const streams = useSelector(state=>state.streams)
    const [ searchParams, setSearchParams ] = useSearchParams();
    const [ apptInfo, setApptInfo ] = useState({})
    const smallFeedEl = useRef(null);
    const largeFeedEl = useRef(null);
    const [ haveGottenIce, setHaveGottenIce ] = useState(false)
    const streamsRef = useRef(null);

    useEffect(()=>{
        const fetchMedia = async()=>{
            const constraints = {
                video: true,
                audio: true,
            }
            try{
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                dispatch(updateCallStatus('haveMedia',true));
                dispatch(addStream('localStream',stream));
                const { peerConnection, remoteStream } = await createPeerConnection(addIce);
                dispatch(addStream('remote1',remoteStream, peerConnection));
                largeFeedEl.current.srcObject = remoteStream
            }catch(err){
                console.log(err);
            }
        }
        fetchMedia()
    },[])

    useEffect(() => {
        const getIceAsync = async () => {
            const token = searchParams.get('token')
            const socket = socketConnection(token)
            const uuid = searchParams.get('uuid');
            const iceCandidates = await socket.emitWithAck('getIce', uuid, "professional")
            console.log("iceCandidate Received");
            console.log(iceCandidates);

            iceCandidates.forEach(iceC=>{
                for(const s in streams){
                    if(s !== 'localStream'){
                        const pc = streams[s].peerConnection;
                        pc.addIceCandidate(iceC)
                        console.log("=======Added Ice Candidate!!!!!!!")
                    }
                }
            })
        }

        if (streams.remote1 && !haveGottenIce) {
            setHaveGottenIce(true);
            getIceAsync()
            streamsRef.current = streams; 
        }
        
    },[streams,haveGottenIce])

    useEffect(()=>{
        const setAsyncOffer = async()=>{
            for(const s in streams){
                if(s !== "localStream"){
                    const pc = streams[s].peerConnection;
                    console.log('Setting RemoteDescription in asyncOffer', callStatus.offer)
                    await pc.setRemoteDescription(callStatus.offer)
                    console.log(pc.signalingState);
                }
            }
        }
        if (callStatus.offer && streams.remote1 && streams.remote1.peerConnection) {
            console.log("Starting to set RemoteDescription in asyncOffer")
            setAsyncOffer()
        }
    },[callStatus.offer,streams.remote1])
    


    useEffect(()=>{
        const createAnswerAsync = async()=>{
                for(const s in streams){
                if(s !== "localStream"){
                    const pc = streams[s].peerConnection;
                    const answer = await pc.createAnswer();
                        await pc.setLocalDescription(answer);
                        console.log(pc.signalingState);
                        dispatch(updateCallStatus('haveCreatedAnswer',true))
                        dispatch(updateCallStatus('answer',answer))   
                        const token = searchParams.get('token');
                        const socket = socketConnection(token);
                        const uuid = searchParams.get('uuid');
                        console.log("emitting",answer,uuid)
                        socket.emit('newAnswer',{answer,uuid})

                }
            }
        }
        if(callStatus.audio === "enabled" && callStatus.video === "enabled" && !callStatus.haveCreatedAnswer){
            createAnswerAsync()
        }
    },[callStatus.audio, callStatus.video, callStatus.haveCreatedAnswer])


    useEffect(()=>{
        const token = searchParams.get('token');
        console.log(token)
        const fetchDecodedToken = async()=>{
            const resp = await axios.post('https://localhost:9009/validate-link',{token});
            console.log('professional',resp.data);
            setApptInfo(resp.data)
        }
        fetchDecodedToken();
    },[])

    useEffect(()=>{
        const token = searchParams.get('token');
        const socket = socketConnection(token);
        proVideoSocketListeners(socket,addIceCandidateToPc);
    },[]) 


    const addIceCandidateToPc = (iceC)=>{
        for (const s in streamsRef.current) {
            if(s !== 'localStream'){
                const pc = streamsRef.current[s].peerConnection;
                pc.addIceCandidate(iceC);
                console.log("ProVideo Added an iceCandidate to existing page presence")
            }
        }
    }

    const addIce = (iceCandidate) => {
        const token = searchParams.get('token')
        const socket = socketConnection(token)
        socket.emit('iceToServer',{
            who: 'professional',
            iceCandidate,
            uuid: searchParams.get('uuid')
        })        
    }

    return(
        <div className="main-video-page">
            <div className="video-chat-wrapper">
                <video id="large-feed" ref={largeFeedEl} autoPlay controls playsInline></video>
                <video id="own-feed" ref={smallFeedEl} autoPlay controls playsInline></video>
                {callStatus.audio === "off" || callStatus.video === "off" ?
                    <div className="call-info">
                        <h1>
                            {searchParams.get('client')} is in the waiting room.<br />
                            Call will start when video and audio are enabled
                        </h1>
                    </div> : <></>
                }
                <ChatWindow />
            </div>
            <ActionButtons 
                smallFeedEl={smallFeedEl} 
                largeFeedEl={largeFeedEl}
            />
        </div>
    )
}

export default ProMainVideoPage

