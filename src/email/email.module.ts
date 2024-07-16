import { DynamicModule, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailModuleOptions } from './email.interfaces';
import { EmailService } from './mail.service';

@Module({})
export class EmailModule {
    static forRoot(options: EmailModuleOptions): DynamicModule {
        return {
            module: EmailModule,
            providers: [
                {
                    provide: CONFIG_OPTIONS,
                    useValue: options
                },
                EmailService
            ],
            exports:[EmailService]
        }
    }
}
