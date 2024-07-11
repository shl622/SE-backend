import { DynamicModule, Global, Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { JwtModuleOptions } from './interfaces/jwt-module-options.interface';

//JWT Token Module
//exports JwtService for users module
@Module({})
@Global()
export class JwtModule {
    static forRoot(options: JwtModuleOptions): DynamicModule {
        return {
            module: JwtModule,
            exports: [JwtService],
            providers: [JwtService]
        }
    }
}
