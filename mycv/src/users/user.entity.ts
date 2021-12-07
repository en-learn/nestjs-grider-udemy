import { Logger } from '@nestjs/common'
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
export class User {
  private readonly logger = new Logger(User.name)

  @PrimaryGeneratedColumn()
  id: number

  @Column()
  email: string

  @Column()
  password: string

  @AfterInsert()
  logInsert() {
    this.logger.log(`Inserted User with id ${this.id}`)
  }

  @AfterUpdate()
  logUpdate() {
    this.logger.log(`Updated User with id ${this.id}`)
  }

  @AfterRemove()
  logRemove() {
    this.logger.log(`Removed User with id ${this.id}`)
  }
}
