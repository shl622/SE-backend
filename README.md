# Eats App

Backend of Eats App built with NestJS

## Local Development
A localhost graphQL playground should initiate.
</br>
Make sure to include a <code>.env.dev</code> file at root.
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
For E2E testing:<br/>
Make sure to include a <code>.env.test</code> file at root.
```
npm run test:e2e
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

## Restaurant Model

-   name
-   category
-   address
-   coverImage

## Restaurant CRUD

-   View categories
-   View Restaurants by Category (pagination)
-   View Restaurants (pagination)
-   View Restaurant

-   Edit Restaurant
-   Delete Restaurant

-   Create Menu
-   Edit Menu
-   Delete Menu

## Menu Model

-   Menu Item name
-   Menu Item price

## Menu CRUD

-   Create Menu Item
-   Edit Menu Item
-   Delete  Menu Item

## Ordering CRUD

-   Create Order
-   Edit Order (Edit status)
-   Delete Order

## Ordering Subscription (Owner,Client,Delivery)

-   Pending Orders (Owner dashboard)
    -> (s/listen: newOrder  && trigger: createOrder(newOrder))
-   Order Status (Client/Customer)
    -> (s/listen: orderUpdate && trigger: editOrder(orderUpdate))
-   Pending Pickup (Delivery)
    -> (s/listen: orderUpdate && trigger: editOrder(orderUpdate))

## Payments (CRON)