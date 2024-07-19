import { Test } from "@nestjs/testing"
import { EmailService } from "./email.service"
import { CONFIG_OPTIONS } from "src/common/common.constants"
import * as FormData from 'form-data';
import fetch from 'node-fetch'

//mock node-fetch, form-data packages
// jest.mock('node-fetch',()=>{
//     return{
//         fetch: jest.fn(()=>{})
//     }
// })
jest.mock('form-data')

const TEST_DOMAIN = 'test-domain'

describe('EmailService', () => {
    let service: EmailService

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [EmailService, {
                provide: CONFIG_OPTIONS,
                useValue: {
                    apiKey: 'test-apiKey',
                    domain: TEST_DOMAIN,
                    fromemail: 'test-fromEmail'
                }
            }]
        }).compile()
        service = module.get<EmailService>(EmailService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('sendEmail', () => {
        it('sends email', () => {
            const ok = service.sendEmail('','',[])
            //first check for new FormData and then append
            const formDataSpy = jest.spyOn(FormData.prototype, 'append')
            expect(formDataSpy).toHaveBeenCalled()
            // expect(fetch).toHaveBeenCalledTimes(1)
            // expect(fetch).toHaveBeenCalledWith(
            //     `https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`,
            //     expect.any(Object)
            // )
            // expect(ok).toEqual(true)
        })
        it('fails on error', async ()=>{
            // jest.spyOn(fetch,'Request')
        })
    })

    describe('sendVerificationEmail', () => {
        it('should call sendEmail', () => {
            const sendVerificationEmailArgs = {
                email: 'email',
                code: 'code'
            }
            jest.spyOn(service, 'sendEmail').mockImplementation(async () => { true })
            service.sendVerificationEmail(sendVerificationEmailArgs.email, sendVerificationEmailArgs.code)
            expect(service.sendEmail).toHaveBeenCalledTimes(1)
            expect(service.sendEmail).toHaveBeenCalledWith("Verify Your Email", "verify email", [
                { key: "code", value: sendVerificationEmailArgs.code },
                { key: 'username', value: sendVerificationEmailArgs.email }
            ])
        })
    })
})