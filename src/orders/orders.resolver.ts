import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { Order } from "./entities/order.entity";
import { OrderService } from "./orders.service";
import { CreateOrderInput, CreateOrderOutput } from "./dto/create-order.dto";
import { AuthUser } from "src/auth/auth-user.decorator";
import { User } from "src/users/entities/user.entity";
import { Role } from "src/auth/role.decorator";

@Resolver(of=>Order)
    export class OrderResolver {
        constructor(private readonly ordersService: OrderService){}

    @Mutation(returns => CreateOrderOutput)
    @Role(['Client'])
    async createOrder(@AuthUser() customer:User, @Args('input') createOrderInput: CreateOrderInput):Promise<CreateOrderOutput>{
        return this.ordersService.createOrder(customer,createOrderInput)
    }
}