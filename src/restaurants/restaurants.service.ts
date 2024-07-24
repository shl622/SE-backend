import { Injectable } from "@nestjs/common";
import { Restaurant } from "./entities/restaurant.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreatesRestaurantInput, CreatesRestaurantOutput } from "./dto/create-restaurant.dto";
import { User } from "src/users/entities/user.entity";
import { Category } from "./entities/category.entity";
import { EditRestaurantInput, EditRestaurantOutput } from "./dto/edit-restaurant.dto";

@Injectable()
export class RestaurantService {
    constructor(
        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant>,
        @InjectRepository(Category)
        private readonly categories: Repository<Category>
    ) { }


    async createRestaurant(
        owner: User,
        createRestaurantInput: CreatesRestaurantInput)
        : Promise<CreatesRestaurantOutput> {
        try {
            const newRestaurant = this.restaurants.create(createRestaurantInput)
            newRestaurant.owner = owner
            const category = await this.getOrCreateCategory(createRestaurantInput.categoryName)
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

    async getOrCreateCategory(name: string): Promise<Category> {
        //slug implementation for category input
        //remove whitespace and format to lowercase
        //remove all space between and join with -
        const categoryName = name.trim().toLowerCase()
        const categorySlug = categoryName.replace(/ /g, '-')

        //try create category or find
        //if category doesn't exist, create new one and else apply category
        let category = await this.categories.findOne({ where: { slug: categorySlug } })
        if (!category) {
            category = await this.categories.save(this.categories.create({ slug: categorySlug, name: categoryName }))
        }
        return category
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
            return { ok: true }
        } catch (e) {
            return {
                ok: false,
                error: 'Failed to edit restaurant.'
            }
        }
    }
}