import { Args, Mutation, Query } from "@nestjs/graphql";
import { Resolver } from "@nestjs/graphql";
import { Restaurant } from "./entities/restaurant.entity";
import { CreateRestaurantDto } from "./dto/create-restaurant.dto";
import { RestaurantService } from "./restaurants.service";
import { UpdateRestaurantDto } from "./dto/update-restaurant.dto";

@Resolver(of => Restaurant)
export class RestaurantResolver {
    constructor(private readonly restaurantService: RestaurantService) {}
    @Query(returns => [Restaurant])
    restaurants(): Promise<Restaurant[]> {
        return this.restaurantService.getAll()
    }
    @Mutation(returns => Boolean)
    async createRestaurant(@Args('input') createRestuarntDto: CreateRestaurantDto): Promise<boolean> {
        try{
            await this.restaurantService.createRestaurant(createRestuarntDto)
            return true
        }catch(e){
            console.log(e)
            return false
        }
    }

    @Mutation(returns => Boolean)
    async updateRestaurant(
        @Args('input') updateRestaurantDto: UpdateRestaurantDto
    ): Promise<boolean>{
        try{
            await this.restaurantService.updateRestauarnt(updateRestaurantDto)
            return true
        }catch(e){
            console.log(e)
            return false
        }
    }
}

