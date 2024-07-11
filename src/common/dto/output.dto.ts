import { Field, ObjectType } from "@nestjs/graphql"

//graphQL purposes: output
@ObjectType()
export class CoreOutput {
    @Field(type => String, { nullable: true })
    error?: string

    @Field(type => Boolean)
    ok: boolean
}