import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersResolver } from './users.resolver';
import { UserService } from './users.service';
import { Verification } from './entities/verfication.entity';

@Module({
    imports:[TypeOrmModule.forFeature([User, Verification])],
    providers:[UsersResolver, UserService],
    exports:[UserService]
})
export class UsersModule {}
