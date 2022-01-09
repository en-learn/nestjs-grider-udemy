import { BadRequestException, NotFoundException } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import { AuthService } from "./auth.service"
import { User } from "./user.entity"
import { UsersService } from "./users.service"

describe('AuthService', () => {
  let service: AuthService
  let fakeUsersService: Partial<UsersService>

  beforeEach(async () => {
    // create a fake copy of the users service
    const users: User[] = []
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter(user => user.email === email)
        return Promise.resolve(filteredUsers)
      },
      create: (email: string, password: string) => {
        const user = { id: Math.floor(Math.random() * 999999), email, password } as User
        users.push(user)
        return Promise.resolve(user)
      }
    }

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService
        }
      ]
    }).compile()

    service = module.get(AuthService)
  })

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined()
  })

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('asdf@asdf.com', 'asdf')

    expect(user.password).not.toEqual('asdf')
    const [salt, hash] = user.password.split('.')
    expect(salt).toBeDefined()
    expect(hash).toBeDefined()
  })

  it('throws an error if user signs up with email that is in use', async () => {
    expect.assertions(1)
    fakeUsersService.find = () => Promise.resolve([{ id: 1, email: 'a', password: '1' } as User])
    await expect(service.signup('asdf@asdf.com', 'asdf')).rejects.toBeInstanceOf(BadRequestException)
  })

  it('throws if signin is called with an unused email', async () => {
    expect.assertions(1)
    await expect(service.signin('asdf@asdf.com', 'asdf')).rejects.toBeInstanceOf(NotFoundException)
  })

  it('thows if an invalid password is provided', async () => {
    expect.assertions(1)
    fakeUsersService.find = () => Promise.resolve([{ id: 1, email: 'asdf@asdf.com', password: 'abcd123' } as User])
    await expect(service.signin('fdsa@fdsa.com', 'pass')).rejects.toBeInstanceOf(BadRequestException)
  })

  it('returns a user if correct password is provided', async () => {
    const [email, password] = ['asdf@asdf.com', 'mypassword']
    await service.signup(email, password)
    const user = await service.signin(email, password)
    expect(user).toBeDefined()
  })
})
