import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity } from "typeorm";
import * as bcrypt from "bcrypt";
import { InternalServerErrorException } from "@nestjs/common";
import { IsEmail, IsEnum, Length } from "class-validator";
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
    @IsEmail()
    email: string

    @Column()
    @Field(type => String)
    @Length(4)
    password: string

    @Column({ type: 'enum', enum: UserRole })
    @Field(type => UserRole)
    @IsEnum(UserRole)
    role: UserRole

    //hash password before adding to DB
    //uses bcrypt- default 10 rounds of salt after hash
    @BeforeInsert()
    @BeforeUpdate()
    async hashPassWord(): Promise<void> {
        try {
            this.password = await bcrypt.hash(this.password, 10)
        }
        catch (e) {
            console.log(e)
            throw new InternalServerErrorException()
        }
    }

    //password authentication function
    //checks hashed pw with provided pw->hash
    async checkPassword(pw: string): Promise<boolean> {
        try {
            return await bcrypt.compare(pw, this.password)
        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException()
        }
    }
}