import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Category } from "../entities/category.entity";

/*
https://stackoverflow.com/questions/71557301/how-to-workraound-this-typeorm-error-entityrepository-is-deprecated-use-repo
custom repository
*/

@Injectable()
export class CategoryRepository extends Repository<Category> {
    constructor(private dataSource: DataSource) {
        super(Category, dataSource.createEntityManager())
    }
    async getOrCreate(name: string): Promise<Category> {
        const categoryName = name.trim().toLowerCase()
        const categorySlug = categoryName.replace(/ /g, '-')

        //try create category or find
        //if category doesn't exist, create new one and else apply category
        let category = await this.findOne({ where: { slug: categorySlug } })
        if (!category) {
            category = await this.save(this.create({ slug: categorySlug, name: categoryName }))
        }
        return category
    }
}