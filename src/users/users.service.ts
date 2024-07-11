import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Injectable } from "@nestjs/common";
import { CreateAccountInput } from "./dtos/create_account.dto";

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private readonly users: Repository<User>
    ) { }

    /* 
    Create Account (takes createAccountInput(dto) as input)
    returns string or undefined

    1. check if new User exists in db
    2.1. if user exists
    -> return error
    2.2 if user does not exist (isNew)
    -> create user & hash the password
    -> return ok

    **check @Mutation in users.resolver**
    */

    async createAccount({ email, password, role }: CreateAccountInput): Promise<string | undefined> {
        try {
            const exists = await this.users.exists({ where: { email } })
            if (exists) {
                return "User already exists with the email."
            }
            await this.users.save(this.users.create({ email, password, role }))
        } catch (e) {
            return "Failed to create account."
        }
    }
}