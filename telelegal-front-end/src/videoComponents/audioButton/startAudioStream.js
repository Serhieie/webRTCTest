


const startAudioStream = (streams)=>{
    const localStream = streams.localStream;
    for(const s in streams){ 
        if(s !== "localStream"){
            const curStream = streams[s];
            localStream.stream.getAudioTracks().forEach(t=>{
                curStream.peerConnection.addTrack(t,streams.localStream.stream);
            })
        }
    }
}

export default startAudioStream;
