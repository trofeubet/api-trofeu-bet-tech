import fastify from "fastify";
import { appRoutes } from "./http/controllers/routes";
import { ZodError } from "zod";
import { env } from "./env";
import fastifyJwt from "@fastify/jwt";
import fastifyCors from "@fastify/cors";  // Importa o plugin CORS

export const app = fastify();

app.register(fastifyCors, {
    origin: 'http://localhost:5173', // Permite apenas essa origem
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Cabeçalhos permitidos
    credentials: true // Permite o envio de cookies
});

app.register(fastifyJwt, {
    secret: env.JWT_SECRET
});

app.register(appRoutes);

app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
        return reply
            .status(400)
            .send({ message: 'Validation error.', issues: error.format() });
    }

    if (env.NODE_ENV !== 'production') {
        console.error(error);
    } else {
        // Exemplo: Enviar o erro para um serviço de monitoramento
        // Sentry.captureException(error);
    }

    return reply.status(500).send({ message: 'Internal server error' });
});
