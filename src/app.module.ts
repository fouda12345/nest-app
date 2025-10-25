import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import path from 'node:path';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Module({
  imports: [
    AuthModule,
    ProductModule,
    UserModule,
    ConfigModule.forRoot({
      envFilePath: path.resolve('./config/.env'),
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URI as string, {
      serverSelectionTimeoutMS: 5000,
      onConnectionCreate: (connection: Connection) => {
        connection.on('connected', () => console.log('connected to DB'));
        connection.on('disconnected', () =>
          console.log('disconnected from DB'),
        );
        connection.on('reconnected', () => console.log('reconnected to DB'));
        connection.on('disconnecting', () =>
          console.log('disconnecting from DB'),
        );
        return connection;
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
