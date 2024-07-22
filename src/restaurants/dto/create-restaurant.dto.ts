import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { Restaurant } from "../entities/restaurant.entity";
import { CoreOutput } from "src/common/dto/output.dto";

@InputType()
export class CreatesRestaurantInput extends PickType(Restaurant, [
    'name',
    'coverImg',
    'address'
]) {
    //create a slug to narrow down the category input
    @Field(type => String)
    categoryName: string
}
@ObjectType()
export class CreatesRestaurantOutput extends CoreOutput { }