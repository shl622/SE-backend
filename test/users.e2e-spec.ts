import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import * as request from 'supertest'

const GRAPHQL_ENDPOINT = '/graphql'

describe('UserModule (e2e)', () => {
  let app: INestApplication;

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
  1. test creating account
  2. test if id of any user is reached
  3. test logging in
  4. test current logged in user
  5. verify email of user
  6. check if edits user profile
  */

  describe('createAccount', () => {
    const EMAIL = "test@e2e.com"
    it('should create account', () => {
      return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .send({
        query: `
        mutation{
          createAccount(input:{
            email:"${EMAIL}",
            password:"12345",
            role:Owner
          }) {
            ok
            error
          }
        }
        `,
      })
      .expect(200)
      .expect(res=>{
        expect(res.body.data.createAccount.ok).toBe(true)
        expect(res.body.data.createAccount.error).toBe(null)
      })
    })
    it.todo('should fail if account already exists')
  })


  it.todo('userProfile')
  it.todo('login')
  it.todo('currAuth')
  it.todo('verifyEmail')
  it.todo('editProfile')

});
