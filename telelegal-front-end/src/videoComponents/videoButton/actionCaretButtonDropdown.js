const ActionButtonCaretDropdown = ({ defaultValue, changeHandler, devicesList, type }) => {
    
    let dropDownEl;
    if(type === "video"){
        dropDownEl = devicesList?.map(device => <option key={device.deviceId} value={device.deviceId}>{device.label}</option>)
    } else if (type === 'audio') {
        const audioInputEl = []
        const audioOutputEl = []
        devicesList.forEach((device, i) => {
            if (device.kind === 'audioinput') {
                audioInputEl.push(<option key={`input${device.deviceId}`} value={`input${device.deviceId}`}>{device.label}</option>) 
            } else if (device.kind === 'audiooutput') {
                audioOutputEl.push(<option key={`output${device.deviceId}`} value={`output${device.deviceId}`}>{device.label}</option>) 
            }
        })
        audioInputEl.unshift(<optgroup label="Input Devices" />)
        audioOutputEl.unshift(<optgroup label="Output Devices" />)
        dropDownEl = audioInputEl.concat(audioOutputEl)
    }

    return  <div className="caret-dropdown" style={{ top: '-25px' }}>
            <select key={type} defaultValue={defaultValue} onChange={changeHandler}>
            {dropDownEl}
        </select>
        </div>
}

export default ActionButtonCaretDropdown