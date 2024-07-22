import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { User } from "./entities/user.entity";
import { UserService } from "./users.service";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto.ts";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { AuthUser } from "src/auth/auth-user.decorator";
import { UserProfileInput, UserProfileOutput } from "./dtos/user-profile.dto";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile";
import { VerifyEmailInput, VerifyEmailOutput } from "./dtos/verify-email.dto";
import { Role } from "src/auth/role.decorator";


@Resolver(of => User)
export class UsersResolver {

    constructor(
        private readonly usersService: UserService
    ) { }

    //creates account
    @Mutation(returns => CreateAccountOutput)
    async createAccount(@Args("input") createAccountInput: CreateAccountInput): Promise<CreateAccountOutput> {
        return await this.usersService.createAccount(createAccountInput)
    }

    //login
    @Mutation(returns => LoginOutput)
    async login(@Args("input") loginInput: LoginInput): Promise<LoginOutput> {
        return await this.usersService.login(loginInput)
    }

    //blocks request if not logged in (no jwt header)
    //returns user look at auth-user.decorator.ts
    @Query(returns => User)
    @Role(['Any'])
    currAuth(@AuthUser() authUser: User) {
        return authUser
    }

    //checks if user exists before accessing user profile
    @Role(['Any'])
    @Query(returns => UserProfileOutput)
    async userProfile(@Args() userProfileInput: UserProfileInput): Promise<UserProfileOutput> {
        return this.usersService.findById(userProfileInput.userId)
    }

    //user profile crud
    @Mutation(returns => EditProfileOutput)
    @Role(['Any'])
    async editProfile(
        @AuthUser() authUser: User,
        @Args('input') editProfileInput: EditProfileInput): Promise<EditProfileOutput> {
        return this.usersService.editProfile(authUser.id, editProfileInput)
    }

    //verify email
    @Mutation(returns => VerifyEmailOutput)
    verifyEmail(@Args('input') { code }: VerifyEmailInput): Promise<VerifyEmailOutput> {
        return this.usersService.verifyEmail(code)
    }
}