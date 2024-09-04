import { Field, ObjectType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dto/output.dto";
import { Category } from "../entities/category.entity";


@ObjectType()
export class AllCategoriesOutput extends CoreOutput {
    //may exist or not
    @Field(type => [Category], {nullable:true})
    categories?: Category[]
}