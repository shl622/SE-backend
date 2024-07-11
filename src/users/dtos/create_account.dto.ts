import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { User } from "../entities/user.entity";


//graphQL input types for Mutation: createAccount()
@InputType()
export class CreateAccountInput extends PickType(User,
    ["email", "password", "role"]) { }


//graphQL output return from Mutation: createAccount()
@ObjectType()
export class CreateAccountOutput {
    @Field(type => String, { nullable: true })
    error?: string

    @Field(type => Boolean)
    ok: boolean
}