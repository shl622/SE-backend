import { DynamicModule, Global, Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { CONFIG_OPTIONS } from './jwt.constants';
import { JwtModuleOptions } from './jwt.interfaces';

//JWT Token Module
//exports JwtService for users module
@Module({})
@Global()
export class JwtModule {
    static forRoot(options: JwtModuleOptions): DynamicModule {
        return {
            module: JwtModule,
            exports: [JwtService],
            providers: [
                {
                    provide: CONFIG_OPTIONS,
                    useValue: options
                },
                JwtService,
            ]
        }
    }
}
