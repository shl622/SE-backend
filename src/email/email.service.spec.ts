import { Test } from "@nestjs/testing"
import { EmailService } from "./email.service"
import { CONFIG_OPTIONS } from "src/common/common.constants"
import * as FormData from 'form-data';

//mock fetch, form-data packages
jest.mock('node-fetch', () => {
    return{
        fetch: jest.fn()
    }
 })
jest.mock('form-data', () => {
    return {
        append: jest.fn()
    }
})

describe('EmailService', () => {
    let service: EmailService

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [EmailService, {
                provide: CONFIG_OPTIONS,
                useValue: {
                    apiKey: 'test-apiKey',
                    domain: 'test-domain',
                    fromemail: 'test-fromEmail'
                }
            }]
        }).compile()
        service = module.get<EmailService>(EmailService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })
    it.todo('sendEmail')
    it.todo('sendVerificationEmail')
})