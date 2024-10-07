import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { Dish } from "../entities/dish.entity";
import { CoreOutput } from "src/common/dto/output.dto";

@InputType()
export class GetDishInput extends PickType(Dish, ['id']){}

@ObjectType()
export class GetDishOutput extends CoreOutput{
    @Field(type => Dish, {nullable:true})
    dish?: Dish
}