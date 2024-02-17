const jwt = require('jsonwebtoken');
const JWT_SECRET = "jas!@#dvk2##@$skllsa@#$%";
const fetchUser = (req, res, next) => {
    //Get the user from the JWT token and add id to req object
    const token = req.header('auth-token')
    if (!token) {
        res.status(401).json({ error: "Please authenticate using a valid token" })
    }
    else {
        try {
            //Verifying the JWT token
            const data = jwt.verify(token, JWT_SECRET);
            req.user = data.user;
            next();
        } catch (err) {
            res.status(401).json({ error: "Please authenticate using a valid token" })
        }
    }
}
module.exports = fetchUser;