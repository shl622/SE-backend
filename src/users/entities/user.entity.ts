import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { BeforeInsert, Column, Entity } from "typeorm";
import * as bcrypt from "bcrypt";
import { InternalServerErrorException } from "@nestjs/common";
/*
    user-specific entity
    - email
    - role (client, owner, delivery)
    - password
*/

enum UserRole {
    Owner,
    Client,
    Delivery
}

registerEnumType(UserRole, { name: "UserRole" })

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {

    @Column()
    @Field(type => String)
    email: string

    @Column()
    @Field(type => String)
    password: string

    @Column({ type: 'enum', enum: UserRole })
    @Field(type => UserRole)
    role: UserRole

    //hash password before adding to DB
    //uses bcrypt- default 10 rounds of salt after hash
    @BeforeInsert()
    async hashPassWord(): Promise<void>{
        try{
            this.password = await bcrypt.hash(this.password, 10)
        }
        catch(e){
            console.log(e)
            throw new InternalServerErrorException()
        }
    }
}