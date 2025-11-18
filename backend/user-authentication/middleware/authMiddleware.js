const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token){
        return res.status(401).json({ error: 'Access token is missing' });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // attach user info to request
        req.user = decoded;
        next();
    }catch(error){
        if(error.name === 'TokenExpiredError'){
            return res.status(401).json({ error: 'Token has expired' });
        }
        return res.status(403).json({ error: 'Invalid token' });
    }
};

module.exports = {
    verifyToken
};