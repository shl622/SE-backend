import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailModuleOptions, EmailVar } from './email.interfaces';
import * as FormData from 'form-data';
import fetch from 'node-fetch';

@Injectable()
export class EmailService {
    constructor(@Inject(CONFIG_OPTIONS) private readonly options: EmailModuleOptions) {
    }

    //mock cURL on Node.js
    //use form data npm
    async sendEmail(subject: string, template: string, emailVars: EmailVar[]) {
        const form = new FormData()
        form.append("from", `Brian from Eats <mailgun@${this.options.domain}>`)
        //will default to verified email on mailgun as not paid atm
        form.append("to", `${this.options.fromEmail}`)
        form.append("subject", subject)
        form.append("template", template)
        emailVars.forEach(emailVar => form.append(`v:${emailVar.key}`, emailVar.value))
        try {
            await fetch(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
                method: "POST",
                headers: {
                    "Authorization": `Basic ${Buffer.from(`api:${this.options.apiKey}`).toString("base64")}`
                },
                body: form
            })
        }
        catch (error) {
            console.log(error)
        }
    }

    sendVerificationEmail(email: string, code: string) {
        this.sendEmail("Verify Your Email", "verify email", [
            { key: "code", value: code },
            { key: 'username', value: email }
        ])
    }
}
