import { Controller, Get, Logger, Query } from '@nestjs/common';
import { MailService } from './mail.service';
import { Mail, mailType } from '@prisma/client';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { DataMessage } from './types/message';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) { }

  private readonly logger = new Logger(MailController.name);

  @Get('get')
  async getMail(@Query('idUser') idUser: string): Promise<Mail[] | null> {
    return await this.mailService.getMailByIdUser(idUser);
  }

  @MessagePattern('register')
  async readRegisterPayment(
    @Payload() Payload: any,
    @Ctx() context: RmqContext,
  ) {
    try {
      this.logger.log(`data: ${JSON.stringify(Payload)}`);
      const DataMessage: DataMessage = JSON.parse(Payload.data.notification);
      const channel = context.getChannelRef();
      const originalMessage = context.getMessage();
      channel.ack(originalMessage);
      await this.mailService.sendMail(DataMessage, mailType.orderConfimation);
      await this.mailService.persistNotification(
       DataMessage,
       mailType.orderConfimation,
      );
    } catch (error) {}
  }

  @MessagePattern('confirmation')
  async readConfimationPayment(
    @Payload() Payload: any,
    @Ctx() context: RmqContext,
  ) { 
    try {
      const DataMessage: DataMessage = JSON.parse(Payload.data.notification);
      const channel = context.getChannelRef();
      const originalMessage = context.getMessage();
      channel.ack(originalMessage);
      await this.mailService.sendMail(DataMessage, mailType.paymentConfirmation);
      await this.mailService.persistNotification(
       DataMessage,
       mailType.paymentConfirmation,
      );
    } catch (error) {}
  }
}
