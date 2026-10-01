package com.bookstore.catalog.service;

import com.bookstore.catalog.dto.FacetResponse;
import com.bookstore.catalog.dto.FacetResponse.*;
import com.bookstore.catalog.entity.Book;
import com.bookstore.catalog.entity.Category;
import com.bookstore.catalog.repository.BookRepository;
import com.bookstore.catalog.repository.CategoryRepository;
import com.bookstore.inventory.entity.Inventory;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Tuple;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.Cacheable;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Computes live facet counts for the catalog filter panel.
 *
 * <p>Design note: each facet's counts are computed with all OTHER active filters
 * applied but NOT the facet's own filter. This means selecting "Fantasy" shows
 * how many Fantasy books match the other filters (price, format, etc.), not zero.</p>
 *
 * <p>Multi-select within a facet is OR; across facets is AND.</p>
 */
@Service
@RequiredArgsConstructor
public class FacetService {

    private final EntityManager em;
    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;

    private static final int PRICE_BUCKET_COUNT = 10;

    /**
     * Builds the full facet response for the given filter state.
     *
     * @param query        search query text (null if browsing)
     * @param categoryIds  selected genre/category UUIDs
     * @param formats      selected format values (HARDCOVER, EBOOK, etc.)
     * @param languages    selected language codes
     * @param minPrice     price range lower bound
     * @param maxPrice     price range upper bound
     * @param minRating    minimum rating filter
     * @param yearMin      publication year lower bound
     * @param yearMax      publication year upper bound
     * @param availability availability filter value
     */
    @Transactional(readOnly = true)
    @Cacheable("facets")
    public FacetResponse computeFacets(
            String query,
            List<UUID> categoryIds,
            List<String> formats,
            List<String> languages,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            BigDecimal minRating,
            Integer yearMin,
            Integer yearMax,
            String availability
    ) {
        FacetResponse response = new FacetResponse();

        // Build the "base" specification that includes ALL filters EXCEPT active=false
        // Each facet computation excludes its own filter from the base spec.

        // --- Genre facet: apply all filters EXCEPT category ---
        Specification<Book> specExcludingGenre = buildSpec(query, null, formats, languages,
                minPrice, maxPrice, minRating, yearMin, yearMax, availability);
        response.setGenre(computeGenreFacets(specExcludingGenre));

        // --- Format facet: format was removed, return empty list ---
        response.setFormat(Collections.emptyList());

        // --- Language facet: apply all filters EXCEPT language ---
        Specification<Book> specExcludingLang = buildSpec(query, categoryIds, formats, null,
                minPrice, maxPrice, minRating, yearMin, yearMax, availability);
        response.setLanguage(computeLanguageFacets(specExcludingLang));

        // --- Rating facet: apply all filters EXCEPT rating ---
        Specification<Book> specExcludingRating = buildSpec(query, categoryIds, formats, languages,
                minPrice, maxPrice, null, yearMin, yearMax, availability);
        response.setRating(computeRatingFacets(specExcludingRating));

        // --- Availability facet: apply all filters EXCEPT availability ---
        Specification<Book> specExcludingAvail = buildSpec(query, categoryIds, formats, languages,
                minPrice, maxPrice, minRating, yearMin, yearMax, null);
        response.setAvailability(computeAvailabilityFacets(specExcludingAvail));

        // --- Price histogram: apply all filters EXCEPT price ---
        Specification<Book> specExcludingPrice = buildSpec(query, categoryIds, formats, languages,
                null, null, minRating, yearMin, yearMax, availability);
        response.setPriceHistogram(computePriceHistogram(specExcludingPrice));

        // --- Year range: apply all filters EXCEPT year ---
        Specification<Book> specExcludingYear = buildSpec(query, categoryIds, formats, languages,
                minPrice, maxPrice, minRating, null, null, availability);
        response.setYearRange(computeYearRange(specExcludingYear));

        return response;
    }

