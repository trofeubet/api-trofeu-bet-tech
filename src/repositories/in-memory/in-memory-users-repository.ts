import { Prisma, User } from "@prisma/client";
import { UsersRepository } from "../users-repository";

export class InMemoryUsersRepository implements UsersRepository {

    public items: User[] = []

    async findByEmail(email: string) {
        const user = this.items.find((item) => item.email === email);

        if(!user){
            return null
        }

        return user
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        const user = {
            id: this.items.length + 1,
            ...data
        } as User

        this.items.push(user)

        return user
    }
}