package com.bookstore.catalog.controller;

import com.bookstore.catalog.dto.AuthorDto;
import com.bookstore.catalog.dto.CreateAuthorRequest;
import com.bookstore.catalog.service.AuthorService;
import com.bookstore.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthorController {

    private final AuthorService authorService;

    @GetMapping("/authors")
    public ApiResponse<List<AuthorDto>> getAllAuthors() {
        return ApiResponse.success(authorService.getAllAuthors(), "Authors retrieved");
    }

    @GetMapping("/authors/{id}")
    public ApiResponse<AuthorDto> getAuthor(@PathVariable UUID id) {
        return ApiResponse.success(authorService.getAuthor(id), "Author retrieved");
    }

    @PostMapping("/admin/authors")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AuthorDto> createAuthor(@Valid @RequestBody CreateAuthorRequest request) {
        return ApiResponse.success(authorService.createAuthor(request), "Author created");
    }

    @PutMapping("/admin/authors/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<AuthorDto> updateAuthor(@PathVariable UUID id, @Valid @RequestBody CreateAuthorRequest request) {
        return ApiResponse.success(authorService.updateAuthor(id, request), "Author updated");
    }

    @DeleteMapping("/admin/authors/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<Void> deleteAuthor(@PathVariable UUID id) {
        authorService.deleteAuthor(id);
        return ApiResponse.<Void>success(null, "Author deleted");
    }
}
