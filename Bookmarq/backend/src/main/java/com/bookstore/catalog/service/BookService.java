package com.bookstore.catalog.service;

import com.bookstore.catalog.dto.BookDto;
import com.bookstore.catalog.dto.BookRequest;
import com.bookstore.catalog.entity.Author;
import com.bookstore.catalog.entity.Book;
import com.bookstore.catalog.entity.Category;
import com.bookstore.catalog.mapper.BookMapper;
import com.bookstore.catalog.repository.AuthorRepository;
import com.bookstore.catalog.repository.BookRepository;
import com.bookstore.catalog.repository.CategoryRepository;
import com.bookstore.common.exception.BadRequestException;
import com.bookstore.common.exception.ResourceNotFoundException;
import com.bookstore.inventory.service.InventoryService;
import com.bookstore.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.Set;
import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;
    private final AuthorRepository authorRepository;
    private final BookMapper bookMapper;
    private final InventoryService inventoryService;
    private final OrderRepository orderRepository;

    /**
     * Original getBooks — kept for backward compatibility with existing callers.
     */
    @Transactional(readOnly = true)
    @Cacheable("catalog")
    public Page<BookDto> getBooks(String query, UUID categoryId, BigDecimal minPrice, BigDecimal maxPrice, BigDecimal minRating, Boolean active, Boolean featured, Pageable pageable) {
        Specification<Book> spec = Specification.where(BookSpecification.search(query))
                .and(BookSpecification.hasCategory(categoryId))
                .and(BookSpecification.priceBetween(minPrice, maxPrice))
                .and(BookSpecification.minRating(minRating))
                .and(BookSpecification.isActive(active))
                .and(BookSpecification.isFeatured(featured));
        
        // Always append ID as tiebreaker to prevent duplicate/missing items across pages
        Pageable safePageable = appendTiebreaker(pageable);
        return bookRepository.findAll(spec, safePageable).map(bookMapper::toDto);
    }

    /**
     * Expanded getBooks with all faceted filter parameters.
     * Uses human-readable sort slugs (price_asc, rating_desc, etc.).
     *
     * <p>Multi-select within a facet is OR; across facets is AND.</p>
     */
    @Transactional(readOnly = true)
    @Cacheable("catalog")
    public Page<BookDto> getBooks(
            String query,
            List<UUID> categoryIds,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            BigDecimal minRating,
            List<String> formats,
            List<String> languages,
            Integer yearMin,
            Integer yearMax,
            String availability,
            Boolean featured,
            String sortSlug,
            int page,
            int size,
            boolean workGrouped
    ) {
        Specification<Book> spec = Specification.where(BookSpecification.isActive(true))
                .and(BookSpecification.search(query))
                .and(BookSpecification.hasCategoryIn(categoryIds))
                .and(BookSpecification.priceBetween(minPrice, maxPrice))
                .and(BookSpecification.minRating(minRating))
                .and(BookSpecification.hasFormat(formats))
                .and(BookSpecification.hasLanguage(languages))
                .and(BookSpecification.publishedYearBetween(yearMin, yearMax))
                .and(BookSpecification.hasAvailability(availability))
                .and(BookSpecification.isFeatured(featured));

        Sort sort = resolveSort(sortSlug, query);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        return bookRepository.findAll(spec, pageable).map(bookMapper::toDto);
    }

    /**
     * Maps human-readable sort slugs to Spring Sort objects.
     * Always appends book ID as a secondary tiebreaker so pagination
     * never duplicates or drops items on ties.
     *
     * <p>"relevance" is only meaningful when a query is present;
     * falls back to popularity otherwise.</p>
     */
    private Sort resolveSort(String sortSlug, String query) {
        Sort primary;
        if (sortSlug == null) sortSlug = "";

        switch (sortSlug.toLowerCase()) {
            case "price_asc":
                primary = Sort.by("price").ascending();
                break;
            case "price_desc":
                primary = Sort.by("price").descending();
                break;
            case "date_desc":
                primary = Sort.by("publishedDate").descending();
                break;
            case "rating_desc":
                primary = Sort.by("avgRating").descending();
                break;
            case "popularity":
                primary = Sort.by("ratingCount").descending()
                              .and(Sort.by("avgRating").descending());
                break;
            case "title_asc":
                primary = Sort.by("title").ascending();
                break;
            case "relevance":
                if (query != null && !query.isBlank()) {
                    primary = Sort.by("ratingCount").descending();
                } else {
                    primary = Sort.by("ratingCount").descending();
                }
                break;
            default:
                // Default: newest first
                primary = Sort.by("createdAt").descending();
                break;
        }

        // Always append ID as tiebreaker — this is the fix for the
        // "same book on page 2 and 3" bug described in the spec.
        return primary.and(Sort.by("id").ascending());
    }

    /**
     * Appends ID tiebreaker to an existing Pageable's sort.
     * Used by the legacy getBooks overload.
     */
    private Pageable appendTiebreaker(Pageable pageable) {
        Sort existing = pageable.getSort();
        Sort withTiebreaker = existing.isSorted()
                ? existing.and(Sort.by("id").ascending())
                : Sort.by("id").ascending();
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), withTiebreaker);
    }

    @Transactional
    public BookDto getBookBySlug(String slug) {
        Book book = bookRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
        
        bookRepository.save(book);
        
        return bookMapper.toDto(book);
    }

    @Transactional(readOnly = true)
    public BookDto getBook(UUID id) {
        return bookRepository.findById(id)
                .map(bookMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
    }

    @Transactional
    @CacheEvict(value = "catalog", allEntries = true)
    public BookDto createBook(BookRequest request) {
        if (bookRepository.findByIsbn(request.getIsbn()).isPresent()) {
            throw new BadRequestException("Book with this ISBN already exists");
        }
        if (bookRepository.findBySlug(request.getSlug()).isPresent()) {
            throw new BadRequestException("Book with this slug already exists");
        }

        Book book = bookMapper.toEntity(request);
        
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            book.setCategory(category);
        }

        if (request.getAuthorIds() != null && !request.getAuthorIds().isEmpty()) {
            Set<Author> authors = new HashSet<>();
            for (UUID authorId : request.getAuthorIds()) {
                Author author = authorRepository.findById(authorId)
                        .orElseThrow(() -> new ResourceNotFoundException("Author not found: " + authorId));
                authors.add(author);
            }
            book.setAuthors(authors);
        }

        Book saved = bookRepository.save(book);
        inventoryService.initializeInventoryForBook(saved);
        return bookMapper.toDto(saved);
    }

    @Transactional
    @CacheEvict(value = "catalog", allEntries = true)
    public BookDto updateBook(UUID id, BookRequest request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        if (!book.getIsbn().equals(request.getIsbn()) && bookRepository.findByIsbn(request.getIsbn()).isPresent()) {
            throw new BadRequestException("Book with this ISBN already exists");
        }
        if (!book.getSlug().equals(request.getSlug()) && bookRepository.findBySlug(request.getSlug()).isPresent()) {
            throw new BadRequestException("Book with this slug already exists");
        }

        bookMapper.updateEntity(request, book);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            book.setCategory(category);
        } else {
            book.setCategory(null);
        }

        if (request.getAuthorIds() != null && !request.getAuthorIds().isEmpty()) {
            Set<Author> authors = new HashSet<>();
            for (UUID authorId : request.getAuthorIds()) {
                Author author = authorRepository.findById(authorId)
                        .orElseThrow(() -> new ResourceNotFoundException("Author not found: " + authorId));
                authors.add(author);
            }
            book.setAuthors(authors);
        } else {
            book.getAuthors().clear();
        }

        Book saved = bookRepository.save(book);
        return bookMapper.toDto(saved);
    }

    @Transactional
    @CacheEvict(value = "catalog", allEntries = true)
    public BookDto updateCover(UUID id, String coverUrl) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
        book.setCoverUrl(coverUrl);
        Book saved = bookRepository.save(book);
        return bookMapper.toDto(saved);
    }

    @Transactional
    @CacheEvict(value = "catalog", allEntries = true)
    public void deleteBook(UUID id) {
        if (!bookRepository.existsById(id)) {
            throw new ResourceNotFoundException("Book not found");
        }
        bookRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<BookDto> getAlsoBoughtBooks(UUID bookId) {
        List<UUID> alsoBoughtIds = orderRepository.findAlsoBoughtBookIds(bookId, org.springframework.data.domain.PageRequest.of(0, 10));
        return bookRepository.findAllById(alsoBoughtIds).stream()
                .map(bookMapper::toDto)
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookDto> getRecommendedBooks(UUID userId) {
        if (userId != null) {
            List<UUID> topCategories = orderRepository.findTopCategoriesByUserId(userId, org.springframework.data.domain.PageRequest.of(0, 3));
            if (!topCategories.isEmpty()) {
                Specification<Book> spec = Specification.where(BookSpecification.isActive(true))
                        .and((root, query, cb) -> root.get("category").get("id").in(topCategories));
                return bookRepository.findAll(spec, org.springframework.data.domain.PageRequest.of(0, 10))
                        .map(bookMapper::toDto)
                        .getContent();
            }
        }
        // Fallback: top rated books
        Specification<Book> spec = Specification.where(BookSpecification.isActive(true));
        return bookRepository.findAll(spec, org.springframework.data.domain.PageRequest.of(0, 10, org.springframework.data.domain.Sort.by("avgRating").descending()))
                .map(bookMapper::toDto)
                .getContent();
    }
}
