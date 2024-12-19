import { useEffect, useState, useRef } from "react"
import axios from 'axios'
import { useSearchParams } from "react-router-dom"
import { useDispatch, useSelector} from "react-redux"
import './videoComponents.css'
import CallInfo from "./CallInfo"
import ChatWindow from "./ChatWindow"
import ActionButtons from "./ActionButtons"
import addStream from '../redux-elements/actions/addStream'
import createPeerConnection from "../webRTCUtilities/createPeerConnection"
import socketConnection from '../webRTCUtilities/socketConnection'
import updateCallStatus from "../redux-elements/actions/updateCallStatus"
import clientSocketListeners from "../webRTCUtilities/clientSocketListeners"



const MainVideoPage = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const callStatus = useSelector(state => state.callStatus)
    const streams = useSelector(state => state.streams)
    const [apptInfo, setApptInfo] = useState({})
    const smallFeedEl = useRef(null)
    const largeFeedEl = useRef(null)
    const uuidRef = useRef(null)
    const streamsRef = useRef(null)
    const dispatch = useDispatch()
    const [ showCallInfo, setShowCallInfo] = useState(true)

    useEffect(() => {
        const fetchMedia = async () => {
            const constrains = {
                audio: true,
                video: true
            }
            try {
                const stream = await navigator.mediaDevices.getUserMedia(constrains)
                dispatch(updateCallStatus('haveMedia', true))
                dispatch(addStream('localStream', stream))
                const { peerConnection, remoteStream } = await createPeerConnection(addIce)
                dispatch(addStream('remote1', remoteStream, peerConnection))
                largeFeedEl.current.srcObject = remoteStream
            } catch (err) {
                console.error(err)
            }
        }
        fetchMedia()
    }, [])


    useEffect(()=>{
        if (streams.remote1) {
            streamsRef.current = streams
        }
    }, [streams])
    

        useEffect(() => {
        const createOfferAsync = async () => {
            for (const s in streams) {
                if (s !== 'localStream') {
                    try {
                        const pc = streams[s].peerConnection
                        const offer = await pc.createOffer()
                        pc.setLocalDescription(offer)
                        
                        const token = searchParams.get('token')
                        const socket = socketConnection(token)
                        socket.emit('newOffer', { offer, apptInfo })
                    } catch (err) {
                        console.error(err)
                    }
                }
            }
            dispatch(updateCallStatus('haveCreatedOffer', true))
        }

        if (callStatus.audio === 'enabled' && callStatus.video === 'enabled' && !callStatus.haveCreatedOffer) {
            createOfferAsync()
        }
    }, [callStatus.audio, callStatus.video, callStatus.haveCreatedOffer])



    useEffect(() => {
        const asyncAddAnswer = async () => {
            for (const s in streams) {
                if (s !== 'localStream') {
                    const pc = streams[s].peerConnection
                    await pc.setRemoteDescription(callStatus.answer)
                    console.log(pc.signalingState)
                    console.log('Answer added!')
                }
            }
        }

        if (callStatus.answer) {
        asyncAddAnswer()
        }
    }, [callStatus.answer])


    useEffect(() => {
        const token = searchParams.get('token')
        const fetchDecodedToken = async () => {
            const resp = await axios.post('https://localhost:9009/validate-link', { token })
            console.log('client',resp.data)
            setApptInfo(resp.data)
            uuidRef.current = resp.data.uuid
        }
        fetchDecodedToken()
    }, [])


    useEffect(()=>{
        const token = searchParams.get('token');
        const socket = socketConnection(token);
        clientSocketListeners(socket, dispatch, addIceCandidateToPc);
    },[])

    const addIceCandidateToPc = (iceC)=>{
        for (const s in streamsRef.current) {
            if(s !== 'localStream'){
                const pc = streamsRef.current[s].peerConnection;
                pc.addIceCandidate(iceC);
                console.log("MainVideo Added an iceCandidate to existing page presence")
                setShowCallInfo(false)
            }
        }
    }



    const addIce = (iceCandidate) => {
        const token = searchParams.get('token')
        const socket = socketConnection(token)
        socket.emit('iceToServer',{
                iceCandidate,
                who: 'client',
                uuid: uuidRef.current
            })
    }

    return <div className='main-video-page'>
        <div className='video-chat-wrapper'>
            <video ref={largeFeedEl} id="large-feed" autoPlay controls playsInline />
            <video ref={smallFeedEl} id="own-feed" autoPlay controls playsInline />
            {showCallInfo ? <CallInfo apptInfo={apptInfo} /> : <></>}
            <ChatWindow/>
        </div>
        <ActionButtons smallFeedEl={smallFeedEl} largeFeedEl={largeFeedEl} />
    </div>
}   

export default MainVideoPage