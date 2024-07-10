import { Args, Mutation, Query } from "@nestjs/graphql";
import { Resolver } from "@nestjs/graphql";
import { Restaurant } from "./entities/restaurant.entity";
import { CreateRestaurantDto } from "./dto/create-restaurant.dto";

@Resolver(of => Restaurant)
export class RestaurantResolver{
    @Query(returns => [Restaurant])
    restaurants(@Args('veganOnly') vegaOnly: boolean):Restaurant[]{
        console.log(vegaOnly)
        return []
    }
    @Mutation(returns => Boolean)
    createRestaurant(
        @Args() createRestuarntDto : CreateRestaurantDto
    ): boolean {
        console.log(createRestuarntDto)
        return true
    }
}