import { io } from 'socket.io-client'


let socket;
const socketConnection = (jwt)=>{
    if(socket && socket.connected){
        return socket;
    }else{
        socket = io.connect('https://localhost:9009',{
            auth: {
                jwt
            }
        });
        console.log(socket, jwt)
        return socket;
    }
}

export default socketConnection;

