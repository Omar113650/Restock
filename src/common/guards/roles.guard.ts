// import {
//   CanActivate,
//   ExecutionContext,
//   Injectable,
//   ForbiddenException,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { PlatformRole } from '@prisma/client';
// import { ROLES_KEY } from '../decorators/roles.decorator';

// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(private readonly reflector: Reflector) {}

//   canActivate(context: ExecutionContext): boolean {
//     const requiredRoles = this.reflector.getAllAndOverride<PlatformRole[]>(
//       ROLES_KEY,
//       [context.getHandler(), context.getClass()],
//     );

//     if (!requiredRoles) {
//       return true;
//     }

//     const request = context.switchToHttp().getRequest();

//     const user = request.user;

//     if (!user) {
//       return false;
//     }

//     const userRoles = user.userRoles.map((item) => item.role.name);

//     const hasRole = requiredRoles.some((role) => userRoles.includes(role));

//     if (!hasRole) {
//       throw new ForbiddenException(
//         'You do not have permission to access this resource',
//       );
//     }

//     return true;
//   }
// }
