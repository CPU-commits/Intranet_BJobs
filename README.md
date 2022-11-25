
# Microservice Jobs - Intranet

Microservice for the purpose of jobs 

## Requirements

- NATS Server
- MongoDB

## Environment Variables

| Variable              | Description                 | Required     |
| :-------------------- | :---------------------------| :------------|
| `MONGO_DB`            | MongoDB Database            | **Required** |
| `MONGO_ROOT_USERNAME` | MongoDB Root Username       | **Required** |
| `MONGO_ROOT_PASSWORD` | MongoDB Root Password       | **Required** |
| `MONGO_HOST`          | MongoDB Host                | **Required** |
| `MONGO_CONNECTION`    | MongoDB Type Connection     | **Required** |
| `NATS_HOST`           | NATS Host                   | **Required** |
| `AWS_BUCKET`          | AWS Bucket                  | **Required** |
| `NODE_ENV`            | Node ENV                    | **Required** |