const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { validationResult, body } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/fetchUser');
const JWT_SECRET = "jas!@#dvk2##@$skllsa@#$%";

//ROUTE 1: Create a User using: POST "/api/auth/createUser", Doesn't require Auth 
router.post('/createUser', [
    body('name').isLength({ min: 3 }),
    body('email').isEmail(),
    body('password').isLength({ min: 5 }),
], (req, res) => {
    // Validating the body passed
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }
    else {
        //Checking if user with entered email id already exists
        User.findOne({ email: req.body.email }, { name: 1 })
            .then(async (user) => {
                // If user already exists then return error
                if (user) {
                    res.status(400).json({ error: "user with this email id already exists" });
                }
                // Else create new User
                else {
                    //Creating Salt
                    const salt = await bcrypt.genSalt(10);
                    //encrypting password with hash and salt
                    const secPass = await bcrypt.hash(req.body.password, salt);
                    User.create({
                        name: req.body.name,
                        email: req.body.email,
                        password: secPass,
                    })
                        .then((user) => {
                            const data = {
                                user: {
                                    id: user.id
                                }
                            }
                            //Sign JWT with digital signature
                            const jwtData = jwt.sign(data, JWT_SECRET);
                            res.status(200).json(
                                {
                                    message: "User Created Successfully",
                                    authToken: jwtData
                                });
                        })
                        .catch((err) => {
                            res.status(400).json({ error: err.message });
                        })
                }
            })
            .catch((err) => res.status(400).json({ error: err }))
    }
});


//ROUTE 2: login a User using: POST "/api/auth/loginUser", Doesn't require login
router.post('/loginUser', [
    body('email').isEmail(),
    body('password').exists(),
], (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }
    else {
        const [enteredEmail, enteredPassword] = [req.body['email'], req.body['password']];
        User.findOne({ email: enteredEmail })
            .then(async (user) => {
                if (!user) {
                    res.status(400).json({ error: "Please try to login with correct credentials" });
                }
                else {
                    const passwordCompare = await bcrypt.compare(enteredPassword, user.password);
                    if (!passwordCompare) {
                        res.status(400).json({ error: "Please try to login with correct credentials" });
                    }
                    else {
                        const payload = {
                            user: {
                                id: user.id,
                            }
                        }
                        const jwtData = jwt.sign(payload, JWT_SECRET);
                        res.status(200).json(
                            {
                                message: "User Logined Successfully",
                                authToken: jwtData,
                            }
                        );
                    }
                }
            })
            .catch(err => res.status(400).json({ error: err }))
    }
});


//ROUTE 3: Get loggedIn User data using: POST"/api/auth/getUser", Login required
router.post('/getUser', fetchUser, (req, res) => {
    const userId = req.user.id;
    User.findOne({ _id: userId }).select("-password").then((user) => {
        res.status(200).send(user);
    }).catch((err) => {
        res.status(400).json({ error: err })
    })
});


module.exports = router