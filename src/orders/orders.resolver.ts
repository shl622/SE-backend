import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { Order } from "./entities/order.entity";
import { OrderService } from "./orders.service";
import { CreateOrderInput, CreateOrderOutput } from "./dto/create-order.dto";
import { AuthUser } from "src/auth/auth-user.decorator";
import { User } from "src/users/entities/user.entity";
import { Role } from "src/auth/role.decorator";
import { GetOrdersInput, GetOrdersOutput } from "./dto/get-orders.dto";
import { GetOrderInput, GetOrderOutput } from "./dto/get-order.dto";
import { EditOrderInput, EditOrderOutput } from "./dto/edit-order.dto";
import { Inject } from "@nestjs/common";
import { NEW_COOKED_ORDER, NEW_PENDING_ORDER, PUB_SUB } from "src/common/common.constants";
import { PubSub } from "graphql-subscriptions";

@Resolver(of => Order)
export class OrderResolver {
    constructor(private readonly ordersService: OrderService, @Inject(PUB_SUB) private readonly pubSub: PubSub) { }

    @Mutation(returns => CreateOrderOutput)
    @Role(['Client'])
    async createOrder(@AuthUser() customer: User, @Args('input') createOrderInput: CreateOrderInput): Promise<CreateOrderOutput> {
        return this.ordersService.createOrder(customer, createOrderInput)
    }

    //multiple orders query
    @Query(returns => GetOrdersOutput)
    @Role(['Any'])
    async getOrders(@AuthUser() user: User, @Args('input') getOrdersInput: GetOrdersInput): Promise<GetOrdersOutput> {
        return this.ordersService.getOrders(user, getOrdersInput)
    }

    //single order input
    @Query(returns => GetOrderOutput)
    @Role(['Any'])
    async getOrder(@AuthUser() user: User, @Args('input') getOrderInput: GetOrderInput): Promise<GetOrderOutput> {
        return this.ordersService.getOrder(user, getOrderInput)
    }

    @Mutation(returns => EditOrderOutput)
    @Role(['Any'])
    async editOrder(@AuthUser() user: User, @Args('input') editOrderInput: EditOrderInput): Promise<EditOrderOutput> {
        return this.ordersService.editOrder(user, editOrderInput)
    }

    //Owner Dashboard show pending orders
    //triggered by customer (trigger string saved in constants)
    //when customer adds new order, this subscription is triggered
    @Subscription(returns => Order, {
        //check if restaurant of the order is owned by the listener
        filter: ({ pendingOrders: { ownerId } }, _, { user }) => {
            return ownerId === user.id
        },
        resolve: ({ pendingOrders: { order } }) => order
    })
    @Role(['Owner'])
    pendingOrders() {
        return this.pubSub.asyncIterator(NEW_PENDING_ORDER)
    }

    @Subscription(returns => Order)
    @Role(['Delivery'])
    cookedOrders(){
        return this.pubSub.asyncIterator(NEW_COOKED_ORDER)
    }
}