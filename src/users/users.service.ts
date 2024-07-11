import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Injectable } from "@nestjs/common";
import { CreateAccountInput } from "./dtos/create_account.dto";
import { LoginInput } from "./dtos/login.dto";
import { JwtService } from "src/jwt/jwt.service";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>, 
        private readonly jwtService : JwtService
    ) {}

    /* 
    Create Account (takes createAccountInput(dto) as input)
    returns Object(boolean,string-errormsg) for mutation output
    **check @Mutation in users.resolver**

    1. check if new User exists in db
    2.1. if user exists
    -> return error
    2.2 if user does not exist (isNew)
    -> create user & hash the password
    -> return ok
    */

    async createAccount({ email, password, role }: CreateAccountInput): Promise<{ok:boolean; error?: string}> {
        try {
            const exists = await this.users.exists({ where: { email } })
            if (exists) {
                return {ok:false, error:"User already exists with the email."}
            }
            await this.users.save(this.users.create({ email, password, role }))
            return {ok:true}
        } catch (e) {
            return {ok:false, error:"Failed to create account."}
        }
    }

    /*
    Login (takes loginInput(dto))
    returns Object(ok,error,token) for mutation output

    1. find User with provided email
    2. check if the password matches (hash provided and compare with hashed in DB)
    3. make a JWT token and give to User
    */

    async login({email,password}:LoginInput): Promise<{ok:boolean; error?:string; token?:string}>{
        try{
            const user = await this.users.findOne({where:{email}})
            if(!user){
                return{
                    ok:false,
                    error: "User not found."
                }
            }
            const passwordIsCorrect = await user.checkPassword(password)
            if(!passwordIsCorrect){
                return{
                    ok:false,
                    error: "Password does not match."
                }
            }
            const token = this.jwtService.sign(user.id)
            return{
                ok:true,
                token:token
            }
        }catch(error){
            return{
                ok:false,
                error
            }
        }
    }
}