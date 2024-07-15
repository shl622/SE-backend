import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Injectable } from "@nestjs/common";
import { CreateAccountInput } from "./dtos/create-account.dto.ts";
import { LoginInput } from "./dtos/login.dto";
import { JwtService } from "src/jwt/jwt.service";
import { EditProfileInput } from "./dtos/edit-profile";
import { Verification } from "./entities/verfication.entity";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>,
        @InjectRepository(Verification) private readonly verifications: Repository<Verification>,
        private readonly jwtService: JwtService
    ) { }

    /* 
    Create Account (takes createAccountInput(dto) as input)
    returns Object(boolean,string-errormsg) for mutation output
    **check @Mutation in users.resolver**

    1. check if new User exists in db
    2.1. if user exists
    -> return error
    2.2 if user does not exist (isNew)
    -> create user & hash the password
    -> add verification
    -> return ok
    */

    async createAccount({ email, password, role }: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
        try {
            const exists = await this.users.exists({ where: { email } })
            if (exists) {
                return { ok: false, error: "User already exists with the email." }
            }
            const user = await this.users.save(this.users.create({ email, password, role }))
            await this.verifications.save(this.verifications.create({
                // code: 12212212, //todo: creates code
                user
            }))
            return { ok: true }
        } catch (e) {
            return { ok: false, error: "Failed to create account." }
        }
    }

    /*
    Login (takes loginInput(dto))
    returns Object(ok,error,token) for mutation output

    1. find User with provided email
    2. check if the password matches (hash provided and compare with hashed in DB)
    3. make a JWT token and give to User
    */

    async login({ email, password }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
        try {
            const user = await this.users.findOne({ where: { email } })
            if (!user) {
                return {
                    ok: false,
                    error: "User not found."
                }
            }
            const passwordIsCorrect = await user.checkPassword(password)
            if (!passwordIsCorrect) {
                return {
                    ok: false,
                    error: "Password does not match."
                }
            }
            const token = this.jwtService.sign(user.id)
            return {
                ok: true,
                token: token
            }
        } catch (error) {
            return {
                ok: false,
                error
            }
        }
    }

    /*
   findById (takes id of user)
   returns Object(ok,error,token) for mutation output
   */

    async findById(id: number): Promise<User> {
        return this.users.findOne({ where: { id } })
    }

    /*
    editProfile (takes id of user)
    return updateResult
    update() is faster, but needs to use BeforeUpdate() for hashing passwords, so use save()
    */
    async editProfile(userId: number, { email, password }: EditProfileInput): Promise<User> {
        const user = await this.users.findOne({ where: { id: userId } })
        if (email) {
            user.email = email
            user.verified = false
            await this.verifications.save(this.verifications.create({ user }))
        }
        if (password) {
            user.password = password
        }
        return this.users.save(user)
    }

    /*
    verifyEmail
    takes verification code(string) and returns boolean
    have to explicitly tell typeOrm to load the relationship
    */
    async verifyEmail(code: string): Promise<boolean> {
        const verification = await this.verifications.findOne({where:{code}, relations:{user:true}})
        if(verification){
            verification.user.verified= true
            this.users.save(verification.user)
        }
        return false
    }
}