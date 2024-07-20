# Eats App

Backend of Eats App built with NestJS

## Local Development
A localhost graphQL playground should initiate.
</br>
Requires PostgreSQL server running.
```(bash)
npm install 
npm run start:dev
```

## Testing Functions
Use watch to run all unit tests and cov for coverage.
```
npm run test:watch
npm run test:cov
```

## User Model:

-   id
-   createdAt
-   updatedAt

-   email
-   password
-   role(client | delivery | owner)

## User CRUD:

-   Create Account
-   Log In
-   See Profile
-   Edit Profile
-   Verify Email