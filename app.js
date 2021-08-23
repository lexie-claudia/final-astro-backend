const express = require('express');
const app = express();
const path = require('path');
const usersRoute = require('./routes/users-route.js');
const cors = require('cors');
require('dotenv').config();
const expressFormData = require('express-form-data');
// Passport and Passport-JWT for authentication
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwtSecret = process.env.JWT_SECRET;

// This will tell passport where to find the JWT
// and how to extract the payload
const passportJwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret,
}
// This function will tell passport how what to do
// with the payload.
const passportJwt = (passport) => {
    passport.use(
        new JwtStrategy(
            passportJwtOptions,
            (jwtPayload, done) => {
                // Tell passport what to do with payload
                UserModel
                    .findOne({ _id: jwtPayload._id })
                    .then(
                        (dbDocument) => {
                            // The done() function will pass the 
                            // dbDocument to Express. The user's 
                            // document can then be access via req.user
                            return done(null, dbDocument)
                        }
                    )
                    .catch(
                        (err) => {
                            // If the _id or anything is invalid,
                            // pass 'null' to Express.
                            if (err) console.log(err);
                            return done(null, null)
                        }
                    )
            }
        )
    )
};
passportJwt(passport);

// Parse urlencoded bodies and where the Content-Type header matches the type option
app.use(express.urlencoded({ extended: false }));
// Tell express to parse JSON data
app.use(express.json());
// Tell express about external HTTP requests
app.use(cors());
// Tell express about express-form-data
app.use(expressFormData.parse());

const mongoose = require('mongoose');
const connectionString = process.env.MONGODB_CONNECTION_STRING;
const connectionConfig = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

mongoose.connect(connectionString, connectionConfig).then(() => {
    console.log('DB is connected!')
}).catch((error) => {
    console.log('error occured', error);
});

app.use('/users', usersRoute);

app.get('/', (req, res) => {
    res.send('Hompage');
});

const PORT = process.env.PORT || 7000;
app.listen(PORT,
    () => {
        console.log(`Website is live on http://localhost:${PORT}`);
    }
);