

const streamsInfo = (state = {}, action)=>{
    if(action.type === "ADD_STREAM"){
        const copyState = {...state};
        copyState[action.payload.who] = action.payload
        return copyState
    }else if(action.type === "LOGOUT_ACTION"){
        return {}
    }else{
        return state;
    }
}


export default streamsInfo