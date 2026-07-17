import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  async send(senderId: string, familyId: string, dto: CreateMessageDto): Promise<Message> {
    const message = this.messageRepo.create({
      content: dto.content,
      senderId,
      familyId,
    });
    return this.messageRepo.save(message);
  }

  async getFamilyMessages(familyId: string, limit = 50): Promise<Message[]> {
    return this.messageRepo.find({
      where: { familyId },
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }
}
