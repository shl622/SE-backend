import { InputType, ObjectType, PartialType } from "@nestjs/graphql";
import { CreatesRestaurantInput } from "./create-restaurant.dto";
import { CoreOutput } from "src/common/dto/output.dto";

//make all properties from CreateRestaurant to be available
@InputType()
export class EditRestaurantInput extends PartialType(CreatesRestaurantInput){}

@ObjectType()
export class EditRestaurantOutput extends CoreOutput{}
