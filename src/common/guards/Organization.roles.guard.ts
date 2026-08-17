// import {
//   CanActivate,
//   ExecutionContext,
//   ForbiddenException,
//   Injectable,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { OrganizationMemberRole, PlatformRole } from '@prisma/client';

// import { ORGANIZATION_ROLES_KEY } from '../decorators/organization.roles.decorator';
// import { PrismaService } from '../../module/prisma/prisma.service';

// /**
//  * Checks that the current user is a member of the organization referenced
//  * by the `:id` route param, and holds one of the roles required by
//  * @OrganizationRoles(...). PlatformRole.ADMIN always passes.
//  *
//  * Must run after JwtAuthGuard (needs req.user to be populated).
//  */
// @Injectable()
// export class OrganizationRolesGuard implements CanActivate {
//   constructor(
//     private readonly reflector: Reflector,
//     private readonly prisma: PrismaService,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const requiredRoles = this.reflector.getAllAndOverride<
//       OrganizationMemberRole[]
//     >(ORGANIZATION_ROLES_KEY, [context.getHandler(), context.getClass()]);

//     // No roles required on this route -> allow
//     if (!requiredRoles || requiredRoles.length === 0) {
//       return true;
//     }

//     const request = context.switchToHttp().getRequest();
//     const user = request.user;

//     if (!user) {
//       throw new ForbiddenException('Not authenticated');
//     }

//     // Platform admins bypass organization-level role checks
//     const platformRoles = (user.userRoles ?? []).map(
//       (item) => item.role.name,
//     );

//     if (platformRoles.includes(PlatformRole.ADMIN)) {
//       return true;
//     }

//     const organizationId = request.params.id;

//     if (!organizationId) {
//       throw new ForbiddenException('Organization id missing from request');
//     }

//     const member = await this.prisma.organizationMember.findUnique({
//       where: {
//         organizationId_userId: {
//           organizationId,
//           userId: user.id,
//         },
//       },
//     });

//     if (!member || !requiredRoles.includes(member.role)) {
//       throw new ForbiddenException(
//         'You do not have permission to perform this action on this organization',
//       );
//     }

//     return true;
//   }
// }