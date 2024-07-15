import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { User } from "./user.entity";
import { v4 as uuidv4 } from 'uuid';

/*
One to one relationship 
https://orkhan.gitbook.io/typeorm/docs/one-to-one-relations
*/

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
    @Column()
    @Field(type=>String)
    code: string

    @OneToOne(type=>User)
    @JoinColumn()
    user: User

    @BeforeInsert()
    //use uuid to generate random string
    createCode(): void{
        this.code = uuidv4()
    }
}