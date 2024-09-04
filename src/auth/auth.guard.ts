import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { AllowedRoles } from "./role.decorator";
import { User } from "src/users/entities/user.entity";
import { JwtService } from "src/jwt/jwt.service";
import { UserService } from "src/users/users.service";


/*
    Guard authentication follows:
    1. Check if the resolver method requires a specific role
    2. If no role => public method => return true
    3. If role is set => check if user exist && user has that role => return true/false
*/
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );
    //debugger for role
    // console.log(roles)
    if (!roles) {
      return true;
    }
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user: User = gqlContext['user'];
    if (!user) {
      return false;
    }
    if (roles.includes('Any')) {
      return true;
    }
    console.log(roles)
    console.log(user.role)
    console.log(roles.includes(user.role))
    return roles.includes(user.role);
  }
}