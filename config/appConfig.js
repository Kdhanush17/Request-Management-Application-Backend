var config = {
  "local": {
    APP_BE_URL: 'http://localhost:5000',
    jwtKey: "aDhv92EAgI31SsT2AOxI3kAeZZEZcoXd231",
    expiresIn: '1h',
    rememberMeExpiresIn: '7d',
    port: 5000,
    dbPort: 5432, // Added dedicated database port
    db: true,
    username: 'postgres',
    dbPassword: '123456',
    url: 'localhost',
    dbName: 'request_management_db',
    saltRounds: 10,
    CLIENT_URL: 'http://localhost:3000',
  },
  "dev": {
    APP_BE_URL: 'http://localhost:5000', // Update for actual dev URL if available
    jwtKey: "KOQAGCZCuT5JeRAMzkIBdk75sELLlWcH254",
    expiresIn: '1h',
    rememberMeExpiresIn: '7d',
    saltRounds: 10,
    port: 5000,
    dbPort: 5432, // Added dedicated database port
    db: true,
    username: 'postgres',
    dbPassword: 'password',
    url: 'localhost',
    dbName: 'request_management_db',
    CLIENT_URL: 'http://localhost:3000', // Update for actual dev client URL if available
  },
  "uat": {
    APP_BE_URL: 'https://uat-api.example.com', // Placeholder for UAT
    jwtKey: "JpAZWvUA3DJW4zcDgZTU5UwQvFXLOTbi457",
    expiresIn: '1h',
    rememberMeExpiresIn: '7d',
    saltRounds: 10,
    port: 5000,
    dbPort: 5432, // Added dedicated database port
    db: true,
    username: 'uat_user',
    dbPassword: 'Uat@321#',
    url: 'dev-db-host',
    dbName: 'request_management_db',
  },
  "prod": {
    APP_BE_URL: 'https://api.example.com', // Placeholder for Prod
    jwtKey: "de873toel9sDfVcWQZhuRH42CJNK1TCEm2",
    expiresIn: '1h',
    rememberMeExpiresIn: '7d',
    saltRounds: 10,
    port: 5000,
    dbPort: 5432, // Added dedicated database port
    db: true,
    username: 'prod_user',
    dbPassword: 'prod_password',
    url: 'prod-db-host',
    dbName: 'request_management_db',
  }
}
module.exports = config;
