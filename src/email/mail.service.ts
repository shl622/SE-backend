import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailModuleOptions } from './email.interfaces';

@Injectable()
export class EmailService {
    constructor(@Inject(CONFIG_OPTIONS) private readonly options: EmailModuleOptions) { 
        console.log(options)
    }

}