    /**
     * Builds a composite JPA Specification from the given filter params.
     * Always filters to active=true only.
     */
    private Specification<Book> buildSpec(
            String query, List<UUID> categoryIds, List<String> formats, List<String> languages,
            BigDecimal minPrice, BigDecimal maxPrice, BigDecimal minRating,
            Integer yearMin, Integer yearMax, String availability
    ) {
        return Specification.where(BookSpecification.isActive(true))
                .and(BookSpecification.search(query))
                .and(BookSpecification.hasCategoryIn(categoryIds))
                .and(BookSpecification.hasFormat(formats))
                .and(BookSpecification.hasLanguage(languages))
                .and(BookSpecification.priceBetween(minPrice, maxPrice))
                .and(BookSpecification.minRating(minRating))
                .and(BookSpecification.publishedYearBetween(yearMin, yearMax))
                .and(BookSpecification.hasAvailability(availability));
    }

    // ── Facet computation methods ───────────────────────────────────────────

    private List<GenreFacet> computeGenreFacets(Specification<Book> baseSpec) {
        List<Category> allCategories = categoryRepository.findAll();
        
        // Count books per category
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Tuple> cq = cb.createTupleQuery();
        Root<Book> root = cq.from(Book.class);
        
        // Apply the base spec (all filters except genre)
        Predicate basePredicate = baseSpec.toPredicate(root, cq, cb);
        
        cq.multiselect(
            root.get("category").get("id").alias("catId"),
            cb.count(root).alias("cnt")
        );
        if (basePredicate != null) {
            cq.where(basePredicate);
        }
        cq.groupBy(root.get("category").get("id"));
        
        List<Tuple> results = em.createQuery(cq).getResultList();
        Map<UUID, Long> countMap = new HashMap<>();
        for (Tuple t : results) {
            UUID catId = t.get("catId", UUID.class);
            Long cnt = t.get("cnt", Long.class);
            if (catId != null) {
                countMap.put(catId, cnt);
            }
        }
        
        return allCategories.stream()
                .filter(Category::isActive)
                .map(c -> new GenreFacet(c.getId(), c.getName(), c.getSlug(),
                        countMap.getOrDefault(c.getId(), 0L)))
                .sorted(Comparator.comparing(GenreFacet::getName))
                .collect(Collectors.toList());
    }

    private List<ValueFacet> computeStringFacets(Specification<Book> baseSpec, String fieldName, List<String> allValues) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Tuple> cq = cb.createTupleQuery();
        Root<Book> root = cq.from(Book.class);
        
        Predicate basePredicate = baseSpec.toPredicate(root, cq, cb);
        
        cq.multiselect(
            root.get(fieldName).alias("val"),
            cb.count(root).alias("cnt")
        );
        if (basePredicate != null) {
            cq.where(basePredicate);
        }
        cq.groupBy(root.get(fieldName));
        
        List<Tuple> results = em.createQuery(cq).getResultList();
        Map<String, Long> countMap = new HashMap<>();
        for (Tuple t : results) {
            String val = t.get("val", String.class);
            Long cnt = t.get("cnt", Long.class);
            if (val != null) {
                countMap.put(val.toUpperCase(), cnt);
            }
        }
        
