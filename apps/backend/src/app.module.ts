import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { FilesModule } from './files/files.module';
import { ActivityModule } from './activity/activity.module';
import { PrismaModule } from './common/prisma.module';
import { OrganizationModule } from './organization/organization.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          rootPath: config.get<string>('STORAGE_ROOT') || '/storage',
          serveRoot: '/files',
        },
      ],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    FilesModule,
    ActivityModule,
    OrganizationModule,
  ],
})
export class AppModule {}
