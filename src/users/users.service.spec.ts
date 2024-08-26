import { Test } from "@nestjs/testing"
import { UserService } from "./users.service"
import { getRepositoryToken } from "@nestjs/typeorm"
import { User, UserRole } from "./entities/user.entity"
import { Verification } from "./entities/verfication.entity"
import { JwtService } from "src/jwt/jwt.service"
import { EmailService } from "src/email/email.service"
import { Not, Repository } from "typeorm"

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
    findOneOrFail: jest.fn(),
    delete: jest.fn(),
    exists: jest.fn()
})

const mockJwtService = () => ({
    sign: jest.fn(() => "signed-token"),
    verify: jest.fn()
})

const mockEmailService = () => ({
    sendVerificationEmail: jest.fn()
})

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>

//create testing module first
// use getRepositoryToken, which is provided by typeOrm
//provide mock repository ( User,verification,jwt,email)
describe('UserService', () => {
    let service: UserService
    let userRepository: MockRepository<User>
    let verificationRepository: MockRepository<Verification>
    let emailService: EmailService
    let jwtService: JwtService

    beforeEach(async () => {
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
                    useValue: mockJwtService(),
                },
                {
                    provide: EmailService,
                    useValue: mockEmailService(),
                }]
        }).compile()
        service = module.get<UserService>(UserService)
        emailService = module.get<EmailService>(EmailService)
        jwtService = module.get<JwtService>(JwtService)
        userRepository = module.get(getRepositoryToken(User))
        verificationRepository = module.get(getRepositoryToken(Verification))
    })

    //first check the service is created
    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('createAccount', () => {
        const createAccountArgs = {
            email: '',
            password: '',
            role: UserRole.Owner
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
            // check if user is created and saved
            // check if created user is sent verificaiton and ver is created and saved
            // check if email is sent for verification
            // finally check if user is created

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

        //check if createAccount fails in try catch
        it('should fail on exception', async () => {
            userRepository.findOne.mockRejectedValue(new Error())
            const result = await service.createAccount(createAccountArgs)
            expect(result).toEqual({ ok: false, error: "Failed to create account." })
        })

    })

    describe('login', () => {
        const loginArgs = {
            email: 'jest@email.com',
            password: 'jestpw',
        }
        it('should fail if user does not exist', async () => {
            userRepository.findOne.mockResolvedValue(null)
            const result = await service.login(loginArgs)
            expect(userRepository.findOne).toHaveBeenCalledTimes(1)
            expect(userRepository.findOne).toHaveBeenCalledWith(expect.any(Object))
            expect(result).toEqual({
                ok: false,
                error: "User not found."
            })
        })

        it('should fail if password is incorrect', async () => {
            const mockedUser = { checkPassword: jest.fn(() => Promise.resolve(false)) }
            userRepository.findOne.mockResolvedValue(mockedUser)
            const result = await service.login(loginArgs)
            expect(result).toEqual({
                ok: false,
                error: "Password does not match."
            })
        })

        it('should return oken if password is correct', async () => {
            const mockedUser = {
                id: 1,
                checkPassword: jest.fn(() => Promise.resolve(true))
            }
            userRepository.findOne.mockResolvedValue(mockedUser)
            const result = await service.login(loginArgs)
            expect(jwtService.sign).toHaveBeenCalledTimes(1)
            expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number))
            expect(result).toEqual({ ok: true, token: 'signed-token' })
        })
        it('should fail on exception', async () => {
            userRepository.findOne.mockRejectedValue(Error("exited on error"))
            const result = await service.login(loginArgs)
            expect(result).toEqual({
                ok: false,
                error: Error("exited on error")
            })
        })
    })

    describe('findById', () => {
        const findByIdArgs = {
            id: 1
        }
        it('should return existing user', async () => {
            userRepository.findOneOrFail.mockResolvedValue(findByIdArgs)
            const result = await service.findById(1)
            expect(result).toEqual({
                ok: true,
                user: findByIdArgs
            })
        })
        it('should fail if user is not found', async () => {
            userRepository.findOneOrFail.mockRejectedValue(new Error())
            const result = await service.findById(1)
            expect(result).toEqual({
                ok: false,
                error: "User not found."
            })
        })
    })

    describe('editProfile', () => {
        it('should update email', async () => {
            const oldUser = {
                email: "jest@test.com",
                verified: true
            }
            const editProfileArgs = {
                userId: 1,
                input: { email: "jestupdate@test.com" }
            }
            const newVerification = {
                code: 'code'
            }
            const updatedUser = {
                email: "jestupdate@test.com",
                verified: false
            }
            userRepository.findOne.mockResolvedValue(oldUser)
            userRepository.exists.mockResolvedValue(null)
            verificationRepository.delete({ user: { id: editProfileArgs.userId } })
            verificationRepository.create.mockReturnValue(newVerification)
            verificationRepository.save.mockResolvedValue(newVerification)
            await service.editProfile(editProfileArgs.userId, editProfileArgs.input)
            expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: editProfileArgs.userId } })

            expect(verificationRepository.delete).toHaveBeenCalledWith({ user: { id: editProfileArgs.userId } })
            expect(verificationRepository.create).toHaveBeenCalledWith({ user: updatedUser })
            expect(verificationRepository.save).toHaveBeenCalledWith(newVerification)

            expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(updatedUser.email, newVerification.code)
        })
        it('should check if updating email already exists', async () => {
            const oldUser = {
                email: "jest@test.com",
                verified: true
            }
            const existingUser = {
                email: "exist@test.com",
                userId: 2
            }
            const editProfileArgs = {
                userId: 1,
                input: { email: existingUser.email }
            }
            userRepository.findOne.mockResolvedValue(oldUser)
            userRepository.exists.mockResolvedValue(existingUser)
            const result = await service.editProfile(editProfileArgs.userId, editProfileArgs.input)
            expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: editProfileArgs.userId } })
            expect(userRepository.exists).toHaveBeenCalledWith({ where: { email: editProfileArgs.input.email, id: Not(editProfileArgs.userId) } })
            expect(result).toEqual({
                ok: false,
                error: 'Email is already in use.'
            })
        })
        it('should update password', async () => {
            const editProfileArgs = {
                userId: 1,
                input: { password: "jest.test" }
            }
            userRepository.findOne.mockResolvedValue({ password: 'old' })
            const result = await service.editProfile(editProfileArgs.userId, editProfileArgs.input)
            expect(userRepository.save).toHaveBeenCalledTimes(1)
            expect(userRepository.save).toHaveBeenCalledWith(editProfileArgs.input)
            expect(result).toEqual({ ok: true })
        })
        it('should exit on exception', async () => {
            userRepository.findOne.mockRejectedValue(new Error())
            const result = await service.editProfile(1, { email: "fail@jest" })
            expect(result).toEqual({
                ok: false,
                error: "Failed to update user profile."
            })
        })
    })

    describe('verifyEmail', () => {
        it('should verify email', async () => {
            const mockedVerification = {
                user: {
                    verified: false
                },
                id: 1
            }
            verificationRepository.findOne.mockResolvedValue(mockedVerification)
            const result = await service.verifyEmail('')

            expect(verificationRepository.findOne).toHaveBeenCalledTimes(1)
            expect(verificationRepository.findOne).toHaveBeenCalledWith(
                expect.any(Object) // {where:{code}, relations: ['user]}
            )
            expect(userRepository.save).toHaveBeenCalledTimes(1)
            expect(userRepository.save).toHaveBeenCalledWith({ verified: true })

            expect(verificationRepository.delete).toHaveBeenCalledTimes(1)
            expect(verificationRepository.delete).toHaveBeenCalledWith(mockedVerification.id)
            expect(result).toEqual({ ok: true })

        })

        it('should fail on verification not found', async () => {
            verificationRepository.findOne.mockResolvedValue(undefined)
            const result = await service.verifyEmail('')
            expect(result).toEqual({ ok: false, error: "Verification not found." })
        })

        it('should fail on exception', async () => {
            verificationRepository.findOne.mockRejectedValue(new Error())
            const result = await service.verifyEmail('')
            expect(result).toEqual({
                ok: false,
                error: 'Could not verify email.'
            })
        })
    })
})