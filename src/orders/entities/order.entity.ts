import { Field, Float, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { Dish } from "src/restaurants/entities/dish.entity";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from "typeorm";

export enum OrderStatus {
    Pending = 'Pending',
    InProgress = 'InProgress', //cooking
    PickedUp = 'PickedUp',
    Delivered = 'Delivered'
}

registerEnumType(OrderStatus, { name: "Orderstatus" })

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
    @Field(type => User, { nullable: true })
    @ManyToOne(type => User, user => user.orders, { onDelete: 'SET NULL', nullable: true })
    customer?: User

    @Field(type => User, { nullable: true })
    @ManyToOne(type => User, user => user.rides, { onDelete: 'SET NULL', nullable: true })
    driver?: User

    @Field(type => Restaurant)
    @ManyToOne(type => Restaurant, restaurant => restaurant.orders, { onDelete: 'SET NULL', nullable: true })
    restaurant: Restaurant

    //dish can be many orders (multiple ppl order same dish)
    //order can have many dishes -> n:n relatinoship
    //owner side of this relationship will be order since we look at order to view which dishes were ordered
    @Field(type => [Dish])
    @ManyToMany(type=>Dish)
    @JoinTable()
    Dishes: Dish[]

    @Column()
    @Field(type => Float)
    total: number

    @Column({ type: "enum", enum: OrderStatus })
    @Field(type => OrderStatus)
    status: OrderStatus
}