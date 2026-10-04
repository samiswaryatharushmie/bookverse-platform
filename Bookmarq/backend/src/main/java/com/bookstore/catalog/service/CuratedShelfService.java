package com.bookstore.catalog.service;

import com.bookstore.catalog.dto.CuratedShelfDto;
import com.bookstore.catalog.dto.CuratedShelfRequest;
import com.bookstore.catalog.entity.Book;
import com.bookstore.catalog.entity.CuratedShelf;
import com.bookstore.catalog.mapper.CuratedShelfMapper;
import com.bookstore.catalog.repository.BookRepository;
import com.bookstore.catalog.repository.CuratedShelfRepository;
import com.bookstore.common.exception.BadRequestException;
import com.bookstore.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CuratedShelfService {

    private final CuratedShelfRepository curatedShelfRepository;
    private final BookRepository bookRepository;
    private final CuratedShelfMapper curatedShelfMapper;

    @Transactional(readOnly = true)
    public List<CuratedShelfDto> getActiveShelves() {
        return curatedShelfRepository.findByActiveTrueOrderBySortOrderAsc()
                .stream()
                .map(curatedShelfMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CuratedShelfDto> getAllShelves() {
        return curatedShelfRepository.findAll()
                .stream()
                .map(curatedShelfMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CuratedShelfDto createShelf(CuratedShelfRequest request) {
        CuratedShelf shelf = new CuratedShelf();
        shelf.setTitle(request.getTitle());
        shelf.setSlug(request.getSlug());
        shelf.setDescription(request.getDescription());
        shelf.setSortOrder(request.getSortOrder());
        shelf.setActive(request.isActive());
        return curatedShelfMapper.toDto(curatedShelfRepository.save(shelf));
    }

    @Transactional
    public CuratedShelfDto updateShelf(UUID shelfId, CuratedShelfRequest request) {
        CuratedShelf shelf = curatedShelfRepository.findById(shelfId)
                .orElseThrow(() -> new ResourceNotFoundException("Shelf not found"));
        shelf.setTitle(request.getTitle());
        shelf.setSlug(request.getSlug());
        shelf.setDescription(request.getDescription());
        shelf.setSortOrder(request.getSortOrder());
        shelf.setActive(request.isActive());
        return curatedShelfMapper.toDto(curatedShelfRepository.save(shelf));
    }

    @Transactional
    public void deleteShelf(UUID shelfId) {
        if (!curatedShelfRepository.existsById(shelfId)) {
            throw new ResourceNotFoundException("Shelf not found");
        }
        curatedShelfRepository.deleteById(shelfId);
    }

    @Transactional
    public CuratedShelfDto addBook(UUID shelfId, UUID bookId) {
        CuratedShelf shelf = curatedShelfRepository.findById(shelfId)
                .orElseThrow(() -> new ResourceNotFoundException("Shelf not found"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
        if (shelf.getBooks().stream().anyMatch(b -> b.getId().equals(bookId))) {
            throw new BadRequestException("Book is already on this shelf");
        }
        shelf.getBooks().add(book);
        return curatedShelfMapper.toDto(curatedShelfRepository.save(shelf));
    }

    @Transactional
    public CuratedShelfDto removeBook(UUID shelfId, UUID bookId) {
        CuratedShelf shelf = curatedShelfRepository.findById(shelfId)
                .orElseThrow(() -> new ResourceNotFoundException("Shelf not found"));
        shelf.getBooks().removeIf(b -> b.getId().equals(bookId));
        return curatedShelfMapper.toDto(curatedShelfRepository.save(shelf));
    }
}
