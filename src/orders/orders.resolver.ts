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
import { PUB_SUB } from "src/common/common.constants";
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

    //test that trigger works
    @Mutation(returns => Boolean)
    async subReady(@Args('subId') subId: number) {
        await this.pubSub.publish('start', { orderSubscription: subId })
        return true
    }

    @Subscription(returns => String, {
        filter: ({ orderSubscription }, { subId }) => {
            return orderSubscription === subId
        },
        resolve: ({orderSubscription}) => `Your sub with the id ${orderSubscription} is ready!`
    })
    @Role(['Any'])
    orderSubscription(@Args('subId') subId: number) {
        return this.pubSub.asyncIterator('start')
    }
}