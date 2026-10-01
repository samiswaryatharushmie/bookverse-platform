package com.bookstore.catalog.service;

import com.bookstore.catalog.entity.Book;
import com.bookstore.catalog.repository.BookRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AutocompleteService {

    private static final Logger logger = LoggerFactory.getLogger(AutocompleteService.class);

    private final BookRepository bookRepository;
    private TrieNode root;

    public AutocompleteService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @PostConstruct
    public void initTrie() {
        logger.info("Initializing Autocomplete Trie...");
        root = new TrieNode();
        List<Book> allBooks = bookRepository.findAllWithDetails();

        for (Book book : allBooks) {
            if (book.isActive()) {
                // Insert title
                insert(book.getTitle());
                
                // Insert author names
                book.getAuthors().forEach(author -> insert(author.getName()));
                
                // Insert category name
                if (book.getCategory() != null) {
                    insert(book.getCategory().getName());
                }
            }
        }
        logger.info("Autocomplete Trie built successfully.");
    }

    /**
     * Inserts a string into the Trie.
     */
    private void insert(String phrase) {
        if (phrase == null || phrase.trim().isEmpty()) return;
        
        // We convert to lowercase for case-insensitive matching
        String word = phrase.trim().toLowerCase();
        TrieNode current = root;
        
        for (char c : word.toCharArray()) {
            current.children.putIfAbsent(c, new TrieNode());
            current = current.children.get(c);
        }
        current.isEndOfWord = true;
        // Store original formatted string at the leaf
        current.originalFormat = phrase.trim();
    }

    /**
     * Returns up to 5 suggestions based on the given prefix.
     */
    public List<String> getSuggestions(String prefix) {
        if (prefix == null || prefix.trim().isEmpty()) return Collections.emptyList();
        
        String word = prefix.trim().toLowerCase();
        TrieNode current = root;
        
        // Traverse to the node representing the prefix
        for (char c : word.toCharArray()) {
            if (!current.children.containsKey(c)) {
                return Collections.emptyList(); // No matches
            }
            current = current.children.get(c);
        }
        
        // DFS to find all words from this node
        List<String> suggestions = new ArrayList<>();
        dfs(current, suggestions, 5);
        return suggestions;
    }

    private void dfs(TrieNode node, List<String> result, int limit) {
        if (result.size() >= limit) return;
        
        if (node.isEndOfWord && node.originalFormat != null) {
            result.add(node.originalFormat);
        }
        
        // Traverse children
        for (TrieNode child : node.children.values()) {
            dfs(child, result, limit);
            if (result.size() >= limit) return;
        }
    }

    // --- Inner Class for Trie Node ---
    
    private static class TrieNode {
        // TreeMap to keep suggestions alphabetically sorted automatically!
        Map<Character, TrieNode> children = new TreeMap<>();
        boolean isEndOfWord;
        String originalFormat;
    }
}
