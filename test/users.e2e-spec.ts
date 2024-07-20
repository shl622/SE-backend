import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import * as request from 'supertest'

//mock fetch so email is not sent on every test
jest.mock("node-fetch", () => {
  return {
    fetch: jest.fn()
  }
})

//constants
const GRAPHQL_ENDPOINT = '/graphql'
const testUser = {
  email: 'test@e2e.com',
  password: '12345'
}


describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  //for every test, drop the DB used for E2E testing
  afterAll(async () => {
    const dataSource = new DataSource({
      type: "postgres",
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    const connection = await dataSource.initialize();
    await connection.dropDatabase(); //delete test db
    await connection.destroy(); //disconnect
    await app.close();
    app.close()
  })

  /*
  to-do:
  <Must follow this order for E2E>
  1. test creating account
  2. test logging in
  3. test if id of any user is reached
  4. test current logged in user
  5. verify email of user
  6. check if edits user profile
  */

  describe('createAccount', () => {
    it('should create account', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
        mutation{
          createAccount(input:{
            email:"${testUser.email}",
            password:"${testUser.password}",
            role:Owner
          }) {
            ok
            error
          }
        }
        `,
        })
        .expect(200)
        .expect(res => {
          const{
            body:{
              data:{createAccount}
            }
          }=res
          expect(createAccount.ok).toBe(true)
          expect(createAccount.error).toBe(null)
        })
    })
    it('should fail if account already exists', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
        mutation{
          createAccount(input:{
            email:"${testUser.email}",
            password:"${testUser.password}",
            role:Owner
          }) {
            ok
            error
          }
        }
        `,
        })
        .expect(200)
        .expect(res => {
          const{
            body:{
              data:{createAccount}
            }
          }=res
          expect(createAccount.ok).toBe(false)
          expect(createAccount.error).toEqual(expect.any(String))
        })
    })
  })

  describe('login', () => {
    it('should receive token with correct credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
        mutation{
          login(input:{
            email:"${testUser.email}",
            password:"${testUser.password}"
          }){
            ok
            error
            token
          }
        }`
        })
        .expect(200)
        .expect(res => {
          const {
            body:{
              data:{login}
            }
          }=res
          expect(login.ok).toBe(true)
          expect(login.error).toBe(null)
          expect(login.token).toEqual(expect.any(String))
        })
    })
    it('should fail to login with an email that does not exist',()=>{
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
        mutation{
          login(input:{
            email:"failtest@e2e.com",
            password:"${testUser.password}"
          }){
            ok
            error
            token
          }
        }`
        })
        .expect(200)
        .expect(res => {
          const {
            body:{
              data:{login}
            }
          }=res
          expect(login.ok).toBe(false)
          expect(login.error).toBe('User not found.')
          expect(login.token).toBe(null)
          //update token to be used in userProfile,currAuth
          jwtToken = login.token
        })
    })
    it('should fail to login with an email that does not exist',()=>{
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
        mutation{
          login(input:{
            email:"${testUser.email}",
            password:"1234"
          }){
            ok
            error
            token
          }
        }`
        })
        .expect(200)
        .expect(res => {
          const {
            body:{
              data:{login}
            }
          }=res
          expect(login.ok).toBe(false)
          expect(login.error).toBe("Password does not match.")
          expect(login.token).toBe(null)
        })
    })
  })
  it.todo('userProfile')
  it.todo('currAuth')
  it.todo('verifyEmail')
  it.todo('editProfile')

});
