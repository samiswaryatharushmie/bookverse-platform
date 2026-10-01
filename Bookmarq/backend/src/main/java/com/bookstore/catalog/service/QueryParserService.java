package com.bookstore.catalog.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class QueryParserService {

    private static final Logger logger = LoggerFactory.getLogger(QueryParserService.class);

    // Phase 5: Query Expansion Dictionary
    private static final Map<String, String> SYNONYMS = new HashMap<>();
    static {
        SYNONYMS.put("ai", "artificial intelligence");
        SYNONYMS.put("ml", "machine learning");
        SYNONYMS.put("sci-fi", "science fiction");
        SYNONYMS.put("lotr", "lord of the rings");
        SYNONYMS.put("hp", "harry potter");
        SYNONYMS.put("ya", "young adult");
        SYNONYMS.put("cs", "computer science");
        SYNONYMS.put("programming", "software development coding"); // Expansion adds context
    }

    // --- Regex Patterns ---
    
    // Price: "under $20", "less than 50", "max 20"
    private static final Pattern MAX_PRICE_PATTERN = Pattern.compile("(?i)(?:under|less than|max|cheaper than)\\s*\\$?\\s*(\\d+(?:\\.\\d{1,2})?)");
    
    // Synonyms for price
    private static final Pattern CHEAP_PATTERN = Pattern.compile("(?i)\\b(cheap|bargain|inexpensive)\\b");

    // Rating: "above 4 stars", "4+ stars", "min 4"
    private static final Pattern MIN_RATING_PATTERN = Pattern.compile("(?i)(?:above|over|min|minimum)\\s*(\\d+(?:\\.\\d{1,2})?)\\s*(?:stars?)?");
    private static final Pattern RATING_PLUS_PATTERN = Pattern.compile("(?i)(\\d+(?:\\.\\d{1,2})?)\\+?\\s*stars?");
    
    // Synonyms for rating
    private static final Pattern TOP_RATED_PATTERN = Pattern.compile("(?i)\\b(top rated|best|highly rated|acclaimed)\\b");

    // Author: "by stephen king"
    private static final Pattern AUTHOR_PATTERN = Pattern.compile("(?i)\\bby\\s+([a-zA-Z\\s\\.]+)");

    // ISBN: "isbn: 978..."
    private static final Pattern ISBN_PATTERN = Pattern.compile("(?i)isbn:?\\s*([0-9\\-]+)");

    /**
     * Parses a raw text query into structured intents using Regex heuristics.
     * VIVA NOTE: A transparent heuristic ruleset is often preferable to an opaque LLM 
     * for query understanding because it is fast, deterministic, and easily debuggable.
     */
    public QueryIntent parse(String rawQuery) {
        if (rawQuery == null || rawQuery.isBlank()) {
            return new QueryIntent("");
        }

        QueryIntent intent = new QueryIntent(rawQuery.trim());
        String cleanQuery = rawQuery;

        // 1. Extract ISBN
        Matcher isbnMatcher = ISBN_PATTERN.matcher(cleanQuery);
        if (isbnMatcher.find()) {
            intent.setIsbn(isbnMatcher.group(1).replaceAll("-", ""));
            cleanQuery = isbnMatcher.replaceFirst("");
        }

        // 2. Extract Author
        Matcher authorMatcher = AUTHOR_PATTERN.matcher(cleanQuery);
        if (authorMatcher.find()) {
            intent.setAuthorName(authorMatcher.group(1).trim());
            cleanQuery = authorMatcher.replaceFirst("");
        }

        // 3. Extract Max Price
        Matcher maxPriceMatcher = MAX_PRICE_PATTERN.matcher(cleanQuery);
        if (maxPriceMatcher.find()) {
            try {
                intent.setMaxPrice(new BigDecimal(maxPriceMatcher.group(1)));
                cleanQuery = maxPriceMatcher.replaceFirst("");
            } catch (NumberFormatException ignored) {}
        } else {
            Matcher cheapMatcher = CHEAP_PATTERN.matcher(cleanQuery);
            if (cheapMatcher.find()) {
                intent.setMaxPrice(new BigDecimal("1000.00")); // Hardcoded "cheap" threshold in LKR
                cleanQuery = cheapMatcher.replaceFirst("");
            }
        }

        // 4. Extract Min Rating
        Matcher minRatingMatcher = MIN_RATING_PATTERN.matcher(cleanQuery);
        if (minRatingMatcher.find()) {
            try {
                intent.setMinRating(Double.parseDouble(minRatingMatcher.group(1)));
                cleanQuery = minRatingMatcher.replaceFirst("");
            } catch (NumberFormatException ignored) {}
        } else {
            Matcher ratingPlusMatcher = RATING_PLUS_PATTERN.matcher(cleanQuery);
            if (ratingPlusMatcher.find()) {
                try {
                    intent.setMinRating(Double.parseDouble(ratingPlusMatcher.group(1)));
                    cleanQuery = ratingPlusMatcher.replaceFirst("");
                } catch (NumberFormatException ignored) {}
            } else {
                Matcher topRatedMatcher = TOP_RATED_PATTERN.matcher(cleanQuery);
                if (topRatedMatcher.find()) {
                    intent.setMinRating(4.0); // Hardcoded "top rated" threshold
                    cleanQuery = topRatedMatcher.replaceFirst("");
                }
            }
        }

        // Clean up remaining query (extra spaces)
        cleanQuery = cleanQuery.replaceAll("\\s+", " ").trim();
        
        // Phase 5: Apply Query Expansion
        cleanQuery = expandQuery(cleanQuery);
        
        intent.setCleanQuery(cleanQuery);

        logger.debug("Parsed Query: '{}' -> {}", rawQuery, intent);
        return intent;
    }

    /**
     * Expands known acronyms and synonyms to improve lexical matching.
     */
    private String expandQuery(String query) {
        if (query.isEmpty()) return query;
        
        String[] words = query.split("\\s+");
        StringBuilder expanded = new StringBuilder();
        
        for (String word : words) {
            String lower = word.toLowerCase();
            if (SYNONYMS.containsKey(lower)) {
                // Append original AND expansion to maximize BM25 match surface
                expanded.append(word).append(" ").append(SYNONYMS.get(lower)).append(" ");
            } else {
                expanded.append(word).append(" ");
            }
        }
        return expanded.toString().trim();
    }
}
