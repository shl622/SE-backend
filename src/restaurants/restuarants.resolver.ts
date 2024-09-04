import { Args, Int, Mutation, Parent, Query, ResolveField } from "@nestjs/graphql";
import { Resolver } from "@nestjs/graphql";
import { Restaurant } from "./entities/restaurant.entity";
import { CreatesRestaurantInput, CreatesRestaurantOutput } from "./dto/create-restaurant.dto";
import { RestaurantService } from "./restaurants.service";
import { AuthUser } from "src/auth/auth-user.decorator";
import { User } from "src/users/entities/user.entity";
import { Role } from "src/auth/role.decorator";
import { EditRestaurantInput, EditRestaurantOutput } from "./dto/edit-restaurant.dto";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dto/delete-restaurant.dto";
import { Category } from "./entities/category.entity";
import { AllCategoriesOutput } from "./dto/all-categories.dto";

@Resolver(of => Restaurant)
export class RestaurantResolver {
    constructor(private readonly restaurantService: RestaurantService) { }

    //create Restaurant
    @Mutation(returns => CreatesRestaurantOutput)
    @Role(['Owner'])
    async createRestaurant(
        @AuthUser() authUser: User,
        @Args('input') createRestaurantInput: CreatesRestaurantInput): Promise<CreatesRestaurantOutput> {
        return this.restaurantService.createRestaurant(authUser, createRestaurantInput)
    }

    //edit Restaurant
    @Mutation(returns => EditRestaurantOutput)
    @Role(['Owner'])
    editRestaurant(
        @AuthUser() owner: User,
        @Args('input') editRestaurantInput: EditRestaurantInput
    ): Promise<EditRestaurantOutput> {
        return this.restaurantService.editRestaurant(owner, editRestaurantInput)
    }

    //delete restaurant
    @Mutation(returns => DeleteRestaurantOutput)
    @Role(['Owner'])
    deleteRestaurant(
        @AuthUser() owner: User,
        @Args('input') deleteRestaurantInput: DeleteRestaurantInput
    ): Promise<DeleteRestaurantOutput> {
        return this.restaurantService.deleteRestaurant(owner, deleteRestaurantInput)
    }
}

//category resolver inherent in restaurant service
@Resolver(of => Category)
export class CategoryResolver {
    constructor(private readonly restaurantService: RestaurantService){}
    
    //dynamic field for getting number of restaurants per category
    @ResolveField(type=> Int)
    restaurantCount(@Parent() category: Category): Promise<number>{
        return this.restaurantService.countRestaurants(category)
    }

    @Query(type=>AllCategoriesOutput)
    allCategories():Promise<AllCategoriesOutput>{
        return this.restaurantService.allCategories()
    }
}