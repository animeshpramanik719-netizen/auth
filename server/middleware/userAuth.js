
import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.json({
            success: false,
            message: "Not Authorized. Login Again"
        });
    }

    try {
        const tokenDecode = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (!tokenDecode.id) {
            return res.json({
                success: false,
                message: "Not Authorized. Login Again"
            });
        }

        req.user = {
            userId: tokenDecode.id
        };

        next();

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};

export default userAuth;
