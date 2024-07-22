import { Args, Mutation, Query } from "@nestjs/graphql";
import { Resolver } from "@nestjs/graphql";
import { Restaurant } from "./entities/restaurant.entity";
import { CreatesRestaurantInput, CreatesRestaurantOutput } from "./dto/create-restaurant.dto";
import { RestaurantService } from "./restaurants.service";
import { AuthUser } from "src/auth/auth-user.decorator";
import { User } from "src/users/entities/user.entity";

@Resolver(of => Restaurant)
export class RestaurantResolver {
    constructor(private readonly restaurantService: RestaurantService) { }

    @Mutation(returns => CreatesRestaurantOutput)
    async createRestaurant(
        @AuthUser()  authUser: User,
        @Args('input') createRestaurantInput: CreatesRestaurantInput): Promise<CreatesRestaurantOutput> {
        return this.restaurantService.createRestaurant(authUser,createRestaurantInput)
    }
}