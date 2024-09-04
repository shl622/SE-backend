import { Injectable } from "@nestjs/common";
import { Restaurant } from "./entities/restaurant.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Like, Repository } from "typeorm";
import { CreatesRestaurantInput, CreatesRestaurantOutput } from "./dto/create-restaurant.dto";
import { User } from "src/users/entities/user.entity";
import { Category } from "./entities/category.entity";
import { EditRestaurantInput, EditRestaurantOutput } from "./dto/edit-restaurant.dto";
import { CategoryRepository } from "./repositories/cateogry.repository";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dto/delete-restaurant.dto";
import { AllCategoriesOutput } from "./dto/all-categories.dto";
import { CategoryInput } from "./dto/category.dto";
import { RestaurantsInput, RestaurantsOutput } from "./dto/restaurants.dto";
import { RestaurantInput, RestaurantOutput } from "./dto/restaurant.dto";
import { SearchRestaurantInput, SearchRestaurantOutput } from "./dto/search-restaurant.dto";

@Injectable()
export class RestaurantService {
    constructor(
        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant>,
        private readonly categories: CategoryRepository
    ) { }


    async createRestaurant(
        owner: User,
        createRestaurantInput: CreatesRestaurantInput)
        : Promise<CreatesRestaurantOutput> {
        try {
            console.log(owner.role)
            const newRestaurant = this.restaurants.create(createRestaurantInput)
            newRestaurant.owner = owner
            const category = await this.categories.getOrCreate(createRestaurantInput.categoryName)
            newRestaurant.category = category
            await this.restaurants.save(newRestaurant)
            return {
                ok: true
            }
        } catch (e) {
            return {
                ok: false,
                error: 'Could not create restaurant.'
            }
        }
    }

    async editRestaurant(
        owner: User,
        editRestaurantInput: EditRestaurantInput)
        : Promise<EditRestaurantOutput> {
        try {
            const restaurant = await this.restaurants.findOne({ where: { id: editRestaurantInput.restaurantId } })
            //check restaurant exists
            if (!restaurant) {
                return {
                    ok: false,
                    error: 'Restaurant not found.'
                }
            }
            //if restaurant is found by Id, check if user is auth
            if (owner.id !== restaurant.ownerId) {
                return {
                    ok: false,
                    error: 'Must be an owner to edit restaurant.'
                }
            }
            let category: Category = null
            if (editRestaurantInput.categoryName) {
                category = await this.categories.getOrCreate(editRestaurantInput.categoryName)
            }
            await this.restaurants.save([{
                id: editRestaurantInput.restaurantId,
                ...editRestaurantInput,
                //optionally if category exists, return an object that has category=category
                //if category is null, do not update
                ...(category && { category })
            }])
            return { ok: true }
        } catch (e) {
            console.log(e)
            return {
                ok: false,
                error: 'Failed to edit restaurant.'
            }
        }
    }

    async deleteRestaurant(owner: User, { restaurantId }: DeleteRestaurantInput): Promise<DeleteRestaurantOutput> {
        const restaurant = await this.restaurants.findOne({ where: { id: restaurantId } })
        try {
            if (!restaurant) {
                return {
                    ok: false,
                    error: 'Restaurant not found.'
                }
            }
            if (owner.id !== restaurant.ownerId) {
                return {
                    ok: false,
                    error: 'Must be an owner to delete restaurant.'
                }
            }
            await this.restaurants.delete(restaurantId)
            return {
                ok: true,
            }
        } catch {
            return {
                ok: false,
                error: 'Failed to delete restaurant'
            }
        }
    }

    async allCategories(): Promise<AllCategoriesOutput> {
        try {
            const categories = await this.categories.find()
            return {
                ok: true,
                categories
            }
        } catch {
            return {
                ok: false,
                error: "Failed to load categories."
            }
        }
    }

    countRestaurants(category: Category) {
        return this.restaurants.count({ where: { categoryId: category.id } })
    }

    async findCategoryBySlug({ slug, page }: CategoryInput) {
        try {
            const category = await this.categories.findOne({ where: { slug: slug } })
            if (!category) {
                return {
                    ok: false,
                    error: 'Category not found'
                }
            }
            //use find and combine take,skip instead of loading relations for db optimization
            const restaurants = await this.restaurants.find({ where: { category: { id: category.id } }, take: 25, skip: (page - 1) * 25 })
            const totalResults = await this.countRestaurants(category)
            return {
                ok: true,
                restaurants,
                category,
                totalPages: Math.ceil(totalResults / 25)
            }
        } catch {
            return {
                ok: false,
                error: 'Failed to load category.'
            }
        }
    }

    async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
        try {
            const [restaurants, totalResults] = await this.restaurants.findAndCount({ skip: (page - 1) * 25, take: 25 })
            return {
                ok: true,
                results: restaurants,
                totalPages: Math.ceil(totalResults / 25),
                totalResults
            }
        } catch {
            return {
                ok: false,
                error: 'Failed to load restaurants.'
            }
        }
    }

    async findRestaurantById({ restaurantId }: RestaurantInput): Promise<RestaurantOutput> {
        try {
            const restaurant = await this.restaurants.findOne({ where: { id: restaurantId } })
            if (!restaurant) {
                return {
                    ok: false,
                    error: 'Failed to find restaurant.'
                }
            }
            return {
                ok: true,
                restaurant
            }
        } catch {
            return {
                ok: false,
                error: 'Search failed due to an unknown error.'
            }
        }
    }

    async searchRestaurantByName({ query, page }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
        try {
            const [restaurants, totalResults] = await this.restaurants.findAndCount({
                where: { name: Like(`%${query}%`) }, 
                skip: (page - 1) * 25, 
                take: 25
            })
            return {
                ok: true,
                restaurants,
                totalPages: Math.ceil(totalResults / 25),
                totalResults
            }
        } catch {
            return {
                ok: false,
                error: 'Search failed due to an unknown error.'
            }
        }
    }
}