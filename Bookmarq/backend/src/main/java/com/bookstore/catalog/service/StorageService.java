package com.bookstore.catalog.service;

import com.bookstore.common.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class StorageService {

    @Value("${app.storage.upload-dir:uploads/}")
    private String uploadDir;

    private Path rootLocation;

    @PostConstruct
    public void init() {
        this.rootLocation = Paths.get(uploadDir);
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory", e);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Failed to store empty file.");
        }
        
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("File exceeds maximum size of 5MB.");
        }

        // Magic byte check for JPEG, PNG, and PDF
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[8];
            if (is.read(header) != -1) {
                if (!isJpeg(header) && !isPng(header) && !isPdf(header)) {
                    throw new BadRequestException("Invalid file format. Only JPEG, PNG, and PDF are allowed.");
                }
            } else {
                throw new BadRequestException("File is empty.");
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file", e);
        }

        try {
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String newFilename = UUID.randomUUID().toString() + extension;
            Path destinationFile = this.rootLocation.resolve(Paths.get(newFilename)).normalize().toAbsolutePath();

            if (!destinationFile.getParent().equals(this.rootLocation.toAbsolutePath())) {
                throw new BadRequestException("Cannot store file outside current directory.");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            return "/uploads/" + newFilename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file.", e);
        }
    }

    private boolean isJpeg(byte[] header) {
        return header.length >= 2 &&
               (header[0] & 0xFF) == 0xFF &&
               (header[1] & 0xFF) == 0xD8;
    }

    private boolean isPng(byte[] header) {
        return header.length >= 8 &&
               (header[0] & 0xFF) == 0x89 &&
               (header[1] & 0xFF) == 0x50 &&
               (header[2] & 0xFF) == 0x4E &&
               (header[3] & 0xFF) == 0x47 &&
               (header[4] & 0xFF) == 0x0D &&
               (header[5] & 0xFF) == 0x0A &&
               (header[6] & 0xFF) == 0x1A &&
               (header[7] & 0xFF) == 0x0A;
    }

    private boolean isPdf(byte[] header) {
        // PDF magic bytes: %PDF (0x25 0x50 0x44 0x46)
        return header.length >= 4 &&
               (header[0] & 0xFF) == 0x25 &&
               (header[1] & 0xFF) == 0x50 &&
               (header[2] & 0xFF) == 0x44 &&
               (header[3] & 0xFF) == 0x46;
    }
}
