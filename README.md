# URL Shortener Service

## Description

The URL Shortener Service is a robust backend application developed using Nest.js and MongoDB, aimed at shortening URLs efficiently while providing detailed analytics for each URL. Leveraging Redis for caching, the service ensures fast response times and scalability to handle high traffic loads.

## Key Features

### URL Shortening Functionality

The core functionality of the URL Shortener Service revolves around shortening long URLs into shorter, more manageable ones. When a user submits a URL to be shortened, the service generates a unique shortcode ID for the URL. This shortcode ID is appended to the server's base URL, creating a shortened URL. For example, a long URL https://example.com/very/long/url might be shortened to https://short.url/abc123.

### Caching with Redis

To optimize performance and reduce latency, the service utilizes Redis as a caching mechanism. When a URL is shortened, the shortcode ID and its corresponding long URL are stored in Redis. Subsequent requests to access the shortened URL first check if the shortcode exists in the Redis cache. If found, the service redirects the user to the corresponding long URL, avoiding the need to query the database. This caching mechanism significantly improves response times, especially for frequently accessed URLs.

### Analytics

In addition to URL shortening, the service provides detailed analytics for each shortened URL. This includes tracking the number of clicks, referral sources, active hours, and browser/device types used to access the URL. Analytics data is stored in MongoDB, allowing users to query and analyze their URL traffic patterns over time.

### Scheduled Cleanup

To maintain database and cache efficiency, the service implements a weekly cron job to remove old URLs from both MongoDB and Redis. This ensures that the system remains optimized and doesn't accumulate unnecessary data over time.

### Security

- **Input Validation**: Utilizes Nest.js ValidationPipe to automatically validate incoming data and prevent common vulnerabilities such as SQL injection by rejecting invalid requests with an appropriate HTTP status code.
- **Rate Limiting**: Implemented using ThrottlerModule to mitigate the risk of abuse or denial-of-service attacks by limiting the number of requests a client can make within a certain time period, thus safeguarding the service from excessive load and potential security threats.
- **Middleware Protection**: Utilizes middleware such as compression, xss, and hpp to defend against common security threats like Cross-Site Scripting (XSS) attacks and HTTP Parameter Pollution (HPP), ensuring the integrity and security of incoming requests.

## Installation .

```bash
#Clone the Repository
$ git clone https://github.com/rahultripathi21/shortening-url-service.git
$ cd shortening-url-service

#to run code using docker
$ docker-compose up -d mongodb redis && docker-compose up url-shortner

#OR ELSE
#Install Dependencies
$ yarn install

#Copy Environment Variables
$ cp .env.example .env.dev

# Development
$ yarn run start

# Watch mode
$ yarn run start:dev
```

## Testing
```bash
#Copy Environment Variables
$ cp .env.example .env.test

# unit tests
$ yarn  test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## Swagger Documentation
Swagger provides interactive API documentation for easy discovery and consumption.
`http://localhost:3000/api` for localhost port could be different please refer .env.dev

## Stay in touch
- Author : [Rahul Tripathi](tripathirahul158@gmail.com)
