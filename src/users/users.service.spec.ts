import { Test } from "@nestjs/testing"
import { UsersService } from "./users.service"
import { getRepositoryToken } from "@nestjs/typeorm"
import { User } from "./entities/user.entity"
import { Verification } from "./entities/verfication.entity"
import { JwtService } from "src/jwt/jwt.service"
import { EmailService } from "src/email/email.service"

/*
    test all functions in userService
    1. create Account
    2. Login
    3. Find user by Id
    4. Edit user Profile
    5. Verify Email
*/

const mockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
}

const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn()
}

const mockEmailService = {
    sendVerificationEmail: jest.fn()
}
describe('UserService', () => {
    //create testing module first
    // use getRepositoryToken, which is provided by typeOrm
    //provide mock repository ( User,verification,jwt,email...)
    let service: UsersService

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            providers: [UsersService, 
            {
                provide: getRepositoryToken(User), 
                useValue: mockRepository
            },
            {
                provide: getRepositoryToken(Verification), 
                useValue: mockRepository
            },
            {
                provide: JwtService, 
                useValue: mockJwtService
            },
            {
                provide: EmailService, 
                useValue: mockEmailService
            }]
        }).compile()
        service = module.get<UsersService>(UsersService)
    })

    //first check the service is created
    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    it.todo('createAccount')
    it.todo('login')
    it.todo('findById')
    it.todo('editProfile')
    it.todo('verifyEmail')
})