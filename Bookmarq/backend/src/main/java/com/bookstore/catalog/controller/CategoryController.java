package com.bookstore.catalog.controller;

import com.bookstore.catalog.dto.CategoryDto;
import com.bookstore.catalog.dto.CreateCategoryRequest;
import com.bookstore.catalog.service.CategoryService;
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
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/categories")
    public ApiResponse<List<CategoryDto>> getActiveCategories() {
        return ApiResponse.success(categoryService.getActiveCategories(), "Categories retrieved");
    }

    @GetMapping("/admin/categories")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<List<CategoryDto>> getAllCategories() {
        return ApiResponse.success(categoryService.getAllCategories(), "Categories retrieved");
    }

    @GetMapping("/categories/{id}")
    public ApiResponse<CategoryDto> getCategory(@PathVariable UUID id) {
        return ApiResponse.success(categoryService.getCategory(id), "Category retrieved");
    }

    @PostMapping("/admin/categories")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CategoryDto> createCategory(@Valid @RequestBody CreateCategoryRequest request) {
        return ApiResponse.success(categoryService.createCategory(request), "Category created");
    }

    @PutMapping("/admin/categories/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<CategoryDto> updateCategory(@PathVariable UUID id, @Valid @RequestBody CreateCategoryRequest request) {
        return ApiResponse.success(categoryService.updateCategory(id, request), "Category updated");
    }

    @DeleteMapping("/admin/categories/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<Void> deleteCategory(@PathVariable UUID id) {
        categoryService.deleteCategory(id);
        return ApiResponse.<Void>success(null, "Category deleted");
    }
}
