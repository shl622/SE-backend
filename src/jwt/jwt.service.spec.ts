import { Test } from "@nestjs/testing"
import { JwtService } from "./jwt.service"
import { CONFIG_OPTIONS } from "src/common/common.constants"

const TEST_KEY = 'test-key'

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
    it.todo('sign')
    it.todo('verify')
})