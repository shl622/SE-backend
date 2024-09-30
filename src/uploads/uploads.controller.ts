import { Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import * as AWS from 'aws-sdk'
import { ConfigService } from "@nestjs/config";

const BUCKET_NAME = "super-eats-app-bucket"

@Controller("uploads")
export class UploadController {
    constructor(private readonly configService: ConfigService) { }
    @Post('')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file) {
        AWS.config.update({
            credentials: {
                accessKeyId: this.configService.get('AWS_KEY'),
                secretAccessKey: this.configService.get('AWS_SECRET_KEY')
            }
        })
        try {
            const objName = `${Date.now() + file.originalname}`
            const { Location: fileUrl } = await new AWS.S3().upload({
                Body: file.buffer,
                Bucket: BUCKET_NAME,
                Key: objName,
                ACL: 'public-read'
            }).promise()
            console.log(fileUrl)
            return { url: fileUrl }
        } catch (e) {
            console.log(e)
        }
    }
}