        return allValues.stream()
                .map(v -> new ValueFacet(v, countMap.getOrDefault(v, 0L)))
                .collect(Collectors.toList());
    }

    private List<ValueFacet> computeLanguageFacets(Specification<Book> baseSpec) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Tuple> cq = cb.createTupleQuery();
        Root<Book> root = cq.from(Book.class);
        
        Predicate basePredicate = baseSpec.toPredicate(root, cq, cb);
        
        cq.multiselect(
            root.get("language").alias("val"),
            cb.count(root).alias("cnt")
        );
        if (basePredicate != null) {
            cq.where(basePredicate);
        }
        cq.groupBy(root.get("language"));
        
        List<Tuple> results = em.createQuery(cq).getResultList();
        return results.stream()
                .map(t -> new ValueFacet(
                        t.get("val", String.class),
                        t.get("cnt", Long.class)))
                .sorted(Comparator.comparing(ValueFacet::getCount).reversed())
                .collect(Collectors.toList());
    }

    private List<RatingFacet> computeRatingFacets(Specification<Book> baseSpec) {
        // Rating facets are cumulative: "4+" means >= 4, "3+" means >= 3
        List<RatingFacet> facets = new ArrayList<>();
        for (int threshold : List.of(4, 3, 2, 1)) {
            long count = bookRepository.count(
                    baseSpec.and(BookSpecification.minRating(BigDecimal.valueOf(threshold)))
            );
            facets.add(new RatingFacet(threshold, count));
        }
        return facets;
    }

    private List<ValueFacet> computeAvailabilityFacets(Specification<Book> baseSpec) {
        List<ValueFacet> facets = new ArrayList<>();
        
        long inStock = bookRepository.count(
                baseSpec.and(BookSpecification.hasAvailability("in_stock")));
        long outOfStock = bookRepository.count(
                baseSpec.and(BookSpecification.hasAvailability("out_of_stock")));
        long preOrder = bookRepository.count(
                baseSpec.and(BookSpecification.hasAvailability("pre_order")));
        
        facets.add(new ValueFacet("in_stock", inStock));
        facets.add(new ValueFacet("out_of_stock", outOfStock));
        facets.add(new ValueFacet("pre_order", preOrder));
        
        return facets;
    }

    private PriceHistogram computePriceHistogram(Specification<Book> baseSpec) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Tuple> cq = cb.createTupleQuery();
        Root<Book> root = cq.from(Book.class);
        
        Predicate basePredicate = baseSpec.toPredicate(root, cq, cb);
        
        cq.multiselect(
            cb.min(root.get("price")).alias("minP"),
            cb.max(root.get("price")).alias("maxP")
        );
        if (basePredicate != null) {
            cq.where(basePredicate);
        }
        
        Tuple minMax = em.createQuery(cq).getSingleResult();
        BigDecimal minPrice = minMax.get("minP", BigDecimal.class);
        BigDecimal maxPrice = minMax.get("maxP", BigDecimal.class);
        
        if (minPrice == null || maxPrice == null) {
            return new PriceHistogram(BigDecimal.ZERO, BigDecimal.ZERO, List.of());
        }
        
        // Build equal-width buckets
        BigDecimal range = maxPrice.subtract(minPrice);
        BigDecimal bucketWidth = range.divide(BigDecimal.valueOf(PRICE_BUCKET_COUNT), 2, RoundingMode.CEILING);
        if (bucketWidth.compareTo(BigDecimal.ZERO) <= 0) {
            bucketWidth = BigDecimal.ONE;
        }
        
        List<PriceHistogram.Bucket> buckets = new ArrayList<>();
        BigDecimal bucketStart = minPrice;
        
        for (int i = 0; i < PRICE_BUCKET_COUNT; i++) {
            BigDecimal bucketEnd = (i == PRICE_BUCKET_COUNT - 1) 
                    ? maxPrice.add(BigDecimal.ONE)  // inclusive last bucket
                    : bucketStart.add(bucketWidth);
            
            long count = bookRepository.count(
                    baseSpec.and(BookSpecification.priceBetween(bucketStart, bucketEnd))
            );
            buckets.add(new PriceHistogram.Bucket(bucketStart, bucketEnd, count));
            bucketStart = bucketEnd;
        }
        
        return new PriceHistogram(minPrice, maxPrice, buckets);
    }

    private YearRange computeYearRange(Specification<Book> baseSpec) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Tuple> cq = cb.createTupleQuery();
        Root<Book> root = cq.from(Book.class);
        
        Predicate basePredicate = baseSpec.toPredicate(root, cq, cb);
        
        Expression<Integer> yearExpr = cb.function("YEAR", Integer.class, root.get("publishedDate"));
        cq.multiselect(
            cb.min(yearExpr).alias("minY"),
            cb.max(yearExpr).alias("maxY")
        );
        if (basePredicate != null) {
            cq.where(basePredicate);
        }
        
        Tuple result = em.createQuery(cq).getSingleResult();
        Integer minYear = result.get("minY", Integer.class);
        Integer maxYear = result.get("maxY", Integer.class);
        
        return new YearRange(minYear, maxYear);
    }
}
