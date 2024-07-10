import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private readonly users: Repository<User>
    ) {}
}