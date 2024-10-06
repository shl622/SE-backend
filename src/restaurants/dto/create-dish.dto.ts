import { Field, InputType, Int, ObjectType, PickType } from "@nestjs/graphql";
import { Dish } from "../entities/dish.entity";
import { CoreOutput } from "src/common/dto/output.dto";

@InputType()
export class CreateDishInput extends PickType(Dish, ['name', 'price', 'photo', 'description', 'options']) {
    @Field(type => Int)
    restaurantId: number
}

@ObjectType()
export class CreateDishOutput extends CoreOutput { }