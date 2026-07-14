import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { FamilyRole } from "../../users/entities/user.entity";

export interface RequestUser {
  id: string;
  name: string;
  email: string;
  role: FamilyRole;
  familyId: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
