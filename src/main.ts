import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });
  const port = process.env.PORT ?? 5000;
  await app.listen(port, () => console.log(`app running on port ${port}`));
}
bootstrap();
