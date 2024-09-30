import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString, Length } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { Restaurant } from "./restaurant.entity";
import { defaultCategoryUrl } from "src/lib/constants";

@InputType("CategoryInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class Category extends CoreEntity {

    @Field(type => String)
    @Column({ unique: true })
    @IsString()
    @Length(5)
    name: string

    @Field(type => String, { nullable: true })
    @Column({ nullable: true })
    @IsString()
    coverImg: string

    @Field(type => String)
    @Column({ unique: true })
    @IsString()
    slug: string

    //1 to many relationship with restaurant
    //1 category has many restaurants 
    @Field(type => [Restaurant])
    @OneToMany(type => Restaurant, restaurant => restaurant.category)
    restaurants: Restaurant[]
}