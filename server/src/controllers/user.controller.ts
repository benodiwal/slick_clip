import { NextFunction, Request, Response } from "express";
import AbstractController from "./index.controller";
import { InternalServerError } from "errors/internal-server-error";
import z from 'zod';
import { validateRequestBody, validateRequestParams } from "validators/validateRequest";
import { generateApiToken } from "utils";

class UserController extends AbstractController {
    create() {
        const payloadSchema = z.object({ username: z.string() });
        type IPayload = z.infer<typeof payloadSchema>;
        return [
            validateRequestBody(payloadSchema),
            async (req: Request<unknown, unknown, IPayload>, res: Response, next: NextFunction) => {
                try {
                    const { username } = req.body;

                    if (!username) {
                        return res.status(400).json({ error: 'Username is required' });
                    }

                    const existingUser = await this.ctx.db.client.user.findUnique({
                        where: {
                            username
                        }
                    });

                    if (existingUser) {
                        return res.status(400).json({ error: 'Username already exists' });
                    }

                    const apiToken = generateApiToken();

                    const user = await this.ctx.db.client.user.create({
                        data: {
                            username,
                            apiToken
                        }
                    });

                    res.status(201).json({
                        id: user.id,
                        username: user.username,
                        apiToken: user.apiToken
                    });
                    
                } catch (e) {
                    console.error(e);
                    next(new InternalServerError());
                }
            }
        ];
    }

    get() {
        const paramsSchema = z.object({ id: z.string() });
        type IParams = z.infer<typeof paramsSchema>;
        return [
            validateRequestParams(paramsSchema),
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    const { id } = req.params as unknown as IParams;
                    
                    const user = await this.ctx.db.client.user.findUnique({
                        where: { id },
                        select: {
                            id: true,
                            username: true,
                            createdAt: true,
                            updatedAt: true,
                        },
                    });
                    
                    if (!user) {
                        return res.status(404).json({ error: 'User not found' });
                    }
                    
                    res.json(user);
                } catch (e) {
                    console.error(e);
                    next(new InternalServerError());
                }
            }
        ];
    }
}

export default UserController;
