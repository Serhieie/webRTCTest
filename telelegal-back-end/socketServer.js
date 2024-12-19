const io = require('./server').io;
const jwt = require('jsonwebtoken');
const app = require('./server').app;


const SECRET = 'Adfaf@13412rf;2rlkf';
const connectedProfessionals = [];
const connectedClients = [];

const allKnownOffers = {};

io.on('connection', socket => {
    console.log(socket.id, 'has connected')
    const handshakeData = socket.handshake.auth.jwt         
    let decodedData;
    try {
        decodedData = jwt.verify(handshakeData, SECRET)
    } catch (err) {
        console.error(err)
        socket.disconnect()
        return
    }

    const { fullName, proId } = decodedData;
    
    if (proId) {
    const connectedPro = connectedProfessionals.find(cp => cp.proId === proId)
    if (connectedPro) {
        connectedPro.socketId = socket.id
    } else {
        connectedProfessionals.push({
            socketId: socket.id,
            fullName,
            proId
        })
    }
        
        const professionalAppointments = app.get('professionalAppointments')
        
        socket.emit('apptData', professionalAppointments.filter(pa => 
            pa.professionalFullName === fullName
        ))

        for(const key in allKnownOffers){
            if(allKnownOffers[key].professionalFullName === fullName){
                io.to(socket.id).emit('newOfferWaiting',allKnownOffers[key])
            }
        }
    } else {
        const { professionalFullName, uuid, clientName } = decodedData;
        const clientExist = connectedClients.find(cp => cp.uuid == uuid)
        if (clientExist) { 
            clientExist.socketId = socket.id
        } else {
            connectedClients.push({
            socketId: socket.id,
            clientName,
            uuid,
            professionalMeetingWith: professionalFullName,
        })
        }
        

        const offerForThisClient = allKnownOffers[uuid]

        if(offerForThisClient) {
            io.to(socket.id).emit('answerToClient', offerForThisClient.answer)
        }
    }

    socket.on('newAnswer', ({ answer, uuid }) => {
        const socketToSendTo = connectedClients.find(cp => cp.uuid == uuid)
        if(socketToSendTo) {
            socket.to(socketToSendTo.socketId).emit('answerToClient', answer)
        }
        const knownOffer = allKnownOffers[uuid]
        if(knownOffer) {
            knownOffer.answer = answer
        }
    })

    socket.on('newOffer', ({ offer, apptInfo }) => {
        allKnownOffers[apptInfo.uuid] = {
            ...apptInfo,
            offer,
            offererIceCandidates: [],
            answer: null,
            answererIceCandidates: []
        }
        const professionalAppointments = app.get('professionalAppointments');
        const pa = professionalAppointments.find(pa => pa.uuid === apptInfo.uuid)
        if (pa) {
            pa.waiting = true;
        }


        const p = connectedProfessionals.find(cp => cp.fullName === apptInfo.professionalFullName)
     if(p){
            const socketId = p.socketId;
            socket.to(socketId).emit('newOfferWaiting',allKnownOffers[apptInfo.uuid])
            socket.to(socketId).emit('apptData',professionalAppointments.filter(pa=>pa.professionalFullName === apptInfo.professionalFullName))
        }
    })

    socket.on('getIce',(uuid,who,ackFunc)=>{
        const offer = allKnownOffers[uuid];
        let iceCandidates = [];


        if(offer){
            if(who === "professional"){
                iceCandidates = offer.offererIceCandidates
            }else if(who === "client"){
                iceCandidates = offer.answererIceCandidates;
            }
            ackFunc(iceCandidates)
        }
    })
    
    socket.on('iceToServer',({who,iceCandidate,uuid})=>{
        console.log("==============",who)
        const offerToUpdate = allKnownOffers[uuid];
        if(offerToUpdate){
            if(who === "client"){
                offerToUpdate.offererIceCandidates.push(iceCandidate)
                const socketToSendTo = connectedProfessionals.find(cp=>cp.fullName === decodedData.professionalFullName)
                if(socketToSendTo){
                    socket.to(socketToSendTo.socketId).emit('iceToClient',iceCandidate);
                }
            }else if(who === "professional"){
                offerToUpdate.answererIceCandidates.push(iceCandidate)
                const socketToSendTo = connectedClients.find(cp=>cp.uuid == uuid)
                if(socketToSendTo){
                    socket.to(socketToSendTo.socketId).emit('iceToClient',iceCandidate);
                }
            }
        }
    })
})