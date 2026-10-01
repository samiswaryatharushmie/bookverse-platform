package com.bookstore.catalog.service;

import com.bookstore.catalog.dto.AuthorDto;
import com.bookstore.catalog.dto.CreateAuthorRequest;
import com.bookstore.catalog.entity.Author;
import com.bookstore.catalog.mapper.AuthorMapper;
import com.bookstore.catalog.repository.AuthorRepository;
import com.bookstore.common.exception.ResourceNotFoundException;
import com.bookstore.common.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthorService {

    private final AuthorRepository authorRepository;
    private final AuthorMapper authorMapper;

    @Transactional(readOnly = true)
    public List<AuthorDto> getAllAuthors() {
        return authorRepository.findAll().stream()
                .map(authorMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AuthorDto getAuthor(UUID id) {
        return authorRepository.findById(id)
                .map(authorMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Author not found"));
    }

    @Transactional
    public AuthorDto createAuthor(CreateAuthorRequest request) {
        if (authorRepository.findBySlug(request.getSlug()).isPresent()) {
            throw new BadRequestException("Author slug already exists");
        }

        Author author = authorMapper.toEntity(request);
        Author saved = authorRepository.save(author);
        return authorMapper.toDto(saved);
    }

    @Transactional
    public AuthorDto updateAuthor(UUID id, CreateAuthorRequest request) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Author not found"));

        if (!author.getSlug().equals(request.getSlug()) &&
            authorRepository.findBySlug(request.getSlug()).isPresent()) {
            throw new BadRequestException("Author slug already exists");
        }

        authorMapper.updateEntity(request, author);
        Author saved = authorRepository.save(author);
        return authorMapper.toDto(saved);
    }

    @Transactional
    public void deleteAuthor(UUID id) {
        if (!authorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Author not found");
        }
        authorRepository.deleteById(id);
    }
}
