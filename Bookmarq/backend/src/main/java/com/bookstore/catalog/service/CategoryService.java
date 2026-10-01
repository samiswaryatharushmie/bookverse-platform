package com.bookstore.catalog.service;

import com.bookstore.catalog.dto.CategoryDto;
import com.bookstore.catalog.dto.CreateCategoryRequest;
import com.bookstore.catalog.entity.Category;
import com.bookstore.catalog.mapper.CategoryMapper;
import com.bookstore.catalog.repository.CategoryRepository;
import com.bookstore.common.exception.ResourceNotFoundException;
import com.bookstore.common.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getActiveCategories() {
        return categoryRepository.findByActiveTrueOrderBySortOrderAsc().stream()
                .map(categoryMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryDto getCategory(UUID id) {
        return categoryRepository.findById(id)
                .map(categoryMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    @Transactional
    public CategoryDto createCategory(CreateCategoryRequest request) {
        if (categoryRepository.findBySlug(request.getSlug()).isPresent()) {
            throw new BadRequestException("Category slug already exists");
        }

        Category category = categoryMapper.toEntity(request);
        
        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
            category.setParent(parent);
        }

        Category saved = categoryRepository.save(category);
        return categoryMapper.toDto(saved);
    }

    @Transactional
    public CategoryDto updateCategory(UUID id, CreateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (!category.getSlug().equals(request.getSlug()) &&
            categoryRepository.findBySlug(request.getSlug()).isPresent()) {
            throw new BadRequestException("Category slug already exists");
        }

        categoryMapper.updateEntity(request, category);
        
        if (request.getParentId() != null) {
            if (id.equals(request.getParentId())) {
                throw new BadRequestException("Category cannot be its own parent");
            }
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        Category saved = categoryRepository.save(category);
        return categoryMapper.toDto(saved);
    }

    @Transactional
    public void deleteCategory(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        
        if (!categoryRepository.findByParentId(id).isEmpty()) {
            throw new BadRequestException("Cannot delete category with subcategories");
        }
        
        categoryRepository.delete(category);
    }
}
