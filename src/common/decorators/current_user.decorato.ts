
// import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// export type JwtPayload = {
//   sub: string;
//   email: string;
//   role: string;
// };

// /**
//  * Extracts the authenticated user from the request.
//  * Relies on `JwtAuthGuard` (or any guard/strategy) having already
//  * attached the decoded JWT payload to `request.user`.
//  *
//  * Usage:
//  *   @Get()
//  *   getBalance(@CurrentUser() user: JwtPayload) { ... }
//  *
//  *   // or grab a single field:
//  *   @Get()
//  *   getBalance(@CurrentUser('sub') userId: string) { ... }
//  */
// export const CurrentUser = createParamDecorator(
//   (field: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
//     const request = ctx.switchToHttp().getRequest();
//     const user = request.user as JwtPayload | undefined;

//     return field ? user?.[field] : user;
//   },
// );