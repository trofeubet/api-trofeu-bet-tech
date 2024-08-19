import { UsersRepository } from "@/repositories/users-repository";
import { hash } from "bcryptjs";
import { UserAlreadyExistsError } from "../errors/user-already-exists";
import { User } from "@prisma/client";

interface RegisterUserRequest {
    name: string;
    email: string;
    password: string;
    gender: string;
}

interface RegisterUserResponse {
    user: User
}

export class RegisterUserUseCase {
    constructor(private usersRepository: UsersRepository) {}

    async execute ({ name, email,password, gender}: RegisterUserRequest): Promise<RegisterUserResponse> {
        const password_hash = await hash(password, 6)

        const userWithSomeEmail = await this.usersRepository.findByEmail(email)
    
        if(userWithSomeEmail) throw new UserAlreadyExistsError()
    
        const user = await this.usersRepository.create({
            name,
            email,
            gender,
            password: password_hash
        })

        return {
            user
        }
    }
}