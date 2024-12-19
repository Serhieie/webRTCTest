const getDevices = ()=>{
    return new Promise(async(resolve, reject)=>{
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(d=>d.kind === "videoinput");
        const audioOutputDevices = devices.filter(d=>d.kind === "audiooutput");
        const audioInputDevices = devices.filter(d=>d.kind === "audioinput");
        resolve({
            videoDevices,
            audioOutputDevices,
            audioInputDevices
        })
    })
}

export default getDevices