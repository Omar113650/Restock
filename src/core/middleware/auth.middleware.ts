// import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
// import { Request, Response, NextFunction } from 'express';
// import { JwtService } from '@nestjs/jwt';

// @Injectable()
// export class AuthMiddleware implements NestMiddleware {
//   constructor(private readonly jwtService: JwtService) {}

//   async use(req: Request, res: Response, next: NextFunction) {
//     try {
//       const authHeader = req.headers['authorization'];

//       if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return res.status(HttpStatus.UNAUTHORIZED).json({
//           message: 'Unauthorized access - No token provided',
//         });
//       }

//       const token = authHeader.split(' ')[1];
//       try {
//         const payload = await this.jwtService.verifyAsync(token, {
//           secret: process.env.JWT_ACCESS_SECRET as string,
//           algorithms: ['HS256'],
//         });
//         req['User'] = payload;
//         return next();
//       } catch (accessError: any) {
//         if (
//           accessError.name === 'JsonWebTokenError' ||
//           accessError.name === 'TokenExpiredError'
//         ) {
//           try {
//             const refreshPayload = await this.jwtService.verifyAsync(token, {
//               secret: process.env.JWT_REFRESH_SECRET as string,
//               algorithms: ['HS256'],
//             });

//             req['User'] = refreshPayload;
//             req['isRefreshToken'] = true;
//             return next();
//           } catch (refreshError: any) {
//             console.log('Refresh Token also failed:', refreshError.message);
//           }
//         }
//       }

//       return res.status(HttpStatus.UNAUTHORIZED).json({
//         message: 'Invalid or expired token',
//         details: 'Both access and refresh tokens are invalid',
//       });
//     } catch (error: any) {
//       console.log(' JWT ERROR Full Details:', {
//         name: error.name,
//         message: error.message,
//       });

//       return res.status(HttpStatus.UNAUTHORIZED).json({
//         message: 'Invalid or expired token',
//         details: error.message,
//       });
//     }
//   }
// }
