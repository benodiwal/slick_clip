import { NextFunction, Request, Response } from "express";
import { IContext } from "interfaces/database";

const isAuthenticated = (ctx: IContext) => {
    console.log('middleware: isAuthenticated');
    console.log(ctx);
    return async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization token is required' });
        }
        
        const token = authHeader.split('Bearer ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Authorization token is required' });
        }

        try {
            const user = await ctx.db.client.user.findUnique({
                where: {
                    apiToken: token,
                }
            });

            if (!user) {
                throw new Error();
            }
            
            req.user = user;
            next();
        } catch (e: unknown) {
            console.error(e);
        }
    }
}

export default isAuthenticated;
