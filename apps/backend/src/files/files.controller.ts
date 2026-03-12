import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname, join } from 'path';
import { StreamableFile } from '@nestjs/common';
import * as fs from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectMemberGuard } from '../projects/project-member.guard';
import { FilesService } from './files.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { MoveFileDto } from './dto/move-file.dto';
import { RenameDto } from './dto/rename.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtUser } from '@df-portal/shared';

@Controller()
@UseGuards(JwtAuthGuard, ProjectMemberGuard)
export class FilesController {
  constructor(private files: FilesService) {}

  @Get('projects/:projectId/files')
  list(
    @Param('projectId') projectId: string,
    @Query('folderId') folderId?: string,
  ) {
    return this.files.list(projectId, folderId);
  }

  @Post('projects/:projectId/folders')
  createFolder(
    @Param('projectId') projectId: string,
    @Body() dto: CreateFolderDto,
  ) {
    return this.files.createFolder(projectId, dto.parentId || null, dto.name);
  }

  @Post('projects/:projectId/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, _file, cb) => {
          const projectId = req.params.projectId;
          const folderId = req.body.folderId;
          const root = process.env.STORAGE_ROOT || '/storage';
          const dest = join(root, projectId, folderId);
          fs.mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (_req, file, cb) => {
          const unique = uuidv4();
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  upload(
    @Param('projectId') projectId: string,
    @Body('folderId') folderId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtUser,
  ) {
    return this.files.saveFile(projectId, folderId, file, user.sub);
  }

  @Patch('files/:fileId/rename')
  rename(@Param('fileId') fileId: string, @Body() dto: RenameDto) {
    return this.files.rename(fileId, dto.name);
  }

  @Patch('files/:fileId/move')
  move(@Param('fileId') fileId: string, @Body() dto: MoveFileDto) {
    return this.files.move(fileId, dto.targetFolderId);
  }

  @Delete('files/:fileId')
  delete(@Param('fileId') fileId: string) {
    return this.files.remove(fileId);
  }

  @Get('files/:fileId/download')
  async download(@Param('fileId') fileId: string) {
    const result = await this.files.stream(fileId);
    return new StreamableFile(result.stream, {
      disposition: `attachment; filename=\"${result.name}\"`,
      type: result.mimeType,
    });
  }
}
