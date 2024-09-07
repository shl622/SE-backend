import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from "typeorm";
import * as bcrypt from "bcrypt";
import { InternalServerErrorException } from "@nestjs/common";
import { IsBoolean, IsEmail, IsEnum, IsString, Length } from "class-validator";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { Order } from "src/orders/entities/order.entity";

export enum UserRole {
    Owner = "Owner",
    Client = "Client",
    Delivery = "Delivery"
}

registerEnumType(UserRole, { name: "UserRole" })

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {

    @Column({ unique: true })
    @Field(type => String)
    @IsEmail()
    email: string

    @Column({ select: false })
    @Field(type => String)
    @Length(4)
    @IsString()
    password: string

    @Column({ type: 'enum', enum: UserRole })
    @Field(type => UserRole)
    @IsEnum(UserRole)
    role: UserRole

    @Column({ default: false })
    @Field(type => Boolean)
    @IsBoolean()
    verified: boolean

    //Owner may have many restaurants
    @Field(type => [Restaurant])
    @OneToMany(type => Restaurant, restaurant => restaurant.owner)
    restaurants: Restaurant[]

    //Owner may have many orders
    @Field(type=>[Order])
    @OneToMany(type=>Order, order=>order.customer)
    orders: Order[]

    //for drivers
    @Field(type=>[Order])
    @OneToMany(type=>Order, order=>order.driver)
    rides: Order[]

    //hash password before adding to DB
    //uses bcrypt- default 10 rounds of salt after hash
    @BeforeInsert()
    @BeforeUpdate()
    async hashPassWord(): Promise<void> {
        if (this.password) {
            try {
                this.password = await bcrypt.hash(this.password, 10)
            }
            catch (e) {
                console.log(e)
                throw new InternalServerErrorException()
            }
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