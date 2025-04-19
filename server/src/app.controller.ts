import { Body, Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { OpenAIService } from './modules/openai/openai.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly openAIService: OpenAIService, // Inject OpenAIService
  ) {}

  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @Get('test')
  async testCensorComment(@Body('text') text: string): Promise<string> {
    if (!text) {
      throw new Error('Text query parameter is required');
    }
    return this.openAIService.censorComment(text);
  }
}
