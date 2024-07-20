import { Test } from "@nestjs/testing"
import { JwtService } from "./jwt.service"
import { CONFIG_OPTIONS } from "src/common/common.constants"
import * as jwt from "jsonwebtoken"

//mock Jwt from jsonwebtoken
jest.mock('jsonwebtoken', () => {
    return {
        sign: jest.fn(() => "TOKEN"),
        verify: jest.fn(() => ({ id: USER_ID }))
    }
})

const TEST_KEY = 'test-key'
const USER_ID = 1

describe('JwtService', () => {
    let service: JwtService
    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [JwtService, {
                provide: CONFIG_OPTIONS,
                useValue: { privateKey: TEST_KEY }
            }]
        }).compile()
        service = module.get<JwtService>(JwtService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    //test jwt sign
    //mocked jwt package so jwt.sign is intercepted by jest
    describe('sign', () => {
        it('should return a signed token', () => {
            const token = service.sign(USER_ID)
            expect(typeof token).toBe('string')
            expect(jwt.sign).toHaveBeenCalledTimes(1)
            expect(jwt.sign).toHaveBeenCalledWith({ id: USER_ID }, TEST_KEY)
        })
    })

    //test jwt verify
    describe('verify', () => {
        it('should return the decoded token', () => {
            const token = 'TOKEN'
            const decodedToken = service.verify(token)
            expect(jwt.verify).toHaveBeenCalledTimes(1)
            expect(jwt.verify).toHaveBeenCalledWith(token, TEST_KEY)
            expect(decodedToken).toEqual({ id: USER_ID })
        })
    })
})