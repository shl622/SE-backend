import { Test } from "@nestjs/testing"
import { UserService } from "./users.service"
import { getRepositoryToken } from "@nestjs/typeorm"
import { User } from "./entities/user.entity"
import { Verification } from "./entities/verfication.entity"
import { JwtService } from "src/jwt/jwt.service"
import { EmailService } from "src/email/email.service"
import { Repository } from "typeorm"

/*
    test all functions in userService
    1. create Account
    2. Login
    3. Find user by Id
    4. Edit user Profile
    5. Verify Email
*/

const mockRepository = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
})

const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn()
}

const mockEmailService = {
    sendVerificationEmail: jest.fn()
}

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>

//create testing module first
// use getRepositoryToken, which is provided by typeOrm
//provide mock repository ( User,verification,jwt,email)
describe('UserService', () => {
    let service: UserService
    let userRepository: MockRepository<User>
    let verificationRepository: MockRepository<Verification>
    let emailService: EmailService

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockRepository(),
                },
                {
                    provide: getRepositoryToken(Verification),
                    useValue: mockRepository(),
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: EmailService,
                    useValue: mockEmailService,
                }]
        }).compile()
        service = module.get<UserService>(UserService)
        emailService = module.get<EmailService>(EmailService)
        userRepository = module.get(getRepositoryToken(User))
        verificationRepository = module.get(getRepositoryToken(Verification))
    })

    //first check the service is created
    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('createAccount', () => {
        const createAccountArgs = {
            email: 'jest@email.com',
            password: 'jestpw',
            role: 0
        }
        it("should fail if user already exists with identical email", async () => {
            //mock the behavior of {const exists} to return that a User exists
            userRepository.findOne.mockResolvedValue({
                id: 1,
                email: ''
            })
            //since our test yields a user already exists, createAccount should hit exists part
            const result = await service.createAccount(createAccountArgs)
            expect(result).toMatchObject({ ok: false, error: "User already exists with the email." })
        })
        it("should create a new user", async () => {
            // if user DNE with email, createaccount should run with the createAccountArgs
            userRepository.findOne.mockResolvedValue(undefined)
            userRepository.create.mockReturnValue(createAccountArgs)
            userRepository.save.mockResolvedValue(createAccountArgs)
            verificationRepository.create.mockReturnValue({
                user: createAccountArgs
            })
            verificationRepository.save.mockResolvedValue({
                code: 'code',
            })
            const result = await service.createAccount(createAccountArgs)
            expect(userRepository.create).toHaveBeenCalledTimes(1)
            expect(userRepository.create).toHaveBeenCalledWith(createAccountArgs)

            expect(userRepository.save).toHaveBeenCalledTimes(1)
            expect(userRepository.save).toHaveBeenCalledWith(createAccountArgs)

            expect(verificationRepository.create).toHaveBeenCalledTimes(1)
            expect(verificationRepository.create).toHaveBeenCalledWith({
                user: createAccountArgs
            })

            expect(verificationRepository.save).toHaveBeenCalledTimes(1)
            expect(verificationRepository.save).toHaveBeenCalledWith({
                user: createAccountArgs
            })

            expect(emailService.sendVerificationEmail).toHaveBeenCalledTimes(1)
            expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String)
            )

            expect(result).toEqual({ ok: true })
        })

    })

    it.todo('login')
    it.todo('findById')
    it.todo('editProfile')
    it.todo('verifyEmail')
})