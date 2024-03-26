import { Controller, Get } from '@nestjs/common';

import { AppService } from '@/app.service.js';

@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @Get('/configs')
  listPlatformConfigs() {
    return {
      name: this.appService.getName(),
    };
  }
}
