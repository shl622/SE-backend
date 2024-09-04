import { Module } from '@nestjs/common';
import { RestaurantResolver } from './restuarants.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';
import { CategoryRepository } from './repositories/cateogry.repository';

@Module({
    imports:[TypeOrmModule.forFeature([Restaurant])], 
    providers:[RestaurantResolver, RestaurantService, CategoryRepository]
})
export class RestaurantsModule {}
