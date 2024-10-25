import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [MailController],
  providers: [MailService, PrismaService],
})
export class MailModule {}
