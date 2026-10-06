package com.bookstore.wishlist.service;

import com.bookstore.catalog.entity.Book;
import com.bookstore.catalog.repository.BookRepository;
import com.bookstore.common.exception.ResourceNotFoundException;
import com.bookstore.user.entity.User;
import com.bookstore.user.repository.UserRepository;
import com.bookstore.wishlist.dto.WishlistDto;
import com.bookstore.wishlist.entity.Wishlist;
import com.bookstore.wishlist.entity.WishlistItem;
import com.bookstore.wishlist.mapper.WishlistMapper;
import com.bookstore.wishlist.repository.WishlistItemRepository;
import com.bookstore.wishlist.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final WishlistMapper wishlistMapper;

    @Transactional
    public WishlistDto getWishlist(UUID userId) {
        Wishlist wishlist = getOrCreateWishlist(userId);
        return wishlistMapper.toDto(wishlist);
    }

    @Transactional
    public WishlistDto addBookToWishlist(UUID userId, UUID bookId) {
        Wishlist wishlist = getOrCreateWishlist(userId);
        
        Optional<WishlistItem> existingItem = wishlistItemRepository.findByWishlistIdAndBookId(wishlist.getId(), bookId);
        if (existingItem.isEmpty()) {
            Book book = bookRepository.findById(bookId)
                    .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
            
            WishlistItem item = new WishlistItem();
            item.setWishlist(wishlist);
            item.setBook(book);
            wishlist.getItems().add(item);
            wishlistRepository.save(wishlist);
        }
        
        return wishlistMapper.toDto(wishlist);
    }

    @Transactional
    public WishlistDto removeBookFromWishlist(UUID userId, UUID bookId) {
        Wishlist wishlist = getOrCreateWishlist(userId);
        
        wishlist.getItems().removeIf(item -> item.getBook().getId().equals(bookId));
        wishlistRepository.save(wishlist);
        
        return wishlistMapper.toDto(wishlist);
    }

    private Wishlist getOrCreateWishlist(UUID userId) {
        return wishlistRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                    Wishlist newWishlist = new Wishlist();
                    newWishlist.setUser(user);
                    return wishlistRepository.save(newWishlist);
                });
    }
}
