import "@fastify/jwt"

declare module "@fastify/jwt" {
    export interface FastifyJWT {
        user: {
            sub: string,
            sector: 'DESENVOLVIMENTO' | 'USER' | 'TRAFEGO' | 'GERENCIAL' | 'AFILIADOS' | 'FINANCEIRO' | 'RISCO'
        }
    }
}