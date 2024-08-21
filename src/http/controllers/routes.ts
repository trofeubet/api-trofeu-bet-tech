import { FastifyInstance } from "fastify";
import { registerUser } from "./user/register";
import { authenticateUser } from "./user/authenticate";
import { addPlayer } from "./player/add-player";
import { verifyJwt } from "../middlewares/verify-jwt";
import { createDepositsMonth } from "./deposits-month/create-deposits-month.";
import { sumDepositsMonth } from "./deposits-month/sum-deposits-month";

export async function appRoutes(app: FastifyInstance) {
    app.post('/users', registerUser)
    app.post('/sessions', authenticateUser)

    //precisa estar autenticado para acessar
    app.post('/add_player', { onRequest: [verifyJwt]}, addPlayer)
    app.post('/add_deposits_month', { onRequest: [verifyJwt]}, createDepositsMonth)
    app.post('/sum_deposits_month', { onRequest: [verifyJwt]}, sumDepositsMonth)

}