import { Controller, Get } from '@nestjs/common';
import { Public } from '@micro-service/nest-auth';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getData() {
    return this.appService.getData();
  }
}
