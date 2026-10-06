package com.bookstore.order.service;

import com.bookstore.catalog.entity.Book;
import com.bookstore.catalog.repository.BookRepository;
import com.bookstore.common.exception.BadRequestException;
import com.bookstore.common.exception.ResourceNotFoundException;
import com.bookstore.inventory.service.InventoryService;
import com.bookstore.order.dto.CartDto;
import com.bookstore.order.entity.Cart;
import com.bookstore.order.entity.CartItem;
import com.bookstore.order.mapper.CartMapper;
import com.bookstore.order.repository.CartRepository;
import com.bookstore.user.entity.User;
import com.bookstore.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final CartMapper cartMapper;
    private final InventoryService inventoryService;

    @Transactional
    public CartDto getCart(UUID userId) {
        Cart cart = getOrCreateCart(userId);
        return cartMapper.toDto(cart);
    }

    @Transactional
    public CartDto addItem(UUID userId, UUID bookId, int quantity) {
        Cart cart = getOrCreateCart(userId);
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(i -> i.getBook().getId().equals(bookId))
                .findFirst();

        int currentQuantity = existingItem.map(CartItem::getQuantity).orElse(0);
        int requestedTotal = currentQuantity + quantity;
        if (inventoryService.getAvailableQuantity(bookId) < requestedTotal) {
            throw new BadRequestException("Insufficient stock available");
        }

        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(existingItem.get().getQuantity() + quantity);
            existingItem.get().setUnitPriceSnapshot(book.getPrice());
        } else {
            CartItem newItem = new CartItem();
            newItem.setBook(book);
            newItem.setQuantity(quantity);
            newItem.setUnitPriceSnapshot(book.getPrice());
            cart.addItem(newItem);
        }

        Cart saved = cartRepository.save(cart);
        return cartMapper.toDto(saved);
    }

    @Transactional
    public CartDto removeItem(UUID userId, UUID bookId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().removeIf(i -> i.getBook().getId().equals(bookId));
        Cart saved = cartRepository.save(cart);
        return cartMapper.toDto(saved);
    }

    @Transactional
    public CartDto updateItemQuantity(UUID userId, UUID bookId, int quantity) {
        if (quantity <= 0) {
            return removeItem(userId, bookId);
        }
        Cart cart = getOrCreateCart(userId);
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(i -> i.getBook().getId().equals(bookId))
                .findFirst();

        if (existingItem.isPresent()) {
            if (inventoryService.getAvailableQuantity(bookId) < quantity) {
                throw new BadRequestException("Insufficient stock available");
            }
            existingItem.get().setQuantity(quantity);
            // Optionally update snapshot price:
            // existingItem.get().setUnitPriceSnapshot(existingItem.get().getBook().getPrice());
        } else {
            throw new ResourceNotFoundException("Item not found in cart");
        }

        Cart saved = cartRepository.save(cart);
        return cartMapper.toDto(saved);
    }

    @Transactional
    public void clearCart(UUID userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private Cart getOrCreateCart(UUID userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            Cart newCart = new Cart();
            newCart.setUser(user);
            return cartRepository.save(newCart);
        });
    }
}
