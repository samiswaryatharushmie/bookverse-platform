package com.bookstore.catalog.service;

import com.bookstore.catalog.dto.CuratedShelfDto;
import com.bookstore.catalog.mapper.CuratedShelfMapper;
import com.bookstore.catalog.repository.CuratedShelfRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CuratedShelfService {

    private final CuratedShelfRepository curatedShelfRepository;
    private final CuratedShelfMapper curatedShelfMapper;

    @Transactional(readOnly = true)
    public List<CuratedShelfDto> getActiveShelves() {
        return curatedShelfRepository.findByActiveTrueOrderBySortOrderAsc()
                .stream()
                .map(curatedShelfMapper::toDto)
                .collect(Collectors.toList());
    }
}
