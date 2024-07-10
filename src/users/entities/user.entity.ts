import { CoreEntity } from "src/common/entities/core.entity";
import { Column, Entity } from "typeorm";

/*
    global entity ( in common module )
    - id
    - createdAt
    - updatedAt

    user-specific entity
    - email
    - role (client, owner, delivery)
    - password
*/

type UserRole = "client" | "owner" | "delivery"

@Entity()
export class User extends CoreEntity{
    @Column()
    email: string

    @Column()
    password: string

    @Column()
    role: UserRole
}