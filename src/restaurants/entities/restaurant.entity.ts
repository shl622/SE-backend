import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString, Length } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Column, Entity, ManyToOne, OneToMany, RelationId } from "typeorm";
import { Category } from "./category.entity";
import { User } from "src/users/entities/user.entity";
import { Dish } from "./dish.entity";
import { Order } from "src/orders/entities/order.entity";

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
    @ManyToOne(type => Category, category => category.restaurants, { nullable: true, onDelete: 'SET NULL', eager: true })
    category: Category

    @Column()
    categoryId: number

    //restaurant must have a user (Owner)
    //Owner may have many restaurants, but only one owner per restaurant
    @Field(type => User)
    @ManyToOne(type => User, user => user.restaurants, { onDelete: 'CASCADE', eager:true })
    owner: User

    //restaurant may have many orders
    @Field(type => [Order])
    @OneToMany(type => Order, order => order.customer)
    orders: Order[]

    //preload relation but only load user Id instead of whole user object
    @RelationId((restaurant: Restaurant) => restaurant.owner)
    ownerId: number

    @Field(type => [Dish], { nullable: true })
    @OneToMany(
        type => Dish,
        dish => dish.restaurant,
    )
    menu: Dish[]

    @Field(type => Boolean)
    @Column({ default: false })
    isPromoted: boolean

    @Field(type => Date, { nullable: true })
    @Column({ nullable: true })
    promotedUntil: Date
}