import { Field, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class Restaurant {

    @Field(type => Number)
    @PrimaryGeneratedColumn()
    id: number

    @Field(type => String)
    @Column()
    @IsString()
    @Length(5)
    name: string

    @Field(type => Boolean, { defaultValue: true })
    @Column({ default: true })
    @IsBoolean()
    @IsOptional()
    isVegan: boolean

    @Field(type => String)
    @Column()
    @IsString()
    address: string

    @Field(type => String, { nullable: true })
    @Column({nullable:true})
    @IsString()
    @IsOptional()
    ownerName: string

    @Field(type => String, { nullable: true })
    @Column({nullable:true})
    @IsString()
    @IsOptional()
    categoryName: string
}