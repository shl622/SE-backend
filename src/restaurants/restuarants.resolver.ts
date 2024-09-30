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
import { CategoryInput, CategoryOutput } from "./dto/category.dto";
import { RestaurantsInput, RestaurantsOutput } from "./dto/restaurants.dto";
import { RestaurantInput, RestaurantOutput } from "./dto/restaurant.dto";
import { SearchRestaurantInput, SearchRestaurantOutput } from "./dto/search-restaurant.dto";
import { Dish } from "./entities/dish.entity";
import { CreateDishInput, CreateDishOutput } from "./dto/create-dish.dto";
import { EditDishInput, EditDishOutput } from "./dto/edit-dish.dto";
import { DeleteDishInput, DeleteDishOutput } from "./dto/delete-dish.dto";
import { MyRestaurantsOutput } from "./dto/my-restaurants.dto";
import { MyRestaurantInput, MyRestaurantOutput } from "./dto/my-restaurant.dto";

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

    @Query(returns => RestaurantsOutput)
    restaurants(@Args('input') restaurantsInput: RestaurantsInput): Promise<RestaurantsOutput> {
        return this.restaurantService.allRestaurants(restaurantsInput)
    }

    @Query(returns => RestaurantOutput)
    restaurant(@Args('input') restaurantInput: RestaurantInput): Promise<RestaurantOutput> {
        return this.restaurantService.findRestaurantById(restaurantInput)
    }

    @Query(returns => SearchRestaurantOutput)
    searchRestaurant(@Args('input') searchRestaurantInput: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
        return this.restaurantService.searchRestaurantByName(searchRestaurantInput)
    }

    @Query(returns => MyRestaurantsOutput)
    @Role(['Owner'])
    myRestaurants(@AuthUser() owner:User): Promise<MyRestaurantsOutput> {
        return this.restaurantService.myRestaurants(owner)
    }

    @Query(returns => MyRestaurantOutput)
    @Role(['Owner'])
    myRestaurant(@AuthUser() owner:User, @Args('input') myRestaurantInput: MyRestaurantInput): Promise<MyRestaurantOutput>{
        return this.restaurantService.myRestaurant(owner,myRestaurantInput)
    }
}

//category resolver inherent in restaurant service
@Resolver(of => Category)
export class CategoryResolver {
    constructor(private readonly restaurantService: RestaurantService) { }

    //dynamic field for getting number of restaurants per category
    @ResolveField(type => Int)
    restaurantCount(@Parent() category: Category): Promise<number> {
        return this.restaurantService.countRestaurants(category)
    }

    @Query(type => AllCategoriesOutput)
    allCategories(): Promise<AllCategoriesOutput> {
        return this.restaurantService.allCategories()
    }

    @Query(type => CategoryOutput)
    category(@Args('input') categoryInput: CategoryInput): Promise<CategoryOutput> {
        return this.restaurantService.findCategoryBySlug(categoryInput)
    }
}

// menu items resolver
@Resolver(of => Dish)
export class DishResolver {
    constructor(private readonly restaurantService: RestaurantService) { }

    @Mutation(type=> CreateDishOutput)
    @Role(['Owner'])
    createDish(@AuthUser() owner: User, @Args('input') createDishInput: CreateDishInput):Promise<CreateDishOutput>{
        return this.restaurantService.createDish(owner, createDishInput)
    }

    @Mutation(type=> EditDishOutput)
    @Role(['Owner'])
    editDish(@AuthUser() owner: User, @Args('input') editDishInput: EditDishInput):Promise<EditDishOutput>{
        return this.restaurantService.editDish(owner, editDishInput)
    }

    @Mutation(type=>DeleteDishOutput)
    @Role(['Owner'])
    deleteDish(@AuthUser() owner:User, @Args('input') deleteDishInput: DeleteDishInput):Promise<DeleteDishOutput>{
        return this.restaurantService.deleteDish(owner, deleteDishInput)
    }
}