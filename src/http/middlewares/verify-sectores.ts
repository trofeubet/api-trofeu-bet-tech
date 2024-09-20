import { FastifyReply, FastifyRequest } from "fastify";

export function verificarSectores(sectorParaVerificar: Array<'DESENVOLVIMENTO' | 'USER' | 'TRAFEGO' | 'GERENCIAL' | 'AFILIADOS' | 'FINANCEIRO' | 'RISCO'>) {
    return async (request: FastifyRequest, reply: FastifyReply) => {

        const { sector } = request.user;

        if (!sectorParaVerificar.includes(sector)) {
            return reply.status(401).send({ message: "Não autorizado!" });
        }
    };
}
