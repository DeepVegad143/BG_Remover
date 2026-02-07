import jwt from 'jsonwebtoken'

//middleware function to decode jwt token to get clerkID
const authUser = async (req,res,next) => {

    try {
        
        const {token} = req.headers

        if (!token) {
            return res.json({success:false,message:'Not Authorized Login Again'})
        }

        const token_decode = jwt.decode(token)
        req.body.clerkId = token_decode.clerkId
        next()

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
        
    }

}

// Clerk middleware for background removal routes
const clerkMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Not Authorized - Missing or invalid token' });
        }
        
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'Not Authorized - No token provided' });
        }
        
        // Decode the JWT token (Clerk tokens are typically self-contained)
        const decoded = jwt.decode(token);
        
        if (!decoded || !decoded.sub) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        
        // Clerk uses 'sub' field for user ID
        req.clerkUserId = decoded.sub;
        next();
        
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ success: false, message: 'Authentication failed' });
    }
};

export default authUser;
export { clerkMiddleware };
