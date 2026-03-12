import { join } from 'path';
import { ConfigService } from '@nestjs/config';

export class FilePathUtil {
  constructor(private config: ConfigService) {}

  root() {
    return this.config.get<string>('STORAGE_ROOT') || '/storage';
  }

  project(projectId: string) {
    return join(this.root(), projectId);
  }

  folder(projectId: string, folderId: string) {
    return join(this.project(projectId), folderId);
  }
}
