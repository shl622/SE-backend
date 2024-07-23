import { Injectable } from "@nestjs/common";
import { Restaurant } from "./entities/restaurant.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreatesRestaurantInput, CreatesRestaurantOutput } from "./dto/create-restaurant.dto";
import { User } from "src/users/entities/user.entity";
import { Category } from "./entities/category.entity";

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

            //slug implementation for category input
            //remove whitespace and format to lowercase
            //remove all space between and join with -
            const categoryName = createRestaurantInput.categoryName.trim().toLowerCase()
            const categorySlug = categoryName.replace(/ /g, '-')

            //try create category or find
            //if category doesn't exist, create new one and else apply category
            let category = await this.categories.findOne({ where: { slug: categorySlug } })
            if (!category) {
                category = await this.categories.save(this.categories.create({ slug: categorySlug, name: categoryName }))
            }
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
}