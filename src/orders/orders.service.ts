import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Order, OrderStatus } from "./entities/order.entity";
import { Repository } from "typeorm";
import { CreateOrderInput, CreateOrderOutput } from "./dto/create-order.dto";
import { User, UserRole } from "src/users/entities/user.entity";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { OrderItem } from "./entities/order-item.entity";
import { Dish } from "src/restaurants/entities/dish.entity";
import { GetOrdersInput, GetOrdersOutput } from "./dto/get-orders.dto";
import { GetOrderInput, GetOrderOutput } from "./dto/get-order.dto";
import { EditOrderInput, EditOrderOutput } from "./dto/edit-order.dto";
import { NEW_COOKED_ORDER, NEW_ORDER_UPDATE, NEW_PENDING_ORDER, PUB_SUB } from "src/common/common.constants";
import { PubSub } from "graphql-subscriptions";
import { TakeOrderInput, TakeOrderOutput } from "./dto/take-order.dto";


@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order) private readonly orders: Repository<Order>,
        @InjectRepository(OrderItem) private readonly orderItems: Repository<OrderItem>,
        @InjectRepository(Dish) private readonly dishes: Repository<Dish>,
        @InjectRepository(Restaurant) private readonly restaurants: Repository<Restaurant>,
        @Inject(PUB_SUB) private readonly pubSub: PubSub
    ) { }

    //first create the order and add items to the order
    async createOrder(customer: User, { restaurantId, items }: CreateOrderInput): Promise<CreateOrderOutput> {
        try {
            const restaurant = await this.restaurants.findOne({ where: { id: restaurantId } })
            if (!restaurant) {
                return {
                    ok: false,
                    error: 'Failed to find restaurant.'
                }
            }
            let orderFinalPrice = 0
            const orderItems: OrderItem[] = []
            for (const item of items) {
                const dish = await this.dishes.findOne({ where: { id: item.dishId } })
                if (!dish) {
                    return {
                        ok: false,
                        error: 'Failed to find the menu item.'
                    }
                }
                let dishFinalPrice = dish.price
                //for each option sent from user(frontend), validate with data in DB
                //Runtime complexity trade-off here: using hashmap vs not having a separate entity for options
                //opted with not having another entity as I expect the extras to be small so O(n^2) can be acceptable
                for (const itemOption of item.options) {
                    const dishOption = dish.options.find(dishOption => dishOption.name === itemOption.name)
                    if (dishOption) {
                        if (dishOption.extra) {
                            dishFinalPrice = dishFinalPrice + dishOption.extra
                            // console.log(`USD + ${dishOption.extra}`)
                        } else {
                            const dishOptionChoice = dishOption.choices.find(optionChoice => optionChoice.name === itemOption.choice)
                            if (dishOptionChoice.extra) {
                                // console.log(`USD + ${dishOptionChoice.extra}`)
                                dishFinalPrice = dishFinalPrice + dishOptionChoice.extra
                            }
                        }
                    }
                }
                orderFinalPrice = dishFinalPrice + orderFinalPrice
                const orderItem = await this.orderItems.save(this.orderItems.create({
                    dish,
                    options: item.options
                }))
                orderItems.push(orderItem)
            }

            const order = await this.orders.save(this.orders.create({
                customer,
                restaurant,
                total: orderFinalPrice,
                items: orderItems
            }))
            await this.pubSub.publish(NEW_PENDING_ORDER, { pendingOrders: { order, ownerId: restaurant.ownerId } })
            return {
                ok: true
            }
        } catch {
            return {
                ok: false,
                error: 'Failed to create order.'
            }
        }
    }

    async getOrders(user: User, { status }: GetOrdersInput): Promise<GetOrdersOutput> {
        try {
            let orders: Order[]
            if (user.role === UserRole.Client) {
                orders = await this.orders.find({ where: { customer: { id: user.id }, ...(status && { status }) } })
            }
            else if (user.role === UserRole.Delivery) {
                orders = await this.orders.find({ where: { driver: { id: user.id }, ...(status && { status }) } })
            }
            else if (user.role === UserRole.Owner) {
                //return list of lists
                orders = await this.orders.find({ where: { restaurant: { owner: { id: user.id } } } })
                if (status) {
                    orders = orders.filter(order => order.status === status)
                }
            }
            return {
                ok: true,
                orders
            }
        } catch {
            return {
                ok: false,
                error: 'Failed to get orders.'
            }
        }
    }

    accessOrder(user: User, order: Order): boolean {
        let access = true
        if (user.role === UserRole.Client && order.customerId !== user.id) {
            access = false
        }
        if (user.role === UserRole.Delivery && order.customerId !== user.id) {
            access = false
        }
        if (user.role === UserRole.Owner && order.restaurant.ownerId !== user.id) {
            access = false
        }
        return access
    }

    async getOrder(user: User, { id: orderId }: GetOrderInput): Promise<GetOrderOutput> {
        try {
            const order = await this.orders.findOne({ where: { id: orderId }, relations: ['restaurant'] })
            if (!order) {
                return {
                    ok: false,
                    error: 'Failed to find order.'
                }
            }
            if (!this.accessOrder(user, order)) {
                return {
                    ok: false,
                    error: 'Access denied.'
                }
            }
            return {
                ok: true,
                order
            }
        } catch {
            return {
                ok: false,
                error: 'Failed to get order.'
            }
        }
    }

    //for updating the status of the order ( only driver and owner of restaurant can perform this )
    async editOrder(user: User, { id: orderId, status }: EditOrderInput): Promise<EditOrderOutput> {
        try {
            const order = await this.orders.findOne({ where: { id: orderId }, relations: ['restaurant'] })
            if (!order) {
                return {
                    ok: false,
                    error: 'Failed to find order.'
                }
            }
            if (!this.accessOrder(user, order)) {
                return {
                    ok: false,
                    error: 'Access denied.'
                }
            }
            let accessEdit = true
            if (user.role === UserRole.Client) {
                accessEdit = false
            }
            //restaurant owner can only modify when cooking or finished cooking
            if (user.role === UserRole.Owner) {
                if (status !== OrderStatus.InProgress && status !== OrderStatus.WaitingForPickUp) {
                    accessEdit = true
                }
            }
            //delivery can only modify when picked up or delivered
            if (user.role === UserRole.Delivery) {
                if (status !== OrderStatus.PickedUp && status !== OrderStatus.Delivered) {
                    accessEdit = true
                }
            }
            if (!accessEdit) {
                return {
                    ok: false,
                    error: 'Access denied.'
                }
            }
            await this.orders.save({ id: orderId, status: status })
            const updatedOrder = { ...order, status }
            //Owner --> Delivery
            if (user.role === UserRole.Owner) {
                if (status === OrderStatus.WaitingForPickUp) {
                    await this.pubSub.publish(NEW_COOKED_ORDER, { cookedOrders: updatedOrder })
                }
            }
            //everyone
            await this.pubSub.publish(NEW_ORDER_UPDATE, { orderUpdates: updatedOrder })
            return {
                ok: true
            }
        } catch {
            return {
                ok: false,
                error: 'Failed to edit order.'
            }
        }
    }

    async takeOrder(driver: User, { id: orderId }: TakeOrderInput): Promise<TakeOrderOutput> {
        try {
            const order = await this.orders.findOne({ where: { id: orderId } })
            if (!order) {
                return {
                    ok: false,
                    error: 'Failed to find order.'
                }
            }
            if (order.driver) {
                return {
                    ok: false,
                    error: 'Order is already assigned to a driver'
                }
            }
            await this.orders.save({
                id: orderId,
                driver: driver
            })
            await this.pubSub.publish(NEW_ORDER_UPDATE, { orderUpdates: { ...order, driver } })
            return {
                ok: true
            }
        } catch {
            return{
                ok:false,
                error:'Failed to assign order due to unknown error.'
            }
        }
    }

}