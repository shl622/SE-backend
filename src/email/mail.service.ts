import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailModuleOptions } from './email.interfaces';
import * as FormData from 'form-data';
import fetch from 'node-fetch';

@Injectable()
export class EmailService {
    constructor(@Inject(CONFIG_OPTIONS) private readonly options: EmailModuleOptions) {
        this.sendEmail('testing','test')
    }

    //mock cURL on Node.js
    //use form data npm
    private async sendEmail(subject: string, content: string) {
        const form = new FormData()
        form.append("from", `Excited User <mailgun@${this.options.domain}>`)
        form.append("to", `${this.options.fromEmail}`)
        form.append("subject", subject)
        form.append("text", content)
        const response = await fetch(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
            method:"POST",
            headers: {
                "Authorization": `Basic ${Buffer.from(`api:${this.options.apiKey}`).toString("base64")}`
            },
            body: form
        })
        console.log(response.body)
    }
}
