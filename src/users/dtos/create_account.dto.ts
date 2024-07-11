import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { User } from "../entities/user.entity";
import { MutationOutput } from "src/common/dto/output.dto";


//graphQL input types for Mutation: createAccount()
@InputType()
export class CreateAccountInput extends PickType(User,
    ["email", "password", "role"]) { }

@ObjectType()
export class CreateAccountOutput extends MutationOutput { }