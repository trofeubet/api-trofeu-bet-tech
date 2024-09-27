import { FastifyInstance } from "fastify";
import { registerUser } from "./user/register";
import { authenticateUser } from "./user/authenticate";
import { addPlayer } from "./player/add-player";
import { verifyJwt } from "../middlewares/verify-jwt";
import { createTransactionsMonth } from "./transactions-month/create-transactions-month."
import { sumTransactionsMonth } from "./transactions-month/sum-transactions-month";
import { updateUser } from "./user/update";
import { getPlayers } from "./player/get-players";
import { getUniquePlayer } from "./player/get-player-unique";
import { chartWithdrawalDepositMonthByPlayer } from "./player/chart-withdrawal-deposit-month-by-player";
import { getUsers } from "./user/get-users";
import { getProfile } from "./user/profile";
import { getUniqueUser } from "./user/get-user-unique";
import { getPlayersLTV } from "./player/chart-players-LTV";
import { getDepositsLTV } from "./player/chart-full-amount-LTV";
import { getTicketMedio } from "./player/get-ticket-medio";
import { refresh } from "./user/refresh";
import { verificarSectores } from "../middlewares/verify-sectores";
import { updateFtdDatePlayer } from "./player/update-ftd-date-player";
import { retornandoTodosDepositsLTV } from "./player/retornando-todos-ltv-depositos";

export async function appRoutes(app: FastifyInstance) {
    app.post('/users', registerUser)
    app.post('/sessions', authenticateUser)

    app.patch('/token/refresh', refresh)

    //precisa estar autenticado para acessar
    app.post('/add_player', { onRequest: [verifyJwt]}, addPlayer)
    app.post('/add_transactions_month', { onRequest: [verifyJwt]}, createTransactionsMonth)
    app.post('/sum_transactions_month', { onRequest: [verifyJwt]}, sumTransactionsMonth)

    //user
    app.get('/me', { onRequest: [verifyJwt] }, getProfile);
    app.put('/updateUser', { onRequest: [verifyJwt] }, updateUser);
    app.get('/users/:id', { onRequest: [verifyJwt,verificarSectores(['GERENCIAL', 'DESENVOLVIMENTO'])] }, getUniqueUser);

    //players
    app.post('/get_players', { onRequest: [verifyJwt, verificarSectores(['GERENCIAL', 'DESENVOLVIMENTO'])] }, getPlayers);
    app.get('/players/:id', { onRequest: [verifyJwt, verificarSectores(['GERENCIAL', 'DESENVOLVIMENTO'])] }, getUniquePlayer);
    app.post('/relatorio_mensal_transacoes_by_player', { onRequest: [verifyJwt, verificarSectores(['GERENCIAL', 'DESENVOLVIMENTO'])] }, chartWithdrawalDepositMonthByPlayer);
    app.post('/grafico_ltv', { onRequest: [verifyJwt, verificarSectores(['GERENCIAL', 'DESENVOLVIMENTO'])] }, getPlayersLTV);
    app.post('/grafico_ltv_deposits', { onRequest: [verifyJwt, verificarSectores(['GERENCIAL', 'DESENVOLVIMENTO'])] }, getDepositsLTV);

    app.post('/retornando_todos_ltv_deposits', { onRequest: [verifyJwt, verificarSectores(['GERENCIAL', 'DESENVOLVIMENTO'])] }, retornandoTodosDepositsLTV);


    app.post('/grafico_ticket_medio', { onRequest: [verifyJwt, verificarSectores(['GERENCIAL', 'DESENVOLVIMENTO'])] }, getTicketMedio)
    app.put('/update_ftd_date', { onRequest: [verifyJwt, verificarSectores(['GERENCIAL', 'DESENVOLVIMENTO'])] }, updateFtdDatePlayer)


    //users
    app.post('/get_users', { onRequest: [verifyJwt, verificarSectores(['GERENCIAL', 'DESENVOLVIMENTO'])] }, getUsers);
}