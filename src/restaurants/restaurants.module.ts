import { Module } from '@nestjs/common';
import { CategoryResolver, DishResolver, RestaurantResolver } from './restuarants.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';
import { CategoryRepository } from './repositories/cateogry.repository';
import { Dish } from './entities/dish.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Restaurant, Dish])],
    providers: [RestaurantResolver, RestaurantService, CategoryRepository, DishResolver, CategoryResolver]
})
export class RestaurantsModule { }
