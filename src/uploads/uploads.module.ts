import { Module } from '@nestjs/common';
import { UploadController } from './uploads.controller';

@Module({
    controllers: [UploadController]
})
export class UploadsModule {}
