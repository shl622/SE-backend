import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

@Module({
    providers: [{
        //use APP_GUARD to use AuthGuard globally
        provide: APP_GUARD,
        useClass: AuthGuard
    }]
})
export class AuthModule { }
