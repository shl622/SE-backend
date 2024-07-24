import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString, Length } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { Category } from "./category.entity";
import { User } from "src/users/entities/user.entity";

@InputType('RestaurantInputType', { isAbstract: true })
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
    @Field(type => Category, { nullable: true })
    @ManyToOne(type => Category, category => category.restaurants, { nullable: true, onDelete: 'SET NULL' })
    category: Category

    //restaurant must have a user (Owner)
    //Owner may have many restaurants, but only one owner per restaurant
    @Field(type => User)
    @ManyToOne(type => User, user => user.restaurants, { onDelete: 'CASCADE' })
    owner: User

    //preload relation but only load user Id instead of whole user object
    @RelationId((restaurant:Restaurant)=> restaurant.owner)
    ownerId: number
}