import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
    NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
    PORT: z.coerce.number().default(3333),  
    DATABASE_CLIENT: z.enum(['pg']),
    DATABASE_URL: z.string(),
    NODE_VERSION: z.string(),
    JWT_SECRET: z.string(),
    URL_PRODUCTION_FRONT: z.string(),
    URL_TESTE_FRONT: z.string(),
})

const _env = envSchema.safeParse(process.env)

if(_env.success === false) {
    console.error('Invalid enviroment variables', _env.error.format())

    throw new Error('Invalid enviroment variables')
}

export const env = _env.data
