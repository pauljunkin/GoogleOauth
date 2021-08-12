const express = require('express');
const cookieParser = require('cookie-parser')
const app = express();

require("dotenv").config();


//Google Oath
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = "787826835187-ss3ukl735f1qs3f77ikqqldj6foglkaj.apps.googleusercontent.com"
const client = new OAuth2Client(CLIENT_ID);

const PORT = process.env.PORT || 5000



//Middleware
app.set('view engine', 'ejs');
app.use(express.json());
app.use(cookieParser());


app.get('/', (req, res)=>{
    res.render('index')
})

app.get('/profile',checkAuthenticated, (req, res) => {
    let user = req.user;
    res.render('profile', {user});
})
app.get('/login', (req, res) => {
    let token = req.cookies['session-token'];
    if(token){
        res.redirect('/profile')
    }
    res.render('login')
})
app.get('/logout', (req, res) => {
    res.clearCookie('session-token');
    res.redirect('/login')
})
app.get('/protectedRoute', checkAuthenticated, (req,res)=>{
    res.render('protected')
})


app.post('/login', (req, res) => {
    // console.log(req.body.token)
    let token = req.body.token
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        console.log(payload)
        res.cookie('session-token', token);
        res.send('success')
    }
    verify().catch(console.error);
})

function checkAuthenticated(req, res, next) {

    let token = req.cookies['session-token'];

    let user = {};
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        });
        const payload = ticket.getPayload();
        user.name = payload.name;
        user.email = payload.email;
        user.picture = payload.picture;
    }
    verify()
        .then(() => {
            req.user = user;
            next();
        })
        .catch(err => {
            res.redirect('/login')
        })

}



app.listen(PORT, () => {
    console.log('app listening')
})