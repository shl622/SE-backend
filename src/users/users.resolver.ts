import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto.ts";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { AuthUser } from "src/auth/auth-user.decorator";
import { UserProfileInput, UserProfileOutput } from "./dtos/user-profile.dto";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile";


@Resolver(of => User)
export class UsersResolver {

    constructor(
        private readonly usersService: UsersService
    ) { }

    //creates account
    @Mutation(returns => CreateAccountOutput)
    async createAccount(@Args("input") createAccountInput: CreateAccountInput): Promise<CreateAccountOutput> {
        try {
            return await this.usersService.createAccount(createAccountInput)
        } catch (error) {
            return {
                ok: false,
                error
            }
        }
    }
    
    //login
    @Mutation(returns => LoginOutput)
    async login(@Args("input") loginInput: LoginInput): Promise<LoginOutput> {
        try {
            return await this.usersService.login(loginInput)
        } catch (error) {
            return {
                ok: false,
                error
            }
        }
    }

    //blocks request if not logged in (no jwt header)
    //returns user look at auth-user.decorator.ts
    @Query(returns => User)
    @UseGuards(AuthGuard)
    currAuth(@AuthUser() authUser: User) {
        return authUser
    }

    //checks if user exists before accessing user profile
    @UseGuards(AuthGuard)
    @Query(returns => UserProfileOutput)
    async userProfile(@Args() userProfileInput: UserProfileInput): Promise<UserProfileOutput> {
        try{
            const user = await this.usersService.findById(userProfileInput.userId)
            if(!user){
                throw Error()
            }
            return{
                ok:true,
                user
            }
        }catch(e){
            return{
                ok:false,
                error:"User not found."
            }
        }
    }

    //user profile crud
    @UseGuards(AuthGuard)
    @Mutation(returns=>EditProfileOutput)
    async editProfile(@AuthUser() authUser: User, 
    @Args('input') editProfileInput: EditProfileInput): Promise<EditProfileOutput>{
        try{
            await this.usersService.editProfile(authUser.id, editProfileInput)
            return{
                ok:true
            }
        }catch(error){
            return {
                ok:false,
                error
            }
        }
    }
}