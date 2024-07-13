// import { UnauthorizedError } from 'errors/unauthorized-error';
// import { NextFunction, Request, Response } from 'express';
// import { IContext } from 'interfaces/database';

// const isAuthenticated = (ctx: IContext) => {
//   console.log('middleware: isAuthenticated');
//   return async (req: Request, _: Response, next: NextFunction) => {
//     if (!req.session.currentUserId) {
//       return next(new UnauthorizedError());
//     }
//     const user = await ctx.db.client.user.findFirst({ where: { id: req.session.currentUserId } });
//     if (!user) {
//       return next(new UnauthorizedError());
//     }
//     next();
//   };
// };

// export default isAuthenticated;
