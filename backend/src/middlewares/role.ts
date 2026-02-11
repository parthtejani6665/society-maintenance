import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

interface AuthRequest extends Request {
    user?: User;
}

const roleMiddleware = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized.' });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
            return;
        }

        next();
    };
};

export default roleMiddleware;
