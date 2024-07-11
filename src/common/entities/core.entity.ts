import { Field } from "@nestjs/graphql";
import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

/*
    Core entity
    id, createdAt, updatedAt
    These are extended on other entities as they are globally needed.
*/
export class CoreEntity{
    @PrimaryGeneratedColumn()
    @Field(type=>Number)
    id:number

    @CreateDateColumn()
    @Field(type=>Date)
    createdAt:Date

    @UpdateDateColumn()
    @Field(type=>Date)
    updatedAt:Date
}