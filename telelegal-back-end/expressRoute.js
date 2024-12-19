const app = require('./server').app
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')

const SECRET = 'Adfaf@13412rf;2rlkf'

const professionalAppointments = [{
    professionalFullName: "Serhieiev Bohdan",
    apptDate: Date.now() + 500000,
    uuid:1,
    clientName: "Jim Jones",
},{
    professionalFullName: "Serhieiev Bohdan",
    apptDate: Date.now() - 2000000,
    uuid:2,// uuid:uuidv4(),
    clientName: "Akash Patel",
},{
    professionalFullName: "Serhieiev Bohdan",
    apptDate: Date.now() + 10000000,
    uuid:3,//uuid:uuidv4(),
    clientName: "Mike Williams",
}];

app.set('professionalAppointments', professionalAppointments)


app.get('/user-link',(req, res)=>{
    const apptData = professionalAppointments[0];
    const token = jwt.sign(apptData, SECRET);
    res.send(`https://localhost:3000/join-video?token=${token}`);
})  

app.post('/validate-link',(req, res)=>{
    const token = req.body.token;
    const decodedData = jwt.verify(token, SECRET);
    res.json(decodedData)
})

app.get('/pro-link', (req, res) => {

    const userData = {
        fullName: "Serhieiev Bohdan",
        proId: 12345    
    }

    const token = jwt.sign(userData, SECRET)
    res.send(`<a href="https://localhost:3000/dashboard?token=${token}" target="_blank">Link Here</a>`)
})