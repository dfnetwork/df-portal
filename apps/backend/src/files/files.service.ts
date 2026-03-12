import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as fs from 'fs/promises';
import { createReadStream } from 'fs';

@Injectable()
export class FilesService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  private storageRoot() {
    return this.config.get<string>('STORAGE_ROOT') || '/storage';
  }

  private folderPath(projectId: string, folderId: string) {
    return join(this.storageRoot(), projectId, folderId);
  }

  async ensureFolder(projectId: string, folderId: string) {
    const folder = await this.prisma.folder.findUnique({ where: { id: folderId } });
    if (!folder || folder.projectId !== projectId) {
      throw new NotFoundException('Folder not found');
    }
    await fs.mkdir(this.folderPath(projectId, folderId), { recursive: true });
    return folder;
  }

  async list(projectId: string, folderId?: string) {
    const folderWhere = folderId ? { id: folderId } : { parentId: null, projectId };
    const folder =
      (await this.prisma.folder.findFirst({ where: folderWhere })) ||
      (await this.prisma.folder.create({
        data: { name: 'root', projectId },
      }));

    const folders = await this.prisma.folder.findMany({
      where: { projectId, parentId: folder.id },
    });
    const files = await this.prisma.file.findMany({
      where: { projectId, folderId: folder.id },
      orderBy: { createdAt: 'desc' },
    });
    return { folder, folders, files };
  }

  async createFolder(projectId: string, parentId: string | null, name: string) {
    const parent = parentId
      ? await this.prisma.folder.findUnique({ where: { id: parentId } })
      : null;
    if (parent && parent.projectId !== projectId) {
      throw new BadRequestException('Parent folder invalid');
    }
    const folder = await this.prisma.folder.create({
      data: { name, parentId, projectId },
    });
    await fs.mkdir(this.folderPath(projectId, folder.id), { recursive: true });
    return folder;
  }

  async saveFile(
    projectId: string,
    folderId: string,
    file: Express.Multer.File,
    userId: string,
  ) {
    await this.ensureFolder(projectId, folderId);
    return this.prisma.file.create({
      data: {
        name: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        path: file.filename,
        projectId,
        folderId,
        createdById: userId,
      },
    });
  }

  async rename(fileId: string, newName: string) {
    const file = await this.prisma.file.findUnique({ where: { id: fileId } });
    if (!file) throw new NotFoundException('File not found');
    return this.prisma.file.update({
      where: { id: fileId },
      data: { name: newName },
    });
  }

  async move(fileId: string, targetFolderId: string) {
    const file = await this.prisma.file.findUnique({ where: { id: fileId } });
    if (!file) throw new NotFoundException('File not found');
    const targetFolder = await this.ensureFolder(file.projectId, targetFolderId);
    const sourcePath = join(this.folderPath(file.projectId, file.folderId), file.path);
    const destPath = join(this.folderPath(file.projectId, targetFolder.id), file.path);
    await fs.mkdir(this.folderPath(file.projectId, targetFolder.id), { recursive: true });
    await fs.rename(sourcePath, destPath);
    return this.prisma.file.update({
      where: { id: fileId },
      data: { folderId: targetFolder.id },
    });
  }

  async remove(fileId: string) {
    const file = await this.prisma.file.findUnique({ where: { id: fileId } });
    if (!file) throw new NotFoundException('File not found');
    const filePath = join(this.folderPath(file.projectId, file.folderId), file.path);
    await fs.rm(filePath, { force: true });
    await this.prisma.file.delete({ where: { id: fileId } });
    return { success: true };
  }

  async stream(fileId: string) {
    const file = await this.prisma.file.findUnique({ where: { id: fileId } });
    if (!file) throw new NotFoundException('File not found');
    const filePath = join(this.folderPath(file.projectId, file.folderId), file.path);
    return { stream: createReadStream(filePath), mimeType: file.mimeType, name: file.name };
  }
}
