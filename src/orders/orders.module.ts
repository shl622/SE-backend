import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';
import { OrderResolver } from './orders.resolver';

@Module({
    imports:[TypeOrmModule.forFeature([Order])],
    providers:[
        OrderService,
        OrderResolver
    ]
})
export class OrdersModule {}
