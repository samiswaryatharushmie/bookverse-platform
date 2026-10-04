package com.bookstore.catalog.service;

import com.bookstore.catalog.dto.BookDto;
import com.bookstore.catalog.entity.Book;
import com.bookstore.catalog.mapper.BookMapper;
import com.bookstore.catalog.repository.BookRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class SearchEngineService {
    private static final Logger logger = LoggerFactory.getLogger(SearchEngineService.class);

    private final BookRepository bookRepository;
    private final EmbeddingService embeddingService;
    private final ObjectMapper objectMapper;
    private final BookMapper bookMapper;

    // --- BM25 Parameters (Exposed as requested) ---
    private static final double BM25_K1 = 1.2;
    private static final double BM25_B = 0.75;

    // --- RRF Parameters ---
    private static final int RRF_K = 60;

    // --- In-Memory Data ---
    private List<Book> allBooks = new ArrayList<>();
    private final Map<UUID, float[]> embeddingsCache = new ConcurrentHashMap<>();

    // BM25 Index
    private final Map<UUID, Double> docLengths = new HashMap<>();
    private final Map<String, Map<UUID, Double>> termFreqs = new HashMap<>(); // Weighted TFs
    private final Map<String, Double> idfs = new HashMap<>();
    private double avgdl = 0.0;
    private int totalDocs = 0;

    public SearchEngineService(BookRepository bookRepository, EmbeddingService embeddingService, ObjectMapper objectMapper, BookMapper bookMapper) {
        this.bookRepository = bookRepository;
        this.embeddingService = embeddingService;
        this.objectMapper = objectMapper;
        this.bookMapper = bookMapper;
    }

    @PostConstruct
    public void init() {
        // Load all 224 books into memory
        allBooks = bookRepository.findAllWithDetails();
        totalDocs = allBooks.size();
        logger.info("Loaded {} books into SearchEngineService.", totalDocs);

        if (totalDocs > 0) {
            buildBm25Index();
            loadEmbeddings();
        }
    }

    /**
     * Builds an in-memory BM25 index over the 224 books.
     * Weights: title (highest), author, series, subtitle, blurb, genre tags, publisher.
     */
    private void buildBm25Index() {
        termFreqs.clear();
        docLengths.clear();
        idfs.clear();
        Map<String, Integer> docFrequencies = new HashMap<>();
        double totalLength = 0;

        for (Book book : allBooks) {
            Map<String, Double> weightedTerms = new HashMap<>();
            
            // Extract and weight fields
            addTerms(weightedTerms, book.getTitle(), 5.0);
            String authorNames = book.getAuthors().stream().map(a -> a.getName()).collect(Collectors.joining(" "));
            addTerms(weightedTerms, authorNames, 3.0);
            if (book.getCategory() != null) addTerms(weightedTerms, book.getCategory().getName(), 2.0);
            addTerms(weightedTerms, book.getDescription(), 1.0);
            addTerms(weightedTerms, book.getPublisher(), 1.0);

            // Calculate length (sum of weighted frequencies)
            double length = weightedTerms.values().stream().mapToDouble(Double::doubleValue).sum();
            docLengths.put(book.getId(), length);
            totalLength += length;

            // Add to inverted index
            for (Map.Entry<String, Double> entry : weightedTerms.entrySet()) {
                String term = entry.getKey();
                termFreqs.computeIfAbsent(term, k -> new HashMap<>()).put(book.getId(), entry.getValue());
                docFrequencies.put(term, docFrequencies.getOrDefault(term, 0) + 1);
            }
        }

        avgdl = totalDocs > 0 ? totalLength / totalDocs : 0;

        // Calculate IDFs
        for (Map.Entry<String, Integer> entry : docFrequencies.entrySet()) {
            String term = entry.getKey();
            int df = entry.getValue();
            // Standard BM25 IDF formula
            double idf = Math.log(1 + (totalDocs - df + 0.5) / (df + 0.5));
            idfs.put(term, idf);
        }
        logger.info("BM25 index built with {} unique terms.", idfs.size());
    }

    private void addTerms(Map<String, Double> map, String text, double weight) {
        if (text == null || text.isBlank()) return;
        String[] tokens = text.toLowerCase().replaceAll("[^a-z0-9\\s]", " ").split("\\s+");
        for (String token : tokens) {
            if (!token.isBlank()) {
                map.put(token, map.getOrDefault(token, 0.0) + weight);
            }
        }
    }

    /**
     * Loads embeddings from the DB JSON field into the cache.
     */
    private void loadEmbeddings() {
        embeddingsCache.clear();
        logger.info("Embeddings are no longer stored in the DB.");
    }

    // --- Search Algorithms ---

    public List<SearchResult> search(QueryIntent intent, double lexicalWeight, double semanticWeight) {
        // 0. Pre-filter (Hard Constraints)
        List<Book> candidateBooks = filterBooks(intent);
        
        // Use clean query for searching
        String query = intent.getCleanQuery();

        // 1. Lexical Retriever (BM25)
        Map<UUID, Double> bm25Scores = computeBm25Scores(query);
        
        // 2. Semantic Retriever (Dense Vectors)
        Map<UUID, Double> semanticScores = computeSemanticScores(query);

        // 3. Fusion - Reciprocal Rank Fusion
        Map<UUID, Integer> bm25Ranks = rankScores(bm25Scores);
        Map<UUID, Integer> semanticRanks = rankScores(semanticScores);

        List<SearchResult> results = new ArrayList<>();
        
        for (Book book : candidateBooks) {
            UUID id = book.getId();
            double bm25Score = bm25Scores.getOrDefault(id, 0.0);
            double semanticScore = semanticScores.getOrDefault(id, 0.0);
            
            Integer bm25Rank = bm25Ranks.get(id);
            Integer semanticRank = semanticRanks.get(id);
            
            double rrfScore = 0.0;
            if (bm25Rank != null && lexicalWeight > 0) {
                rrfScore += lexicalWeight * (1.0 / (RRF_K + bm25Rank));
            }
            if (semanticRank != null && semanticWeight > 0) {
                rrfScore += semanticWeight * (1.0 / (RRF_K + semanticRank));
            }
            
            if (rrfScore > 0) {
                SearchResult sr = new SearchResult(bookMapper.toDto(book), bm25Score, semanticScore, bm25Rank, semanticRank, rrfScore);
                results.add(sr);
            }
        }

        // Sort by RRF score descending
        results.sort((a, b) -> Double.compare(b.rrfScore, a.rrfScore));
        return results;
    }

    private List<Book> filterBooks(QueryIntent intent) {
        return allBooks.stream().filter(book -> {
            if (intent.getIsbn().isPresent() && !book.getIsbn().replace("-", "").contains(intent.getIsbn().get())) {
                return false;
            }
            if (intent.getMaxPrice().isPresent() && book.getPrice().compareTo(intent.getMaxPrice().get()) > 0) {
                return false;
            }
            if (intent.getMinPrice().isPresent() && book.getPrice().compareTo(intent.getMinPrice().get()) < 0) {
                return false;
            }
            if (intent.getMinRating().isPresent()) {
                double avgRating = book.getAvgRating() == null ? 0 : book.getAvgRating().doubleValue();
                if (avgRating < intent.getMinRating().get()) {
                    return false;
                }
            }
            if (intent.getAuthorName().isPresent()) {
                String searchAuthor = intent.getAuthorName().get().toLowerCase();
                boolean authorMatches = book.getAuthors().stream()
                        .anyMatch(a -> a.getName().toLowerCase().contains(searchAuthor));
                if (!authorMatches) return false;
            }
            return true;
        }).collect(Collectors.toList());
    }

    private Map<UUID, Double> computeBm25Scores(String query) {
        Map<UUID, Double> scores = new HashMap<>();
        String[] tokens = query.toLowerCase().replaceAll("[^a-z0-9\\s]", " ").split("\\s+");
        
        for (String term : tokens) {
            if (term.isBlank() || !idfs.containsKey(term)) continue;
            
            double idf = idfs.get(term);
            Map<UUID, Double> tfs = termFreqs.get(term);
            
            for (Map.Entry<UUID, Double> entry : tfs.entrySet()) {
                UUID docId = entry.getKey();
                double tf = entry.getValue();
                double dl = docLengths.getOrDefault(docId, avgdl);
                
                // BM25 TF component
                double numerator = tf * (BM25_K1 + 1);
                double denominator = tf + BM25_K1 * (1 - BM25_B + BM25_B * (dl / avgdl));
                double score = idf * (numerator / denominator);
                
                scores.put(docId, scores.getOrDefault(docId, 0.0) + score);
            }
        }
        return scores;
    }

    private Map<UUID, Double> computeSemanticScores(String query) {
        Map<UUID, Double> scores = new HashMap<>();
        if (query == null || query.isBlank() || embeddingsCache.isEmpty()) return scores;

        float[] queryVector = embeddingService.embed(query);

        for (Map.Entry<UUID, float[]> entry : embeddingsCache.entrySet()) {
            UUID docId = entry.getKey();
            float[] docVector = entry.getValue();
            // Cosine similarity (assuming vectors are already L2 normalized)
            double dotProduct = 0.0;
            for (int i = 0; i < queryVector.length && i < docVector.length; i++) {
                dotProduct += queryVector[i] * docVector[i];
            }
            scores.put(docId, dotProduct);
        }
        return scores;
    }

    private Map<UUID, Integer> rankScores(Map<UUID, Double> scores) {
        List<Map.Entry<UUID, Double>> sorted = new ArrayList<>(scores.entrySet());
        // Sort descending by score
        sorted.sort((a, b) -> Double.compare(b.getValue(), a.getValue()));
        
        Map<UUID, Integer> ranks = new HashMap<>();
        int rank = 1;
        for (Map.Entry<UUID, Double> entry : sorted) {
            if (entry.getValue() > 0 || scores.size() == 224) { // Only rank if there is a positive score, except for dense which is always scored
                ranks.put(entry.getKey(), rank++);
            }
        }
        return ranks;
    }

    /**
     * Re-embeds all books that lack embeddings and saves them to the DB.
     */
    public int reembedMissing() {
        int count = 0;
        for (Book book : allBooks) {
            if (!embeddingsCache.containsKey(book.getId())) {
                String chunk = generateChunk(book);
                float[] vec = embeddingService.embed(chunk);
                embeddingsCache.put(book.getId(), vec);
                count++;
            }
        }
        return count;
    }

    private String generateChunk(Book book) {
        String authors = book.getAuthors().stream().map(a -> a.getName()).collect(Collectors.joining(", "));
        return String.format("%s. %s. %s. %s",
                book.getTitle(),
                authors,
                book.getCategory() != null ? book.getCategory().getName() : "",
                book.getDescription() != null ? book.getDescription() : ""
        );
    }

    public static class SearchResult {
        public BookDto book;
        public double bm25Score;
        public double semanticScore;
        public Integer bm25Rank;
        public Integer semanticRank;
        public double rrfScore;

        public SearchResult(BookDto book, double bm25Score, double semanticScore, Integer bm25Rank, Integer semanticRank, double rrfScore) {
            this.book = book;
            this.bm25Score = bm25Score;
            this.semanticScore = semanticScore;
            this.bm25Rank = bm25Rank;
            this.semanticRank = semanticRank;
            this.rrfScore = rrfScore;
        }
    }
}
