import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString, Length } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { Category } from "./category.entity";

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {

    @Field(type => String)
    @Column()
    @IsString()
    @Length(5)
    name: string

    @Field(type => String)
    @Column()
    @IsString()
    coverImg: string

    @Field(type => String)
    @Column()
    @IsString()
    address: string

    //if category is deleted, don't delete the restaurant and set as null
    @Field(type => Category, {nullable:true})
    @ManyToOne(type=>Category, category => category.restaurants, {nullable:true, onDelete: 'SET NULL'})
    category: Category
}