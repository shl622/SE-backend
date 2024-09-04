import { Injectable } from "@nestjs/common";
import { Restaurant } from "./entities/restaurant.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreatesRestaurantInput, CreatesRestaurantOutput } from "./dto/create-restaurant.dto";
import { User } from "src/users/entities/user.entity";
import { Category } from "./entities/category.entity";
import { EditRestaurantInput, EditRestaurantOutput } from "./dto/edit-restaurant.dto";
import { CategoryRepository } from "./repositories/cateogry.repository";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dto/delete-restaurant.dto";

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

    async deleteRestaurant(owner: User, {restaurantId}: DeleteRestaurantInput): Promise<DeleteRestaurantOutput> {
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
            return{
                ok:true,
            }
        } catch {
            return {
                ok: false,
                error: 'Failed to delete restaurant'
            }
        }
    }
}