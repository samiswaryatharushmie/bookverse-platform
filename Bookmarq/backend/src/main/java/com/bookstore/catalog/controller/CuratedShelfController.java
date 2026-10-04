package com.bookstore.catalog.controller;

import com.bookstore.catalog.dto.CuratedShelfDto;
import com.bookstore.catalog.dto.CuratedShelfRequest;
import com.bookstore.catalog.service.CuratedShelfService;
import com.bookstore.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/shelves")
@RequiredArgsConstructor
public class CuratedShelfController {

    private final CuratedShelfService curatedShelfService;

    @GetMapping
    public ApiResponse<List<CuratedShelfDto>> getShelves() {
        return ApiResponse.success(curatedShelfService.getActiveShelves(), "Shelves retrieved");
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<List<CuratedShelfDto>> getAllShelvesAdmin() {
        return ApiResponse.success(curatedShelfService.getAllShelves(), "All shelves retrieved");
    }

    @PostMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<CuratedShelfDto> createShelf(@Valid @RequestBody CuratedShelfRequest request) {
        return ApiResponse.success(curatedShelfService.createShelf(request), "Shelf created successfully");
    }

    @PutMapping("/admin/{shelfId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<CuratedShelfDto> updateShelf(@PathVariable UUID shelfId, @Valid @RequestBody CuratedShelfRequest request) {
        return ApiResponse.success(curatedShelfService.updateShelf(shelfId, request), "Shelf updated successfully");
    }

    @DeleteMapping("/admin/{shelfId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<Void> deleteShelf(@PathVariable UUID shelfId) {
        curatedShelfService.deleteShelf(shelfId);
        return ApiResponse.<Void>success(null, "Shelf deleted successfully");
    }

    @PostMapping("/admin/{shelfId}/books/{bookId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<CuratedShelfDto> addBook(@PathVariable UUID shelfId, @PathVariable UUID bookId) {
        return ApiResponse.success(curatedShelfService.addBook(shelfId, bookId), "Book added to shelf");
    }

    @DeleteMapping("/admin/{shelfId}/books/{bookId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<CuratedShelfDto> removeBook(@PathVariable UUID shelfId, @PathVariable UUID bookId) {
        return ApiResponse.success(curatedShelfService.removeBook(shelfId, bookId), "Book removed from shelf");
    }
}
