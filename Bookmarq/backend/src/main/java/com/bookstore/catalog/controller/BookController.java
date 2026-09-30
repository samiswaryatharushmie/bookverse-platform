package com.bookstore.catalog.controller;

import com.bookstore.catalog.dto.BookDto;
import com.bookstore.catalog.dto.BookRequest;
import com.bookstore.catalog.dto.FacetResponse;

import com.bookstore.catalog.service.BookService;
import com.bookstore.catalog.service.FacetService;
import com.bookstore.catalog.service.SearchEngineService;
import com.bookstore.catalog.service.QueryParserService;
import com.bookstore.catalog.service.QueryIntent;
import com.bookstore.catalog.service.AutocompleteService;
import com.bookstore.catalog.service.StorageService;
import com.bookstore.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;
    private final FacetService facetService;
    private final SearchEngineService searchEngineService;
    private final QueryParserService queryParserService;
    private final AutocompleteService autocompleteService;
    private final StorageService storageService;

    /**
     * Legacy book listing endpoint — kept for backward compatibility.
     */
    @GetMapping("/books")
    public ApiResponse<Page<BookDto>> getBooks(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Boolean featured,
            @PageableDefault(size = 20) Pageable pageable) {
        
        Page<BookDto> books = bookService.getBooks(query, categoryId, minPrice, maxPrice, minRating, active, featured, pageable);
        return ApiResponse.success(books, "Books retrieved successfully");
    }

    /**
     * Expanded catalog endpoint with full faceted filtering support.
     *
     * <p>URL schema example:
     * {@code /api/books/catalog?q=tolkien&genre=uuid1,uuid2&format=hardcover,ebook
     *   &price=500-3000&rating=4&lang=en&year=2000-2026&avail=in_stock
     *   &sort=price_asc&page=0&size=20}</p>
     *
     * <p>Multi-select facets are comma-joined. Omit params at default value.</p>
     */
    @GetMapping("/books/catalog")
    public ApiResponse<Page<BookDto>> catalogBooks(
            @RequestParam(name = "q", required = false) String query,
            @RequestParam(name = "genre", required = false) String genre,
            @RequestParam(name = "format", required = false) String format,
            @RequestParam(name = "price", required = false) String priceRange,
            @RequestParam(name = "rating", required = false) BigDecimal rating,
            @RequestParam(name = "lang", required = false) String lang,
            @RequestParam(name = "year", required = false) String yearRange,
            @RequestParam(name = "avail", required = false) String avail,
            @RequestParam(name = "featured", required = false) Boolean featured,
            @RequestParam(name = "sort", defaultValue = "popularity") String sort,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @RequestParam(name = "workGrouped", defaultValue = "false") boolean workGrouped) {

        // Parse comma-separated multi-select values
        List<UUID> categoryIds = parseUuidList(genre);
        List<String> formats = parseStringList(format);
        List<String> languages = parseStringList(lang);

        // Parse price range "min-max"
        BigDecimal minPrice = null, maxPrice = null;
        if (priceRange != null && priceRange.contains("-")) {
            String[] parts = priceRange.split("-", 2);
            try { minPrice = new BigDecimal(parts[0]); } catch (NumberFormatException ignored) {}
            try { maxPrice = new BigDecimal(parts[1]); } catch (NumberFormatException ignored) {}
        }

        // Parse year range "min-max"
        Integer yearMin = null, yearMax = null;
        if (yearRange != null && yearRange.contains("-")) {
            String[] parts = yearRange.split("-", 2);
            try { yearMin = Integer.parseInt(parts[0]); } catch (NumberFormatException ignored) {}
            try { yearMax = Integer.parseInt(parts[1]); } catch (NumberFormatException ignored) {}
        }

        Page<BookDto> books = bookService.getBooks(
                query, categoryIds, minPrice, maxPrice, rating,
                formats, languages, yearMin, yearMax, avail, featured,
                sort, page, size, workGrouped
        );
        return ApiResponse.success(books, "Catalog results retrieved");
    }

    /**
     * Returns live facet counts for the filter panel.
     * Each facet's count reflects all OTHER active filters but NOT its own,
     * so the user sees how many results they'd get by toggling any option.
     */
    @GetMapping("/books/facets")
    public ApiResponse<FacetResponse> getFacets(
            @RequestParam(name = "q", required = false) String query,
            @RequestParam(name = "genre", required = false) String genre,
            @RequestParam(name = "format", required = false) String format,
            @RequestParam(name = "price", required = false) String priceRange,
            @RequestParam(name = "rating", required = false) BigDecimal rating,
            @RequestParam(name = "lang", required = false) String lang,
            @RequestParam(name = "year", required = false) String yearRange,
            @RequestParam(name = "avail", required = false) String avail) {

        List<UUID> categoryIds = parseUuidList(genre);
        List<String> formats = parseStringList(format);
        List<String> languages = parseStringList(lang);

        BigDecimal minPrice = null, maxPrice = null;
        if (priceRange != null && priceRange.contains("-")) {
            String[] parts = priceRange.split("-", 2);
            try { minPrice = new BigDecimal(parts[0]); } catch (NumberFormatException ignored) {}
            try { maxPrice = new BigDecimal(parts[1]); } catch (NumberFormatException ignored) {}
        }

        Integer yearMin = null, yearMax = null;
        if (yearRange != null && yearRange.contains("-")) {
            String[] parts = yearRange.split("-", 2);
            try { yearMin = Integer.parseInt(parts[0]); } catch (NumberFormatException ignored) {}
            try { yearMax = Integer.parseInt(parts[1]); } catch (NumberFormatException ignored) {}
        }

        FacetResponse facets = facetService.computeFacets(
                query, categoryIds, formats, languages,
                minPrice, maxPrice, rating, yearMin, yearMax, avail
        );
        return ApiResponse.success(facets, "Facet counts retrieved");
    }

    // ── Helper methods for parsing comma-separated params ────────────────────

    private List<UUID> parseUuidList(String commaJoined) {
        if (commaJoined == null || commaJoined.isBlank()) return Collections.emptyList();
        return Arrays.stream(commaJoined.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(UUID::fromString)
                .collect(Collectors.toList());
    }

    private List<String> parseStringList(String commaJoined) {
        if (commaJoined == null || commaJoined.isBlank()) return Collections.emptyList();
        return Arrays.stream(commaJoined.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    @GetMapping("/books/search/hybrid")
    public ApiResponse<List<SearchEngineService.SearchResult>> hybridSearch(
            @RequestParam String query,
            @RequestParam(defaultValue = "1.0") double lexicalWeight,
            @RequestParam(defaultValue = "1.0") double semanticWeight) {
        
        QueryIntent intent = queryParserService.parse(query);
        return ApiResponse.success(searchEngineService.search(intent, lexicalWeight, semanticWeight), "Hybrid search results");
    }

    @GetMapping("/books/search/autocomplete")
    public ApiResponse<List<String>> autocomplete(@RequestParam String q) {
        return ApiResponse.success(autocompleteService.getSuggestions(q), "Autocomplete suggestions");
    }

    @PostMapping("/admin/books/search/reembed")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<Integer> reembedMissing() {
        int count = searchEngineService.reembedMissing();
        return ApiResponse.success(count, "Successfully generated " + count + " missing embeddings.");
    }

    @GetMapping("/books/{slug}")
    public ApiResponse<BookDto> getBookBySlug(@PathVariable String slug) {
        return ApiResponse.success(bookService.getBookBySlug(slug), "Book retrieved successfully");
    }

    @GetMapping("/admin/books")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<Page<BookDto>> getAllBooksAdmin(
            @RequestParam(required = false) String query,
            @PageableDefault(size = 100, sort = "title") Pageable pageable) {
        // Pass active=null so ALL books are returned (active and inactive)
        Page<BookDto> books = bookService.getBooks(query, (UUID) null, null, null, null, null, null, pageable);
        return ApiResponse.success(books, "All books retrieved for admin");
    }

    @GetMapping("/admin/books/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<BookDto> getBookById(@PathVariable UUID id) {
        return ApiResponse.success(bookService.getBook(id), "Book retrieved successfully");
    }

    @PostMapping("/admin/books")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<BookDto> createBook(@Valid @RequestBody BookRequest request) {
        return ApiResponse.success(bookService.createBook(request), "Book created successfully");
    }

    @PutMapping("/admin/books/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<BookDto> updateBook(@PathVariable UUID id, @Valid @RequestBody BookRequest request) {
        return ApiResponse.success(bookService.updateBook(id, request), "Book updated successfully");
    }

    @DeleteMapping("/admin/books/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<Void> deleteBook(@PathVariable UUID id) {
        bookService.deleteBook(id);
        return ApiResponse.<Void>success(null, "Book deleted successfully");
    }

    @PostMapping("/admin/books/{id}/cover")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<BookDto> uploadCover(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        String coverUrl = storageService.storeFile(file);
        return ApiResponse.success(bookService.updateCover(id, coverUrl), "Cover uploaded successfully");
    }

    @GetMapping("/books/{id}/also-bought")
    public ApiResponse<List<BookDto>> getAlsoBoughtBooks(@PathVariable UUID id) {
        return ApiResponse.success(bookService.getAlsoBoughtBooks(id), "Also bought books retrieved");
    }

    @GetMapping("/books/recommended")
    public ApiResponse<List<BookDto>> getRecommendedBooks(Principal principal, com.bookstore.user.repository.UserRepository userRepository) {
        UUID userId = null;
        if (principal != null) {
            userId = userRepository.findByEmail(principal.getName()).map(com.bookstore.user.entity.User::getId).orElse(null);
        }
        return ApiResponse.success(bookService.getRecommendedBooks(userId), "Recommended books retrieved");
    }
}
